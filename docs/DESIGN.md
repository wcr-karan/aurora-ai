# Design system — "Support command deck"

The interface is a dark, instrument-panel surface. The core idea is a **semantic
dual temperature**: one electric-azure primary carries AI / calm / resolved
states, and a warm brass accent carries escalation / urgency. The split isn't
decorative — it maps to what the product does.

Tokens live in [`src/app/globals.css`](../src/app/globals.css) (Tailwind v4
`@theme`), in OKLCH.

## Color

| Role        | Token             | Value (OKLCH)              | Use                              |
| ----------- | ----------------- | -------------------------- | -------------------------------- |
| Background  | `--color-bg`      | `0.166 0.014 248`          | App floor (deep blue-black)      |
| Surface     | `--color-surface` | `0.224 0.016 248`          | Panels, cards                    |
| Primary     | `--color-primary` | `0.722 0.149 234`          | AI, actions, links, resolved     |
| Accent      | `--color-accent`  | `0.83 0.132 78`            | Escalation, urgency, highlights  |
| Success     | `--color-success` | `0.79 0.15 158`            | Resolved, healthy metrics        |
| Danger      | `--color-danger`  | `0.685 0.2 18`            | Urgent priority, destructive     |
| Ink         | `--color-ink`     | `0.972 0.004 248`          | Primary text (≥ 4.5:1 on bg)     |
| Ink-3       | `--color-ink-3`   | `0.642 0.016 248`          | Muted text (verified contrast)   |

Priority colors (urgent → low) are a rose → orange → yellow → green ramp, shared
between badges, kanban lanes, and the escalation dashboard.

## Type

Three families, paired on a contrast axis:

- **Display** — Bricolage Grotesque (characterful, modern). Headings only.
- **Body** — Inter. Everything readable.
- **Mono** — JetBrains Mono. Metrics, keys, code, the embed snippet, latencies.

Headings use `letter-spacing: -0.03em` and `text-wrap: balance`; the hero clamps
at ~4.4rem (under the 6rem ceiling). No all-caps body; uppercase reserved for
small field labels.

## Motion

Framer Motion, eased with `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) — no bounce.
Reveals enhance already-visible content (no visibility gating). Signature
moments: the hero's live chat demo, animated chart draw-ins, the AI-resolution
gauge, the layout-animated nav indicator, and the staggered rich-card entrance.
Everything degrades through a global `prefers-reduced-motion` block.

## Components

Solid layered surfaces over glassmorphism (blur is reserved for the sticky bars
and the widget header). A `.bezel` hairline top-light gives panels a polished
instrument edge. Charts are hand-built SVG (area, gauge, bars, progress) so they
match the system exactly and animate on scroll, with zero chart dependency.

## Anti-slop choices

- Not purple-SaaS-gradient: a committed azure/brass system with meaning.
- No gradient text, no side-stripe accents, no per-section uppercase eyebrows,
  no hero-metric template (metrics are compact instrument readouts).
- The bento feature grid uses varied spans and **live micro-visualizations**
  (ingestion animation, escalation meter, sparkline) instead of identical
  icon-cards.
