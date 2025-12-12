# Hey Aimi Design System — "Luminous Calm"

**Design Philosophy:** Reduce cognitive load while increasing emotional safety.

## Core Principle
Aimi should feel: **calm, luminous, human, present, reassuring, quietly capable**

Never: busy, sharp, loud, corporate, technical, productivity-app-ish

---

## 1. COLOR SYSTEM

### Primary Palette (Foundation)
Use everywhere for trust + calm + readability.

| Token | Use | Hex | Tailwind |
|-------|-----|-----|----------|
| **Aimi Green** | Primary brand color, glow, presence | `#65E6CF` | `aimi-green` |
| **Deep Slate** | Text, structure, grounding | `#183A3A` | `deep-slate` |
| **Soft Ivory** | Main backgrounds | `#F6F8F7` | `soft-ivory` |
| **Mist Grey** | Dividers, subtle surfaces | `#E6ECEA` | `mist-grey` |

### Secondary "Emotional Spectrum"
Use sparingly for states, feedback, personality. They whisper, not shout.

| Color | Emotion | Hex | Tailwind |
|-------|---------|-----|----------|
| **Aurora Blue** | Focus / thinking | `#3DC8F6` | `aurora-blue` |
| **Glow Coral** | Encouragement / warmth | `#FF7C72` | `glow-coral` |
| **Lumo Violet** | Insight / creativity | `#AE7BFF` | `lumo-violet` |
| **Sunlight Amber** | Completion / success | `#FFC46B` | `sunlight-amber` |

### Dark Mode (Nighttime Calm)
Even calmer, not dramatic. Avoid neon-on-black.

| Token | Hex |
|-------|-----|
| Background | `#0F2A2A` |
| Cards | `#143636` |
| Text | `#DCEEEE` |
| Aimi Glow | `#65E6CF` (reduced opacity) |

---

## 2. TYPOGRAPHY — "Human, Soft, Clear"

### Principles
- No harsh geometry
- Excellent readability
- Soft curves
- Large, breathable headers
- Short sentences
- Plenty of white space

### Font Stack
**Primary:** Inter or Sofia Sans
- Neutral, modern, readable
- Excellent variable font support
- Scales beautifully across UI

**Accent (sparingly):** DM Sans or Plus Jakarta Sans
- Adds warmth in headings
- Rounded but not childish

### Type Hierarchy
```
Hero: 3.5rem (56px) — Major moments
H1: 2.5rem (40px) — Page titles
H2: 2rem (32px) — Section headers
H3: 1.5rem (24px) — Subsections
Body: 1rem (16px) — Primary text
Small: 0.875rem (14px) — Secondary text
Tiny: 0.75rem (12px) — Metadata
```

**Rule:** Aimi speaks in calm, measured phrases. Never dense blocks of text.

---

## 3. SHAPE & LAYOUT LANGUAGE

### Shape Language
- Rounded corners: **12–20px** (16px standard)
- Soft cards, not sharp panels
- Floating surfaces with gentle depth
- Very light shadows (no harsh edges)

### Layout Principles
- **One primary focus per screen**
- Progressive disclosure (details only when needed)
- No cluttered dashboards
- Calm vertical rhythm
- Generous spacing

**Mantra:** "A single thought per moment."

