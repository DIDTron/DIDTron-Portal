import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storage } from "../storage";
import { getCloudflareR2 } from "./integrations";

let r2Client: S3Client | null = null;
let r2Config: { bucketName: string } | null = null;

/**
 * R2 operation statistics for error rate monitoring
 * Tracks success and failure counts per operation type
 */
export const r2Stats = {
  upload: { success: 0, fail: 0 },
  download: { success: 0, fail: 0 },
  delete: { success: 0, fail: 0 },
  list: { success: 0, fail: 0 },
  lastReset: new Date(),
  
  recordSuccess(operation: "upload" | "download" | "delete" | "list") {
    this[operation].success++;
  },
  
  recordFailure(operation: "upload" | "download" | "delete" | "list") {
    this[operation].fail++;
  },
  
  getErrorRate(): number {
    const totalSuccess = this.upload.success + this.download.success + this.delete.success + this.list.success;
    const totalFail = this.upload.fail + this.download.fail + this.delete.fail + this.list.fail;
    const total = totalSuccess + totalFail;
    if (total === 0) return 0; // No operations = 0% error rate
    return totalFail / total;
  },
  
  getStats() {
    const totalSuccess = this.upload.success + this.download.success + this.delete.success + this.list.success;
    const totalFail = this.upload.fail + this.download.fail + this.delete.fail + this.list.fail;
    return {
      upload: { ...this.upload },
      download: { ...this.download },
      delete: { ...this.delete },
      list: { ...this.list },
      totalSuccess,
      totalFail,
      total: totalSuccess + totalFail,
      errorRate: this.getErrorRate(),
      lastReset: this.lastReset,
    };
  },
  
  reset() {
    this.upload = { success: 0, fail: 0 };
    this.download = { success: 0, fail: 0 };
    this.delete = { success: 0, fail: 0 };
    this.list = { success: 0, fail: 0 };
    this.lastReset = new Date();
  },
};

export async function initializeR2Storage(): Promise<boolean> {
  try {
    const credentials = await getCloudflareR2(storage);
    
    if (!credentials) {
      console.log("[R2] No Cloudflare R2 credentials configured");
      return false;
    }
    
    r2Client = new S3Client({
      region: "auto",
      endpoint: credentials.endpoint,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
    
    r2Config = { bucketName: credentials.bucketName };
    
    console.log("[R2] Storage initialized successfully for bucket:", credentials.bucketName);
    return true;
  } catch (error) {
    console.error("[R2] Failed to initialize storage:", error);
    return false;
  }
}

export function isR2Available(): boolean {
  return r2Client !== null && r2Config !== null;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string = "application/octet-stream"
): Promise<{ success: boolean; key?: string; error?: string }> {
  if (!r2Client || !r2Config) {
    r2Stats.recordFailure("upload");
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
    
    r2Stats.recordSuccess("upload");
    return { success: true, key };
  } catch (error) {
    r2Stats.recordFailure("upload");
    console.error("[R2] Upload failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function downloadFile(key: string): Promise<{ success: boolean; body?: Uint8Array; contentType?: string; error?: string }> {
  if (!r2Client || !r2Config) {
    r2Stats.recordFailure("download");
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    const response = await r2Client.send(new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    }));
    
    const body = await response.Body?.transformToByteArray();
    r2Stats.recordSuccess("download");
    return { 
      success: true, 
      body, 
      contentType: response.ContentType 
    };
  } catch (error) {
    r2Stats.recordFailure("download");
    console.error("[R2] Download failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  if (!r2Client || !r2Config) {
    r2Stats.recordFailure("delete");
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    }));
    
    r2Stats.recordSuccess("delete");
    return { success: true };
  } catch (error) {
    r2Stats.recordFailure("delete");
    console.error("[R2] Delete failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function listFiles(prefix: string = ""): Promise<{ success: boolean; files?: string[]; error?: string }> {
  if (!r2Client || !r2Config) {
    r2Stats.recordFailure("list");
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    const response = await r2Client.send(new ListObjectsV2Command({
      Bucket: r2Config.bucketName,
      Prefix: prefix,
      MaxKeys: 1000,
    }));
    
    const files = response.Contents?.map((obj: { Key?: string }) => obj.Key || "") || [];
    r2Stats.recordSuccess("list");
    return { success: true, files };
  } catch (error) {
    r2Stats.recordFailure("list");
    console.error("[R2] List failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string = "application/octet-stream",
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!r2Client || !r2Config) {
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      ContentType: contentType,
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return { success: true, url };
  } catch (error) {
    console.error("[R2] Signed URL generation failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!r2Client || !r2Config) {
    return { success: false, error: "R2 storage not initialized" };
  }
  
  try {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return { success: true, url };
  } catch (error) {
    console.error("[R2] Signed URL generation failed:", error);
    return { success: false, error: String(error) };
  }
}
