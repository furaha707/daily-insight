---
version: alpha
name: Anthropic
description: "A warm, restrained canvas built around an off-white parchment tone (#FAF9F7) and a terracotta-adjacent rust accent (#C2522D) that reads as intellectual warmth rather than tech aggression. The system feels more like a considered academic journal than a startup landing page — generous whitespace, tight serif-inflected headings, and a deliberate avoidance of the saturated blues that dominate AI branding. The typography system pairs a humanist sans (Styrene) with long-form body text that invites reading. Surfaces are minimal: near-white backgrounds, thin dividers, and an ink color that never goes full black."

colors:
  primary: "#C2522D"
  on-primary: "#ffffff"
  primary-hover: "#A8421F"
  ink: "#1A1A18"
  ink-muted: "#6B6B63"
  canvas: "#FAF9F7"
  surface-1: "#F2F0EC"
  surface-2: "#E8E5E0"
  border: "#D8D4CC"
  accent-warm: "#D4A574"
  code-bg: "#F0EDE8"

typography:
  display:
    fontFamily: "Styrene A, Styrene B, -apple-system, sans-serif"
    fontSize: 52px
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: -0.03em
  body:
    fontFamily: "Styrene A, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: -0.01em

spacing:
  base: 8px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

radius:
  sm: 4px
  md: 8px
  lg: 16px
  pill: 9999px

shadows:
  card: "0 1px 2px rgba(26,26,24,0.06)"
  elevated: "0 4px 24px rgba(26,26,24,0.08)"

motion:
  duration-fast: 120ms
  duration-base: 240ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
---

## 1. Visual Theme & Atmosphere
Anthropic's visual identity is a deliberate counterpoint to the cold, dark-mode AI aesthetic. Where competitors reach for neon and neural-net imagery, Anthropic opts for warmth: an off-white canvas with parchment undertones, a terracotta brand accent that evokes analog craft, and typography that prioritizes reading comfort. The result feels more like a research institution than a tech company — careful, considered, and confident enough to be unhurried.

## 2. Color System
- **Canvas**: #FAF9F7 — warm off-white, never stark
- **Surface layers**: #F2F0EC / #E8E5E0 — subtle differentiation for cards and panels
- **Primary accent**: #C2522D — rust/terracotta, used sparingly on CTAs and brand moments
- **Ink**: #1A1A18 — warm near-black, never cold pure black
- **Muted**: #6B6B63 — desaturated warm gray for secondary text
- **Border**: #D8D4CC — hairline separators, soft and warm-toned

## 3. Typography
Styrene A/B is Anthropic's workhorse — a geometric grotesque with humanist qualities. Display sizes run at 500 weight with tight tracking (-0.03em) and compressed line-height. Body text is set generously at 17px with 1.65 leading — clearly intended for long-form reading of research and documentation. No decorative serifs; the warmth comes from color and spacing, not letterform.

## 4. Components & Patterns
- **CTA buttons**: Terracotta fill (#C2522D) with white text, medium radius (8px), no shadows
- **Cards**: Minimal — thin border (#D8D4CC), white or surface-1 background, generous padding
- **Navigation**: Clean horizontal bar, logo left, links right, no mega-menu complexity
- **Research papers**: Long-form layout with clear section hierarchy, generous left margin
- **Claude product pages**: Warmer tone, slightly more color, but same underlying system

## 5. Spacing & Layout
Very generous. Max content width ~960px for body text, ~1200px for marketing layouts. Section padding of 96–128px vertical. The whitespace is a design decision: it signals unhurriedness and confidence, not emptiness. Grid is simple 12-column, rarely used beyond 2–3 columns.

## 6. Motion & Interaction
Subtle and slow by tech standards. Hover states are gentle color shifts (120ms). Page sections may fade in on scroll but never aggressively. The philosophy matches the brand: thoughtful restraint over demonstrative animation.

## Rationale

**Terracotta instead of tech blue** — Every AI competitor defaults to cool blues and purples to signal intelligence and technology. Anthropic's rust/terracotta primary (#C2522D) is a deliberate market-positioning choice: it communicates humanistic warmth and intellectual honesty rather than machine precision, positioning the company as a thoughtful research institution rather than a product-first startup.

**Parchment canvas over pure white** — The warm off-white (#FAF9F7) reduces harshness for readers spending extended time with research papers and documentation. It also creates tonal coherence with the terracotta accent — the entire palette exists within a warm-neutral range, giving the system visual unity without requiring color discipline from individual designers.

**17px body at 1.65 line-height** — This is a long-form reading configuration, not a UI configuration. Anthropic publishes dense research documents and the Claude interface hosts long conversations. The generous body size signals that the company expects you to actually read, not skim, and that reading comfort is a product value.

**Restrained motion at slow timescales** — 120ms hover transitions and absence of aggressive scroll animations communicate the brand personality as much as color does. The philosophy is that a company serious about AI safety shouldn't use manipulative UI patterns to drive engagement — the design earns attention through content quality, not stimulus-response animation.

**No dark mode** — By offering only a warm light surface, Anthropic makes a legibility-forward commitment that also avoids the "hacker AI aesthetic" associated with dark-first interfaces. The absence signals confidence: they don't need to look like a terminal to be taken seriously.

## Accessibility

### Contrast Ratios
- **Primary on background** (#C2522D on #FAF9F7): 4.6:1 — passes AA, fails AAA
- **Text on surface** (#1A1A18 on #FAF9F7): 17.2:1 — passes AA
- **Muted on background** (#6B6B63 on #FAF9F7): 5.1:1 — passes AA (decorative)

### Minimum Requirements
- **Touch target**: 44×44px minimum for all interactive elements
- **Focus indicator**: #C2522D outline, 2px, 2px offset
- **Focus contrast**: 4.6:1 against #FAF9F7 background

### Motion
- Respects `prefers-reduced-motion`: yes — all hover transitions and scroll fade-ins should be suppressed
- All transitions use `@media (prefers-reduced-motion: reduce)` guard

### Notes
- The terracotta primary (#C2522D) narrowly passes AA at 4.6:1 on the warm canvas — verify at actual render sizes and do not rely on it for small text below 14px bold
- Muted ink (#6B6B63) passes AA but not AAA; avoid using it for critical instructional text
- Warm parchment canvas reduces harshness but also slightly lowers contrast vs pure white — test with users who have low vision
- Hover-only color shifts (120ms) carry no meaning for keyboard users; ensure all interactive states have a visible focus ring in addition to color change
