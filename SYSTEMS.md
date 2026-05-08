# Most Wanted — Systems Architecture
_Updated: 2026-05-03_

This document maps how every piece of your business interacts. Use it as a blueprint before adding Shopify or any other integration.

---

## 1. THE CUSTOMER JOURNEY (End-to-End)

### Phase A: Discovery
| Channel | Action | Destination |
|---------|--------|-------------|
| Instagram | Sees flyer / grid post | Signal or Website |
| Word of mouth | Gets link or handle | Signal or Website |
| Direct visit | Types URL | Website (Age Gate) |

### Phase B: First Contact
| Path | Experience | Your Action |
|------|------------|-------------|
| **Signal** | Encrypted chat. You answer questions, build trust, take order manually. | Primary sales channel until Shopify is live. |
| **Website** | Browses vault grid, reads drop story, sees countdown. No purchase yet. | Captures interest via "Notify Me" email/SMS for drops. |

### Phase C: Purchase
| State | How It Works | System |
|-------|--------------|--------|
| **Pre-Shopify** | Signal conversation → Cash App / Zelle / Crypto → You ship manually via USPS. | Signal + manual fulfillment. |
| **Post-Shopify** | Website add-to-cart → Shopify checkout → auto-generated tracking → you fulfill. | Shopify + payment processor + shipping integration. |

### Phase D: Fulfillment
| Step | Detail |
|------|--------|
| Packaging | Branded box (not envelope), jar with batch code sticker, physical scorecard included. |
| Shipping | USPS label. Tracking sent via Signal or automated email. |
| Delivery | Customer receives package. Sees scorecard inside. |

### Phase E: Feedback Loop
| Step | Action | Result |
|------|--------|--------|
| 1. Customer scans QR on scorecard | Lands on `/review?batch=XXX` | Starts evaluation |
| 2. Rates 5 criteria | Submits review | Data stored in backend |
| 3. Sees average score + thank you | Optional: social share prompt | Word-of-mouth amplification |
| 4. You review submissions | Aggregated by batch | Identifies best batches, informs next sourcing |

---

## 2. THE WEBSITE (mostwantedhemp.co)

### Routes
| Path | Purpose | Status |
|------|---------|--------|
| `/` | Main vault grid + landing experience | Live |
| `/drop/:dropId/story` | Drop narrative, origin story, batch details | Live |
| `/review` | Interactive 5-point evaluation card | Live (needs backend) |
| `/review?batch=XXX` | Pre-filled batch code (future) | Planned |
| `/shop` or `/store` | Product catalog + cart + checkout | **Future: Shopify embed or redirect** |

### Components
| Feature | Function | Notes |
|---------|----------|-------|
| Age Gate | 21+ verification before site loads | Required for compliance |
| Vault Grid | 16×16 interactive product grid | Click → zoom → add to cart (future) |
| Countdown Timer | Drop countdown + "Notify Me" | Connect to email/SMS service |
| Sticky Nav | Smooth scroll anchors | Works as-is |
| FAQ Accordion | Common questions | Add shipping/return policy later |
| Curator Feed | Aggregated Instagram content | Auto-updates |
| Cart Slide | Side-drawer cart | **Future: Shopify Buy Button integration** |

### Data Sources
| Source | What It Feeds | Integration Type |
|--------|---------------|------------------|
| Supabase (future) | Review data, customer list, batch inventory | API |
| Shopify Storefront API | Products, inventory, checkout | GraphQL API |
| Curator.io | Social feed embed | JS embed (no API needed) |

---

## 3. THE PHYSICAL SCORECARD

### Card Design
- **Material**: Thick matte cream cardstock, 4×6 inches landscape
- **Print**: Black ink only, one accent color optional
- **Elements**:
  - MOST WANTED wordmark
  - 5 criteria rows with empty circles (1–5)
  - Batch code field (e.g., `MW-0427`)
  - NOTES lines
  - QR code linking to `/review`
  - Footer: mostwantedhemp.co

### QR Code Behavior
| Current | Future |
|---------|--------|
| Static link to `/review` | Dynamic: `/review?batch=MW-0427&strain=GELATO` (pre-fills form) |

### The Data Flow
```
Physical Card → QR Scan → Mobile Review Form → Backend Storage → Your Dashboard
```

---

## 4. SHOPIFY INTEGRATION PLAN

### Option A: Shopify Buy Button (Easiest)
- **What**: Embed Shopify products directly into your React site
- **How**: Generate Buy Button code in Shopify admin → embed in grid/cart
- **Pros**: Keep your custom design. Shopify handles checkout, tax, payment.
- **Cons**: Limited Shopify features (no full store analytics on-site)
- **Best for**: You if you want to keep the vault grid aesthetic

