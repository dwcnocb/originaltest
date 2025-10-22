// src/components/ConnectModal.jsx
import React, { useState } from 'react'

export default function ConnectModal({
  open,
  onClose,
  onOpenAppKit,       // () => void
  tronAddress,        // string | null
  onConnectTron,      // () => Promise<void>
  onReadTronUSDT,     // () => Promise<void>
  onSendTronUSDT      // (to, amount) => Promise<void>
}) {
  const [tab, setTab] = useState('appkit') // 'appkit' | 'tron'
  const [to, setTo] = useState('')
  const [amt, setAmt] = useState('')

  if (!open) return null

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <strong>Connect Wallet</strong>
          <button onClick={onClose} style={xbtn}>×</button>
        </div>

        <div style={tabs}>
          <button
            style={{ ...tabBtn, ...(tab === 'appkit' ? tabActive : {}) }}
            onClick={() => setTab('appkit')}
          >
            Multichain (AppKit)
          </button>
          <button
            style={{ ...tabBtn, ...(tab === 'tron' ? tabActive : {}) }}
            onClick={() => setTab('tron')}
          >
            Tron (TronLink)
          </button>
        </div>

        {tab === 'appkit' ? (
          <div style={body}>
            <p>Connect to EVM, Solana, or Bitcoin via AppKit.</p>
            <button className="btn btn-primary" onClick={onOpenAppKit}>
              Open AppKit
            </button>
            <p style={hint}>Supports: Ethereum, Polygon, Base, BSC, Arbitrum, Optimism, Avalanche, Mantle, Solana, Bitcoin.</p>
          </div>
        ) : (
          <div style={body}>
            <p>Connect with <b>TronLink</b> to use TRON (TRC-20 like USDT).</p>
            <div className="flex gap-2" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button className="btn" onClick={onConnectTron}>
                {tronAddress ? `Connected: ${truncate(tronAddress)}` : 'Connect Tron'}
              </button>
              <button className="btn btn-secondary" onClick={onReadTronUSDT}>Read USDT (TRON)</button>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={lbl}>Recipient (T...):</label>
              <input
                style={inp}
                placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={lbl}>Amount (USDT):</label>
              <input
                style={inp}
                type="number"
                min="0"
                step="0.000001"
                placeholder="e.g. 25"
                value={amt}
                onChange={e => setAmt(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => onSendTronUSDT?.(to.trim(), amt.trim())}
              >
                Send USDT (TRON)
              </button>
            </div>

            <p style={hint}>Tip: On mobile, open this site inside the TronLink dApp browser.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function truncate(a){ return a ? a.slice(0,6)+'...'+a.slice(-4) : '' }

// inline styles (quick)
const backdrop = { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }
const sheet   = { width:520, maxWidth:'95vw', background:'#0b1220', color:'#e6ebff', borderRadius:16, boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }
const header  = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #1b2335' }
const xbtn    = { background:'transparent', color:'#9fb0d0', border:'none', fontSize:22, cursor:'pointer' }
const tabs    = { display:'flex', gap:8, padding:'10px 12px', borderBottom:'1px solid #1b2335' }
const tabBtn  = { background:'#11192b', color:'#9fb0d0', border:'1px solid #1b2335', padding:'8px 12px', borderRadius:10, cursor:'pointer' }
const tabActive = { background:'#1b2335', color:'#fff', borderColor:'#324064' }
const body    = { padding:'16px 16px 24px' }
const hint    = { color:'#9fb0d0', fontSize:12, marginTop:8 }
const lbl     = { display:'block', fontSize:12, marginBottom:4, color:'#9fb0d0' }
const inp     = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #1b2335', background:'#0f1830', color:'#e6ebff' }
