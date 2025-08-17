import { getRequest, parseJsonResponse } from './utils/httpUtils';
import { setupTestData, cleanupTestData, getExpectedSkuCodes, getExpectedSkuCount } from './utils/testUtils';

describe('SKU API - GET Tests', () => {
  
  beforeEach(async () => {
    await setupTestData();
    // Small delay to ensure file system operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/skus', () => {
    
    it('should return all SKUs with status 200', async () => {
      const response = await getRequest();
      
      expect(response.status).toBe(200);
    });

    it('should return an array of SKUs', async () => {
      const response = await getRequest();
      const skus = await parseJsonResponse(response);
      
      expect(Array.isArray(skus)).toBe(true);
    });

    it('should return the correct number of SKUs from test data', async () => {
      const response = await getRequest();
      const skus = await parseJsonResponse(response);
      const expectedCount = await getExpectedSkuCount();
      
      expect(skus).toHaveLength(expectedCount);
    });

    it('should return SKUs with all required fields', async () => {
      const response = await getRequest();
      const skus = await parseJsonResponse(response);
      
      const requiredFields = ['sku', 'description', 'price', 'createdAt', 'updatedAt'];
      
      skus.forEach((sku: any) => {
        requiredFields.forEach(field => {
          expect(sku).toHaveProperty(field);
          expect(sku[field]).toBeDefined();
        });
      });
    });

    it('should return the expected test SKU codes', async () => {
      const response = await getRequest();
      const skus = await parseJsonResponse(response);
      const expectedSkuCodes = await getExpectedSkuCodes();
      const actualSkuCodes = skus.map((sku: any) => sku.sku);
      
      expect(actualSkuCodes).toEqual(expect.arrayContaining(expectedSkuCodes));
      expect(actualSkuCodes).toHaveLength(expectedSkuCodes.length);
    });

    it('should return SKUs with correct data types', async () => {
      const response = await getRequest();
      const skus = await parseJsonResponse(response);
      
      skus.forEach((sku: any) => {
        expect(typeof sku.sku).toBe('string');
        expect(typeof sku.description).toBe('string');
        expect(typeof sku.price).toBe('string');
        expect(typeof sku.createdAt).toBe('string');
        expect(typeof sku.updatedAt).toBe('string');
        
        // Verify date strings are valid
        expect(new Date(sku.createdAt)).toBeInstanceOf(Date);
        expect(new Date(sku.updatedAt)).toBeInstanceOf(Date);
      });
    });

  });

  describe('GET /api/skus - Empty Data Scenarios', () => {
    
    test('should return empty array when no SKUs exist', async () => {
      // Skip the normal setup and create empty data instead
      await cleanupTestData(); // Remove any existing data
      
      const response = await getRequest();
      
      expect(response.status).toBe(200);
      
      const skus = await parseJsonResponse(response);
      expect(Array.isArray(skus)).toBe(true);
      expect(skus).toHaveLength(0);
      expect(skus).toEqual([]);
    });

  });

});