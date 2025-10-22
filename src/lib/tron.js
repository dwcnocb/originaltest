// src/lib/tron.js
import TronWeb from 'tronweb'

// USDT (TRC-20) on Tron mainnet
export const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

const TRC20_ABI = [
  { constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], type: 'function' },
  { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' },
  { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], type: 'function' },
  { constant: false, inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transfer', outputs: [{ name: 'success', type: 'bool' }], type: 'function' }
]

// Prefer injected TronLink; fallback to public read-only node
export async function getTronWeb() {
  if (typeof window !== 'undefined') {
    if (window.tronWeb?.ready) return window.tronWeb
    if (window.tronLink) {
      try { await window.tronLink.request?.({ method: 'tron_requestAccounts' }) } catch {}
      if (window.tronWeb?.ready) return window.tronWeb
    }
  }
  // Read-only fallback (no signing)
  return new TronWeb({ fullHost: 'https://api.trongrid.io' })
}

export async function connectTron() {
  const tw = await getTronWeb()
  const addr = tw.defaultAddress?.base58 || null
  if (!addr) throw new Error('Open this site inside TronLink (dApp browser) and authorize.')
  return { tronWeb: tw, address: addr }
}

export async function readTRC20Balance(tokenAddress, holderBase58) {
  const tronWeb = await getTronWeb()
  if (!tokenAddress) throw new Error('No TRC-20 token for Tron.')
  if (!holderBase58) throw new Error('No Tron address.')

  const contract = await tronWeb.contract(TRC20_ABI, tokenAddress)
  const [decimals, symbol, raw] = await Promise.all([
    contract.decimals().call(),
    contract.symbol().call(),
    contract.balanceOf(holderBase58).call()
  ])

  const formatted = formatUnitsTron(raw.toString(), Number(decimals))
  return { symbol, decimals: Number(decimals), raw: raw.toString(), formatted }
}

// 🔥 Send TRC-20 (e.g., USDT on Tron)
export async function transferTRC20(tokenAddress, toBase58, amountHuman) {
  const tronWeb = await getTronWeb()
  if (!tokenAddress) throw new Error('No TRC-20 token for Tron.')
  if (!toBase58) throw new Error('Recipient address required.')
  if (!tronWeb.isAddress?.(toBase58)) throw new Error('Invalid Tron recipient address.')

  // Must be in TronLink for signing
  const fromBase58 = tronWeb?.defaultAddress?.base58
  if (!fromBase58) throw new Error('Connect Tron (TronLink) first to sign.')

  const contract = await tronWeb.contract(TRC20_ABI, tokenAddress)
  const decimals = Number(await contract.decimals().call())
  const value = parseUnitsTron(String(amountHuman), decimals)

  // feeLimit in "sun" (1 TRX = 1e6 sun). 20,000,000 sun = 20 TRX limit (safe upper bound).
  const tx = await contract.transfer(toBase58, value).send({
    feeLimit: 20_000_000
  })

  // tx is usually a transaction id (hash)
  return { txid: tx }
}

// Utilities
function formatUnitsTron(rawStr, decimals) {
  const n = BigInt(rawStr)
  const base = 10n ** BigInt(decimals)
  const int = n / base
  const frac = (n % base).toString().padStart(decimals, '0')
  return decimals ? `${int}.${frac}`.replace(/\.?0+$/, '') : int.toString()
}

function parseUnitsTron(human, decimals) {
  const [i, f = ''] = String(human).split('.')
  const frac = f.padEnd(decimals, '0').slice(0, decimals)
  return (BigInt(i || '0') * (10n ** BigInt(decimals))) + BigInt(frac || '0')
}
