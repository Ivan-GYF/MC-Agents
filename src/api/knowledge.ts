import { Hono } from 'hono';
import { Env, KnowledgeBase } from '../types';

export const knowledgeRouter = new Hono<{ Bindings: Env }>();

// 获取智能体的知识库文档
knowledgeRouter.get('/:agent_id', async (c) => {
  const agent_id = c.req.param('agent_id');

  const documents = await c.env.DB.prepare(
    'SELECT * FROM knowledge_base WHERE agent_id = ? ORDER BY uploaded_at DESC'
  ).bind(agent_id).all<KnowledgeBase>();

  return c.json(documents.results);
});

// 上传文档到知识库
knowledgeRouter.post('/:agent_id/upload', async (c) => {
  if (!c.env.DOCUMENTS) {
    return c.json({ error: 'R2 storage not configured. Please enable R2 in Cloudflare Dashboard.' }, 503);
  }

  const agent_id = c.req.param('agent_id');
  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // 上传到 R2
  const file_path = `${agent_id}/${Date.now()}_${file.name}`;
  await c.env.DOCUMENTS.put(file_path, file.stream());

  // 保存到数据库
  await c.env.DB.prepare(
    'INSERT INTO knowledge_base (agent_id, file_name, file_type, file_path, file_size) VALUES (?, ?, ?, ?, ?)'
  ).bind(
    agent_id,
    file.name,
    file.type,
    file_path,
    file.size
  ).run();

  return c.json({ success: true, file_path });
});

// 删除知识库文档
knowledgeRouter.delete('/:agent_id/:doc_id', async (c) => {
  if (!c.env.DOCUMENTS) {
    return c.json({ error: 'R2 storage not configured' }, 503);
  }

  const agent_id = c.req.param('agent_id');
  const doc_id = c.req.param('doc_id');

  // 获取文档信息
  const doc = await c.env.DB.prepare(
    'SELECT * FROM knowledge_base WHERE id = ? AND agent_id = ?'
  ).bind(doc_id, agent_id).first<KnowledgeBase>();

  if (!doc) {
    return c.json({ error: 'Document not found' }, 404);
  }

  // 从 R2 删除
  await c.env.DOCUMENTS.delete(doc.file_path);

  // 从数据库删除
  await c.env.DB.prepare(
    'DELETE FROM knowledge_base WHERE id = ?'
  ).bind(doc_id).run();

  return c.json({ success: true });
});

// 下载文档
knowledgeRouter.get('/:agent_id/download/:doc_id', async (c) => {
  if (!c.env.DOCUMENTS) {
    return c.json({ error: 'R2 storage not configured' }, 503);
  }

  const agent_id = c.req.param('agent_id');
  const doc_id = c.req.param('doc_id');

  const doc = await c.env.DB.prepare(
    'SELECT * FROM knowledge_base WHERE id = ? AND agent_id = ?'
  ).bind(doc_id, agent_id).first<KnowledgeBase>();

  if (!doc) {
    return c.json({ error: 'Document not found' }, 404);
  }

  const object = await c.env.DOCUMENTS.get(doc.file_path);

  if (!object) {
    return c.json({ error: 'File not found in storage' }, 404);
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': doc.file_type,
      'Content-Disposition': `attachment; filename="${doc.file_name}"`
    }
  });
});
