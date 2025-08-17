import { getRequest, postRequest, parseJsonResponse } from './utils/httpUtils';
import { setupTestData, cleanupTestData, getExpectedSkuCount } from './utils/testUtils';

describe('SKU API - POST Create Tests', () => {
  
  beforeEach(async () => {
    await setupTestData();
    // Small delay to ensure file system operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/skus - Create New SKU', () => {
    
    test('should create a new SKU with valid data and return status 201', async () => {
      const newSku = {
        sku: 'maple-bar',
        description: 'Maple glazed bar donut',
        price: '3.25'
      };

      const response = await postRequest('', newSku);
      
      expect(response.status).toBe(201);
    });

    test('should return the created SKU with all fields populated', async () => {
      const newSku = {
        sku: 'maple-bar',
        description: 'Maple glazed bar donut',
        price: '3.25'
      };

      const response = await postRequest('', newSku);
      const createdSku = await parseJsonResponse(response);
      
      // Check all required fields are present
      expect(createdSku).toHaveProperty('sku', newSku.sku);
      expect(createdSku).toHaveProperty('description', newSku.description);
      expect(createdSku).toHaveProperty('price', newSku.price);
      expect(createdSku).toHaveProperty('createdAt');
      expect(createdSku).toHaveProperty('updatedAt');
      
      // Verify timestamps are valid dates
      expect(new Date(createdSku.createdAt)).toBeInstanceOf(Date);
      expect(new Date(createdSku.updatedAt)).toBeInstanceOf(Date);
      
      // For new SKUs, createdAt and updatedAt should be the same
      expect(createdSku.createdAt).toBe(createdSku.updatedAt);
    });

    test('should add the new SKU to the collection', async () => {
      // Get initial count
      const initialResponse = await getRequest();
      const initialSkus = await parseJsonResponse(initialResponse);
      const initialCount = initialSkus.length;
      
      const newSku = {
        sku: 'old-fashioned',
        description: 'Old fashioned cake donut',
        price: '2.75'
      };

      // Create new SKU
      const createResponse = await postRequest('', newSku);
      expect(createResponse.status).toBe(201);
      
      // Verify collection size increased
      const afterResponse = await getRequest();
      const afterSkus = await parseJsonResponse(afterResponse);
      
      expect(afterSkus).toHaveLength(initialCount + 1);
      
      // Verify the new SKU is in the collection
      const addedSku = afterSkus.find((sku: any) => sku.sku === newSku.sku);
      expect(addedSku).toBeDefined();
      expect(addedSku.description).toBe(newSku.description);
      expect(addedSku.price).toBe(newSku.price);
    });

    test('should return 409 when trying to create a SKU with existing code', async () => {
      const duplicateSku = {
        sku: 'berliner', // This already exists in test data
        description: 'Duplicate jelly donut',
        price: '3.99'
      };

      const response = await postRequest('', duplicateSku);
      
      expect(response.status).toBe(409);
      
      // Verify error message
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('already exists');
      expect(errorResponse.error).toContain('berliner');
    });

    test('should not modify collection when creation fails due to duplicate', async () => {
      // Get initial state
      const initialResponse = await getRequest();
      const initialSkus = await parseJsonResponse(initialResponse);
      const initialCount = initialSkus.length;
      
      const duplicateSku = {
        sku: 'glazed', // This already exists in test data
        description: 'Duplicate glazed donut',
        price: '2.99'
      };

      // Try to create duplicate
      const response = await postRequest('', duplicateSku);
      expect(response.status).toBe(409);
      
      // Verify collection is unchanged
      const afterResponse = await getRequest();
      const afterSkus = await parseJsonResponse(afterResponse);
      
      expect(afterSkus).toHaveLength(initialCount);
      
      // Verify original data is intact
      const originalGlazed = afterSkus.find((sku: any) => sku.sku === 'glazed');
      expect(originalGlazed.description).toBe('Glazed donut'); // Original description
      expect(originalGlazed.price).toBe('1.99'); // Original price
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
    ])('should return 400 for $description', async ({ payload }) => {
      const response = await postRequest('', payload);
      
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
    ])('should return 400 for empty $field field', async ({ payload }) => {
      const response = await postRequest('', payload);
      
      expect(response.status).toBe(400);
      
      const errorResponse = await parseJsonResponse(response);
      expect(errorResponse).toHaveProperty('error');
    });

    test('should create SKU with special characters in code', async () => {
      const specialSku = {
        sku: 'cinnamon-sugar-twist',
        description: 'Cinnamon sugar twisted donut',
        price: '2.89'
      };

      const response = await postRequest('', specialSku);
      
      expect(response.status).toBe(201);
      
      // Verify it can be retrieved
      const getResponse = await getRequest(specialSku.sku);
      expect(getResponse.status).toBe(200);
    });

    test.each([
      { 
        sku: 'price-test-1', 
        description: 'Price test 1', 
        price: '1.99' 
      },
      { 
        sku: 'price-test-2', 
        description: 'Price test 2', 
        price: '10.00' 
      },
      { 
        sku: 'price-test-3', 
        description: 'Price test 3', 
        price: '0.99' 
      }
    ])('should handle price format $price for SKU $sku', async (skuData) => {
      const response = await postRequest('', skuData);
      
      expect(response.status).toBe(201);
      
      const createdSku = await parseJsonResponse(response);
      expect(createdSku.price).toBe(skuData.price);
    });

  });

});