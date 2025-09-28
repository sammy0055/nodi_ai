import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config';
export class ImageUploadHelper {
  superbase: SupabaseClient;
  private bucketName = appConfig.superbase.storage.bucketName;
  constructor() {
    this.superbase = createClient(appConfig.superbase.storage.projectUrl, appConfig.superbase.storage.apiKey);
  }

  async uploadImage(file: any) {
    const { data, error } = await this.superbase.storage
      .from(`${this.bucketName}`)
      .upload(`${uuidv4()}.png`, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (error) {
      throw error;
    }

    const imgUrl = this.getPublicUrl(data.path);

    return { ...data, imgUrl };
  }

  getPublicUrl(path: string): string {
    const { data } = this.superbase.storage.from(`${this.bucketName}`).getPublicUrl(path);
    return data.publicUrl;
  }

  downloadImageFileWithPath = async (path: any) => {
    const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).download(`${path}`);

    if (error) {
      throw error;
    }
    return data;
  };

  deleteImageFile = async (pathArray: string[]) => {
    const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).remove(pathArray);

    if (error) {
      throw error;
    }
    return data;
  };

  replaceImageFile = async (path: any, file: any) => {
    const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).update(`${path}`, file.buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.mimetype,
    });

    if (error) {
      throw error;
    }

    const imgUrl = `${this.getPublicUrl(data.path)}?t=${Date.now()}`;

    return { ...data, imgUrl };
  };
}
