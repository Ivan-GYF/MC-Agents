import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, Agent } from './types';
import { agentsRouter } from './api/agents';
import { chatRouter } from './api/chat';
import { knowledgeRouter } from './api/knowledge';
import { sessionsRouter } from './api/sessions';
import { homePage } from './views/home';
import { agentPage } from './views/agent';

const app = new Hono<{ Bindings: Env }>();

// 中间件
app.use('*', cors());

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态页面路由
app.get('/', (c) => {
  try {
    return c.html(homePage());
  } catch (error) {
    console.error('Homepage error:', error);
    return c.text('Error loading homepage: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

app.get('/agent/:type', async (c) => {
  try {
    const type = c.req.param('type');

    const agent = await c.env.DB.prepare(
      'SELECT * FROM agents WHERE type = ? LIMIT 1'
    ).bind(type).first<Agent>();

    if (!agent) {
      return c.text('Agent not found', 404);
    }

    return c.html(agentPage(agent));
  } catch (error) {
    console.error('Agent page error:', error);
    return c.text('Error loading agent: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

// API 路由
app.route('/api/agents', agentsRouter);
app.route('/api/chat', chatRouter);
app.route('/api/knowledge', knowledgeRouter);
app.route('/api/sessions', sessionsRouter);

export default app;
