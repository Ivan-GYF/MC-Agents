-- 智能体配置表
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('legal', 'finance', 'hr', 'ir')),
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'perplexity',
    system_prompt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 知识库文档表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 对话历史表
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_conversations_agent_session ON conversations(agent_id, session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agent ON knowledge_base(agent_id);

-- 插入默认智能体配置
INSERT INTO agents (name, type, api_url, api_key, model, system_prompt) VALUES
('法务智能体', 'legal', 'https://api.perplexity.ai/chat/completions', '', 'perplexity', '你是一个专业的法务顾问，擅长处理公司法律事务、合同审查、合规咨询等。请提供专业、准确的法律建议。'),
('财务智能体', 'finance', 'https://api.perplexity.ai/chat/completions', '', 'perplexity', '你是一个专业的财务顾问，擅长财务分析、预算规划、投资建议等。请提供专业的财务指导。'),
('人力智能体', 'hr', 'https://api.perplexity.ai/chat/completions', '', 'perplexity', '你是一个专业的人力资源顾问，擅长招聘、员工关系、绩效管理、薪酬福利等。请提供专业的人力资源建议。'),
('IR/股东关系智能体', 'ir', 'https://api.perplexity.ai/chat/completions', '', 'perplexity', '你是一个专业的投资者关系顾问，擅长股东沟通、投资者关系管理、财报解读等。请提供专业的IR建议。');
