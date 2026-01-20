import { ChatMessage } from '../types';

export async function callAIAPI(
  apiKey: string,
  apiUrl: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];

  // 根据模型类型选择不同的API调用方式
  if (model === 'gemini') {
    return callGeminiAPI(apiKey, apiUrl, messages);
  } else {
    return callPerplexityAPI(apiKey, apiUrl, messages);
  }
}

async function callPerplexityAPI(
  apiKey: string,
  apiUrl: string,
  messages: ChatMessage[]
): Promise<string> {
  // Perplexity要求消息必须交替出现（system -> user -> assistant -> user -> assistant）
  // 过滤掉system消息后的历史记录，只保留最后一条用户消息
  const systemMessages = messages.filter(m => m.role === 'system');
  const lastUserMessage = messages[messages.length - 1];

  // 构建符合Perplexity格式的消息数组
  const formattedMessages = [
    ...systemMessages,
    lastUserMessage
  ];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGeminiAPI(
  apiKey: string,
  apiUrl: string,
  messages: ChatMessage[]
): Promise<string> {
  // Dify API使用streaming模式
  const lastUserMessage = messages[messages.length - 1].content;

  const response = await fetch(`${apiUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      inputs: {},
      query: lastUserMessage,
      response_mode: 'streaming',
      conversation_id: '',
      user: 'mc-agents'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
  }

  // 处理streaming响应
  const text = await response.text();
  const lines = text.split('\n').filter(line => line.startsWith('data: '));

  let fullAnswer = '';
  let thinkContent = '';

  for (const line of lines) {
    try {
      const data = JSON.parse(line.substring(6)); // 移除 "data: " 前缀

      // 处理agent_thought事件（包含完整的思考过程）
      if (data.event === 'agent_thought' && data.thought) {
        thinkContent = data.thought;
      }

      // 处理agent_message事件（累积答案片段）
      if (data.event === 'agent_message' && data.answer) {
        fullAnswer += data.answer;
      }
    } catch (e) {
      // 忽略解析错误
      console.error('Parse error:', e);
    }
  }

  // 如果有完整的thought内容，使用它（它包含了完整的回答）
  if (thinkContent) {
    // 移除<think>标签，提取实际内容
    const thinkMatch = thinkContent.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);
    if (thinkMatch && thinkMatch[2]) {
      return thinkMatch[2].trim();
    }
    // 如果没有</think>标签，直接返回去除<think>后的内容
    return thinkContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }

  // 否则使用累积的answer
  if (fullAnswer) {
    return fullAnswer.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }

  return '抱歉，没有收到有效的回复。';
}
