import { Hono } from 'hono';
import { Env, Agent } from '../types';

export const agentsRouter = new Hono<{ Bindings: Env }>();

// 获取所有智能体
agentsRouter.get('/', async (c) => {
  const agents = await c.env.DB.prepare(
    'SELECT * FROM agents ORDER BY type'
  ).all<Agent>();

  return c.json(agents.results);
});

// 获取单个智能体
agentsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const agent = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ?'
  ).bind(id).first<Agent>();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  return c.json(agent);
});

// 更新智能体配置
agentsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Agent>>();

  const { api_url, api_key, model, system_prompt } = body;

  await c.env.DB.prepare(
    `UPDATE agents
     SET api_url = COALESCE(?, api_url),
         api_key = COALESCE(?, api_key),
         model = COALESCE(?, model),
         system_prompt = COALESCE(?, system_prompt),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(api_url, api_key, model, system_prompt, id).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ?'
  ).bind(id).first<Agent>();

  return c.json(updated);
});

// 获取智能体的对话历史
agentsRouter.get('/:id/conversations', async (c) => {
  const id = c.req.param('id');
  const session_id = c.req.query('session_id');

  let query = 'SELECT * FROM conversations WHERE agent_id = ?';
  const params = [id];

  if (session_id) {
    query += ' AND session_id = ?';
    params.push(session_id);
  }

  query += ' ORDER BY created_at ASC';

  const conversations = await c.env.DB.prepare(query)
    .bind(...params)
    .all();

  return c.json(conversations.results);
});
