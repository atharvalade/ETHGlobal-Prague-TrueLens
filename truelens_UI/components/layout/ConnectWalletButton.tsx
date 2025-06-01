"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectWallet, isWalletConnected } from '@/lib/wallet-utils';
import { getMetaMaskProvider } from '@/lib/wallet-utils';

const ConnectWalletButton = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await isWalletConnected();
      
      if (connected) {
        setWalletConnected(true);
        
        // Try to get the account address if connected
        try {
          const provider = getMetaMaskProvider();
          if (provider) {
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              const formattedAddress = formatAddress(accounts[0]);
              setWalletAddress(formattedAddress);
            }
          }
        } catch (error) {
          console.error("Error getting wallet address:", error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Listen for account changes
    const setupAccountChangeListener = () => {
      const provider = getMetaMaskProvider();
      if (provider) {
        provider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected wallet
            setWalletConnected(false);
            setWalletAddress(null);
          } else {
            // User switched account
            const formattedAddress = formatAddress(accounts[0]);
            setWalletAddress(formattedAddress);
            setWalletConnected(true);
          }
        });
      }
    };
    
    setupAccountChangeListener();
    
    // Cleanup listener on unmount
    return () => {
      const provider = getMetaMaskProvider();
      if (provider) {
        provider.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Format the address to show only start and end parts
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const address = await connectWallet();
      
      if (address) {
        setWalletConnected(true);
        setWalletAddress(formatAddress(address));
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletConnected && walletAddress) {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 h-[40px]"
      >
        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 10.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="flex items-center">
          <span className="mr-1.5">Profile</span>
          <span className="text-xs py-0.5 px-2 bg-gray-100 rounded-full text-gray-600 border border-gray-200">{walletAddress}</span>
        </span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleConnectWallet}
      disabled={isConnecting}
      className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 h-[40px] ${
        isConnecting
          ? 'bg-gray-100 text-gray-500 border border-gray-200'
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border border-transparent'
      }`}
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 33 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.3618 0H2.63273C1.17991 0 0 1.17991 0 2.63273V22.3782C0 23.831 1.17991 25.0109 2.63273 25.0109H12.4455V29.1945H8.29697V31H24.7077V29.1945H20.5491V25.0109H30.3618C31.8146 25.0109 32.9945 23.831 32.9945 22.3782V2.63273C32.9945 1.17991 31.8146 0 30.3618 0ZM21.3073 29.1945H11.6873V25.0109H21.3073V29.1945ZM31.1891 22.3782C31.1891 22.8346 30.8182 23.2055 30.3618 23.2055H2.63273C2.17634 23.2055 1.80546 22.8346 1.80546 22.3782V21.5182H31.1891V22.3782ZM31.1891 19.7127H1.80546V2.63273C1.80546 2.17634 2.17634 1.80546 2.63273 1.80546H30.3618C30.8182 1.80546 31.1891 2.17634 31.1891 2.63273V19.7127Z" fill="currentColor"/>
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
};

export default ConnectWalletButton; 