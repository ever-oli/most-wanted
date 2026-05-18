## Goal
Stop review submissions from depending on whatever code list is bundled into the published frontend. Treat review codes like promo codes: the browser can check format, but Lovable Cloud decides if the code is real, unused, and allowed to publish.

## What I found
- `MW-OC-BEL-01` exists in `src/lib/drop-config.ts`, but there is no matching row in the backend `order_tokens` table.
- The review page currently blocks submission using a frontend exact list: `VALID_BATCH_CODES.includes(...)`. That can drift from published builds.
- The backend already knows how to look up `order_tokens`, but it currently has an “unverified fallback” path that can accept unknown codes.
- There is also a hidden bug: the UI and function accept 1–10 ratings, but the database constraints still only allow 1–5. Any review with scores above 5 can fail even when the code issue is solved.

## Recommended solution
Build a backend-first review token system, similar to how promo/checkout codes work.

### 1. Make the backend the exact source of truth
- Keep `order_tokens` as the private table of real review codes.
- Seed/import approved codes there, starting with `MW-OC-BEL-01`.
- The frontend should no longer contain or enforce the exact valid-code list.
- The frontend only checks basic format, like `MW-OC-BEL-01`, so the submit button works without needing a republish for every new code.

### 2. Make review submission strict and safe
Update `submit-review` so it:
- Rejects codes that are not in `order_tokens`.
- Rejects codes that have already been redeemed.
- Only writes a public archive review after the code passes backend validation.
- Marks the token redeemed after a successful review.
- Removes the current unverified fallback path for real public submissions.

Result: people can type any formatted code, but only actual issued codes work.

### 3. Add a pre-check endpoint for better UX
Add a small validation mode to `submit-review`, or a separate `validate-review-code` function, so the review form can check a code before the user fills everything out.

UX behavior:
- Valid + unused: “Code verified. Continue.”
- Valid + already used: “This code already submitted a review.”
- Unknown: “Code not found. Check your jar card.”

This keeps the form feeling like a checkout promo-code validator instead of waiting until final submit.

### 4. Fix the rating mismatch
Run a migration so `reviews` allows 1–10 ratings, matching the current UI and edge function.

This removes a separate failure mode that could make valid submissions look broken.

### 5. Keep publish safety without frontend drift
Archive publishing rule:
- Public archive shows only reviews saved by the backend after exact token validation.
- No review can become public just because the frontend allowed it.
- If you add more jar-card codes later, we only add them to `order_tokens`; no app republish required.

### 6. Practical token workflow
For now, simplest workflow:
- Manually add real jar-card/reviewer codes to `order_tokens` before handing them out.
- Code format can stay simple: `MW-OC-BEL-01`, `MW-OC-BEL-02`, etc.
- Each token can store drop, tier, square, and optional email.

Later, when checkout is real:
- Generate tokens automatically after purchase.
- Attach the token to the order/customer email.
- Include the review link in confirmation or packaging.

## Implementation steps after approval
1. Database migration:
   - Fix `reviews` rating constraints from 1–5 to 1–10.
   - Add a uniqueness guard so each `order_token` can only create one review.
   - Insert/ensure `MW-OC-BEL-01` exists in `order_tokens` for the Belgium drop.
2. Edge function update:
   - Remove unverified fallback acceptance.
   - Add backend validation responses for unknown/used/valid codes.
   - Keep one-time redemption behavior.
3. Review page update:
   - Replace exact frontend code list with format-only validation.
   - Add a backend code check before/while submitting.
   - Update the placeholder/copy to Belgium-era code format.
4. Verification:
   - Test `MW-OC-BEL-01` with a 1–10 review.
   - Confirm unknown codes are rejected.
   - Confirm a reused code is rejected.
   - Confirm the archive only shows verified reviews.