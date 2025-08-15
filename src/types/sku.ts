export interface SKU {
    id: string;
    sku: string;
    description: string;
    price: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateSKURequest {
    sku: string;
    description: string;
    price: string;
  }
  
  export interface UpdateSKURequest extends CreateSKURequest {}