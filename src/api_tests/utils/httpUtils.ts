// src/api_tests/utils/httpUtils.ts

// Test configuration
export const API_BASE_URL = 'http://localhost:3000/api/skus';

// Helper function to make HTTP requests
export async function makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response;
}

// Helper function to make GET request
export async function getRequest(endpoint: string = ''): Promise<Response> {
  const url = endpoint ? `${API_BASE_URL}/${endpoint}` : API_BASE_URL;
  return makeRequest(url, { method: 'GET' });
}

// Helper function to make POST request
export async function postRequest(endpoint: string = '', body?: any): Promise<Response> {
  const url = endpoint ? `${API_BASE_URL}/${endpoint}` : API_BASE_URL;
  return makeRequest(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Helper function to make DELETE request
export async function deleteRequest(endpoint: string): Promise<Response> {
  const url = `${API_BASE_URL}/${endpoint}`;
  return makeRequest(url, { method: 'DELETE' });
}

// Helper function to parse JSON response with error handling
export async function parseJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to parse JSON response: ${errorMessage}`);
  }
}