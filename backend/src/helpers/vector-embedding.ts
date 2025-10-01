import OpenAI from 'openai';
import { appConfig } from '../config';

const openai = new OpenAI({ apiKey: appConfig.openaiKey });
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}
