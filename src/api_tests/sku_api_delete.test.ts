import { getRequest, deleteRequest, parseJsonResponse } from './utils/httpUtils';
import { setupTestData, cleanupTestData, getExpectedSkuCodes } from './utils/testUtils';

describe('SKU API - DELETE Tests', () => {
  
  beforeEach(async () => {
    await setupTestData();
    // Small delay to ensure file system operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('DELETE /api/skus/{sku_code}', () => {
    
    it.only('should delete an existing SKU and return status 204', async () => {
      // Verify the SKU exists first
      const getResponse = await getRequest('berliner');
      expect(getResponse.status).toBe(200);
      
      // Delete the SKU
      const deleteResponse = await deleteRequest('berliner');
      expect(deleteResponse.status).toBe(204);
      
      // Verify the response body is empty for 204
      const responseText = await deleteResponse.text();
      expect(responseText).toBe('');
    });

    it('should remove the SKU from the collection after deletion', async () => {
      // Get initial count
      const initialResponse = await getRequest();
      const initialSkus = await parseJsonResponse(initialResponse);
      const initialCount = initialSkus.length;
      
      // Verify the SKU exists
      expect(initialSkus.some((sku: any) => sku.sku === 'glazed')).toBe(true);
      
      // Delete the SKU
      const deleteResponse = await deleteRequest('glazed');
      expect(deleteResponse.status).toBe(204);
      
      // Verify the SKU is no longer in the collection
      const afterResponse = await getRequest();
      const afterSkus = await parseJsonResponse(afterResponse);
      
      expect(afterSkus).toHaveLength(initialCount - 1);
      expect(afterSkus.some((sku: any) => sku.sku === 'glazed')).toBe(false);
    });

    it('should return 404 when trying to delete a non-existent SKU', async () => {
      const deleteResponse = await deleteRequest('non-existent-sku');
      
      expect(deleteResponse.status).toBe(404);
      
      // Verify error message
      const errorResponse = await parseJsonResponse(deleteResponse);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toBe('SKU not found');
    });

    it('should not affect other SKUs when deleting a non-existent SKU', async () => {
      // Get initial count
      const initialResponse = await getRequest();
      const initialSkus = await parseJsonResponse(initialResponse);
      const initialCount = initialSkus.length;
      const expectedSkuCodes = await getExpectedSkuCodes();
      
      // Try to delete non-existent SKU
      const deleteResponse = await deleteRequest('invalid-sku-code');
      expect(deleteResponse.status).toBe(404);
      
      // Verify all original SKUs are still present
      const afterResponse = await getRequest();
      const afterSkus = await parseJsonResponse(afterResponse);
      const afterSkuCodes = afterSkus.map((sku: any) => sku.sku);
      
      expect(afterSkus).toHaveLength(initialCount);
      expect(afterSkuCodes).toEqual(expect.arrayContaining(expectedSkuCodes));
    });

    it('should handle deletion of SKU with special characters in code', async () => {
      // Test with the 'boston-cream' SKU which has a hyphen
      const deleteResponse = await deleteRequest('boston-cream');
      
      expect(deleteResponse.status).toBe(204);
      
      // Verify it's actually deleted
      const getResponse = await getRequest('boston-cream');
      expect(getResponse.status).toBe(404);
    });

    it('should return proper error for malformed SKU codes', async () => {
      // Test with empty string - should be handled gracefully
      const deleteResponse = await deleteRequest('');
      
      // This might return 404 or 400 depending on route handling
      expect([400, 404]).toContain(deleteResponse.status);
    });

  });

});