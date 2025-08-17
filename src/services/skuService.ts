import { SKU, CreateSKURequest, UpdateSKURequest } from '../types/sku';
import { FileStorage } from '../storage/fileStorage';

export class SKUService {
  private storage: FileStorage;

  constructor() {
    this.storage = new FileStorage();
  }

  async getAllSKUs(): Promise<SKU[]> {
    return await this.storage.findAll();
  }

  async getSKUByCode(skuCode: string): Promise<SKU | null> {
    return await this.storage.findBySku(skuCode);
  }

  async createSKU(data: CreateSKURequest): Promise<SKU> {
    // Check if SKU code already exists
    const existing = await this.storage.findBySku(data.sku);
    if (existing) {
      throw new Error(`SKU with code '${data.sku}' already exists`);
    }

    const now = new Date();
    const newSKU: SKU = {
      sku: data.sku,
      description: data.description,
      price: data.price,
      createdAt: now,
      updatedAt: now
    };

    return await this.storage.create(newSKU);
  }

  async updateSKU(skuCode: string, data: UpdateSKURequest): Promise<SKU | null> {
    const existingSKU = await this.storage.findBySku(skuCode);
    if (!existingSKU) {
      return null;
    }

    // Check if we're trying to update to a SKU code that already exists (and it's not the current one)
    if (data.sku !== skuCode) {
      const skuWithSameCode = await this.storage.findBySku(data.sku);
      if (skuWithSameCode) {
        throw new Error(`SKU with code '${data.sku}' already exists`);
      }
    }

    const updatedSKU: SKU = {
      sku: data.sku,
      description: data.description,
      price: data.price,
      createdAt: existingSKU.createdAt,
      updatedAt: new Date()
    };

    // If SKU code is changing, we need to delete the old one and create the new one
    if (data.sku !== skuCode) {
      await this.storage.delete(skuCode);
      return await this.storage.create(updatedSKU);
    } else {
      return await this.storage.update(skuCode, updatedSKU);
    }
  }

  async deleteSKU(skuCode: string): Promise<boolean> {
    return await this.storage.delete(skuCode);
  }
}