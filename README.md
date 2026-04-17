# SAP Order-to-Cash (O2C) Dashboard — Capstone Project

A full-stack web application that simulates and visualizes the SAP Order-to-Cash
business process using a Node.js/Express mock backend and a React/Vite frontend.

## Quick Start

```bash
# 1. Run setup (installs all dependencies)
chmod +x setup.sh && ./setup.sh

# 2. Start both servers (two terminals)
# Terminal 1:
cd backend && npm start        # → http://localhost:3000

# Terminal 2:
cd frontend && npm run dev     # → http://localhost:5173

# OR start both at once:
./run-all.sh
```

## Project Structure

```
sap-o2c-dashboard/
├── backend/           # Node.js/Express mock SAP API
│   ├── server.js
│   └── package.json
├── frontend/          # React + Vite dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   ├── hooks/useO2CApi.js
│   │   └── components/
│   └── package.json
├── VERIFICATION_PROTOCOL.md   # Testing guide with curl commands
└── CAPSTONE_REPORT.txt        # Full project report text
```

## API Endpoints

| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | /api/health                 | Health check                   |
| GET    | /api/customers              | Fetch all customers (KNA1)     |
| GET    | /api/orders                 | Fetch all orders (VBAK+VBAP)   |
| GET    | /api/orders/:id             | Fetch single order             |
| POST   | /api/orders                 | Create new sales order (VA01)  |
| PUT    | /api/orders/:id/status      | Advance O2C pipeline stage     |
| GET    | /api/pipeline-summary       | Aggregated KPI data            |

## O2C Pipeline Stages

```
ORDER_CREATED → DELIVERY_CREATED → GOODS_ISSUED → INVOICE_GENERATED → PAYMENT_RECEIVED
```

## Tech Stack

- **Frontend**: React 18, Vite 5, Axios
- **Backend**: Node.js, Express 4, CORS, UUID
- **Design**: IBM Plex fonts, custom CSS variables (no framework)
