// src/api_tests/utils/testUtils.ts

import * as fs from 'fs/promises';
import * as path from 'path';

// Test data paths
export const TEST_DATA_PATH = path.resolve('./src/api_tests/test_data/test_data.json');
export const SKU_DATA_PATH = path.resolve('./data/skus.json');

// Test setup function to initialize test data
export async function setupTestData(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(SKU_DATA_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Copy test data to the application's data directory
    const testData = await fs.readFile(TEST_DATA_PATH, 'utf-8');
    await fs.writeFile(SKU_DATA_PATH, testData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to setup test data: ${errorMessage}`);
  }
}

// Test cleanup function
export async function cleanupTestData(): Promise<void> {
  try {
    await fs.unlink(SKU_DATA_PATH);
  } catch (error) {
    // Ignore if file doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to cleanup test data: ${errorMessage}`);
    }
  }
}

// Helper function to read test data for validation
export async function readTestData(): Promise<any[]> {
  try {
    const testData = await fs.readFile(TEST_DATA_PATH, 'utf-8');
    return JSON.parse(testData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to read test data: ${errorMessage}`);
  }
}

// Helper function to get expected SKU codes from test data
export async function getExpectedSkuCodes(): Promise<string[]> {
  const testData = await readTestData();
  return testData.map((sku: any) => sku.sku);
}

// Helper function to get expected SKU count from test data
export async function getExpectedSkuCount(): Promise<number> {
  const testData = await readTestData();
  return testData.length;
}