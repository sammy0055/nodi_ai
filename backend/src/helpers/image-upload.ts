import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config';

export class ImageUploadHelper {
  s3: S3Client;
  private bucketName = appConfig.s3.bucketName;
  private backendUrl = appConfig.backendUrl;
  constructor() {
    this.s3 = new S3Client({
      endpoint: appConfig.s3.minioEndpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: appConfig.s3.minioRootUser,
        secretAccessKey: appConfig.s3.minioRootPassword,
      },
      forcePathStyle: true,
    });
  }

  // async uploadImage(file: any) {
  //   const { data, error } = await this.superbase.storage
  //     .from(`${this.bucketName}`)
  //     .upload(`${uuidv4()}.png`, file.buffer, {
  //       cacheControl: '3600',
  //       upsert: false,
  //       contentType: file.mimetype,
  //     });

  //   if (error) {
  //     throw error;
  //   }

  //   const imgUrl = this.getPublicUrl(data.path);

  //   return { ...data, imgUrl };
  // }

  async uploadImageTos3(file: any, data: { orgainationId: string; productId: string }) {
    const key = `${uuidv4()}.png`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        orgainationId: data.orgainationId,
        productId: data.productId,
      },
    });

    await this.s3.send(command);
    const imgUrl = this.getS3publicimageUrl(key);
    return { imgUrl, path: key };
  }

  getS3publicimageUrl(key: string) {
    const bucket = this.bucketName;
    const domain = this.backendUrl;
    if (!key || !bucket || !domain) throw new Error('one or more variables is not valid');
    return `${domain}/${bucket}/${key}`;
  }

  // getPublicUrl(path: string): string {
  //   const { data } = this.superbase.storage.from(`${this.bucketName}`).getPublicUrl(path);
  //   return data.publicUrl;
  // }

  // downloadImageFileWithPath = async (path: any) => {
  //   const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).download(`${path}`);

  //   if (error) {
  //     throw error;
  //   }
  //   return data;
  // };

  // deleteImageFile = async (pathArray: string[]) => {
  //   const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).remove(pathArray);

  //   if (error) {
  //     throw error;
  //   }
  //   return data;
  // };

  isValidImageUrlFromMyDomain(url: string) {
    try {
      const parsed = new URL(url);
      return parsed.origin === appConfig.backendUrl
    } catch {
      return false;
    }
  }

  async deleteS3ImageFile(key: string) {
    if (!this.isValidImageUrlFromMyDomain(key)) return;
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3.send(command);
  }

  async updateS3ImageFile(key: string, file: any) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key, // SAME KEY
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3.send(command);
    const imgUrl = this.getS3publicimageUrl(key);
    return { imgUrl, path: key };
  }

  // replaceImageFile = async (path: any, file: any) => {
  //   const { data, error } = await this.superbase.storage.from(`${this.bucketName}`).update(`${path}`, file.buffer, {
  //     cacheControl: '3600',
  //     upsert: true,
  //     contentType: file.mimetype,
  //   });

  //   if (error) {
  //     throw error;
  //   }

  //   const imgUrl = `${this.getPublicUrl(data.path)}?t=${Date.now()}`;

  //   return { ...data, imgUrl };
  // };
}
