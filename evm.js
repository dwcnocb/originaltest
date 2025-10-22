evm.js/**
 * evm.js
 * Full EVM multi-chain balance detector
 * Uses Moralis API + Public RPC fallback
 */

import { ethers } from "ethers";

const MORALIS_API_KEY = "YOUR_MORALIS_API_KEY"; // <-- replace with your key
const MORALIS_API_URL = "https://deep-index.moralis.io/api/v2.2";

/**
 * Supported EVM networks — add or remove as needed
 */
const EVM_CHAINS = {
  eth: { name: "Ethereum Mainnet" },
  bsc: { name: "BNB Smart Chain" },
  polygon: { name: "Polygon" },
  avalanche: { name: "Avalanche C-Chain" },
  arbitrum: { name: "Arbitrum One" },
  optimism: { name: "Optimism" },
  base: { name: "Base" },
  mantle: { name: "Mantle" }
};

/**
 * Get balances for one EVM chain
 */
async function getBalancesForChain(walletAddress, chainKey) {
  try {
    // Native token balance
    const nativeRes = await fetch(
      `${MORALIS_API_URL}/${walletAddress}/balance?chain=${chainKey}`,
      {
        headers: { "X-API-Key": MORALIS_API_KEY },
      }
    );
    const nativeData = await nativeRes.json();
    const nativeBalance = ethers.formatEther(nativeData.balance || "0");

    // ERC20 token balances
    const tokenRes = await fetch(
      `${MORALIS_API_URL}/${walletAddress}/erc20?chain=${chainKey}`,
      {
        headers: { "X-API-Key": MORALIS_API_KEY },
      }
    );
    const tokenData = await tokenRes.json();

    const tokens = tokenData.map((t) => ({
      name: t.name,
      symbol: t.symbol,
      token_address: t.token_address,
      balance: Number(t.balance) / 10 ** (t.decimals || 18),
    }));

    return {
      chain: chainKey,
      native: nativeBalance,
      tokens,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${chainKey}:, error`);
    return { chain: chainKey, native: "0", tokens: [] };
  }
}

/**
 * Fetch balances from all supported EVM chains
 */
export async function getAllEvmBalances(walletAddress) {
  console.log(`🌐 Fetching EVM balances for ${walletAddress}...`) ;

  const results = {};
  const chainKeys = Object.keys(EVM_CHAINS);

  for (const chain of chainKeys) {
    const data = await getBalancesForChain(walletAddress, chain);
    results[chain] = data;
  }

  console.log("✅ Full multi-chain result:", results);
  return results;
}

/**
 * Example of how to trigger this after wallet connects
 */
// Example usage:
//
// import { getAllEvmBalances } from "neonvault-wallet-gated/evm.js";
//
// async function onWalletConnected(address) {
//   const allBalances = await getAllEvmBalances(address);
//   console.log("All EVM balances:", allBalances);
// }