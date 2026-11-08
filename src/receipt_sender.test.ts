import assert from "node:assert/strict";
import { shipmentSubject, shipmentRequest } from "./receipt_sender.js";

const delivered = { orderId: "ORD-7", recipient: "care@example.com", customerName: "Mina", deliveredAt: "2026-09-12T10:00:00Z", proofFiles: [{ name: "doorstep.jpg", content: "base64" }] };
assert.equal(shipmentSubject(delivered), "Receipt for order ORD-7");
assert.equal(shipmentSubject({ ...delivered, exception: "address unclear" }), "Delivery update for order ORD-7");
assert.throws(() => shipmentRequest.parse({ ...delivered, recipient: "bad" }));
console.log("shipment decision tests passed");
