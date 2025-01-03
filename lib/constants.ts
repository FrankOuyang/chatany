export type Model = {
  id: string;
  name: string;
  description?: string;
  available: boolean;
};

export const AVAILABLE_MODELS: Model[] = [
  {
    id: process.env.DASHSCOPE_MODEL_ID || "qwen2.5-3b-instruct",
    name: "Qwen2.5-3B",
    // description: "A range of base language models and instruction tuning language models(qwen2.5-3b-instruct)",
    description: "Qwen2.5 系列 3B 模型, 相较于 Qwen2, Qwen2.5 获得了显著更多的知识, 并在编程能力和数学能力方面有了大幅提升。此外, 新模型在指令执行、生成长文本、理解结构化数据（例如表格）以及生成结构化输出特别是 JSON 方面取得了显著改进。",
    available: true,
  },
  {
    id: "qwen2.5-coder-3b-instruct",
    name: "Qwen2.5-Coder-3B",
    description: "Qwen2.5-Coder-3B 是 Qwen2.5 系列中的一款模型, 专为复杂任务设计。它能够处理各种复杂的任务, 包括编程、数据分析、自然语言处理等。",
    available: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3",
    description: "Anthropic's latest model",
    available: false,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Google's advanced model",
    available: false,
  },
];
