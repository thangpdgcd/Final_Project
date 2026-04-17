import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { loadEnv } from "./runtimeEnv.js";

loadEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'phan_coffee_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;
