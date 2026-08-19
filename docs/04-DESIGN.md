# KodeDock — UI/UX Design System

> Clean, professional, developer-focused. Light theme with slate colors.

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Z-Index Scale](#5-z-index-scale)
6. [Iconography](#6-iconography)
7. [Component Library](#7-component-library)
8. [Page Designs](#8-page-designs)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Animation Guidelines](#10-animation-guidelines)

---

## 1. Design Philosophy

- **Developer-first:** Clean, functional, no unnecessary decorations
- **Light theme:** White backgrounds, slate text, subtle borders
- **Dark Theme Note:** The main application is Light theme, but the KodeDock Wallet interface uses a specialized **KodeDock Black** dark theme for a premium financial feel.
- **Minimal animations:** Smooth but not distracting
- **Mobile-first:** Responsive design, works on all devices
- **Accessible:** Proper contrast, focus states, keyboard navigation

---

## 2. Color System

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F8FAFC` | Page background |
| `foreground` | `#0F172A` | Primary text |
| `card` | `#FFFFFF` | Card backgrounds |
| `primary` | `#000000` | Buttons, accents |
| `primary-foreground` | `#FFFFFF` | Text on primary |

### Secondary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `secondary` | `#F1F5F9` | Subtle backgrounds |
| `secondary-foreground` | `#1E293B` | Secondary text |
| `muted` | `#F1F5F9` | Muted backgrounds |
| `muted-foreground` | `#64748B` | Muted text |

### Border & Input

| Token | Value | Usage |
|-------|-------|-------|
| `border` | `#E2E8F0` | Card borders, dividers |
| `input` | `#E2E8F0` | Input borders |
| `ring` | `#2563EB` | Focus rings |

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `brand-blue` | `#2563EB` | Links, interactive elements |
| `brand-green` | `#10B981` | Success, earnings |
| `brand-amber` | `#F59E0B` | Warnings, ratings |
| `brand-red` | `#EF4444` | Errors, destructive |

---

## 3. Typography

### Font Family

```css
--font-geist-sans: 'Geist', sans-serif;    /* Primary */
--font-geist-mono: 'Geist Mono', monospace; /* Code */
```

### Type Scale

| Size | Class | Usage |
|------|-------|-------|
| 7xl (4.5rem) | `text-7xl` | Hero headlines |
| 4xl (2.25rem) | `text-4xl` | Section headings |
| 2xl (1.5rem) | `text-2xl` | Card titles |
| lg (1.125rem) | `text-lg` | Body text |
| base (1rem) | `text-base` | Default text |
| sm (0.875rem) | `text-sm` | Labels, captions |
| xs (0.75rem) | `text-xs` | Small text, badges |

---

## 4. Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `px-4` | 1rem | Mobile padding |
| `px-6` | 1.5rem | Tablet padding |
| `px-8` | 2rem | Desktop padding |
| `py-20` | 5rem | Section vertical padding |
| `gap-4` | 1rem | Grid gaps |
| `gap-6` | 1.5rem | Card grid gaps |
| `gap-8` | 2rem | Large grid gaps |

---

## 5. Z-Index Scale

| Level | Class | Value | Usage |
|-------|-------|-------|-------|
| Base | `z-0` | 0 | Default content |
| Elevated | `z-10` | 10 | Sticky headers, active cards |
| Dropdown | `z-20` | 20 | Dropdown menus, tooltips |
| Overlay | `z-30` | 30 | Modal backdrops, slide-overs |
| Modal | `z-40` | 40 | Dialogs, command palettes |
| Toast | `z-50` | 50 | Notifications, alerts |

---

## 6. Iconography

We use **Lucide React** for all system icons to maintain a consistent, sharp, and clean appearance.

- Use stroke-width of `2` for most icons (Lucide default).
- Always ensure icons are sized appropriately using standard classes (`w-4 h-4`, `w-5 h-5`).
- For brand logos (e.g., GitHub, Next.js), use custom SVGs in `shared/components`.

---

## 7. Component Library

### shadcn/ui Components (New York Style)

| Component | File | Usage |
|-----------|------|-------|
| Button | `shared/ui/button.tsx` | All buttons |
| Card | `shared/ui/card.tsx` | Product cards, dashboards |
| Badge | `shared/ui/badge.tsx` | Labels, categories |
| Input | `shared/ui/input.tsx` | Forms, search |
| Textarea | `shared/ui/textarea.tsx` | Multi-line input fields |
| Sheet | `shared/ui/sheet.tsx` | Mobile navigation |
| Dialog | `shared/ui/dialog.tsx` | Modals, confirmations |
| Dropdown Menu | `shared/ui/dropdown-menu.tsx` | Context menus, user profiles |
| Avatar | `shared/ui/avatar.tsx` | User profile images |
| Separator | `shared/ui/separator.tsx` | Dividers |
| Toaster | `shared/ui/toaster.tsx` | Toast notifications |
| Tabs | `shared/ui/tabs.tsx` | Tabbed interfaces |

### Custom Components

| Component | File | Usage |
|-----------|------|-------|
| KodeDockLogo | `shared/components/kodedock-logo.tsx` | Navigation, footer |
| FadeIn | `shared/components/fade-in.tsx` | Scroll animations |
| GithubIcon | `shared/components/github-icon.tsx` | GitHub branding (custom SVG) |
| EmptyState | `shared/components/empty-state.tsx` | Fallback for empty lists |

---

## 8. Page Designs

### Landing Page (`/`)

```
┌─────────────────────────────────────────────┐
│  [Logo]  Features  How It Works  Sell Code  │
│                               [Login] [Get]  │
├─────────────────────────────────────────────┤
│                                             │
│  Where Code meets commerce.                 │
│  Launch faster with a polished marketplace  │
│                                             │
│  [Browse Products]  [Start Selling]         │
│                                             │
│  ✓ 2.5% commission  ✓ GitHub delivery       │
│  ✓ Starting ₹49     ✓ Escrow protection     │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Search templates, UI kits...       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Dashboard Preview Card]                   │
│                                             │
├─────────────────────────────────────────────┤
│  8M+ Indian Developers | 2.5% Commission    │
│  500K+ CS Graduates   | ₹49 Starting        │
├─────────────────────────────────────────────┤
│  [6 Category Cards]                         │
├─────────────────────────────────────────────┤
│  [6 Feature Cards]                          │
├─────────────────────────────────────────────┤
│  [3 Steps: Browse → Pay → GitHub]           │
├─────────────────────────────────────────────┤
│  [GitHub Showcase + Comparison]             │
├─────────────────────────────────────────────┤
│  [Pricing Comparison Table]                 │
├─────────────────────────────────────────────┤
│  [Seller Section + Dashboard Mockup]        │
├─────────────────────────────────────────────┤
│  [3 Testimonial Cards]                      │
├─────────────────────────────────────────────┤
│  [Dark CTA: Ready to start?]                │
├─────────────────────────────────────────────┤
│  Footer: Product | Sellers | Company | Legal │
└─────────────────────────────────────────────┘
```

### Browse Page (`/browse`)

```
┌─────────────────────────────────────────────┐
│  [Logo]  Search...          [Cart] [User]   │
├─────────────────────────────────────────────┤
│  All | Web Templates | Mobile | UI Kits     │
├─────────────────────────────────────────────┤
│  Welcome back, John!                        │
│  Discover production-ready code assets      │
│                                             │
│  Trending Products           View all →     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🖼  │ │ 🖼  │ │ 🖼  │ │ 🖼  │          │
│  │Title│ │Title│ │Title│ │Title│          │
│  │₹999 │ │₹499 │ │₹249 │ │₹1499│          │
│  │⭐4.8 │ │⭐4.6 │ │⭐4.9 │ │⭐4.7 │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  [Load More Products]                       │
└─────────────────────────────────────────────┘
```

### Seller Dashboard (`/seller`)

```
┌─────────────────────────────────────────────┐
│  [Logo]  Dashboard  Products  Earnings  Set │
├─────────────────────────────────────────────┤
│  Seller Dashboard                [+ Product]│
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │Products│ │ Sales  │ │Revenue │ │You Keep││
│  │   5    │ │  12    │ │₹12,500 │ │₹12,187 ││
│  └────────┘ └────────┘ └────────┘ └────────┘│
│                                             │
│  Recent Sales                               │
│  ┌──────────────────────────────────────┐   │
│  │ Next.js SaaS    ₹999    2min ago    │   │
│  │ Tailwind Admin  ₹499    15min ago   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | 2-column grids |
| Desktop | > 1024px | Full layout, sidebar nav |

---

## 10. Animation Guidelines

- **Duration:** 300-500ms for most animations
- **Easing:** `[0.22, 1, 0.36, 1]` (smooth ease-out)
- **Trigger:** Scroll-triggered via `useInView`
- **Direction:** Fade up (default), fade left/right for sections
- **Reduce motion:** Respect `prefers-reduced-motion`

---

*Document Version: 1.3.0 | Last Updated: August 2026*