### Spacing Scale
```
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

---

## 4. MOTION & INTERACTION — "Breathing, Not Beeping"

### Motion Principles
- **Slow** (never jittery)
- **Organic** (breathing-like)
- **Never fast or aggressive**

### Aimi States & Motion
| State | Motion | Duration |
|-------|--------|----------|
| **Idle** | Slow pulse / breathing glow | 2000ms loop |
| **Listening** | Slight expansion, brighter glow | 400ms |
| **Thinking** | Gentle swirl / color drift | 600ms |
| **Acting** | Smooth forward motion | 500ms |
| **Success** | Warm glow, slight lift | 400ms |
| **Error** | Soft dimming, reassuring text | 300ms |

### Timing
- **Standard transitions:** 300–600ms
- **Easing:** `ease-in-out` curves
- **No snappy productivity app animations**

### Animation Classes (Tailwind)
```css
transition-calm: transition-all duration-500 ease-in-out
transition-breathe: transition-all duration-[2000ms] ease-in-out
transition-quick: transition-all duration-300 ease-in-out
```

---

## 5. COMPONENT PATTERNS

### Cards
```
Background: soft-ivory or white
Border: 1px solid mist-grey
Radius: 16px
Padding: 24px
Shadow: 0 2px 8px rgba(24, 58, 58, 0.06)
```

### Buttons
**Primary (Aimi Green)**
- Background: aimi-green
- Text: deep-slate
- Hover: Slightly brighter glow
- Padding: 12px 24px
- Radius: 12px

**Secondary (Soft)**
- Background: mist-grey
- Text: deep-slate
- Hover: Subtle depth
- Padding: 12px 24px
- Radius: 12px

**Danger (Coral, not red)**
- Background: glow-coral
- Text: soft-ivory
- Hover: Slightly warmer
- Padding: 12px 24px
- Radius: 12px

### Input Fields
```
Background: white
Border: 1px solid mist-grey
Focus border: aimi-green
Radius: 12px
Padding: 12px 16px
Placeholder: text-slate-400
```

---

## 6. DESIGN PER PRODUCT SURFACE

### A. Aimi for Entrepreneurs (Web/Mobile)
- Slightly more structure
- Subtle data visualization
- Still calm, but more informational
- Dashboard cards
- **Tone:** "Your intelligent operations partner."

### B. Aimi for Parents (WhatsApp/Chat)
- Even simpler
- More conversational
- Emoji used very sparingly
- Warm language
- Clear summaries
- **Tone:** "I've got this — you can relax."

**Same brand. Different expression.**

---

## 7. WHAT TO AVOID ❌

**Do NOT:**
- Use bright saturated colors everywhere
- Use red for errors (use soft coral instead)
- Overuse icons
- Create complex productivity metaphors
- Add gamification
- Add AI "wow effects" that increase stress

**Aimi should feel safe and predictable, not flashy.**

---

## 8. BRAND SUMMARY

> Hey Aimi's design language is **calm, luminous, human-first, and emotionally intelligent**.
> Every visual decision should **reduce cognitive load** and **increase trust**.

---

## 9. DESIGN CHECKLIST ✓

Before shipping any screen, ask:

- [ ] **Is this calming?** → yes
- [ ] **Is this necessary?** → yes
- [ ] **Does this feel human?** → yes
- [ ] **Could this be simpler?** → probably

If all yes → **It's on brand.**

---

## 10. IMPLEMENTATION REFERENCE

### Tailwind Config Tokens
```js
colors: {
  // Primary Palette
  'aimi-green': '#65E6CF',
  'deep-slate': '#183A3A',
  'soft-ivory': '#F6F8F7',
  'mist-grey': '#E6ECEA',
  
  // Emotional Spectrum
  'aurora-blue': '#3DC8F6',
  'glow-coral': '#FF7C72',
  'lumo-violet': '#AE7BFF',
  'sunlight-amber': '#FFC46B',
  
  // Dark Mode
  'dark-bg': '#0F2A2A',
  'dark-card': '#143636',
  'dark-text': '#DCEEEE',
}
```

### CSS Custom Properties
```css
:root {
  --aimi-green: #65E6CF;
  --deep-slate: #183A3A;
  --soft-ivory: #F6F8F7;
  --mist-grey: #E6ECEA;
  
  --aurora-blue: #3DC8F6;
  --glow-coral: #FF7C72;
  --lumo-violet: #AE7BFF;
  --sunlight-amber: #FFC46B;
  
  --transition-calm: all 500ms ease-in-out;
  --transition-breathe: all 2000ms ease-in-out;
  --shadow-soft: 0 2px 8px rgba(24, 58, 58, 0.06);
  --shadow-medium: 0 4px 16px rgba(24, 58, 58, 0.08);
}
```

---

**Think:** Apple Health + Calm + Notion (but warmer) + a living presence.
