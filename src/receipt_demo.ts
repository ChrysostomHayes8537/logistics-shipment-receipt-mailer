import { sendReceipt } from "./receipt_sender.js";

const recipient = process.env.DEMO_EMAIL_TO;
if (!recipient) throw new Error("DEMO_EMAIL_TO is required");
const result = await sendReceipt({ orderId: "ORD-1007", recipient, customerName: "Alex", deliveredAt: new Date().toISOString(), proofFiles: [{ name: "pod-photo.jpg", content: "stored-reference" }] });
console.log("receipt sent", result);
