# Ethereum Voting DApp (Solidity, Hardhat, MetaMask, Ethers.js)

A voting DApp built with **Solidity** and **Hardhat** (MetaMask/**Ethers.js**). It lets an admin start/end a vote, enforces one-account-one-vote, and displays live tallies on a local or test network.

## Features
- Admin-controlled lifecycle: `Created → Voting → Ended`
- One vote per address, with events for transparency
- Read candidates & results on-chain; simple React UI
- Local Hardhat network and testnet-ready (e.g., Sepolia)

## Tech Stack
- **Contracts:** Solidity 0.8.20
- **Framework:** Hardhat + @nomicfoundation/hardhat-toolbox
- **Wallet:** MetaMask
- **Library:** Ethers v6
- **Frontend:** React + Vite

## Quick Start (Local)
```bash
npm ci

# Compile & test
npx hardhat compile
npx hardhat test

# 3Start a local node in a separate terminal
npx hardhat node

# Deploy to localhost (writes ABI & address to frontend/src/)
npm run deploy:local

# Start the React app
cd frontend
npm ci
npm run dev
# Open http://localhost:5173
```
When MetaMask prompts, switch the network to **Localhost 8545**.
