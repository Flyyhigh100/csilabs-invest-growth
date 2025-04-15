
import { toast } from 'sonner';

interface DefinedfiOptions {
  endpoint?: string;
  method?: 'GET' | 'POST';
  body?: any;
}

export async function callDefinedfiApi(
  path: string, 
  options: DefinedfiOptions = {}
): Promise<any> {
  try {
    // Get API key from localStorage
    const apiKey = localStorage.getItem('definedfi_api_key');
    
    if (!apiKey) {
      console.error('Defined.fi API key not found');
      throw new Error('API key not configured');
    }
    
    const baseUrl = 'https://api.defined.fi/api/v1';
    const url = `${baseUrl}${path}`;
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Defined.fi API error:', response.status, errorText);
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Defined.fi API:', error);
    toast.error('Error accessing Defined.fi API', {
      description: (error as Error).message || 'Please check your API key configuration',
    });
    throw error;
  }
}

// Function to validate API key
export async function validateDefinedfiApiKey(apiKey: string): Promise<boolean> {
  try {
    // Store temporarily for validation
    const originalKey = localStorage.getItem('definedfi_api_key');
    localStorage.setItem('definedfi_api_key', apiKey);
    
    // Make a simple API call to validate the key
    await callDefinedfiApi('/status');
    
    // Restore original key if validation failed
    if (!originalKey) {
      localStorage.removeItem('definedfi_api_key');
    } else {
      localStorage.setItem('definedfi_api_key', originalKey);
    }
    
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    
    // Restore original key if validation failed
    const originalKey = localStorage.getItem('definedfi_api_key');
    if (!originalKey) {
      localStorage.removeItem('definedfi_api_key');
    } else {
      localStorage.setItem('definedfi_api_key', originalKey);
    }
    
    return false;
  }
}

// Get token price from Defined.fi
export async function getTokenPrice(
  tokenAddress: string, 
  chainId: number = 1
): Promise<number | null> {
  try {
    const response = await callDefinedfiApi(`/tokens/${chainId}/${tokenAddress}?include=market_history`);
    return response?.data?.price?.value || null;
  } catch (error) {
    console.error('Error getting token price:', error);
    return null;
  }
}
