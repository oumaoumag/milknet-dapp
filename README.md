# MilkNet - Blockchain-Powered Dairy Supply Chain Platform

## Project Overview

MilkNet is a decentralized platform that connects farmers directly with consumers, ensuring transparency, quality, and fair pricing in the dairy supply chain. By leveraging blockchain technology, MilkNet enables secure transactions, real-time milk tracking, automated order management, and transparent dispute resolution—all without intermediaries.

## Problem Statement

Traditional dairy supply chains are opaque and inefficient, resulting in delayed payments and limited market access for farmers, while consumers struggle with quality verification and dispute resolution.

## Challenges

### For Farmers
- **Payment Delays:** Slow and uncertain payments.
- **Limited Market Access:** Difficulty reaching consumers directly.
- **Intermediary Exploitation:** Reduced profit margins due to middlemen.

### For Consumers
- **Quality Concerns:** Uncertainty about milk purity and production practices.
- **Lack of Transparency:** Insufficient information on milk origin and pricing.
- **Inefficient Dispute Resolution:** Cumbersome processes for refunds and complaints.

## Solution

MilkNet addresses these challenges by:

- **Streamlined Registration:** Quick onboarding for both farmers and consumers.
- **Milk Tracking:** Unique blockchain IDs for complete traceability.
- **Automated Management:** Smart contracts handle orders, payments, and record-keeping.
- **Transparent Dispute Resolution:** Automated and visible resolution of refunds and disputes.

## Target Audience

- **Dairy Farmers:** Seeking direct market access and fair pricing.
- **Consumers:** Looking for high-quality, verifiable dairy products.

## Impact

MilkNet empowers farmers and builds consumer trust by enhancing transparency and operational efficiency, paving the way for a more sustainable and equitable dairy industry.

## Deployment

- **Frontend:** Deployed on Vercel - [MilkNet](https://milknet-dapp.vercel.app/)
- **Smart Contracts:** Deployed on Lisk and Sepolia test networks

https://sepolia-blockscout.lisk.com/tx/0x8be891f5cdcaa26e43026914a73cc8e3d22b22d3ed9fbc859eeebb797017d33d
https://eth-sepolia.blockscout.com/tx/0x66eb9b50c0aecd4cad1d76564a9b0bd8e15bd523cd152df9a5ba14b4dde2cf01

---

## Vision & Mission

MilkNet envisions efficient, transparent, and equitable dairy supply chains.  
Our mission is to empower all stakeholders—farmers, distributors, and consumers—with blockchain solutions that streamline processes and ensure fair practices.

---

## Key Features

- **Blockchain Transparency:** Immutable registration of each milk batch.
- **Direct Transactions:** Elimination of intermediaries for fair pricing.
- **Automated Order Management:** Smart contracts streamline orders and payments.
- **Transparent Dispute Resolution:** Automated handling of refunds and disputes.

---

## Roadmap

### Implemented
- Blockchain transparency
- Direct transactions
- Automated order management
- Refund processing

### In Progress
- Enhancements to the dispute resolution process

### Future Plans
- Advanced analytics dashboard
- Mobile application
- IoT integration for real-time monitoring
- Enhanced security features (e.g., multi-factor authentication)

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Ethers.js

### Smart Contracts
- Solidity

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

---

## Project Structure

```plaintext
milknet/
├── src/
│   ├── components/
│   │   ├── batches/
│   │   │   ├── BatchList.js
│   │   │   ├── CreateBatch.js
│   │   │   └── FormatBatchData.js
│   │   ├── buyer/
│   │   │   ├── Marketplace.js
│   │   │   └── OrderModal.js
│   │   ├── disputes/
│   │   │   └── FileDispute.js
│   │   ├── farmers/
│   │   │   ├── Dashboard.js
│   │   │   └── Registration.js
│   │   ├── Devs.jsx
│   │   ├── Header.jsx
│   │   └── Landing.jsx
│   ├── contexts/
│   │   └── Web3Context.js
│   ├── utils/
│   │   ├── blockchain.js
│   │   ├── contractCalls.js
│   │   └── MilkNetABI.json
│   ├── App.js
│   ├── App.css
│   └── index.js
├── contracts/
│   └── Milknet.sol
├── public/
│   ├── images/
│   │   └── github.svg
│   ├── index.html
│   └── manifest.json
├── scripts/
│   └── deploy.js
├── test/
│   └── Lock.js
├── ignition/
│   └── modules/
│       └── Lock.js
├── README.md
└── package.json
```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:  
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes.
4. Commit your changes:  
    ```bash
    git commit -m 'Add new feature'
    ```
5. Push to your branch:  
    ```bash
    git push origin feature-branch
    ```
6. Open a pull request.

---

## Authors

- **Audrey Pendo:** [Audrey Pendo](https://github.com/odree123)
- **Ouma Ouma:** [Ouma Ouma](https://github.com/oumaoumag)

---

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.

