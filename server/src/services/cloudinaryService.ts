import cloudinary from 'cloudinary';
import { Readable } from 'stream';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  message?: string;
}

interface DeleteResult {
  success: boolean;
  message?: string;
  result?: any;
}

export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    return new Promise((resolve) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error: any, result: any) => {
          if (error) {
            resolve({
              success: false,
              message: error.message,
            });
          } else {
            resolve({
              success: true,
              url: result?.secure_url,
              publicId: result?.public_id,
            });
          }
        }
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async deleteImage(publicId: string): Promise<DeleteResult> {
    return new Promise((resolve) => {
      cloudinary.v2.uploader.destroy(publicId, (error: any, result: any) => {
        if (error) {
          resolve({ success: false, message: error.message });
        } else {
          resolve({ success: true, result });
        }
      });
    });
  }
}