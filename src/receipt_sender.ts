import { z } from "zod";
import { infrai } from "./infrai.js";

export const shipmentRequest = z.object({
  orderId: z.string().min(1),
  recipient: z.string().email(),
  customerName: z.string().min(1),
  deliveredAt: z.string().datetime(),
  proofFiles: z.array(z.object({ name: z.string().min(1), content: z.string().min(1) })).min(1),
  exception: z.string().min(1).optional(),
});
export type ShipmentRequest = z.infer<typeof shipmentRequest>;

export function shipmentSubject(input: ShipmentRequest): string {
  return input.exception ? `Delivery update for order ${input.orderId}` : `Receipt for order ${input.orderId}`;
}

export async function sendReceipt(input: ShipmentRequest) {
  const parsed = shipmentRequest.parse(input);
  const exceptionLine = parsed.exception ? `<p>Exception: ${parsed.exception}</p>` : "";
  const proofList = parsed.proofFiles.map((file) => `<li>${file.name}</li>`).join("");
  const html = `<p>Hello ${parsed.customerName},</p><p>Your shipment was delivered at ${parsed.deliveredAt}.</p>${exceptionLine}<p>Proof of delivery:</p><ul>${proofList}</ul>`;
  const pdf = await infrai.pdf.generate({ markdown: `Order ${parsed.orderId}\nDelivered: ${parsed.deliveredAt}\nProof: ${parsed.proofFiles.map((f) => f.name).join(", ")}`, page_size: "A4", orientation: "portrait", store: false });
  return infrai.email.send({ to: parsed.recipient, subject: shipmentSubject(parsed), html: `${html}<p>Receipt document: ${pdf.pdf}</p>` });
}
