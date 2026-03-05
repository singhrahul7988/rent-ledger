# RentLedger Desktop UI Spec

## 1. Purpose
This document defines the desktop-first UI system and screen behavior for RentLedger. It is the source of truth for layout, visual tokens, components, interactions, states, and copy constraints.

## 2. Platform Constraints
- Desktop web only
- Minimum viewport width: 1280px
- Layout model: fixed sidebar + flexible main content
- Main content minimum width: 1020px
- Not a mobile app in v2.0

## 3. Visual Direction
Refined fintech with subtle blockchain infrastructure. The interface must feel premium, trustworthy, and warm. Avoid neon, aggressive crypto aesthetics, and dense technical jargon.

## 4. Design Tokens (Exact)
```css
:root {
  --color-navy: #1B3A5C;
  --color-navy-dark: #122840;
  --color-navy-light: #2D5480;
  --color-orange: #E8590C;
  --color-orange-light: #FF7535;
  --color-cream: #FAFAF7;
  --color-white: #FFFFFF;
  --color-green: #1A7A4A;
  --color-green-light: #E8F5EE;
  --color-amber: #D4860B;
  --color-amber-light: #FEF3DB;
  --color-red: #C0392B;
  --color-red-light: #FDEAEA;
  --color-gray-50: #F7F7F5;
  --color-gray-100: #EEEEEA;
  --color-gray-300: #C8C8C0;
  --color-gray-600: #666660;
  --color-gray-900: #1A1A16;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  --radius-card: 16px;
  --radius-button: 10px;
  --radius-pill: 100px;
  --radius-input: 10px;
  --radius-modal: 20px;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.08);
  --shadow-sidebar: 4px 0 20px rgba(0,0,0,0.12);
  --shadow-modal: 0 24px 80px rgba(0,0,0,0.20);
}
```

## 5. Typography
- Display: DM Serif Display
- Body: DM Sans
- Mono: JetBrains Mono

Type scale:
- Hero score: 80px, DM Serif Display, #1B3A5C
- H1 title: 28px, DM Sans bold, #1A1A16
- H2 section: 20px, DM Sans semibold, #1A1A16
- H3 card: 16px, DM Sans semibold, #1A1A16
- Body: 15px, DM Sans regular, #666660
- Label/meta: 13px, DM Sans medium, #999990
- Blockchain/meta mono: 13px, JetBrains Mono, #999990
- Button text: 15px, DM Sans semibold

## 6. Global Layout
### Sidebar
- Width: 260px fixed
- Background: #1B3A5C
- Top logo text: RentLedger, DM Serif Display, 22px, white
- Tagline: Your rent builds your future, 11px, #7A9FBF
- Nav item height: 48px
- Active nav item:
  - White background
  - 4px left border #E8590C
  - Text color #1B3A5C
  - Slight left indent
- Inactive nav item:
  - Text #7A9FBF
  - Icon #5A7F9F
- Bottom area:
  - Green dot + truncated account address in mono
  - Powered by Creditcoin label, 11px

Nav groups:
- OVERVIEW: Dashboard
- PAYMENTS: Pay Rent, Payment History
- CREDIT: My RentScore, Credit Report
- FINANCE: Loans, Transactions
- ACCOUNT: Settings, Help

### Topbar
- Height: 64px
- Background: #FFFFFF
- Bottom border: 1px #EEEEEA
- Left: page title (20px DM Sans bold)
- Right: network badge, notifications icon, 32px avatar

### Main Content
- Background: #FAFAF7
- Padding: 32px
- Max width: 1200px centered when viewport > 1460px

## 7. RentScore Gauge Standard
Use identical treatment across all screens.

- Arc: 270 degree sweep
- Stroke thickness: 12px
- Background arc: #EEEEEA
- Score tiers:
  - 0-299: #C0392B, label Building Credit
  - 300-449: #D4860B, label Credit Starter
  - 450-599: #E8590C, label Credit Builder
  - 600-699: #1A7A4A, label Credit Established
  - 700-850: #1B3A5C, label Credit Trusted
- Center score: 80px DM Serif Display, #1B3A5C
- Subtitle: RentScore, 12px DM Sans, #999990
- Tier badge: pill with tier color
- Needle indicator marks exact position

## 8. Component Library
### Primary Button
- Background: #E8590C
- Hover: #FF7535 and scale(1.02)
- Radius: 10px
- Height: 44px
- Padding: 0 24px
- Disabled: #C8C8C0 and not-allowed cursor

### Secondary Button
- White background
- Border: 1.5px #EEEEEA
- Text: #1A1A16
- Hover background: #F7F7F5

### Ghost Button
- No border/background
- Text: #666660
- Hover background: #F7F7F5

### Stat Card
- Background: white
- Radius: 16px
- Padding: 24px
- Label: 13px uppercase with 0.5px letter spacing
- Value: 28px DM Serif Display
- Optional trend pill

### Data Table
- Container: white card, 16px radius
- Header row: #F7F7F5
- Header text: 13px uppercase semibold #999990
- Row height: 52px
- Row divider: 1px #F7F7F5
- Hover: #FAFAF9
- No alternating stripes

### Status Pills
- ON TIME: bg #E8F5EE, text #1A7A4A, border #C8E8D6
- LATE: bg #FEF3DB, text #D4860B, border #F0D896
- LOCKED: bg #F7F7F5, text #999990, border #EEEEEA
- ELIGIBLE: bg #FFF0E8, text #E8590C, border #F5C8A8
- ACTIVE: bg #EEF4FF, text #1B3A5C, border #B8D0EE
- DEFAULTED: bg #FDEAEA, text #C0392B, border #F0B8B8

