// src/common/middleware/upload.ts
import multer from "multer";

const storage = multer.memoryStorage(); // Файл будет в req.file.buffer
export const upload = multer({ storage });
