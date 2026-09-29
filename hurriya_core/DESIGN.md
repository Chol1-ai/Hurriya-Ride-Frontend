---
name: Hurriya Command
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#142537'
  surface-container-high: '#203244'
  surface-container-highest: '#2c3a4c'
  on-surface: '#d4e4fa'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#c5c9ff'
  on-tertiary: '#131e8c'
  tertiary-container: '#a3abff'
  on-tertiary-container: '#2c36a0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000767'
  on-tertiary-fixed-variant: '#2f3aa3'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  status-success: '#10b981'
  status-warning: '#f59e0b'
  status-danger: '#ef4444'
  status-inactive: '#6b7280'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.4'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  stats-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  stack-gap-lg: 2rem
  stack-gap-md: 1.5rem
  stack-gap-sm: 0.5rem
  sidebar-width: 16rem
  header-height: 5rem
---

## Brand & Style
Hurriya Command embodies a **High-Contrast Modern** aesthetic tailored for mission-critical logistics and fleet operations. The brand personality is authoritative, precise, and technologically advanced, evoking a sense of "command and control" through a deep, dark-mode interface.

The design utilizes **Glassmorphism** selectively—primarily for data containers—to maintain a sense of depth without sacrificing performance. It balances a utilitarian structure with high-energy accents (Amber and Emerald) to guide the operator's eye toward critical status changes. The overall emotional response should be one of calm efficiency and absolute reliability in high-stakes environments.

## Colors
The palette is built on a "Deep Space" foundation using a sophisticated range of midnight blues (`#010f1f` to `#2c3a4c`) instead of pure blacks. 

- **Primary (Amber):** Used for primary actions, branding, and warnings. It provides maximum contrast against the dark background.
- **Secondary (Sky) & Tertiary (Indigo):** Used as semantic identifiers for different vehicle categories (Tuktuks and Cars) to allow for quick visual scanning.
- **Functional Colors:** We use high-vibrancy Emerald for compliance and Red for critical failures. 
- **Surface Strategy:** Layers are built using increasing lightness for higher elevation. The "Lowest" container is used for the sidebar and header backgrounds to ground the UI.

## Typography
We use **Plus Jakarta Sans** exclusively to maintain a modern, approachable, yet highly legible feel. 

- **Hierarchical Contrast:** Use font weight (Bold vs Regular) and color (White vs Gray-400) to create a clear information hierarchy. 
- **Numerical Data:** For statistics and plate numbers, use Bold weights to ensure data points are the first thing an operator sees.
- **Labels:** Small labels use uppercase with increased letter spacing for a "technical" instrument-panel aesthetic.
- **Mobile scaling:** Display-lg should scale down to 24px (headline-md) on mobile devices to maintain readability without horizontal overflow.

## Layout & Spacing
The system follows a **Fixed-Sidebar Fluid-Content** model. 

- **Grid:** A standard 12-column system is used for the main dashboard content.
- **Outer Margins:** Consistent 32px (2rem) padding around the main content area.
- **Card Layout:** Summary cards use a 4-column span on desktop, 2-column on tablet, and full-width on mobile.
- **Breakpoints:** 
    - Desktop: 1024px+ (Sidebar visible)
    - Tablet: 768px - 1023px (Sidebar collapses to icons)
    - Mobile: <767px (Sidebar becomes a bottom nav or drawer, padding reduces to 1rem).

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Glassmorphism**.

- **Level 0 (Base):** `surface-container-lowest` (#010f1f) used for global navigation and headers.
- **Level 1 (Substrate):** `surface` (#051424) used as the main application background.
- **Level 2 (Cards):** `surface-container-low` with a subtle 1px border (`surface-container-high`). 
- **Level 3 (Interactive Containers):** Table containers use a `backdrop-blur-md` with `surface-container/40` to create a "glass" effect, suggesting they sit above the background.
- **Shadows:** Use `shadow-2xl` with a high opacity (0.4) black tint for large containers like tables to make them pop against the dark void.

## Shapes
The shape language is consistently **Rounded**, conveying a professional yet modern software experience.

- **Primary Actions/Inputs:** Use a "Pill" shape (full rounding) for search bars and secondary buttons to differentiate from structural elements.
- **Containers/Cards:** Use `rounded-xl` (12px-24px) for dashboard cards and table containers.
- **Status Badges:** Use `rounded-full` for a friendly, pill-like appearance.
- **Icons:** Small utility icons are housed in `rounded-lg` or `rounded-full` containers with subtle background tints.

## Components

- **Buttons:** 
  - *Primary:* Solid Amber background, bold typography, `shadow-lg` with a primary-tinted glow.
  - *Secondary/Ghost:* Surface background with a 1px `surface-container-high` border.
- **Input Fields:** Search bars should be fully rounded, with a `surface-container` background and `primary` ring on focus.
- **Data Tables:**
  - Headers: `surface-container-lowest` background with uppercase, grayed-out labels.
  - Rows: Alternating `surface-container/30` background with a bright highlight on hover.
- **Chips/Badges:**
  - *Semantic:* Low-opacity background (10-20%) matching the text color (e.g., Emerald-500/20 background with Emerald-400 text).
  - *Status:* High-contrast solid badges for "Action Required" states (e.g., solid Red).
- **Navigation:** Active sidebar items should use a left-accent border (3px) in the Primary color and a container-light background to indicate state.