### Option B: Shopify Storefront API (Custom)
- **What**: Fetch products from Shopify, build your own cart + checkout flow
- **How**: GraphQL API calls to Shopify. Custom cart state in React.
- **Pros**: Full control. Same design. Shopify handles checkout.
- **Cons**: More dev work. Need to handle cart state, inventory sync.
- **Best for**: If you want the grid to feel native but use Shopify checkout

### Option C: Shopify Hydrogen/Headless (Advanced)
- **What**: Full headless Shopify store
- **How**: Shopify handles everything backend. You own the frontend.
- **Pros**: Most powerful. Best performance.
- **Cons**: Overkill for your current size. Complex setup.
- **Best for**: Later, when scaling

### Recommended: Option B (Storefront API)
Why: You keep your exact vault grid design. Shopify checkout is trusted. Cart syncs with inventory. You can still route high-value Signal customers manually if needed.

---

## 5. DATA & BACKEND ARCHITECTURE

### Review Data (Immediate Need)
```
Table: reviews
- id (uuid)
- batch_code (text)
- strain_name (text, optional)
- ratings (jsonb: {nose, structure, cure, burn, experience})
- average (float)
- notes (text)
- submitted_at (timestamp)
- source (text: "qr_card", "website", "signal")
```

**Storage options:**
1. **Supabase** (free tier, Postgres, easy React integration)
2. **Airtable** (spreadsheet-like, good for non-technical review)
3. **Google Sheets** (via API, easiest manual review)
4. **Notion database** (if you already live in Notion)

### Inventory & Batches (Future)
```
Table: batches
- id (text, e.g., "MW-0427")
- strain_name (text)
- tier (text: "EXO", "AAA", etc.)
- source (text: grower/vendor)
- received_date (date)
- quantity_grams (int)
- sold_grams (int)
- status (text: "active", "sold_out", "archived")
- average_review_score (float, computed)
```

### Customers (Future)
```
Table: customers
- id (uuid)
- signal_handle (text, optional)
- instagram_handle (text, optional)
- email (text, optional)
- first_order_date (timestamp)
- lifetime_value (float)
- review_count (int)
- tags (text[], e.g., ["repeat", "wholesale", "vip"])
```

---

## 6. SIGNAL WORKFLOW (Current State)

### Your Role
1. **Inquiry** → Answer questions, send strain list + photos
2. **Order** → Confirm batch + quantity + price
3. **Payment** → Provide Cash App / Zelle / crypto address
4. **Fulfillment** → Pack with scorecard + batch sticker + branded box
5. **Delivery** → Send tracking via Signal
6. **Follow-up** → Remind to scan QR and review (builds engagement)

### Signal Automation (Future)
- **Not possible directly** — Signal has no business API for automated messaging
- **Alternative**: Use Signal for VIP/manual. Use email/SMS for automated order confirmations, tracking, review requests.

---

## 7. INTEGRATION MAP (Visual Summary)

```
┌─────────────────────────────────────────────────────────────┐
│                        DISCOVERY                            │
│     Instagram    Word of Mouth    Direct URL    Signal     │
└──────────┬──────────────┬─────────────┬──────────┬─────────┘
           │              │             │          │
           ▼              ▼             ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                        WEBSITE                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Age Gate │ │ Vault    │ │ Review   │ │ Drop Story   │  │
│  │          │ │ Grid     │ │ Form     │ │ Pages        │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
└───────┼─────────────┼────────────┼──────────────┼──────────┘
        │             │            │              │
        ▼             ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND / DATA                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Reviews  │ │ Batches  │ │ Customers│ │ Shopify      │  │
│  │ (Supabase│ │ (Supabase│ │ (Supabase│ │ (Storefront  │  │
│  │ or Airtbl│ │ or Notion│ │ or Airtbl│ │ API)         │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
└───────┼─────────────┼────────────┼──────────────┼──────────┘
        │             │            │              │
        ▼             ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                        FULFILLMENT                          │
│     Branded Box    Jar + Batch Sticker    Scorecard + QR   │
│                    USPS Shipping                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. PRIORITY CHECKLIST

### Now (No Shopify)
- [ ] Wire `/review` to a real backend (Supabase recommended)
- [ ] Generate static QR codes for current batch
- [ ] Design and print physical scorecards
- [ ] Add batch code stickers to jars
- [ ] Set up email capture for "Notify Me" on drops

### Phase 2 (Shopify Light)
- [ ] Create Shopify store
- [ ] Set up payment processing
- [ ] Connect Storefront API to vault grid
- [ ] Sync batch inventory with Shopify products
- [ ] Auto-generate batch-specific product pages
- [ ] Connect Shopify orders to shipping labels (Shippo or Pirate Ship)

### Phase 3 (Automation)
- [ ] Automated review request email/SMS 3 days post-delivery
- [ ] Dashboard showing batch scores and customer lifetime value
- [ ] Dynamic QR codes with pre-filled batch/strain
- [ ] Instagram auto-post when new drop goes live
- [ ] Wholesale portal (separate from consumer site)

---

## 9. REVIEW → PRODUCT CYCLE (The Loop)

This is your competitive advantage. Document it.

```
Source Product
     │
     ▼
