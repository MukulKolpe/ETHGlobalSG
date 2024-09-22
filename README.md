# ETHGlobal-SG - DAOTown 🚀

Managing DAOs requires technical expertise, creating high entry barriers and inefficiencies. Our project aims to streamline DAO activities, including governance and tokenomics, through a decentralized infrastructure. By lowering these barriers, we enhance accessibility and efficiency, enabling broader participation and user-friendly DAO management for communities, organizations, and individuals.

## Tech Stack 🧰

- Solidity
- ethers.js
- Next.js
- React.js
- Foundry
- OpenZeppelin
- RainbowKit
- TypeScript
- JavaScript
- Chakra UI
- Alchemy
- Wagmi
- Lighthouse Storage (IPFS gateway)
- AirDao Testnet

## Foundry Setup 🚧

### Prerequisites

Before you begin, ensure you have the following installed:

- Follow the installation instructions in the [Foundry documentation](https://book.getfoundry.sh/).

For Windows users, it is recommended to use Windows Subsystem for Linux (WSL) for the Foundry setup.

### Getting Started

#### Cloning the Repository

1. Clone the ETHGlobalSG repository:

```bash
git clone https://github.com/MukulKolpe/ETHGlobalSG
```

2. Navigate to the `contracts/` directory:

```bash
cd ETHGlobalSG/contracts/
```

#### Setting Up Environment Variables

1. Create a file named `.env` in the contracts directory.

2. Configure the `.env` file according to the provided `.env.example` file.

#### Installing Dependencies

Install the necessary dependencies for the Foundry setup:

```bash
forge install
```

#### Building the Project

Build the project with the following command:

```bash
make build
```

#### Deployment

The Makefile is set up for deployment on AirDao Testnet.

```bash
make deploy ARGS="--network airDao"
```

## Frontend Setup 🚧

**Note:** Update the compiled ABIs of the contracts in the `/frontend/src/utils/abis/` directory.

1. From the root, navigate to the `frontend/` directory:

```bash
cd ETHGlobalSG/frontend/
```

2. Create a `.env` file in the root directory of the project:

```bash
touch .env
```

3. Refer to `.env.example` to update the `.env` file.

4. Install Dependencies:

```bash
yarn
```

5. Run the project at `localhost:3000`:

```bash
yarn run dev
```



## Deployed & Verified contracts on AirDAO Network -

- DAOManager.sol: [0x3D304b7960d5d96D45735bbF16Bb89baa03030A3](https://testnet.airdao.io/explorer/address/0x3D304b7960d5d96D45735bbF16Bb89baa03030A3/)
- GovernanceToken.sol: [0xd0A9c6e7FF012F22Ba52038F9727b50e16466176](https://testnet.airdao.io/explorer/address/0xd0A9c6e7FF012F22Ba52038F9727b50e16466176/)
- CreateGovernanceToken.sol: [0x7aD0A9dB054101be9428fa89bB1194506586D1aD](https://testnet.airdao.io/explorer/address/0x7aD0A9dB054101be9428fa89bB1194506586D1aD/)
