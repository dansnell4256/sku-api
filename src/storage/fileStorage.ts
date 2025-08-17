import * as fs from 'fs/promises';
import * as path from 'path';
import { SKU } from '../types/sku';

export class FileStorage {
  private filePath: string;

  constructor(filePath: string = './data/skus.json') {
    this.filePath = path.resolve(filePath);
  }

  async ensureDataDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async readData(): Promise<SKU[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeData(skus: SKU[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(this.filePath, JSON.stringify(skus, null, 2));
  }

  async findAll(): Promise<SKU[]> {
    return await this.readData();
  }

  async findBySku(skuCode: string): Promise<SKU | null> {
    const skus = await this.readData();
    return skus.find(sku => sku.sku === skuCode) || null;
  }

  async create(sku: SKU): Promise<SKU> {
    const skus = await this.readData();
    skus.push(sku);
    await this.writeData(skus);
    return sku;
  }

  async update(skuCode: string, updatedSku: SKU): Promise<SKU | null> {
    const skus = await this.readData();
    const index = skus.findIndex(sku => sku.sku === skuCode);
    
    if (index === -1) {
      return null;
    }

    skus[index] = updatedSku;
    await this.writeData(skus);
    return updatedSku;
  }

  async delete(skuCode: string): Promise<boolean> {
    const skus = await this.readData();
    const index = skus.findIndex(sku => sku.sku === skuCode);
    
    if (index === -1) {
      return false;
    }

    skus.splice(index, 1);
    await this.writeData(skus);
    return true;
  }
}