Grade + Batch Code
     │
     ▼
Customer Purchases (Signal now / Shopify later)
     │
     ▼
Ship with Scorecard
     │
     ▼
Customer Reviews via QR
     │
     ▼
You Analyze: What scored high? What flopped?
     │
     ▼
Inform Next Sourcing Decision
     │
     ▼
Source Better / Different Next Time
     │
     ▼
Repeat
```

Your scorecard data becomes your sourcing intelligence. Over time you will know:
- Which growers consistently score 4.5+
- Which strains perform best for your audience
- Whether price correlates with experience scores
- Which customers are your best evaluators (repeat reviewers)

---

## 10. OPEN QUESTIONS (Decisions Needed)

| Question | Options | Your Pick |
|----------|---------|-----------|
| Review backend? | Supabase / Airtable / Google Sheets / Notion | TBD |
| Shopify approach? | Buy Button / Storefront API / Hydrogen | TBD |
| Payment methods? | Cash App + Zelle + Crypto / Stripe / Square | TBD |
| Shipping labels? | Manual USPS / Shippo / Pirate Ship / Shopify Shipping | TBD |
| Customer ID system? | Instagram handle / Signal number / Email / None | TBD |
| Age verification? | Self-attest / ID upload / Shopify age checker | TBD |

Fill this in as you decide. Update this document.

---

_Last edited: 2026-05-03_
_Maintain this file. Add to it as systems change._

---

## 11. ORDER TOKEN FORMAT (printed on jar card)

Tokens printed on each fulfilled jar's card. Used by buyers to submit verified reviews at `/review`.

**Format:** `MW-{DROP}-{GROWER}-{CODE}`

- `MW` — brand prefix (always)
- `{DROP}` — 3-letter drop code (e.g. `RRR` for Red River Rivalry)
- `{GROWER}` — 2-letter grower initials (e.g. `DA` for Dallas Architect, `OG` for OKC Ghost)
- `{CODE}` — 4-char alphanumeric, unique per square (e.g. `2A7K`)

**Example:** `MW-RRR-DA-2A7K`

**Workflow when fulfilling orders:**
1. Generate one token per jar
2. Insert into `order_tokens` table with `drop_id`, `tier`, `square_index`, buyer `email`
3. Print on the jar card before sealing
4. When buyer submits at `/review`, the `submit-review` edge function verifies the token, marks it redeemed, and (if Shopify is configured) emails back a one-time 10% discount code

---

## 12. THE RAP SHEET (in-jar keepsake)

Every jar ships with a folded paper "Rap Sheet" — a numbered, drop-unique wanted poster for the strain inside. Doubles as the review prompt and the collectible artifact buyers archive.

**Print spec:**
- Folded size: ~3.5" × 5" (single fold, opens to 7" × 5")
- Stock: warm kraft / parchment, matte
- Ink: deep brown + single muted-red accent (sheriff star wax seal)

**Content:**
- **Cover:** "WANTED" header · drop-unique mugshot illustration of the strain · strain name + alias · drop name + numbered edition (`RED RIVER RIVALRY · 014 / 100`)
- **Inside:** lineage, terps, grower, harvest date, cure days · 2–3 lines of grower field notes
- **Verdict block:** small QR + the order token (`MW-RRR-DA-2A7K`) · microcopy "Rate this bounty. Earn 10% off the next hunt."
- **Back:** sheriff star · "Property of the Most Wanted Archive" · `mostwantedhemp.co/archive`

**QR target:** `https://mostwantedhemp.co/review?token=MW-RRR-DA-2A7K`
The `/review` page reads `?token=` (or `?batch=`) from the URL and pre-fills the batch code field automatically — buyer just rates and submits.

**Numbering:** Each drop's print run is fixed (e.g. 100 sheets for a 100-square drop). Numbering is sequential, hand-stamped or pre-printed. Once a drop closes, those sheets are never reprinted.

