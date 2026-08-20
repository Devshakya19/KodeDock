# KodeDock — UI/UX Design System

> Minimal, premium, developer-first marketplace. White + Black + Electric Purple.
> Marketing uses Sora. Product UI uses Geist. Technical content uses Geist Mono.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Color System](#2-brand-color-system)
3. [Typography](#3-typography)
4. [60–30–10 Usage Rule](#4-603010-usage-rule)
5. [Spacing System](#5-spacing-system)
6. [Grid & Layout](#6-grid--layout)
7. [Z-Index Scale](#7-z-index-scale)
8. [Iconography](#8-iconography)
9. [Shape, Border & Elevation](#9-shape-border--elevation)
10. [Component Library](#10-component-library)
11. [Page Designs](#11-page-designs)
12. [Responsive Breakpoints](#12-responsive-breakpoints)
13. [Motion & Interaction](#13-motion--interaction)
14. [Accessibility](#14-accessibility)
15. [Implementation Tokens](#15-implementation-tokens)

---

## 1. Design Philosophy

KodeDock is a premium marketplace for developers to discover, buy and use production-ready code assets.

### Core principles

- **Minimal first:** whitespace, hierarchy and typography do the visual work.
- **Developer-first:** technical information should be easy to scan.
- **Premium, not flashy:** avoid excessive gradients, glassmorphism, neon effects and decorative noise.
- **Marketing ≠ product UI:** Sora creates the brand personality on the landing/marketing experience; Geist keeps the marketplace and application interface highly usable.
- **Black + white foundation:** the interface should feel editorial and professional.
- **Electric Purple is the signal:** `#7C3AED` is reserved for actions, active states, links, highlights and brand moments.
- **Consistent density:** product pages can be information-rich, but spacing and grouping must remain intentional.
- **Responsive by default:** every layout must work from mobile to large desktop.
- **Accessible by default:** keyboard navigation, visible focus, semantic HTML and sufficient contrast are required.

### Visual character

```text
Minimal      ████████████████████
Premium      ██████████████████
Developer    ████████████████████
Playful      █████
Decorative   ███
```

---

# 2. Brand Color System

KodeDock's core palette is intentionally small.

## 2.1 Brand colors

| Token | HEX | HSL | Role |
|---|---|---|---|
| `brand-white` | `#FFFFFF` | `0 0% 100%` | Primary light surface |
| `brand-black` | `#0A0A0A` | `0 0% 4%` | Primary dark / strong text |
| `brand-purple` | `#7C3AED` | `262 81% 58%` | Brand accent / CTA / active |

### Brand rule

**White + Black + Electric Purple are the only colors that define KodeDock's visual identity.**

Other colors are supporting semantic colors only.

---

## 2.2 Light Theme

### Core

| Token | HEX | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Main page background |
| `foreground` | `#0A0A0A` | Primary text |
| `card` | `#FFFFFF` | Cards and elevated surfaces |
| `card-foreground` | `#0A0A0A` | Card text |
| `popover` | `#FFFFFF` | Dropdowns / popovers |
| `popover-foreground` | `#0A0A0A` | Popover text |

### Secondary surfaces

| Token | HEX | Usage |
|---|---|---|
| `secondary` | `#F1F1F3` | Secondary UI surfaces |
| `secondary-foreground` | `#0A0A0A` | Secondary text |
| `muted` | `#F8F8FA` | Subtle backgrounds |
| `muted-foreground` | `#A1A1AA` | Secondary / muted text |

### Accent

| Token | HEX | Usage |
|---|---|---|
| `primary` | `#7C3AED` | Main CTA / active state |
| `primary-foreground` | `#FFFFFF` | Text on purple |
| `accent` | `#7C3AED` | Accent |
| `accent-foreground` | `#FFFFFF` | Text on accent |
| `ring` | `#7C3AED` | Focus ring |

### Borders

| Token | HEX | Usage |
|---|---|---|
| `border` | `#E5E5E7` | Borders / dividers |
| `input` | `#E5E5E7` | Input borders |

---

## 2.3 Dark Theme

### Core

| Token | HEX | Usage |
|---|---|---|
| `background` | `#0A0A0A` | Main canvas |
| `foreground` | `#FAFAFA` | Primary text |
| `card` | `#18181B` | Cards / surfaces |
| `card-foreground` | `#FAFAFA` | Card text |
| `popover` | `#18181B` | Dropdowns / popovers |
| `popover-foreground` | `#FAFAFA` | Popover text |

### Secondary surfaces

| Token | HEX | Usage |
|---|---|---|
| `secondary` | `#27272A` | Secondary surfaces |
| `secondary-foreground` | `#FAFAFA` | Secondary text |
| `muted` | `#27272A` | Muted surface |
| `muted-foreground` | `#A1A1AA` | Muted text |

### Accent

| Token | HEX | Usage |
|---|---|---|
| `primary` | `#7C3AED` | Main CTA / active state |
| `primary-foreground` | `#FFFFFF` | Text on purple |
| `accent` | `#7C3AED` | Accent |
| `accent-foreground` | `#FFFFFF` | Text on accent |
| `ring` | `#7C3AED` | Focus ring |

### Borders

| Token | HEX | Usage |
|---|---|---|
| `border` | `#3F3F46` | Borders / dividers |
| `input` | `#3F3F46` | Input borders |

---

## 2.4 Semantic colors

Semantic colors must not compete with the purple brand accent.

| Token | HEX | Usage |
|---|---|---|
| `success` | `#22C55E` | Successful actions / verified states |
| `warning` | `#F59E0B` | Warnings / ratings |
| `destructive` | `#EF4444` | Errors / destructive actions |

Use semantic colors only when their meaning is necessary.

---

# 3. Typography

KodeDock uses **three tightly controlled font roles**.

## 3.1 Font roles

### Sora — Marketing / Brand

```css
--font-sora: 'Sora', sans-serif;
```

Use Sora for:

- Landing page hero headline
- Marketing section headlines
- Brand statements
- Marketing CTAs when a large display treatment is needed
- High-impact promotional numbers

Do **not** use Sora throughout the application UI.

### Geist — Product UI

```css
--font-geist: 'Geist', sans-serif;
```

Use Geist for:

- Navbar
- Browse
- Product cards
- Filters
- Search
- Checkout
- Dashboard
- Seller interface
- Settings
- Forms
- Buttons
- Labels
- Body copy

### Geist Mono — Technical

```css
--font-geist-mono: 'Geist Mono', monospace;
```

Use Geist Mono for:

- Code
- CLI commands
- API endpoints
- Package names
- Repository names
- Technical identifiers
- Version numbers when presented as technical data

---

## 3.2 Typography hierarchy

### Marketing / Landing

| Role | Font | Weight | Suggested size |
|---|---|---:|---:|
| Hero | Sora | 700 | `clamp(2.75rem, 6vw, 5rem)` |
| Section heading | Sora | 600–700 | `2rem–3rem` |
| Marketing subheading | Sora | 500–600 | `1.25rem–1.5rem` |
| Body | Geist | 400–500 | `1rem–1.125rem` |
| CTA | Geist | 600 | `0.875rem–1rem` |

### Product / Application

| Role | Font | Weight | Suggested size |
|---|---|---:|---:|
| Page heading | Geist | 700 | `2rem–2.5rem` |
| Section heading | Geist | 650–700 | `1.5rem–2rem` |
| Product title | Geist | 600–700 | `0.875rem–1rem` |
| Body | Geist | 400–500 | `0.875rem–1rem` |
| Label | Geist | 600 | `0.6875rem–0.8125rem` |
| Caption | Geist | 400–500 | `0.6875rem–0.75rem` |
| Code | Geist Mono | 400–600 | context-dependent |

### Letter spacing

- Large Sora headings: `-0.04em` to `-0.055em`
- Geist headings: `-0.02em` to `-0.035em`
- Body: normal
- Uppercase labels: `0.08em–0.16em`

---

# 4. 60–30–10 Usage Rule

The 60–30–10 rule defines the visual balance, not a literal pixel-perfect percentage on every page.

## Light mode

### 60% — White

```text
#FFFFFF
```

Used for:

- Main content canvas
- Cards
- Navbar
- Modals
- Inputs where appropriate

### 30% — Black / neutral surfaces

```text
#0A0A0A
#F1F1F3
#F8F8FA
```

Used for:

- Typography
- Navigation emphasis
- Dark CTA blocks
- Secondary surfaces
- Dividers and neutral hierarchy

### 10% — Electric Purple

```text
#7C3AED
```

Used for:

- Primary CTA
- Active navigation
- Active filters
- Links
- Important highlights
- Brand marks
- Selected states
- Focus rings

**Do not turn every UI element purple.**

---

## Dark mode

### 60% — Black

```text
#0A0A0A
```

Main application canvas.

### 30% — Dark surfaces

```text
#18181B
#27272A
```

Cards, panels, navigation surfaces and grouped content.

### 10% — Electric Purple

```text
#7C3AED
```

Same semantic role as light mode.

---

# 5. Spacing System

Use a consistent 4px base rhythm.

| Token | Value | Primary use |
|---|---:|---|
| `1` | 4px | Icon/text micro gap |
| `2` | 8px | Tight internal spacing |
| `3` | 12px | Labels / compact cards |
| `4` | 16px | Default component spacing |
| `5` | 20px | Card spacing |
| `6` | 24px | Component groups |
| `8` | 32px | Section groups |
| `10` | 40px | Large component spacing |
| `12` | 48px | Section spacing |
| `16` | 64px | Major section spacing |
| `20` | 80px | Marketing section padding |
| `24` | 96px | Large landing sections |

Avoid arbitrary spacing values unless the layout genuinely requires them.

---

# 6. Grid & Layout

## Desktop

- Maximum content width: `1440px–1536px`
- Standard horizontal padding: `24px–32px`
- Browse sidebar: approximately `248px`
- Browse content: flexible
- Product grid: 4 columns on large desktop
- Grid gap: `20px–24px`

## Browse layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Navbar                                                      │
├──────────────┬──────────────────────────────────────────────┤
│              │ Hero                                         │
│   Filters    ├──────────────────────────────────────────────┤
│   ~248px     │ Category tabs / Sort                          │
│              ├──────────────────────────────────────────────┤
│              │ Product grid                                  │
│              │  [1] [2] [3] [4]                             │
│              │  [5] [6] [7] [8]                             │
└──────────────┴──────────────────────────────────────────────┘
```

### Browse visual rules

- White cards on a very subtle neutral canvas are allowed when needed for separation.
- Borders should be subtle.
- Product imagery is the visual focus.
- Purple is reserved for badges, active controls and key actions.
- Avoid oversized decorative elements that compete with product previews.

---

# 7. Z-Index Scale

| Level | Class | Value | Usage |
|---|---|---:|---|
| Base | `z-0` | 0 | Normal content |
| Elevated | `z-10` | 10 | Sticky headers / floating elements |
| Dropdown | `z-20` | 20 | Menus / tooltips |
| Overlay | `z-30` | 30 | Backdrops |
| Modal | `z-40` | 40 | Dialogs / command palettes |
| Toast | `z-50` | 50 | Notifications |

---

# 8. Iconography

Use **Lucide React** for system icons.

Rules:

- Default stroke width: `2`
- Small UI: `14–16px`
- Standard UI: `16–20px`
- Prominent action: `20–24px`
- Do not use emoji as interface icons.
- Brand logos use dedicated SVGs.
- GitHub, Next.js and other external brands use their official/custom SVG assets where appropriate.

---

# 9. Shape, Border & Elevation

## Border radius

| Element | Radius |
|---|---:|
| Input | `8px` |
| Small button | `8px` |
| Card | `12px–16px` |
| Large panel | `16px–20px` |
| Pill | `9999px` |
| Avatar | `9999px` |

KodeDock should feel **rounded but restrained**.

Avoid excessive pill-shaped containers except for:

- Tags
- Category filters
- Status badges
- Compact controls

## Borders

Light:

```text
#E5E5E7
```

Dark:

```text
#3F3F46
```

Prefer a 1px border over heavy shadows.

## Shadows

Use shadows sparingly.

Preferred:

```text
0 4px 16px rgba(15, 23, 42, 0.04)
0 12px 30px rgba(15, 23, 42, 0.08)
```

Cards should not look like floating plastic.

---

# 10. Component Library

## shadcn/ui

Use the existing shadcn/ui New York style where available.

| Component | Usage |
|---|---|
| Button | Actions / CTAs |
| Card | Product / dashboard cards |
| Badge | Categories / status |
| Input | Search / forms |
| Sheet | Mobile navigation / filters |
| Dialog | Modals |
| Dropdown Menu | User / sorting / actions |
| Avatar | User profiles |
| Separator | Dividers |
| Toast | Feedback |
| Tabs | Categories / sections |

## Custom components

```text
KodeDockLogo
KodeDockMark
Navbar
SearchBar
BrowseSidebar
BrowseHero
CategoryTabs
ProductCard
ProductGrid
SellerDashboard
GithubDeliveryCard
EmptyState
```

All reusable component files should use kebab-case naming.

---

# 11. Page Designs

## 11.1 Landing / Marketing Page

The landing page is the strongest expression of the KodeDock brand.

### Typography

- Hero: **Sora**
- Marketing headings: **Sora**
- Supporting copy: **Geist**
- Technical snippets: **Geist Mono**

### Structure

```text
┌──────────────────────────────────────────────────────────────┐
│ KodeDock    Features  How It Works  Sell Code    Login  CTA │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              [SORA — HERO HEADLINE]                          │
│              Discover. Buy. Build.                           │
│                                                              │
│       Premium code assets built by developers.               │
│                                                              │
│       [Browse Assets]     [Start Selling]                    │
│                                                              │
│       ✓ GitHub delivery   ✓ Instant access                   │
│       ✓ Curated assets    ✓ Developer-first                  │
│                                                              │
│                 [Marketplace / Product Visual]               │
├──────────────────────────────────────────────────────────────┤
│                       Social proof                            │
├──────────────────────────────────────────────────────────────┤
│                 Featured Categories                           │
├──────────────────────────────────────────────────────────────┤
│                 Why KodeDock                                 │
├──────────────────────────────────────────────────────────────┤
│                 How It Works                                  │
│             Browse → Pay → GitHub                             │
├──────────────────────────────────────────────────────────────┤
│                 Product Showcase                              │
├──────────────────────────────────────────────────────────────┤
│                 Seller Section                                │
├──────────────────────────────────────────────────────────────┤
│                 Testimonials                                  │
├──────────────────────────────────────────────────────────────┤
│                 Final CTA                                     │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────────┘
```

### Marketing visual rules

- Use Sora only where it creates hierarchy.
- Keep body copy in Geist.
- Hero may use the purple accent, but should not become a purple wall.
- Use product/dashboard mockups as visual proof.
- Prefer one strong visual over many small decorative graphics.
- Use whitespace aggressively.

---

## 11.2 Browse Page

The Browse page is a **product interface**, therefore Geist is primary.

```text
Navbar
  ↓
Sidebar filters + Marketplace Hero
  ↓
Category tabs + Sort
  ↓
4-column product grid
  ↓
Load More
```

### Product card

```text
┌──────────────────────────┐
│                          │
│     PRODUCT PREVIEW      │
│                    [🛒] │
│                          │
├──────────────────────────┤
│ Product title            │
│ Short description        │
│                          │
│ Seller       ★ 4.9      │
│                          │
│ ₹1,499                   │
│ [Next.js] [TypeScript]   │
└──────────────────────────┘
```

No emoji icons in the final implementation; use Lucide/custom SVG icons.

---

## 11.3 Seller Dashboard

Use Geist throughout.

```text
Navbar
  ↓
Dashboard header + Add Product
  ↓
Products / Sales / Revenue / Net Earnings
  ↓
Sales chart
  ↓
Recent sales
  ↓
Products
```

Technical values may use Geist Mono.

---

## 11.4 Checkout

- Geist UI
- Clear price hierarchy
- Purple primary CTA
- Minimal distractions
- Strong security / delivery reassurance
- GitHub delivery should be visually explicit

---

# 12. Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|---|---:|---|
| Mobile | `< 640px` | Single column, compact nav |
| Tablet | `640px–1024px` | 2-column content where appropriate |
| Desktop | `> 1024px` | Full layout |
| Large desktop | `> 1280px` | 4-column marketplace grid |

### Mobile Browse

- Sidebar becomes a filter Sheet.
- Category tabs scroll horizontally.
- Product grid becomes 1 column.
- Navbar collapses.
- Search remains easy to access.
- Touch targets should be at least approximately 44px.

---

# 13. Motion & Interaction

KodeDock uses restrained motion.

### Timing

```text
Micro interaction: 150–200ms
Normal transition: 200–300ms
Large reveal: 400–500ms
```

### Easing

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

### Allowed

- Button hover
- Card elevation
- Image scale on hover
- Fade/slide reveal
- Dropdown transitions
- Modal transitions
- Skeleton loading

### Avoid

- Constant floating animations
- Excessive parallax
- Large bouncing elements
- Long page transitions
- Animation that delays user actions

Always respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* Reduce or disable non-essential motion */
}
```

---

# 14. Accessibility

- Use semantic HTML.
- Every interactive element must have a keyboard-accessible focus state.
- Focus ring uses `#7C3AED`.
- Do not communicate meaning through color alone.
- Use accessible labels for icon-only buttons.
- Maintain readable contrast in both themes.
- Respect reduced motion.
- Form controls require visible labels or accessible names.
- Product images require meaningful alt text when they convey information.

---

# 15. Implementation Tokens

## CSS variables

### Light

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 4%;

  --card: 0 0% 100%;
  --card-foreground: 0 0% 4%;

  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 4%;

  --primary: 262 81% 58%;
  --primary-foreground: 0 0% 100%;

  --secondary: 240 10% 96%;
  --secondary-foreground: 0 0% 4%;

  --muted: 240 14% 97%;
  --muted-foreground: 240 5% 65%;

  --accent: 262 81% 58%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 262 81% 58%;

  --success: 142 71% 45%;

  --radius: 0.5rem;
}
```

### Dark

```css
.dark {
  --background: 0 0% 4%;
  --foreground: 0 0% 98%;

  --card: 240 6% 10%;
  --card-foreground: 0 0% 98%;

  --popover: 240 6% 10%;
  --popover-foreground: 0 0% 98%;

  --primary: 262 81% 58%;
  --primary-foreground: 0 0% 100%;

  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 4% 16%;
  --muted-foreground: 240 5% 65%;

  --accent: 262 81% 58%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 5% 26%;
  --input: 240 5% 26%;
  --ring: 262 81% 58%;

  --success: 142 71% 45%;
}
```

## Font variables

```css
:root {
  --font-sans: var(--font-geist);
  --font-marketing: var(--font-sora);
  --font-mono: var(--font-geist-mono);
}
```

### Next.js font setup

```tsx
import { Geist, Geist_Mono, Sora } from "next/font/google";

export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});
```

---

## Final KodeDock Identity

```text
BRAND
──────────────────────────────
White       #FFFFFF
Black       #0A0A0A
Purple      #7C3AED

LIGHT
──────────────────────────────
60% White
30% Black / Neutral
10% Purple

DARK
──────────────────────────────
60% #0A0A0A
30% #18181B / #27272A
10% #7C3AED

TYPOGRAPHY
──────────────────────────────
Marketing    → Sora
Product UI   → Geist
Code         → Geist Mono

ICONOGRAPHY
──────────────────────────────
Lucide React + dedicated SVG brands

STYLE
──────────────────────────────
Minimal
Premium
Developer-first
Clean
High whitespace
Restrained motion
```

---

*Document Version: 2.0.0 | Updated: August 2026*
