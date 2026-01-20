import { Hono } from 'hono';
import { Env, Session } from '../types';

export const sessionsRouter = new Hono<{ Bindings: Env }>();

// 获取智能体的所有会话
sessionsRouter.get('/:agent_id', async (c) => {
  const agent_id = c.req.param('agent_id');

  const sessions = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE agent_id = ? ORDER BY updated_at DESC'
  ).bind(agent_id).all<Session>();

  return c.json(sessions.results || []);
});

// 创建新会话
sessionsRouter.post('/:agent_id', async (c) => {
  const agent_id = c.req.param('agent_id');
  const session_id = crypto.randomUUID();
  const { title } = await c.req.json<{ title?: string }>();

  await c.env.DB.prepare(
    'INSERT INTO sessions (id, agent_id, title) VALUES (?, ?, ?)'
  ).bind(session_id, agent_id, title || '新对话').run();

  return c.json({ session_id, title: title || '新对话' });
});

// 更新会话标题
sessionsRouter.put('/:agent_id/:session_id', async (c) => {
  const agent_id = c.req.param('agent_id');
  const session_id = c.req.param('session_id');
  const { title } = await c.req.json<{ title: string }>();

  await c.env.DB.prepare(
    'UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND agent_id = ?'
  ).bind(title, session_id, agent_id).run();

  return c.json({ success: true });
});

// 删除会话
sessionsRouter.delete('/:agent_id/:session_id', async (c) => {
  const agent_id = c.req.param('agent_id');
  const session_id = c.req.param('session_id');

  // 删除会话（会级联删除对话记录）
  await c.env.DB.prepare(
    'DELETE FROM sessions WHERE id = ? AND agent_id = ?'
  ).bind(session_id, agent_id).run();

  return c.json({ success: true });
});
