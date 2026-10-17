# The Breakthrough Room — secure results service contract

## Current tested status
- Kajabi form 2149757217 accepts first name, email and KFLA Marketing Consent; Coach Lateka received a Kajabi submission notification.
- Five-room game and local Blueprint preview work.
- **The game does NOT verify a Kajabi submission, sync results, or email reports yet.** The live results gate must remain off until these are working end-to-end.

## Required production transaction
1. HTTPS game session is created by trusted server with short-lived opaque session ID. Never trust a self-reported five-key completion alone.
2. At the end of the five rooms, browser sends a minimally necessary assessment payload to `POST /api/assessments/complete`; server validates allowed question IDs/answer values, puzzle completion attestation where possible, issues a one-time results claim token; store server-side.
3. Email unlock collects first name, email address, independent optional marketing opt-in and a clear notice covering results delivery / retention. Secure submission passes through trusted server.
4. **Only on confirmed successful submission:** server ties the identity to assessment session, returns `verified: true` to the client and authorizes results reveal. Merely embedding the Kajabi form or detecting a button click is not sufficient proof.
5. Results delivered to participant by a transactional email service. Coach receives a brief lead notification at thrive@kingdomfitlife.com; keep detailed sensitive answers behind a protected view.
6. Synchronize Kajabi contact and consent where supported by plan and integration. Do not silently enroll non-consenting participants into marketing sequences. If using Kajabi's own form, verify it via a reliable server-side event or supported API mechanism.
7. Limit retries; validate inputs; apply rate limits; use double opt-in when warranted; configure SPF/DKIM/DMARC for sender; implement deletion and retention rules.

## Suggested API response example (illustration, not currently live)
`{ "verified": true, "resultId": "opaque-result-id", "revealToken": "short-lived-opaque-token" }`

## Kajabi Basic limitation
Kajabi Basic's embedded form can submit contacts, but the embed snippet supplied alone does not prove successful submission to this local game. Advanced webhook/API capabilities vary by plan or add-on. An external integration service may be necessary. No passwords/API tokens belong in browser code.

## Referral incentives
Keep Breakthrough Rewards disabled until verified referrals, a single-reward-per-person rule, coupon code issuance, and disclosure are supported server-side.
