import { v4 as uuidv4 } from 'uuid';
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

  async getSKUById(id: string): Promise<SKU | null> {
    return await this.storage.findById(id);
  }

  async createSKU(data: CreateSKURequest): Promise<SKU> {
    // Check if SKU code already exists
    const existing = await this.storage.findBySku(data.sku);
    if (existing) {
      throw new Error(`SKU with code '${data.sku}' already exists`);
    }

    const now = new Date();
    const newSKU: SKU = {
      id: uuidv4(),
      sku: data.sku,
      description: data.description,
      price: data.price,
      createdAt: now,
      updatedAt: now
    };

    return await this.storage.create(newSKU);
  }

  async updateSKU(id: string, data: UpdateSKURequest): Promise<SKU | null> {
    const existingSKU = await this.storage.findById(id);
    if (!existingSKU) {
      return null;
    }

    // Check if we're trying to update to a SKU code that already exists (and it's not the current one)
    const skuWithSameCode = await this.storage.findBySku(data.sku);
    if (skuWithSameCode && skuWithSameCode.id !== id) {
      throw new Error(`SKU with code '${data.sku}' already exists`);
    }

    const updatedSKU: SKU = {
      ...existingSKU,
      sku: data.sku,
      description: data.description,
      price: data.price,
      updatedAt: new Date()
    };

    return await this.storage.update(id, updatedSKU);
  }

  async deleteSKU(id: string): Promise<boolean> {
    return await this.storage.delete(id);
  }
}