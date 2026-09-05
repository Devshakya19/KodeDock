# 🎨 KodeDock Design System (V2)

## 🎯 Core Philosophy & Vision
The KodeDock Design System is a premium, developer-centric UI framework. It takes heavy inspiration from **Appwrite's Pink Design**, favoring high contrast, deep charcoal backgrounds, precise typography, and mathematical spacing over flashy shadows or complex gradients. 

**Mantra:** *Function over form. Minimalist. Sharp. Developer-first.*

---

## 🎨 1. The Token System (Color Palette)
We follow a strict **60-30-10 ratio**. Colors are mapped directly to CSS variables to be consumed by Tailwind CSS.

### 🟣 The Brand Accent
* **KodeDock Violet:** `#8535FC` (Used for primary calls-to-action, active states, and focus rings).

### 🌑 Dark Mode (Default & Primary Focus)
KodeDock is designed Dark-Mode first to reduce developer eye strain.
* **Background (`bg-background`):** `#1D1D21` (Premium Charcoal. Never pure black).
* **Surface (`bg-card` / `bg-popover`):** `#27272A` (Slightly elevated offset).
* **Surface Inset (`bg-muted`):** `#141417` (Used for input fields and code blocks).
* **Borders (`border-border`):** `#414146` (Faint separation) / `#52525B` (Hovered borders).
* **Text Primary (`text-foreground`):** `#EDEDF0` (Off-white, highly legible).
* **Text Secondary (`text-muted-foreground`):** `#A1A1AA` (Subtle grays).

### ☀️ Light Mode (Secondary)
* **Background:** `#FAFAFA`
* **Surface:** `#FFFFFF` (Relies on borders/shadows for depth).
* **Borders:** `#E4E4E7`
* **Text Primary:** `#18181B`
* **Text Secondary:** `#71717A`

### 🚥 Semantic Colors
* **Success:** `#10B981` (Emerald)
* **Error/Destructive:** `#EF4444` (Red)
* **Warning:** `#F59E0B` (Amber)

---

## 🖋️ 2. Typography & Fonts
Typography drives the "tech" feel of KodeDock. We use a tri-font strategy.

1. **Primary UI (`font-sans`): `Inter`**
   - *Usage:* 90% of the interface (Buttons, paragraphs, lists, forms).
   - *Tracking:* `tracking-tight` (`-0.02em` to `-0.04em`). Tight letter spacing makes text look modern and compact.
   
2. **Display & Headings (`font-heading`): `Poppins`**
   - *Usage:* Page Titles, Hero sections, Marketing banners.
   - *Weights:* `font-semibold` (600) and `font-bold` (700).

3. **Technical Data (`font-mono`): `Fira Code`**
   - *Usage:* API Keys, User IDs, Code blocks, Badges, and subtle brand labels.
   - *Tracking:* Normal for code, but `tracking-widest` (`0.1em`) for uppercase category labels to create a premium structural feel.

---

## 🧱 3. Component Anatomy

### 🔲 Buttons
- **Shape:** `rounded-lg` (8px border radius).
- **Primary Button:** Solid Background (`bg-[#8535FC]`), Text is pure white (`text-white`), `font-medium`. No borders.
- **Secondary/Outline Button:** Transparent background, `border border-[#414146]`. Hover state changes background to `#27272A`.
- **Focus States:** Sharp `2px` solid ring of `#8535FC`. No blurry outlines.

### 🃏 Cards & Surfaces
- **Depth:** In dark mode, shadows (`shadow-sm`) are almost invisible. Depth is created purely by a `1px solid` border (`border-[#414146]`) and a lighter background color (`#27272A`).
- **Padding:** Strict adherence to `p-6` (24px) or `p-8` (32px).

### 📝 Input Fields
- **Background:** `bg-[#141417]` (Slightly darker than the card surface).
- **Border:** `1px solid border-[#414146]`. 
- **Focus:** Changes border color to `#8535FC`.
- **Typography:** Placeholder is `Inter`, but entered technical values (like product slugs) should dynamically switch to `Fira Code`.

---

## 📐 4. Spacing Theory (The 4px Grid)
KodeDock uses a strict 4-point grid system. All margins, paddings, and gaps must map to Tailwind's default spacing scale.
- **Micro (`gap-1`, `gap-2`):** 4px, 8px (Gaps between icons and text).
- **Small (`p-3`, `p-4`):** 12px, 16px (Button padding, form control gaps).
- **Medium (`p-6`, `p-8`):** 24px, 32px (Card padding, inner section spacing).
- **Large (`py-12`, `py-16`):** 48px, 64px (Major page sections).

---

## 🛠️ 5. Implementation Strategy (Next.js & Tailwind)
To implement this design system in code:
1. Initialize **Next.js App Router**.
2. Install **Shadcn UI** as the base component library.
3. Overwrite `tailwind.config.ts` CSS variables (`--background`, `--primary`, `--border`) with the HEX codes defined in Section 1.
4. Load `Inter`, `Poppins`, and `Fira Code` using `next/font/google`.
