// Generic wallet interactions for TrueLens

// Interface representing a transaction
export interface Transaction {
  from: string;
  to: string;
  value: string;
  data: string;
  chainId: string;
}

// Interface for Ethereum provider
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
}

// Add ethereum property to the window type
declare global {
  interface Window {
    ethereum?: EthereumProvider | {
      providers?: EthereumProvider[];
      providerMap?: Map<string, EthereumProvider>;
    };
  }
}

// Get the MetaMask provider specifically
export const getMetaMaskProvider = (): EthereumProvider | null => {
  // Case 1: When MetaMask is the only provider (standard)
  if (typeof window !== 'undefined' && 
      window.ethereum && 
      'isMetaMask' in window.ethereum && 
      window.ethereum.isMetaMask) {
    return window.ethereum as EthereumProvider;
  }

  // Case 2: When there's a providers array (e.g., with Coinbase Wallet + MetaMask)
  if (typeof window !== 'undefined' && 
      window.ethereum && 
      'providers' in window.ethereum && 
      Array.isArray(window.ethereum.providers)) {
    const metaMaskProvider = window.ethereum.providers.find(
      (provider) => provider && 'isMetaMask' in provider && provider.isMetaMask
    );
    if (metaMaskProvider) {
      return metaMaskProvider;
    }
  }
  
  return null;
};

// Mock function to request wallet connection and get account
export const connectWallet = async (): Promise<string | null> => {
  const metaMaskProvider = getMetaMaskProvider();
  
  if (!metaMaskProvider) {
    console.error("MetaMask not found. Please install the MetaMask extension.");
    alert("MetaMask is not found or not available. Please install the MetaMask extension to use this feature.");
    
    // Open MetaMask installation page
    window.open('https://metamask.io/download/', '_blank');
    return null;
  }
  
  try {
    // Request account access
    const accounts = await metaMaskProvider.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("User denied account access", error);
    return null;
  }
};

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  const metaMaskProvider = getMetaMaskProvider();
  
  if (!metaMaskProvider) {
    return false;
  }
  
  try {
    const accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
};

// Generic function to sign verification data
export const signVerificationData = async (
  newsId: number,
  choice: 'verify' | 'flag',
  newsDetails?: {
    title?: string;
    source?: string;
    date?: string;
    summary?: string;
    ipfsHash?: string;
  }
): Promise<{success: boolean, hash?: string}> => {
  const metaMaskProvider = getMetaMaskProvider();
  
  if (!metaMaskProvider) {
    console.error("MetaMask not found.");
    return { success: false };
  }
  
  try {
    const accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      console.error("No accounts connected");
      return { success: false };
    }
    
    const account = accounts[0];
    const message = `Verification for news ID: ${newsId}, Choice: ${choice}`;
    
    // Sign the message
    const signature = await metaMaskProvider.request({
      method: 'personal_sign',
      params: [message, account]
    });
    
    return { 
      success: true, 
      hash: signature 
    };
  } catch (error) {
    console.error("Error signing verification:", error);
    return { success: false };
  }
}; 