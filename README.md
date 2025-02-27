# MilkNet - Blockchain-Powered Dairy Supply Chain Platform

## Overview

MilkNet is a revolutionary platform designed to bring cutting-edge technology into the dairy industry. By leveraging blockchain, data analytics, and user-centric design, MilkNet aims to optimize supply chain management, enhance transparency, and streamline operations for all stakeholders involved in dairy production, distribution, and retail.

**The app is currently deployed on Vercel and can be accessed here: [MilkNet](https://milknet.vercel.app/)**

## Vision and Mission

MilkNet envisions a world where dairy supply chains are highly efficient, transparent, and equitable. The platform's mission is to empower farmers, distributors, retailers, and consumers with tools that:

- Enhance operational efficiency.
- Ensure product quality and traceability.
- Foster trust through transparent practices.
- Reduce wastage and maximize profitability.

## Features Implementation Status

### ✅ Completed

- Waitlist page UI implementation
- Form validation and submission handling
- Responsive design
- Motion animations
- Features section with icons
- Testimonials section

### 🚧 In Progress

- Smart contract integration
- User authentication
- Database setup
- API endpoints
- Footer component styling

### 📋 Planned

- Dashboard interface
- Blockchain transaction handling
- Supply chain tracking
- Analytics dashboard
- Mobile app development

## Key Features

### 1. Blockchain-Based Transparency

MilkNet employs blockchain technology to ensure that all transactions and records within the supply chain are immutable and transparent. Key benefits include:

- **Traceability:** Every step of the production process, from farm to consumer, is logged on the blockchain.
- **Tamper-Proof Records:** Immutable ledgers prevent unauthorized modifications, enhancing trust among stakeholders.
- **Real-Time Auditing:** Authorized parties can access real-time data to verify compliance with industry standards.

### 2. Smart Contracts

Smart contracts automate agreements between parties, reducing manual intervention and errors. Examples include:

- **Automated Payments:** Farmers and distributors receive payments automatically when predefined conditions are met.
- **Quality Assurance Contracts:** Payments are linked to quality metrics like milk fat content or freshness.

### 3. Data Analytics and Insights

MilkNet provides stakeholders with actionable insights using advanced data analytics. Key applications include:

- **Demand Forecasting:** Retailers can predict consumer demand and optimize inventory.
- **Performance Monitoring:** Farmers can track metrics like milk yield and health indicators for livestock.
- **Supply Chain Optimization:** Distributors can plan routes and schedules to minimize costs and maximize efficiency.

### 4. Farmer-Centric Tools

Farmers are at the heart of the dairy industry, and MilkNet equips them with tools to:

- **Monitor Livestock:** Sensors and IoT devices track health metrics like temperature, activity, and milk yield.
- **Access Microloans:** Blockchain-based credit scoring enables access to affordable loans.
- **Get Market Insights:** Farmers receive real-time price updates and demand forecasts.

### 5. Consumer Engagement

MilkNet enhances consumer trust and engagement by providing:

- **Product Authenticity:** QR codes on packaging allow consumers to trace the origin and journey of dairy products.
- **Nutritional Transparency:** Detailed information about nutritional content and production methods is available.
- **Feedback Mechanisms:** Consumers can provide feedback directly to producers, fostering a sense of community.

### 6. Sustainability and Waste Reduction

MilkNet promotes sustainable practices by:

- **Tracking Carbon Footprint:** Stakeholders can monitor and reduce their environmental impact.
- **Reducing Spoilage:** Real-time monitoring of storage conditions ensures product freshness.
- **Encouraging Recycling:** Incentivizing the use of eco-friendly packaging materials.

## Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Ethers.js

### Smart Contracts

- Solidity
- Hardhat
- OpenZeppelin

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## Project Structure

```plaintext
milknet/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   └── waitlist.tsx
│   │   │   ├── components/
│   │   │   │   └── footer.tsx
│   │   │   └── utils/
│   │   │       └── ethers.js
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   │   └── images/
│   └── next.config.ts
└── backend
    └──contracts/
        └── ProductRegistration.sol
```

## Contributing

We welcome contributions from the community. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## Authors

- **Audrey Pendo:** [Audrey Pend0](https://github.com/odree123)
- **Ouma Ouma:** [Ouma Ouma](https://github.com/oumaoumag)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

<!-- ## Contact

For any inquiries or feedback, please contact us at [support@milknet.com](mailto:support@milknet.com). -->
