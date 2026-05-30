import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { v4 as uuid } from 'uuid'
import path from 'path'

// ─ Configure providers

const useS3 = !!(env.AWS_BUCKET_NAME && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY)
const useCloudinary = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)

let s3Client: S3Client | null = null

if (useS3) {
  s3Client = new S3Client({
    region:      env.AWS_REGION,
    credentials: {
      accessKeyId:     env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

// ─ Upload a file

export const uploadFile = async (
  buffer:   Buffer,
  fileName: string,
  mimeType: string,
  folder:   string
): Promise<string> => {
  const ext      = path.extname(fileName)
  const key      = `${folder}/${uuid()}${ext}`

  //  S3 

  if (useS3 && s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket:      env.AWS_BUCKET_NAME!,
        Key:         key,
        Body:        buffer,
        ContentType: mimeType,
      })
    )
    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
  }

  // ─ Cloudinary

  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))
          resolve(result.secure_url)
        }
      ).end(buffer)
    })
  }

  //  Dev fallback: return a placeholder URL

  console.warn('⚠️  No storage provider configured. File upload simulated in dev mode.')
  return `http://localhost:${env.PORT}/uploads/${key}`
}

// ─ Delete a file 

export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (useS3 && s3Client && env.AWS_BUCKET_NAME && fileUrl.includes(env.AWS_BUCKET_NAME)) {
    const url = new URL(fileUrl)
    const key = url.pathname.slice(1) // Remove leading /
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key })
    )
    return
  }

  if (useCloudinary && fileUrl.includes('cloudinary.com')) {
    // Extract public_id from Cloudinary URL
    const parts    = fileUrl.split('/')
    const fileName = parts[parts.length - 1]
    const publicId = `${parts[parts.length - 2]}/${fileName.split('.')[0]}`
    await cloudinary.uploader.destroy(publicId)
    return
  }

  // Dev mode — no-op
  console.warn('⚠️  deleteFile: no storage provider — skipped.')
}

// Upload an avatar image

export const uploadAvatar = async (
  buffer:   Buffer,
  userId:   string,
  mimeType: string
): Promise<string> => {
  return uploadFile(buffer, `avatar-${userId}.jpg`, mimeType, 'avatars')
}