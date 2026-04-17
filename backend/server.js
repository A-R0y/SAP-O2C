// ============================================================
//  SAP O2C Mock Backend — server.js
//  Simulates SAP ECC/S4HANA OData endpoints via Express REST
// ============================================================

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*", "ws://localhost:*", "wss://localhost:*"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    },
  },
}));

// ─────────────────────────────────────────────
//  MOCK SAP TABLES
// ─────────────────────────────────────────────

// KNA1 — Customer Master
let Customers = [
  { customerId: "C001", name: "Infosys Technologies Ltd.", region: "IN-KA", creditLimit: 500000 },
  { customerId: "C002", name: "Tata Consultancy Services", region: "IN-MH", creditLimit: 750000 },
  { customerId: "C003", name: "Wipro Limited", region: "IN-KA", creditLimit: 300000 },
  { customerId: "C004", name: "HCL Technologies", region: "IN-HR", creditLimit: 450000 },
  { customerId: "C005", name: "Tech Mahindra", region: "IN-MH", creditLimit: 200000 },
];

// VBAK — Sales Order Header
// O2C Pipeline Stages (in order):
//   ORDER_CREATED → DELIVERY_CREATED → GOODS_ISSUED → INVOICE_GENERATED → PAYMENT_RECEIVED
let VBAK = [
  {
    orderId: "SO-10001",
    customerId: "C001",
    orderDate: "2025-06-01",
    requestedDate: "2025-06-15",
    totalValue: 125000,
    currency: "INR",
    status: "PAYMENT_RECEIVED",
    salesOrg: "1000",
    distChannel: "10",
    division: "00",
  },
  {
    orderId: "SO-10002",
    customerId: "C002",
    orderDate: "2025-06-10",
    requestedDate: "2025-06-25",
    totalValue: 87500,
    currency: "INR",
    status: "INVOICE_GENERATED",
    salesOrg: "1000",
    distChannel: "10",
    division: "00",
  },
  {
    orderId: "SO-10003",
    customerId: "C003",
    orderDate: "2025-06-18",
    requestedDate: "2025-07-01",
    totalValue: 43200,
    currency: "INR",
    status: "GOODS_ISSUED",
    salesOrg: "1000",
    distChannel: "20",
    division: "00",
  },
  {
    orderId: "SO-10004",
    customerId: "C004",
    orderDate: "2025-06-22",
    requestedDate: "2025-07-10",
    totalValue: 215000,
    currency: "INR",
    status: "DELIVERY_CREATED",
    salesOrg: "2000",
    distChannel: "10",
    division: "00",
  },
  {
    orderId: "SO-10005",
    customerId: "C005",
    orderDate: "2025-06-28",
    requestedDate: "2025-07-20",
    totalValue: 62000,
    currency: "INR",
    status: "ORDER_CREATED",
    salesOrg: "2000",
    distChannel: "20",
    division: "00",
  },
];

// VBAP — Sales Order Line Items
let VBAP = [
  { itemId: "10", orderId: "SO-10001", material: "MAT-001", description: "SAP HANA License", quantity: 5, uom: "EA", unitPrice: 20000, netValue: 100000 },
  { itemId: "20", orderId: "SO-10001", material: "MAT-005", description: "Consulting Services", quantity: 1, uom: "HR", unitPrice: 25000, netValue: 25000 },
  { itemId: "10", orderId: "SO-10002", material: "MAT-002", description: "S/4HANA Cloud Module", quantity: 1, uom: "EA", unitPrice: 87500, netValue: 87500 },
  { itemId: "10", orderId: "SO-10003", material: "MAT-003", description: "Fiori Launchpad Setup", quantity: 3, uom: "EA", unitPrice: 14400, netValue: 43200 },
  { itemId: "10", orderId: "SO-10004", material: "MAT-004", description: "BTP Integration Suite", quantity: 5, uom: "EA", unitPrice: 43000, netValue: 215000 },
  { itemId: "10", orderId: "SO-10005", material: "MAT-001", description: "SAP HANA License", quantity: 3, uom: "EA", unitPrice: 20000, netValue: 60000 },
  { itemId: "20", orderId: "SO-10005", material: "MAT-005", description: "Go-Live Support", quantity: 1, uom: "HR", unitPrice: 2000, netValue: 2000 },
];

// ─────────────────────────────────────────────
//  PIPELINE CONSTANTS
// ─────────────────────────────────────────────
const PIPELINE_STAGES = [
  "ORDER_CREATED",
  "DELIVERY_CREATED",
  "GOODS_ISSUED",
  "INVOICE_GENERATED",
  "PAYMENT_RECEIVED",
];

const STAGE_LABELS = {
  ORDER_CREATED: "Order Created",
  DELIVERY_CREATED: "Delivery Created",
  GOODS_ISSUED: "Goods Issued",
  INVOICE_GENERATED: "Invoice Generated",
  PAYMENT_RECEIVED: "Payment Received",
};

const NEXT_ACTION_LABELS = {
  ORDER_CREATED: "Create Delivery",
  DELIVERY_CREATED: "Post Goods Issue",
  GOODS_ISSUED: "Generate Invoice",
  INVOICE_GENERATED: "Mark Payment Received",
  PAYMENT_RECEIVED: null, // terminal stage
};

