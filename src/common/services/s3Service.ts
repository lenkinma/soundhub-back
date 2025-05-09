// src/common/services/s3Service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/common/utils/envConfig";

const s3 = new S3Client({
  region: env.YC_REGION,
  endpoint: env.YC_ENDPOINT, // например, https://storage.yandexcloud.net
  credentials: {
    accessKeyId: env.YC_ACCESS_KEY_ID,
    secretAccessKey: env.YC_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  path: string
): Promise<string> {
  console.log(filename);
  const key = `${path}/${filename}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.YC_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: "public-read", // чтобы был публичный доступ
      })
    );
    console.log(`${env.YC_PUBLIC_URL}/${key}`);
    return `${env.YC_PUBLIC_URL}/${key}`; // YC_PUBLIC_URL = https://storage.yandexcloud.net/your-bucket
  } catch (error) {
    console.error("Ошибка загрузки в S3:", error);
    throw error;
  }
}
