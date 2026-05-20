import multer from "multer";
import { Request } from "express";
import { cloudinary } from "../config/cloudinary";
import { AppError } from "./errorHandler";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("File type not allowed", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};