### Payment Certificate Badge
- Small card with chain-style icon
- Month year label, amount, status pill, tx hash snippet
- Tx snippet format: first 6 + ... + last 4
- Mono font for tx text

### Blockchain Data Display
- Prefix icon + mono text + copy icon + external link
- Text size: 12px JetBrains Mono
- Color: #999990

### Loading States
- Skeleton shimmer blocks only
- No spinner-based loading for main content

### Empty States
- Centered outline illustration (navy/orange)
- H2 title + body copy + primary CTA

## 9. Motion and Feedback
- Page load: 180-250ms fade/translate for section cards
- Success feedback: subtle green pulse and checkmark draw animation
- Hover states: only meaningful controls should animate
- Avoid constant idle animation

## 10. Screen Specifications
## 10.1 Dashboard
Purpose: summary and next action.

Content blocks:
- Hero: RentScore gauge + tier badge + trend note
- Stat cards:
  - Total rent recorded: $21,900
  - On-time streak: 5 months
  - Loan eligibility: Tier 2 Eligible
- Recent Payment Certificates: 6 card list
- Eligibility progress module with required points to next tier

Primary actions:
- Pay Rent
- View Credit Report

## 10.2 Pay Rent
Purpose: complete monthly rent payment confidently.

Sections:
- Active lease selector
- Amount details:
  - Monthly rent: $1,850.00
  - Processing fee: $4.50
  - Total: $1,854.50
- Due date and payment timing hint
- Confirm and pay primary button

Post-success state:
- Green check animation
- Message: Payment recorded successfully
- Show Payment Certificate summary and tx reference

## 10.3 Payment History
Purpose: verifiable payment evidence.

Modules:
- Filter bar (status, lease, year)
- Table with columns: Date, Amount, Status, Payment Certificate, Transaction
- Right-side panel on row click with full metadata

Row sample:
- Date: March 5, 2026
- Amount: $1,850.00
- Status: ON TIME
- Payment Certificate: PR-4481
- Transaction: 0x7f29ab...012d

## 10.4 My RentScore
Purpose: explain score and progress.

Modules:
- Full gauge hero
- Score factor cards
- 12-month line chart
- Actionable tips list:
  - Keep 3 consecutive on-time payments
  - Avoid late payments to prevent penalty
  - Maintain stable lease tenure

## 10.5 Credit Report
Purpose: exportable and shareable proof.

Modules:
- Score snapshot card
- Reliability metrics:
  - On-time ratio
  - Average monthly rent
  - Longest streak
- Share link settings:
  - Expiration (7 days default)
  - View access count
- Export button (PDF)

## 10.6 Loans
Purpose: move from score to capital access.

Tier cards:
- Tier 1: up to $800, min score 450
- Tier 2: up to $2,500, min score 550
- Tier 3: up to $5,000, min score 650
- Tier 4: up to $10,000, min score 725

States:
- Locked: show points needed
- Eligible: orange highlight + request CTA
- Active: repayment schedule and next due date

## 10.7 Transactions
Purpose: audit trail across all financial events.

Table columns:
- Time
- Event
- Status
- Network reference
- Explorer link

Filters:
- Event type
- Date range
- Status

## 11. Copy Standards
### Tone
- Trustworthy
- Clear
- Empowering
- Slightly warm

### Copy Examples
Use:
- "Your payment has been recorded and your RentScore increased by 18 points."
- "You need 38 more points to unlock Tier 3 loans."

Do not use:
- "NFT minted"
- "Gas consumed"
- "Smart contract call executed"

## 12. Sample Data Set (UI Fixtures)
- Account name: Sarah Chen
- Account id: acc_01HQP7S1A9
- Account address: 0x8f21A9...B113
- Current RentScore: 612
- Lease rent: $1,850/month
- Payment history sample:
  - Oct 2025 ON TIME $1,800 tx 0x19ad2f...9ab1
  - Nov 2025 ON TIME $1,800 tx 0x61bcfe...3da2
  - Dec 2025 LATE $1,850 tx 0xae3c11...91f4
  - Jan 2026 ON TIME $1,850 tx 0x29d7ab...40ce
  - Feb 2026 ON TIME $1,850 tx 0x17f9aa...6f2e
  - Mar 2026 ON TIME $1,850 tx 0x7f29ab...012d

## 13. Accessibility Requirements
- Color contrast WCAG AA minimum
- All icon-only actions must have tooltips and aria labels
- Keyboard focus visible for every interactive element
- Table rows navigable by keyboard
- Reduced motion support for success and page-load animations

## 14. Responsive Behavior Rules
- 1280px: base layout, no horizontal overflow
- 1440px: increased spacing between dashboard modules
- 1600px+: center main container at 1200px max width
- Below 1280px: show unsupported viewport message in v2.0 demo

## 15. UI QA Checklist
- [ ] Token values match exact hex codes
- [ ] Fonts loaded correctly (DM Serif Display, DM Sans, JetBrains Mono)
- [ ] Sidebar states match active/inactive spec
- [ ] RentScore gauge style is consistent on all relevant screens
- [ ] Skeleton loaders present for async modules
- [ ] Empty states use approved style and CTA
- [ ] Status pills match semantic color mapping
- [ ] Blockchain metadata uses mono style and truncation rules
