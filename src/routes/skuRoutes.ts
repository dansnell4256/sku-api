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

// GET /api/skus/{id} - Get SKU by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sku = await skuService.getSKUById(id);
    
    if (!sku) {
      return res.status(404).json({ error: 'SKU not found' });
    }
    
    res.json(sku);
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

    // Check if this is an update (if ID is provided in query or if SKU already exists)
    const { id } = req.query;
    
    if (id && typeof id === 'string') {
      // Update operation
      const updatedSKU = await skuService.updateSKU(id, { sku, description, price });
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

// DELETE /api/skus/{id} - Delete SKU by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await skuService.deleteSKU(id);
    
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