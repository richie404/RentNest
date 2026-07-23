import fs from "fs";
import path from "path";
import { env } from "../config/env.config";

export interface IStorageProvider {
  saveFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_PATH);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async saveFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);
    return `/uploads/${fileName}`;
  }

  public async deleteFile(fileUrl: string): Promise<void> {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    this.provider = provider || new LocalStorageProvider();
  }

  public async upload(fileBuffer: Buffer, fileName: string): Promise<string> {
    return this.provider.saveFile(fileBuffer, fileName);
  }

  public async delete(fileUrl: string): Promise<void> {
    return this.provider.deleteFile(fileUrl);
  }
}

export const storageService = new StorageService();
