import { Router, Request, Response } from 'express';
import { SKUService } from '../services/skuService';
import { CreateSKURequest, UpdateSKURequest } from '../types/sku';

const router = Router();
const skuService = new SKUService();

// GET /api/skus - Get all SKUs
router.get('/', async (req: Request, res: Response) => {
  try {
    const skus = await skuService.getAllSKUs();
    res.json(skus);
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/skus/{sku_code} - Get SKU by SKU code
router.get('/:sku_code', async (req: Request, res: Response) => {
  try {
    const { sku_code } = req.params;
    const skuData = await skuService.getSKUByCode(sku_code);
    
    if (!skuData) {
      return res.status(404).json({ error: 'SKU not found' });
    }
    
    res.json(skuData);
  } catch (error) {
    console.error('Error fetching SKU:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/skus - Create or Update SKU
router.post('/', async (req: Request, res: Response) => {
  try {
    const { sku, description, price } = req.body as CreateSKURequest;
    
    // Validation
    if (!sku || !description || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: sku, description, and price are required' 
      });
    }

    // Check if this is an update (if SKU code is provided in query)
    const { skuCode } = req.query;
    
    if (skuCode && typeof skuCode === 'string') {
      // Update operation
      const updatedSKU = await skuService.updateSKU(skuCode, { sku, description, price });
      if (!updatedSKU) {
        return res.status(404).json({ error: 'SKU not found for update' });
      }
      res.json(updatedSKU);
    } else {
      // Create operation
      const newSKU = await skuService.createSKU({ sku, description, price });
      res.status(201).json(newSKU);
    }
  } catch (error: any) {
    console.error('Error creating/updating SKU:', error);
    if (error.message.includes('already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/skus/{sku_code} - Delete SKU by SKU code
router.delete('/:sku_code', async (req: Request, res: Response) => {
  try {
    const { sku_code } = req.params;
    const deleted = await skuService.deleteSKU(sku_code);
    
    if (!deleted) {
      return res.status(404).json({ error: 'SKU not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting SKU:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as skuRoutes };