import { appConfig } from '../config';

const accessToken = appConfig.metaBusinessToken;
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: appConfig.openaiKey });

const getData = async (url: string) => {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = (await response.json()) as any;
    throw new Error(`Error ${response.status}: ${errorData.error.message}`);
  }

  return await response.json();
};

export const getVoiceNote = async (mediaId: string) => {
  try {
    const url = `https://graph.facebook.com/v23.0/${mediaId}`;
    const media = (await getData(url)) as { url: string };
    const res = await fetch(media.url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.log(text);
      throw new Error(`Media download failed: ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const audioFile = new File([buffer], 'voice.ogg', { type: 'audio/ogg' });
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe',
    });

    return transcription.text;
  } catch (error: any) {
    throw new Error(error);
  }
};
