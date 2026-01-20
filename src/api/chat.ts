import { Hono } from 'hono';
import { Env, ChatRequest, ChatResponse, Agent, Conversation } from '../types';
import { callAIAPI } from '../lib/ai-api';

export const chatRouter = new Hono<{ Bindings: Env }>();

// 发送消息给智能体（支持文件附件）
chatRouter.post('/', async (c) => {
  const { message, session_id, agent_id, attachments } = await c.req.json<ChatRequest & { attachments?: Array<{ name: string; type: string; content: string; size: number }> }>();

  // 确保会话存在
  const sessionExists = await c.env.DB.prepare(
    'SELECT id FROM sessions WHERE id = ? AND agent_id = ?'
  ).bind(session_id, agent_id).first();

  if (!sessionExists) {
    // 创建会话
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, agent_id, title) VALUES (?, ?, ?)'
    ).bind(session_id, agent_id, '新对话').run();
  }

  // 获取智能体配置
  const agent = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ?'
  ).bind(agent_id).first<Agent>();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  // 构建包含附件信息的消息
  let fullMessage = message;
  if (attachments && attachments.length > 0) {
    fullMessage += '\n\n[附件]:';
    for (const att of attachments) {
      fullMessage += `\n- ${att.name} (${att.type}, ${(att.size / 1024).toFixed(2)}KB)`;
      // 如果是文本文件，包含内容
      if (att.type.startsWith('text/') || att.name.endsWith('.txt') || att.name.endsWith('.md')) {
        fullMessage += `\n内容: ${att.content.substring(0, 1000)}${att.content.length > 1000 ? '...' : ''}`;
      }
    }
  }

  // 保存用户消息
  const userMsgResult = await c.env.DB.prepare(
    'INSERT INTO conversations (agent_id, session_id, role, content) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(agent_id, session_id, 'user', message).first<{ id: number }>();

  // 保存附件
  if (attachments && attachments.length > 0 && userMsgResult) {
    for (const att of attachments) {
      await c.env.DB.prepare(
        'INSERT INTO message_attachments (conversation_id, file_name, file_type, file_content, file_size) VALUES (?, ?, ?, ?, ?)'
      ).bind(userMsgResult.id, att.name, att.type, att.content, att.size).run();
    }
  }

  // 更新会话时间
  await c.env.DB.prepare(
    'UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(session_id).run();

  // 获取历史对话
  const history = await c.env.DB.prepare(
    'SELECT role, content FROM conversations WHERE agent_id = ? AND session_id = ? ORDER BY created_at ASC LIMIT 20'
  ).bind(agent_id, session_id).all<Conversation>();

  // 调用 AI API
  try {
    const response = await callAIAPI(
      agent.api_key,
      agent.api_url,
      agent.model,
      agent.system_prompt,
      history.results.map(h => ({ role: h.role, content: h.content })),
      fullMessage
    );

    // 保存助手回复
    await c.env.DB.prepare(
      'INSERT INTO conversations (agent_id, session_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(agent_id, session_id, 'assistant', response).run();

    return c.json<ChatResponse>({
      response,
      session_id
    });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: `Failed to get response from AI: ${errorMessage}` }, 500);
  }
});

// 创建新会话
chatRouter.post('/session', async (c) => {
  const session_id = crypto.randomUUID();
  return c.json({ session_id });
});
