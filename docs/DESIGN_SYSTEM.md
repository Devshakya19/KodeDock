# Kodedock - Design System & UI Specification

| **Document Version** | 1.0.0 |
| :--- | :--- |
| **Status** | Approved Specification |
| **Last Updated** | 2026-09-20 |
| **Target Audience** | UI/UX Designers, Frontend Engineers |

---

## 1. Design Philosophy & Core Aesthetics

Kodedock is built for software engineers, designers, and technical founders. The interface embodies **precision engineering, dark-first aesthetics, high readability, and subtle cybernetic elegance**.

### Core Pillars:
1. **Dark-First Native**: Engineered for night-time hacking, terminal aesthetics, and zero eye fatigue, with a clean porcelain light mode for daytime workflows.
2. **The 60-30-10 Golden Rule**:
   - **60% Base Surface**: Rich Obsidian Black (`#090A0F`) in Dark Mode / Soft Porcelain (`#F8F9FC`) in Light Mode.
   - **30% Structure & Contrast**: Deep Graphite Surfaces (`#12131A`), Midnight Borders (`#1F212D`), and Cyber Cyan (`#38BDF8`) for secondary tags and tech stacks.
   - **10% High-Energy Accent**: Electric Purple (`#8B5CF6`) for primary CTAs ("Buy Now", "Publish Asset"), glowing indicators, and focus states.
3. **Typography for Code & Prose (Fontshare Suite)**:
   - **Clash Display**: Bold, high-energy geometric display typeface for Hero sections, landing headlines, and prominent pricing figures (`₹999`).
   - **Satoshi**: Modern, ultra-legible neo-grotesque for UI components, body text, form inputs, and dashboards.
   - **Azeret Mono**: High-character monospace font for code snippets, terminal commands, Git commit hashes, and dynamic license keys (`KD-XXXX-XXXX`).
4. **Subtle Glassmorphism & Micro-Glows**: Refined 1px semi-transparent borders and diffused purple/cyan ambient glows that elevate cards above the canvas.

---

## 2. Color Palette & Theming (60-30-10 Rule)

```
==================================================================================
                           DARK THEME (Default Engine)
==================================================================================
 [60% Base Canvas]       [30% Structure & Secondary]       [10% High Accent]
   #090A0F (Obsidian)      #12131A (Graphite Surface)        #8B5CF6 (Electric Purple)
   #0D0E15 (Canvas Alt)    #1F212D (Midnight Border)         #A855F7 (Purple Glow)
                           #38BDF8 (Cyber Cyan Secondary)

==================================================================================
                           LIGHT THEME (Ceramic Engine)
==================================================================================
 [60% Base Canvas]       [30% Structure & Secondary]       [10% High Accent]
   #F8F9FC (Porcelain)     #FFFFFF (Pure White Surface)      #6D28D9 (Royal Violet)
   #F1F5F9 (Canvas Alt)    #E2E8F0 (Cool Slate Border)       #7C3AED (Violet Hover)
                           #0284C7 (Ocean Blue Secondary)
==================================================================================
```

### Color Token Reference Table

| Token Name | Dark Theme Value | Light Theme Value | Usage Description |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#090A0F` | `#F8F9FC` | Global viewport background (60% base). |
| `--bg-surface` | `#12131A` | `#FFFFFF` | Cards, modals, sidebars, headers. |
| `--bg-surface-elevated` | `#181924` | `#F1F5F9` | Dropdowns, popovers, hovering states. |
| `--border-subtle` | `#1F212D` | `#E2E8F0` | Default card borders, dividers, outlines. |
| `--border-focus` | `#8B5CF6` | `#6D28D9` | Focused inputs, active tabs, selected cards. |
| `--text-primary` | `#F1F1F5` | `#0F172A` | Primary headings, asset titles, prices. |
| `--text-secondary` | `#9496A8` | `#64748B` | Subtext, card metadata, descriptions. |
| `--text-muted` | `#5C5E70` | `#94A3B8` | Timestamps, placeholder text, disabled states. |
| `--accent-primary` | `#8B5CF6` | `#6D28D9` | Main CTA buttons ("Buy Now", "Download", "Publish"). |
| `--accent-hover` | `#7C3AED` | `#5B21B6` | Button hover and pressed states. |
| `--accent-glow` | `rgba(139, 92, 246, 0.35)` | `rgba(109, 40, 217, 0.15)` | Glowing shadow behind primary CTA buttons. |
| `--accent-cyan` | `#38BDF8` | `#0284C7` | Tech-stack badges (Next.js, Go, Docker, AI). |
| `--status-success` | `#10B981` | `#059669` | Verified badges, successful payments, active licenses. |
| `--status-warning` | `#F59E0B` | `#D97706` | In-review notices, expiring sessions. |
| `--status-danger` | `#EF4444` | `#DC2626` | Destructive actions, rejected listings, errors. |

---

## 3. Global CSS Variables (`design-tokens.css`)

Copy and mount this stylesheet in the root styling layer (`packages/ui` or `apps/*/styles`):

