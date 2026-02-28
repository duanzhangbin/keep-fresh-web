export interface ItemRecognition {
  name: string;
  prod_date: string;
  exp_date: string;
  category: string;
  shelf_life_after_open?: number;
}

export async function recognizeImage(imageBase64: string): Promise<ItemRecognition> {
  const apiKey = process.env.QWEN_API_KEY;
  const model = process.env.QWEN_MODEL || 'qwen-vl-plus';
  
  const prompt = `你是一个生产日期识别助手。请识别图中包装上的生产日期和保质时长。

请严格按照以下规则识别：
1. 如果有过期日期，请直接提取
2. 如果只有生产日期和保质期（如18个月），请计算出过期日期
3. 尝试识别物品分类（食品/药品/美妆/其他）和开封后保质期（如包装上有'12M'图标）

请只输出 JSON 格式，不要包含任何其他内容：
{
  "name": "物品名称",
  "prod_date": "YYYY-MM-DD",
  "exp_date": "YYYY-MM-DD",
  "category": "分类建议",
  "shelf_life_after_open": 数字(天，如果能识别的话)
}`;

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      input: {
        messages: [{
          role: 'user',
          content: [
            {
              image: `data:image/jpeg;base64,${imageBase64}`,
            },
            {
              text: prompt,
            }
          ]
        }]
      }
    }),
  });

  const data = await response.json();

  console.log('Qwen API response status:', response.status);
  console.log('Qwen API response:', JSON.stringify(data));

  if (response.ok && data.output) {
    const choices = data.output.choices;
    if (choices && choices.length > 0) {
      const message = choices[0].message;
      const content = message.content;
      
      // 处理内容数组，查找包含 JSON 的文本
      for (const item of content) {
        if (item.text) {
          try {
            const jsonMatch = item.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error('解析 JSON 失败:', e);
          }
        }
      }
    }
  }

  throw new Error(`识别失败: ${data.message || data.code || '未知错误'}`);
}
