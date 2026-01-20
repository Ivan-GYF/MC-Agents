import { Hono } from 'hono';
import { Env, ChatRequest, ChatResponse, Agent, Conversation } from '../types';
import { callAIAPI, callAIAPIStream } from '../lib/ai-api';

export const chatRouter = new Hono<{ Bindings: Env }>();

// 流式聊天端点（支持打字机效果）
chatRouter.post('/stream', async (c) => {
  const { message, session_id, agent_id, attachments } = await c.req.json<ChatRequest & { attachments?: Array<{ name: string; type: string; content: string; size: number }> }>();

  // 确保会话存在
  const sessionExists = await c.env.DB.prepare(
    'SELECT id FROM sessions WHERE id = ? AND agent_id = ?'
  ).bind(session_id, agent_id).first();

  if (!sessionExists) {
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

  // 设置SSE响应头
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  // 创建流式响应
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullResponse = '';

      try {
        // 调用流式API
        for await (const chunk of callAIAPIStream(
          agent.api_key,
          agent.api_url,
          agent.model,
          agent.system_prompt,
          history.results.map(h => ({ role: h.role, content: h.content })),
          fullMessage
        )) {
          fullResponse += chunk;
          // 发送SSE格式的数据
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        }

        // 发送完成信号
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

        // 保存完整的助手回复
        await c.env.DB.prepare(
          'INSERT INTO conversations (agent_id, session_id, role, content) VALUES (?, ?, ?, ?)'
        ).bind(agent_id, session_id, 'assistant', fullResponse).run();

      } catch (error) {
        console.error('Stream error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
});

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
