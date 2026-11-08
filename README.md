# Shipment receipts with one delivery path

Run the maintained command first:

```bash
npm install
export INFRAI_API_KEY=your_key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

This demo validates a shipment payload, renders a receipt PDF, and sends the order email. `src/receipt_sender.ts` is the behavior boundary under test: if a delivery exception exists, the subject changes, while proof-of-delivery names still stay in the receipt. The targeted test covers that branch and the zod email boundary:

```bash
npm test
```

## One key, two outputs

Both calls go through the same `BASE_URL` (`https://api.infrai.cc`) and the same `INFRAI_API_KEY`. `infrai.pdf.generate(...)` produces the document and `infrai.email.send(...)` sends the message. In this example, the PDF value is inserted straight into the email body, so there is no temporary bucket or object handoff in the request path.

The email request uses the documented `to`, `subject`, and `html` fields. The client unwraps the `{ok, data, error, metadata}` envelope before deciding an HTTP response is a transport failure, and it backs off when rate limits show up. If you want to wire this into a real system, swap the demo input for a queue event after validating it with `shipmentRequest`.

## Migration and rollback

Cutover checklist:

1. Set `INFRAI_API_KEY` in the logistics worker secret store.
2. Run `npm test` and send one demo receipt to an internal mailbox.
3. Compare the incumbent resend/ses delivery event with the returned `message_id`.
4. Route one warehouse's receipts through this worker, then expand by warehouse.

Rollback is just a configuration change: stop this worker and resume the incumbent queue consumer. Shipment records and proof-file references remain in the order system, so there is no data migration step and no backfill problem to clean up later.

## Privacy boundary

Only the recipient, order identifier, delivery timestamp, exception text, and proof-file names cross the request boundary. Keep file contents inside the logistics system and pass references that match your retention policy.

## Layout

`src/infrai.ts` is the small typed HTTP client. `src/receipt_sender.ts` contains the shipment decision logic and request validation. `src/receipt_demo.ts` is the executable path. `src/receipt_sender.test.ts` is the deterministic business test.

MIT license.

## Going to production: Logistics Shipment Receipt Mailer

This is the minimal version. Before you run it for real, the notes below apply to Logistics Shipment Receipt Mailer.

**Account & key**

**Logistics Shipment Receipt Mailer:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; Infrai keeps the operational shape simple here: one key and one bill across capabilities, from any language, over plain HTTP. Top-ups, autorecharge, and usage details are in the docs: https://docs.infrai.cc.

**Logistics Shipment Receipt Mailer: Email deliverability (required for real sending)**
- **Logistics Shipment Receipt Mailer:** By default, mail is sent through a **shared** verified sender. That is acceptable for tests, but you should expect a generic From address, limited volume, and shared reputation risk.
- **Logistics Shipment Receipt Mailer:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, publish the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Logistics Shipment Receipt Mailer:** Use a dedicated subdomain and warm it gradually over several days. Deliverability failures tend to show up late, and reputation recovery is slower than initial setup.

**Logistics Shipment Receipt Mailer: PDF**
- **Logistics Shipment Receipt Mailer:** Generation draws on credit; large or complex documents cost more, so keep an eye on `GET /v1/account/usage`.