// ─────────────────────────────────────────────
//  HELPER — enrich order with customer + items
// ─────────────────────────────────────────────
function enrichOrder(order) {
  const customer = Customers.find((c) => c.customerId === order.customerId) || {};
  const items = VBAP.filter((i) => i.orderId === order.orderId);
  const stageIdx = PIPELINE_STAGES.indexOf(order.status);
  return {
    ...order,
    statusLabel: STAGE_LABELS[order.status] || order.status,
    nextActionLabel: NEXT_ACTION_LABELS[order.status],
    stageIndex: stageIdx,
    totalStages: PIPELINE_STAGES.length,
    customerName: customer.name || "Unknown",
    customerRegion: customer.region || "—",
    items,
  };
}

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

// GET /api/health
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "SAP O2C Mock Backend is running", timestamp: new Date().toISOString() });
});

// GET /api/customers
app.get("/api/customers", (_req, res) => {
  res.json({ d: { results: Customers } });
});

// GET /api/orders  — fetch all orders (enriched)
app.get("/api/orders", (_req, res) => {
  const enriched = VBAK.map(enrichOrder);
  res.json({ d: { results: enriched } });
});

// GET /api/orders/:id  — fetch single order
app.get("/api/orders/:id", (req, res) => {
  const order = VBAK.find((o) => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: `Order ${req.params.id} not found` });
  res.json({ d: enrichOrder(order) });
});

// POST /api/orders  — create a new sales order
app.post("/api/orders", (req, res) => {
  const { customerId, requestedDate, items } = req.body;

  // Validation
  if (!customerId || !requestedDate || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Validation failed",
      required: ["customerId", "requestedDate", "items (array)"],
    });
  }
  const customer = Customers.find((c) => c.customerId === customerId);
  if (!customer) return res.status(404).json({ error: `Customer ${customerId} not found` });

  // Generate new order ID
  const maxId = VBAK.reduce((max, o) => {
    const num = parseInt(o.orderId.replace("SO-", ""), 10);
    return num > max ? num : max;
  }, 10000);
  const newOrderId = `SO-${maxId + 1}`;

  // Calculate total from line items
  const totalValue = (items || []).reduce((sum, it) => sum + (it.quantity * it.unitPrice || 0), 0);

  const newOrder = {
    orderId: newOrderId,
    customerId,
    orderDate: new Date().toISOString().split("T")[0],
    requestedDate,
    totalValue,
    currency: "INR",
    status: "ORDER_CREATED",
    salesOrg: "1000",
    distChannel: "10",
    division: "00",
  };
  VBAK.push(newOrder);

  // Insert line items into VBAP
  items.forEach((item, idx) => {
    VBAP.push({
      itemId: String((idx + 1) * 10),
      orderId: newOrderId,
      material: item.material || "MAT-000",
      description: item.description || "Custom Item",
      quantity: item.quantity,
      uom: item.uom || "EA",
      unitPrice: item.unitPrice,
      netValue: item.quantity * item.unitPrice,
    });
  });

  res.status(201).json({ d: enrichOrder(newOrder) });
});

// PUT /api/orders/:id/status  — advance order through O2C pipeline
app.put("/api/orders/:id/status", (req, res) => {
  const order = VBAK.find((o) => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: `Order ${req.params.id} not found` });

  const currentIdx = PIPELINE_STAGES.indexOf(order.status);
  if (currentIdx === -1) return res.status(400).json({ error: `Unknown status: ${order.status}` });
  if (currentIdx >= PIPELINE_STAGES.length - 1) {
    return res.status(400).json({
      error: "Order is already at the final stage (PAYMENT_RECEIVED)",
      order: enrichOrder(order),
    });
  }

  const prevStatus = order.status;
  order.status = PIPELINE_STAGES[currentIdx + 1];

  console.log(`[O2C] ${order.orderId}: ${prevStatus} → ${order.status}`);
  res.json({ d: enrichOrder(order) });
});

// GET /api/pipeline-summary  — KPI aggregation
app.get("/api/pipeline-summary", (_req, res) => {
  const summary = PIPELINE_STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    orderCount: VBAK.filter((o) => o.status === stage).length,
    totalValue: VBAK
      .filter((o) => o.status === stage)
      .reduce((sum, o) => sum + o.totalValue, 0),
  }));
  const grandTotal = VBAK.reduce((sum, o) => sum + o.totalValue, 0);
  res.json({ d: { stages: summary, totalOrders: VBAK.length, grandTotalValue: grandTotal } });
});

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   SAP O2C Mock Backend — Running on :3000   ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  GET  /api/health                            ║`);
  console.log(`║  GET  /api/customers                         ║`);
  console.log(`║  GET  /api/orders                            ║`);
  console.log(`║  POST /api/orders                            ║`);
  console.log(`║  PUT  /api/orders/:id/status                 ║`);
  console.log(`║  GET  /api/pipeline-summary                  ║`);
  console.log("╚══════════════════════════════════════════════╝");
});