```css
/* ==========================================================================
   KODEDOCK DESIGN SYSTEM TOKENS
   ========================================================================== */

:root {
  /* LIGHT THEME TOKENS */
  --bg-canvas: #F8F9FC;
  --bg-canvas-alt: #F1F5F9;
  --bg-surface: #FFFFFF;
  --bg-surface-elevated: #F8FAFC;
  
  --border-subtle: #E2E8F0;
  --border-highlight: #CBD5E1;
  --border-focus: #6D28D9;

  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;

  --accent-primary: #6D28D9;
  --accent-hover: #5B21B6;
  --accent-light: #EDE9FE;
  --accent-glow: rgba(109, 40, 217, 0.15);

  --accent-cyan: #0284C7;
  --cyan-subtle: #E0F2FE;

  --status-success: #059669;
  --success-subtle: #D1FAE5;
  --status-warning: #D97706;
  --warning-subtle: #FEF3C7;
  --status-danger: #DC2626;
  --danger-subtle: #FEE2E2;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
  --shadow-glow: 0 0 20px rgba(109, 40, 217, 0.2);

  --font-sans: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Menlo, monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

[data-theme="dark"],
.dark {
  /* DARK THEME TOKENS (DEFAULT) */
  --bg-canvas: #090A0F;
  --bg-canvas-alt: #0D0E15;
  --bg-surface: #12131A;
  --bg-surface-elevated: #181924;

  --border-subtle: #1F212D;
  --border-highlight: #2C2E3E;
  --border-focus: #8B5CF6;

  --text-primary: #F1F1F5;
  --text-secondary: #9496A8;
  --text-muted: #5C5E70;

  --accent-primary: #8B5CF6;
  --accent-hover: #7C3AED;
  --accent-light: rgba(139, 92, 246, 0.15);
  --accent-glow: 0 0 24px rgba(139, 92, 246, 0.35);

  --accent-cyan: #38BDF8;
  --cyan-subtle: rgba(56, 189, 248, 0.12);

  --status-success: #10B981;
  --success-subtle: rgba(16, 185, 129, 0.15);
  --status-warning: #F59E0B;
  --warning-subtle: rgba(245, 158, 11, 0.15);
  --status-danger: #EF4444;
  --danger-subtle: rgba(239, 68, 68, 0.15);

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 28px -4px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 28px rgba(139, 92, 246, 0.35);
}
```

---

## 4. Typography Scale

| Style Level | Font Family | Size (Desktop / Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Headline (H1)** | `--font-display` (`Clash Display`) | 48px / 36px | 700 (Bold) | 1.15 |
| **Section Title (H2)** | `--font-display` (`Clash Display`) | 32px / 26px | 600 (Semibold) | 1.25 |
| **Card Title (H3)** | `--font-sans` (`Satoshi`) | 20px / 18px | 700 (Bold) | 1.35 |
| **Body Large / Lead** | `--font-sans` (`Satoshi`) | 16px | 500 (Medium) | 1.5 |
| **Body Default / Meta** | `--font-sans` (`Satoshi`) | 14px | 400 (Regular) | 1.4 |
| **Code / License Keys** | `--font-mono` (`Azeret Mono`) | 13px | 500 (Medium) | 1.6 |
| **Badge / Label** | `--font-sans` (`Satoshi`) | 12px | 700 (Bold) | 1.0 (Caps) |

---

## 5. Core Component Design Guidelines

### 5.1 Buttons

```
  [ Primary CTA: Electric Glow ]          [ Secondary: Cyber Border ]
  ┌───────────────────────────┐          ┌───────────────────────────┐
  │      ⚡ Buy Now ($79)     │          │      Live Preview ↗       │
  └───────────────────────────┘          └───────────────────────────┘
   Background: #8B5CF6                    Background: #12131A
   Hover: #7C3AED + Glow                  Border: 1px solid #1F212D
   Text: #FFFFFF                          Hover Border: #38BDF8
```

1. **Primary Action Button (`.btn-primary`)**:
   - Solid electric purple background (`var(--accent-primary)`).
   - Crisp white text (`#FFFFFF`) with bold weight.
   - Hover state: Slight lift (`translateY(-1px)`) with glowing aura (`box-shadow: var(--shadow-glow)`).
2. **Secondary Outline Button (`.btn-secondary`)**:
   - Dark graphite background (`var(--bg-surface)`).
   - 1px midnight border (`var(--border-subtle)`).
   - Hover state: Border turns into cyber cyan or subtle purple highlight.
3. **Ghost / Action Icon Button (`.btn-ghost`)**:
   - Transparent background.
   - Micro-interaction on hover: subtle background tint (`var(--bg-surface-elevated)`).

---

### 5.2 Product Cards (`apps/store`)
- **Structure**:
  - Aspect Ratio: 16:9 media preview with zoom-on-hover effect.
  - Card Body: 1px subtle border (`#1F212D`) with backdrop-filter glassmorphism.
  - Header: Product title with verified author avatar.
  - Tag row: Pills for tech stack (e.g., `Next.js 15`, `Better Auth`, `Tailwind`).
  - Footer: Price display in bold white and 1-click "Buy" or "Preview" trigger.

---

### 5.3 Tech-Stack & Category Badges
Badges provide instant visual recognition for developers:
- **Next.js / React**: Deep slate background with Cyber Cyan text (`color: var(--accent-cyan)`).
- **Better Auth / Security**: Midnight purple background with Electric Violet text.
- **Verified Code / Security Tested**: Subtle Emerald background with green check icon (`color: var(--status-success)`).

---

### 5.4 Code Blocks & License Displays
- Monospace font (`JetBrains Mono`).
- Dark obsidian inset background (`#07080B`).
- 1px border (`#1A1B26`).
- Copy-to-clipboard 1-click button with feedback animation ("Copied!").

---

## 6. Accessibility & Contrast Verification (WCAG AAA/AA)

1. **Text Contrast**:
   - Dark mode primary text (`#F1F1F5`) on `#090A0F` canvas delivers a contrast ratio of **18.4:1** (Exceeds WCAG AAA standard).
   - Light mode primary text (`#0F172A`) on `#F8F9FC` canvas delivers a contrast ratio of **16.1:1** (Exceeds WCAG AAA standard).
2. **Interactive States**:
   - All interactive elements possess explicit `:focus-visible` rings (`outline: 2px solid var(--border-focus); outline-offset: 2px`).
   - Links and buttons have visible hover and active transformations.
