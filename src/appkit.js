// src/App.jsx
import React, { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { openConnectModal, openNetworkModal } from './lib/AppKitProvider'
import { readErc20Balance } from './lib/erc20'
import { USDT } from './lib/tokens'
import { logEvent, logNetworkChange, logWallet } from './api/log'
import ConnectModal from './components/ConnectModal'

// Tron helpers
import { connectTron, readTRC20Balance, transferTRC20, TRON_USDT } from './lib/tron'

function truncate(addr){ return addr ? addr.slice(0,6)+'...'+addr.slice(-4) : '' }

export default function App() {
  const { address, status, isConnected } = useAccount()
  const chainId = useChainId()
  const [log, setLog] = useState('')
  const [showConnect, setShowConnect] = useState(false)

  // Tron state
  const [tronAddress, setTronAddress] = useState(null)

  // Wallet logs
  useEffect(() => {
    if (isConnected && address) logWallet('connected', address)
    else if (status === 'disconnected') logWallet('disconnected')
  }, [isConnected, status, address])

  // Network logs
  useEffect(() => {
    if (chainId) logNetworkChange({ id: chainId })
  }, [chainId])

  async function onReadUSDT_EVM() {
    try {
      if (!isConnected) return setLog('Connect an EVM wallet first.')
      const token = USDT[chainId]
      if (!token) return setLog(`No EVM USDT configured for chain ${chainId}.`)
      const bal = await readErc20Balance(token, address)
      setLog(`EVM USDT on chain ${chainId}: ${bal.formatted} ${bal.symbol}`)
    } catch (e) { setLog(String(e?.message || e)) }
  }

  async function onConnectTron() {
    try {
      const { address } = await connectTron()
      setTronAddress(address)
      setLog(`Tron connected: ${address}`)
      logEvent('Tron connected', { address })
    } catch (e) { setLog(String(e?.message || e)) }
  }

  async function onReadUSDT_Tron() {
    try {
      if (!tronAddress) return setLog('Connect Tron first.')
      const bal = await readTRC20Balance(TRON_USDT, tronAddress)
      setLog(`TRON USDT: ${bal.formatted} ${bal.symbol}`)
      logEvent('Tron USDT read', { address: tronAddress, balance: bal.formatted })
    } catch (e) { setLog(String(e?.message || e)) }
  }

  async function onSendUSDT_Tron(to, amount) {
    try {
      if (!tronAddress) return setLog('Connect Tron first.')
      if (!to) return setLog('Enter recipient address.')
      if (!amount || Number(amount) <= 0) return setLog('Enter a valid amount.')

      const { txid } = await transferTRC20(TRON_USDT, to, amount)
      setLog(`TRON USDT sent: ${amount} → ${to}\nTx: ${txid}`)
      logEvent('Tron USDT sent', { from: tronAddress, to, amount, txid })
    } catch (e) { setLog(String(e?.message || e)) }
  }

  return (
    <div className="container">
      {/* NAV */}
      <nav className="nav">
        <div className="brand">
          <img className="brand-icon" src="/favicon.svg" alt="" />
          <span className="brand-title">NeonVault</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowConnect(true)}>
            {isConnected ? `${truncate(address)} • Wallet` : 'Connect Wallet'}
          </button>
          {isConnected && (
            <button className="btn btn-outline" onClick={openNetworkModal}>Networks</button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <h1>Gate premium features behind your wallet.</h1>

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowConnect(true)}>
              {isConnected ? 'View Wallets' : 'Connect to Continue'}
            </button>
            {isConnected && (
              <button className="btn btn-secondary" onClick={onReadUSDT_EVM}>Read USDT (EVM)</button>
            )}
          </div>

          <div className="kpis">
            <div className="kpi"><h3>Status</h3><p>{status}</p></div>
            <div className="kpi"><h3>Access</h3><p>{isConnected ? 'Granted' : 'Locked'}</p></div>
            <div className="kpi"><h3>Address</h3><p>{isConnected ? truncate(address) : '—'}</p></div>
            <div className="kpi"><h3>Chain</h3><p>{chainId || '—'}</p></div>
          </div>
        </div>
      </section>

      {/* Optional quick Tron actions */}
      <section className="mt-4">
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={onConnectTron}>
            {tronAddress ? `Tron: ${truncate(tronAddress)}` : 'Connect Tron'}
          </button>
          <button className="btn btn-secondary" onClick={onReadUSDT_Tron}>Read USDT (TRON)</button>
        </div>
      </section>

      {log && (
        <section className="mt-4">
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">{log}</pre>
        </section>
      )}

      <footer className="footer">
        NeonVault • Built with AppKit + Wagmi • {new Date().getFullYear()}
      </footer>

      {/* Unified Connect Modal */}
      <ConnectModal
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onOpenAppKit={() => { setShowConnect(false); openConnectModal() }}
        tronAddress={tronAddress}
        onConnectTron={onConnectTron}
        onReadTronUSDT={onReadUSDT_Tron}
        onSendTronUSDT={onSendUSDT_Tron}
      />
    </div>
  )
}

