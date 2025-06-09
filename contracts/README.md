# Football Quiz NFT - Foundry Project

A Solidity smart contract for minting NFTs based on football quiz scores, built with the Foundry framework.

## Features

- **Score-based NFT Minting**: Mint NFTs with dynamic metadata based on quiz scores
- **Dynamic SVG Generation**: Generate unique SVG images based on performance levels
- **Rarity System**: 5 rarity tiers (Basic, Common, Rare, Epic, Legendary)
- **Leaderboard**: Track top scores across all players
- **Achievement Tracking**: Store personal best scores and timestamps

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

## Installation

1. **Initialize a new Foundry project:**
```bash
forge init football-quiz-nft
cd football-quiz-nft
```

2. **Install OpenZeppelin contracts:**
```bash
forge install OpenZeppelin/openzeppelin-contracts
```

3. **Copy the contract files:**
   - Place `FootballQuizNFT.sol` in `src/`
   - Place `Deploy.s.sol` in `script/`
   - Place `FootballQuizNFT.t.sol` in `test/`
   - Replace `foundry.toml` with the provided configuration

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

## Project Structure

```
football-quiz-nft/
├── src/
│   └── FootballQuizNFT.sol          # Main contract
├── script/
│   └── Deploy.s.sol                 # Deployment scripts
├── test/
│   └── FootballQuizNFT.t.sol        # Test suite
├── foundry.toml                     # Foundry configuration
├── .env.example                     # Environment template
└── README.md                        # This file
```

## Usage

### Building

```bash
forge build
```

### Testing

Run all tests:
```bash
forge test
```

Run tests with verbosity:
```bash
forge test -vvv
```

Run specific test:
```bash
forge test --match-contract FootballQuizNFTTest
```

### Deployment

#### Deploy to local network (Anvil):

1. Start local node:
```bash
anvil
```

2. Deploy contract:
```bash
forge script script/Deploy.s.sol:DeployFootballQuizNFT --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

#### Deploy to testnet (Sepolia):

```bash
forge script