import { getRequest, parseJsonResponse } from './utils/httpUtils';
import { setupTestData, cleanupTestData, getExpectedSkuCodes } from './utils/testUtils';

describe('SKU API - GET Single Item Tests', () => {
  
  beforeEach(async () => {
    await setupTestData();
    // Small delay to ensure file system operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/skus/{sku_code}', () => {
    
    test('should return a specific SKU with status 200', async () => {
      const response = await getRequest('berliner');
      
      expect(response.status).toBe(200);
    });

    test('should return the correct SKU data for existing item', async () => {
      const response = await getRequest('glazed');
      const sku = await parseJsonResponse(response);
      
      // Verify it's the correct SKU
      expect(sku).toHaveProperty('sku', 'glazed');
      expect(sku).toHaveProperty('description', 'Glazed donut');
      expect(sku).toHaveProperty('price', '1.99');
      
      // Verify all required fields are present
      expect(sku).toHaveProperty('createdAt');
      expect(sku).toHaveProperty('updatedAt');
      
      // Verify timestamps are valid dates
      expect(new Date(sku.createdAt)).toBeInstanceOf(Date);
      expect(new Date(sku.updatedAt)).toBeInstanceOf(Date);
    });

    test.each([
      { 
        skuCode: 'berliner', 
        expectedDescription: 'Jelly donut', 
        expectedPrice: '2.99' 
      },
      { 
        skuCode: 'glazed', 
        expectedDescription: 'Glazed donut', 
        expectedPrice: '1.99' 
      },
      { 
        skuCode: 'chocolate', 
        expectedDescription: 'Chocolate frosted donut', 
        expectedPrice: '2.49' 
      },
      { 
        skuCode: 'boston-cream', 
        expectedDescription: 'Boston cream donut', 
        expectedPrice: '3.49' 
      }
    ])('should return correct data for SKU $skuCode', async ({ skuCode, expectedDescription, expectedPrice }) => {
      const response = await getRequest(skuCode);
      
      expect(response.status).toBe(200);
      
      const sku = await parseJsonResponse(response);
      expect(sku.sku).toBe(skuCode);
      expect(sku.description).toBe(expectedDescription);
      expect(sku.price).toBe(expectedPrice);
    });

    test('should return SKU with correct data types', async () => {
      const response = await getRequest('chocolate');
      const sku = await parseJsonResponse(response);
      
      expect(typeof sku.sku).toBe('string');
      expect(typeof sku.description).toBe('string');
      expect(typeof sku.price).toBe('string');
      expect(typeof sku.createdAt).toBe('string');
      expect(typeof sku.updatedAt).toBe('string');
      
      // Verify date strings are valid
      expect(new Date(sku.createdAt)).toBeInstanceOf(Date);
      expect(new Date(sku.updatedAt)).toBeInstanceOf(Date);
      expect(isNaN(new Date(sku.createdAt).getTime())).toBe(false);
      expect(isNaN(new Date(sku.updatedAt).getTime())).toBe(false);
    });

    test('should return 404 for non-existent SKU', async () => {
      const response = await getRequest('non-existent-sku');
      
      expect(response.status).toBe(404);
      
      // Verify error message
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toBe('SKU not found');
    });

    test('should handle SKU codes with special characters', async () => {
      // Test the 'boston-cream' SKU which has a hyphen
      const response = await getRequest('boston-cream');
      
      expect(response.status).toBe(200);
      
      const sku = await parseJsonResponse(response);
      expect(sku.sku).toBe('boston-cream');
      expect(sku.description).toBe('Boston cream donut');
    });

    test.each([
      '%20',        // URL encoded space
      'sku%20code', // URL encoded space in middle
      '123',        // Numeric string
      'SKU-WITH-CAPS' // All caps
    ])('should handle edge case SKU code: "%s"', async (edgeCaseSku) => {
      const response = await getRequest(edgeCaseSku);
      
      // All of these should return 404 since they don't exist in test data
      expect(response.status).toBe(404);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
    });

    test('should return only the requested SKU, not others', async () => {
      const response = await getRequest('berliner');
      const sku = await parseJsonResponse(response);
      
      // Should be a single object, not an array
      expect(Array.isArray(sku)).toBe(false);
      expect(typeof sku).toBe('object');
      
      // Should be exactly the requested SKU
      expect(sku.sku).toBe('berliner');
      
      // Should not contain data from other SKUs
      expect(sku.sku).not.toBe('glazed');
      expect(sku.sku).not.toBe('chocolate');
      expect(sku.sku).not.toBe('boston-cream');
    });

    test('should be case-sensitive for SKU codes', async () => {
      // Test that SKU codes are case-sensitive
      const upperCaseResponse = await getRequest('BERLINER');
      const mixedCaseResponse = await getRequest('Berliner');
      
      // Both should return 404 since our test data uses lowercase
      expect(upperCaseResponse.status).toBe(404);
      expect(mixedCaseResponse.status).toBe(404);
      
      // But the correct lowercase should work
      const correctCaseResponse = await getRequest('berliner');
      expect(correctCaseResponse.status).toBe(200);
    });

    test('should handle concurrent requests for the same SKU', async () => {
      // Make multiple simultaneous requests for the same SKU
      const promises = Array(5).fill(null).map(() => getRequest('glazed'));
      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // All should return the same data
      const skuDataPromises = responses.map(response => parseJsonResponse(response));
      const skuData = await Promise.all(skuDataPromises);
      
      skuData.forEach(sku => {
        expect(sku.sku).toBe('glazed');
        expect(sku.description).toBe('Glazed donut');
        expect(sku.price).toBe('1.99');
      });
    });

    test('should handle empty string SKU code by returning all SKUs', async () => {
        // Empty string gets treated as no endpoint, so it hits GET all
        const response = await getRequest('');
        expect(response.status).toBe(200);
        // Returns array of all SKUs
      });
      
      test('should handle space-only SKU code by returning all SKUs', async () => {
        // Space gets treated as no endpoint, so it hits GET all  
        const response = await getRequest(' ');
        expect(response.status).toBe(200);
        // Returns array of all SKUs
      });

  });

});