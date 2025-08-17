import { getRequest, postRequest, parseJsonResponse } from './utils/httpUtils';
import { setupTestData, cleanupTestData } from './utils/testUtils';

describe('SKU API - POST Update Tests', () => {
  
  beforeEach(async () => {
    await setupTestData();
    // Small delay to ensure file system operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/skus?skuCode={existing-sku} - Update Existing SKU', () => {
    
    test('should update an existing SKU and return status 200', async () => {
      const updatedData = {
        sku: 'berliner',
        description: 'Updated Jelly donut with premium filling',
        price: '3.49'
      };

      const response = await postRequest('?skuCode=berliner', updatedData);
      
      expect(response.status).toBe(200);
    });

    test('should return the updated SKU with modified fields', async () => {
      const updatedData = {
        sku: 'glazed',
        description: 'Premium glazed donut with honey glaze',
        price: '2.49'
      };

      const response = await postRequest('?skuCode=glazed', updatedData);
      const updatedSku = await parseJsonResponse(response);
      
      // Check updated fields
      expect(updatedSku).toHaveProperty('sku', updatedData.sku);
      expect(updatedSku).toHaveProperty('description', updatedData.description);
      expect(updatedSku).toHaveProperty('price', updatedData.price);
      
      // Check timestamps
      expect(updatedSku).toHaveProperty('createdAt');
      expect(updatedSku).toHaveProperty('updatedAt');
      
      // Verify timestamps are valid dates
      expect(new Date(updatedSku.createdAt)).toBeInstanceOf(Date);
      expect(new Date(updatedSku.updatedAt)).toBeInstanceOf(Date);
      
      // updatedAt should be more recent than createdAt (or equal for fast operations)
      const createdTime = new Date(updatedSku.createdAt).getTime();
      const updatedTime = new Date(updatedSku.updatedAt).getTime();
      expect(updatedTime).toBeGreaterThanOrEqual(createdTime);
    });

    test('should preserve createdAt timestamp when updating', async () => {
      // Get original data first
      const originalResponse = await getRequest('chocolate');
      const originalSku = await parseJsonResponse(originalResponse);
      const originalCreatedAt = originalSku.createdAt;
      
      const updatedData = {
        sku: 'chocolate',
        description: 'Dark chocolate frosted donut',
        price: '2.99'
      };

      // Update the SKU
      const updateResponse = await postRequest('?skuCode=chocolate', updatedData);
      const updatedSku = await parseJsonResponse(updateResponse);
      
      // createdAt should remain unchanged
      expect(updatedSku.createdAt).toBe(originalCreatedAt);
      
      // But other fields should be updated
      expect(updatedSku.description).toBe(updatedData.description);
      expect(updatedSku.price).toBe(updatedData.price);
    });

    test('should update SKU in the collection', async () => {
      const updatedData = {
        sku: 'boston-cream',
        description: 'Boston cream with extra filling',
        price: '4.99'
      };

      // Update the SKU
      const updateResponse = await postRequest('?skuCode=boston-cream', updatedData);
      expect(updateResponse.status).toBe(200);
      
      // Verify the SKU is updated in the collection
      const getResponse = await getRequest('boston-cream');
      const retrievedSku = await parseJsonResponse(getResponse);
      
      expect(retrievedSku.description).toBe(updatedData.description);
      expect(retrievedSku.price).toBe(updatedData.price);
    });

    test('should change SKU code when updating', async () => {
      const updatedData = {
        sku: 'berliner-premium', // Changing the SKU code
        description: 'Premium Jelly donut',
        price: '3.99'
      };

      // Update with new SKU code
      const updateResponse = await postRequest('?skuCode=berliner', updatedData);
      expect(updateResponse.status).toBe(200);
      
      // Original SKU code should no longer exist
      const oldResponse = await getRequest('berliner');
      expect(oldResponse.status).toBe(404);
      
      // New SKU code should exist
      const newResponse = await getRequest('berliner-premium');
      expect(newResponse.status).toBe(200);
      
      const retrievedSku = await parseJsonResponse(newResponse);
      expect(retrievedSku.sku).toBe('berliner-premium');
      expect(retrievedSku.description).toBe(updatedData.description);
    });

    test('should return 404 when trying to update non-existent SKU', async () => {
      const updatedData = {
        sku: 'non-existent',
        description: 'This should not work',
        price: '1.00'
      };

      const response = await postRequest('?skuCode=non-existent-sku', updatedData);
      
      expect(response.status).toBe(404);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('not found');
    });

    test('should return 409 when trying to change SKU code to existing one', async () => {
      const updatedData = {
        sku: 'glazed', // This already exists in test data
        description: 'Trying to duplicate',
        price: '2.99'
      };

      // Try to update 'chocolate' to use 'glazed' SKU code
      const response = await postRequest('?skuCode=chocolate', updatedData);
      
      expect(response.status).toBe(409);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('already exists');
      expect(errorResponse.error).toContain('glazed');
    });

    test('should not modify collection when update fails due to duplicate SKU code', async () => {
      // Get initial state
      const initialResponse = await getRequest();
      const initialSkus = await parseJsonResponse(initialResponse);
      const initialCount = initialSkus.length;
      
      const updatedData = {
        sku: 'berliner', // This already exists
        description: 'Trying to duplicate',
        price: '2.99'
      };

      // Try to update 'glazed' to use 'berliner' SKU code (should fail)
      const response = await postRequest('?skuCode=glazed', updatedData);
      expect(response.status).toBe(409);
      
      // Verify collection is unchanged
      const afterResponse = await getRequest();
      const afterSkus = await parseJsonResponse(afterResponse);
      
      expect(afterSkus).toHaveLength(initialCount);
      
      // Verify original data is intact
      const originalGlazed = afterSkus.find((sku: any) => sku.sku === 'glazed');
      expect(originalGlazed.description).toBe('Glazed donut'); // Original description
      expect(originalGlazed.price).toBe('1.99'); // Original price
      
      const originalBerliner = afterSkus.find((sku: any) => sku.sku === 'berliner');
      expect(originalBerliner.description).toBe('Jelly donut'); // Original description
    });

    test.each([
      { 
        description: 'Missing sku', 
        payload: { description: 'Test donut', price: '2.99' } 
      },
      { 
        description: 'Missing description', 
        payload: { sku: 'test-sku', price: '2.99' } 
      },
      { 
        description: 'Missing price', 
        payload: { sku: 'test-sku', description: 'Test donut' } 
      },
      { 
        description: 'Empty payload', 
        payload: {} 
      }
    ])('should return 400 for update with $description', async ({ payload }) => {
      const response = await postRequest('?skuCode=berliner', payload);
      
      expect(response.status).toBe(400);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('required');
    });

    test.each([
      { 
        field: 'sku', 
        payload: { sku: '', description: 'Test donut', price: '2.99' } 
      },
      { 
        field: 'description', 
        payload: { sku: 'test-sku', description: '', price: '2.99' } 
      },
      { 
        field: 'price', 
        payload: { sku: 'test-sku', description: 'Test donut', price: '' } 
      }
    ])('should return 400 for update with empty $field field', async ({ payload }) => {
      const response = await postRequest('?skuCode=glazed', payload);
      
      expect(response.status).toBe(400);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
    });

    test.each([
      {
        originalSku: 'berliner',
        updatedData: { sku: 'berliner-v2', description: 'Jelly donut v2', price: '3.29' }
      },
      {
        originalSku: 'glazed',
        updatedData: { sku: 'glazed-premium', description: 'Premium glazed', price: '2.79' }
      },
      {
        originalSku: 'chocolate',
        updatedData: { sku: 'chocolate-deluxe', description: 'Deluxe chocolate', price: '3.19' }
      }
    ])('should successfully update $originalSku to $updatedData.sku', async ({ originalSku, updatedData }) => {
      const response = await postRequest(`?skuCode=${originalSku}`, updatedData);
      
      expect(response.status).toBe(200);
      
      const updatedSku = await parseJsonResponse(response);
      expect(updatedSku.sku).toBe(updatedData.sku);
      expect(updatedSku.description).toBe(updatedData.description);
      expect(updatedSku.price).toBe(updatedData.price);
      
      // Verify via GET request
      const getResponse = await getRequest(updatedData.sku);
      expect(getResponse.status).toBe(200);
    });

  });

});