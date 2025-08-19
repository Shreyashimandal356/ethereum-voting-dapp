import React, { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS } from './config.js'
import VotingAbi from './abi/Voting.json'

export default function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [state, setState] = useState(0) // 0 Created, 1 Voting, 2 Ended
  const [txPending, setTxPending] = useState(false)
  const [error, setError] = useState('')

  const canVote = useMemo(() => state === 1 && !hasVoted, [state, hasVoted])

  useEffect(() => {
    if (!window.ethereum) return
    const p = new ethers.BrowserProvider(window.ethereum)
    setProvider(p)

    const handleAccountsChanged = async () => {
      const accs = await p.send('eth_requestAccounts', [])
      setAccount(accs[0] || null)
      const s = await p.getSigner()
      setSigner(s)
    }
    handleAccountsChanged()
    window.ethereum.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum.on?.('chainChanged', () => window.location.reload())
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [])

  useEffect(() => {
    if (!signer || !CONTRACT_ADDRESS || CONTRACT_ADDRESS.includes('REPLACE_')) return
    const c = new ethers.Contract(CONTRACT_ADDRESS, VotingAbi, signer)
    setContract(c)

    const load = async () => {
      try {
        const [names, r, st, voted] = await Promise.all([
          c.getCandidates(),
          c.results(),
          c.state(),
          c.hasVoted(await signer.getAddress()),
        ])
        setCandidates(names)
        setResults(r.map((x) => Number(x)))
        setState(Number(st))
        setHasVoted(Boolean(voted))
      } catch (e) {
        setError(String(e))
      }
    }
    load()

    const votedEv = c.on('VoteCast', () => load())
    const stateEv = c.on('StateChanged', () => load())
    return () => {
      c.removeAllListeners('VoteCast')
      c.removeAllListeners('StateChanged')
    }
  }, [signer])

  const doVote = async (idx) => {
    if (!contract) return
    try {
      setTxPending(true)
      const tx = await contract.vote(idx)
      await tx.wait()
      setTxPending(false)
    } catch (e) {
      setTxPending(false)
      setError(String(e))
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Voting DApp</h1>
      {!window.ethereum && <p>Please install MetaMask.</p>}
      {window.ethereum && (
        <p>
          Connected account: <b>{account || 'Not connected'}</b>
        </p>
      )}
      <p>State: {['Created', 'Voting', 'Ended'][state] || state}</p>
      {error && <p style={{ color: '#b00' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {candidates.map((name, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div>
              <b>{name}</b>
              <div style={{ fontSize: 12, color: '#666' }}>Votes: {results[i] ?? 0}</div>
            </div>
            <button
              disabled={!canVote || txPending}
              onClick={() => doVote(i)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 6, cursor: canVote ? 'pointer' : 'not-allowed' }}
            >
              Vote
            </button>
          </div>
        ))}
      </div>

      {state === 0 && <p><i>Waiting for admin to start voting.</i></p>}
      {state === 2 && <p><i>Voting has ended.</i></p>}
    </div>
  )
}
