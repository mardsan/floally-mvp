# Hey Aimi — Design System Visual Guide

## Color Palette

### Primary Foundation
```
┌─────────────────────────────────────────────┐
│  Aimi Green     #65E6CF  ████████████████   │  Brand presence, glow
│  Deep Slate     #183A3A  ████████████████   │  Text, structure
│  Soft Ivory     #F6F8F7  ████████████████   │  Backgrounds
│  Mist Grey      #E6ECEA  ████████████████   │  Dividers
└─────────────────────────────────────────────┘
```

### Emotional Spectrum (Use Sparingly)
```
┌─────────────────────────────────────────────┐
│  Aurora Blue    #3DC8F6  ████████████████   │  Focus / thinking
│  Glow Coral     #FF7C72  ████████████████   │  Encouragement (not red!)
│  Lumo Violet    #AE7BFF  ████████████████   │  Insight / creativity
│  Sunlight Amber #FFC46B  ████████████████   │  Success / completion
└─────────────────────────────────────────────┘
```

---

## CalmDashboard Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Header (sticky)                                         ┃
┃  ┌────┐  Hey Aimi                           Settings    ┃
┃  │ ●  │  [Aimi logo]                                     ┃
┃  └────┘                                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ┌───────────────────────────────────────────┐
     │  ● I'm here                               │  ← Breathing presence
     └───────────────────────────────────────────┘

     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃  Your One Thing Today                    ┃
     ┃  Based on your emails, calendar, etc.    ┃
     ┃                                           ┃
     ┃  ┌─────────────────────────────────────┐ ┃
     ┃  │  Review Q4 budget proposal   30min │ ┃  ← Primary focus
     ┃  │                                     │ ┃
     ┃  │  Your CFO marked it urgent...       │ ┃
     ┃  │                                     │ ┃
     ┃  │  [Start Now]  [Schedule]  [Skip]   │ ┃
     ┃  │                                     │ ┃
     ┃  │  ● 92% confident this is priority   │ ┃
     ┃  └─────────────────────────────────────┘ ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃  Waiting for Your Approval               ┃  ← Only when exists
     ┃  1 action ready to go                    ┃
     ┃                                           ┃
     ┃  ┌─────────────────────────────────────┐ ┃
     ┃  │  ✉  Send reply to Sarah about...   │ ┃
     ┃  │     "Hi Sarah, Thanks for..."       │ ┃
     ┃  │                                     │ ┃
     ┃  │  [Approve & Send]  [Edit]  [Skip]  │ ┃
     ┃  └─────────────────────────────────────┘ ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃  ❤  Feeling Overwhelmed?                 ┃
     ┃                                           ┃  ← Emergency button
     ┃     I can reschedule meetings, clear     ┃
     ┃     tasks, and create protected time.    ┃
     ┃                                           ┃
     ┃     [Save My Day]                         ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

            Everything's handled. You can relax.
```

---

## Aimi's Presence States

### Idle (Default)
```
● Aimi Green (#65E6CF)
  Breathing animation: 2000ms cycle
  Shadow: 0 0 12px rgba(101, 230, 207, 0.2)
  Label: "I'm here"
```

### Listening (User interaction)
```
● Aurora Blue (#3DC8F6)
  Expanding animation: 400ms
  Shadow: 0 0 24px rgba(61, 200, 246, 0.4)
  Label: "Listening..."
```

### Thinking (Processing)
```
● Lumo Violet (#AE7BFF)
  Gentle swirl: 600ms
  Shadow: 0 0 20px rgba(174, 123, 255, 0.3)
  Label: "Thinking..."
```

### Acting (Executing)
```
● Sunlight Amber (#FFC46B)
  Warm pulse: 500ms
  Shadow: 0 0 30px rgba(255, 196, 107, 0.5)
  Label: "Working on it..."
```

---

## Typography Scale

```
Hero      3.5rem (56px)  ██████████████████  Major moments
H1        2.5rem (40px)  ████████████████    Page titles
H2        2rem   (32px)  ██████████████      Section headers
H3        1.5rem (24px)  ████████████        Subsections
Body      1rem   (16px)  ██████████          Primary text
Small     0.875rem(14px) ████████            Secondary text
Tiny      0.75rem(12px)  ██████              Metadata
```

**Font:** Inter (primary), Sofia Sans (display)  
**Line height:** 1.5 (breathable)  
**Letter spacing:** Normal (0)

---

## Component Examples

### Button — Primary
```
┌────────────────┐
│   Start Now    │  ← Aimi green bg, deep slate text
└────────────────┘
Hover: Glow shadow + scale(1.02)
Active: scale(0.98)
Transition: 500ms ease-in-out
```

### Button — Secondary
```
┌────────────────┐
│   Schedule     │  ← White bg, border mist-grey
└────────────────┘
Hover: Border → aimi-green
Transition: 500ms
```

### Card
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                            ┃  Background: white
┃   Card content here        ┃  Border: 1px mist-grey
┃                            ┃  Radius: 16px
┃                            ┃  Padding: 24px
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  Shadow: 0 2px 8px rgba(24,58,58,0.06)
```

### Input Field
```
┌─────────────────────────────────┐
│ Enter your task...              │  Border: mist-grey
└─────────────────────────────────┘  Focus: aimi-green ring
Radius: 12px
Padding: 12px 16px
```

---

## Animation Timings

```
Quick feedback     300ms    Hover states, clicks
Calm transitions   500ms    Card movements, fades
Breathing          2000ms   Idle presence, pulse
Thinking           600ms    Processing state
Success            400ms    Completion celebrations
```

**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)  
**Principle:** Slow, organic, breathing-like. Never jittery.

---

## Spacing Scale

```
xs     8px   ████
sm    12px   ██████
md    16px   ████████          ← Standard (most common)
lg    24px   ████████████
xl    32px   ████████████████
2xl   48px   ████████████████████████
3xl   64px   ████████████████████████████████
```

**Vertical rhythm:** Use 2xl (48px) between major sections  
**Card padding:** md (16px) or lg (24px)  
**Button padding:** 12px 24px

---

## Shadow System

```
Soft       0 2px 8px rgba(24, 58, 58, 0.06)     Cards (default)
Soft MD    0 4px 16px rgba(24, 58, 58, 0.08)    Elevated cards
Soft LG    0 8px 24px rgba(24, 58, 58, 0.10)    Modals
Glow       0 0 20px rgba(101, 230, 207, 0.3)    Aimi's presence
Glow Strong 0 0 30px rgba(101, 230, 207, 0.5)   Active state
```

**Rule:** No black shadows. Use deep-slate rgba for softness.

---

## Design Checklist ✓

Before shipping any screen:

```
┌──────────────────────────────────────┐
│  Is this calming?           → YES    │
│  Is this necessary?         → YES    │
│  Does this feel human?      → YES    │
│  Could this be simpler?     → NO     │
└──────────────────────────────────────┘
```

If all ✓ → **It's on brand.**

---

## What to Avoid ❌

```
DON'T                          DO INSTEAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bright saturated colors        → Soft, luminous tones
Red for errors                 → Glow coral (#FF7C72)
Multiple competing CTAs        → One primary action
Complex productivity UI        → One focus per screen
Gamification                   → Calm reassurance
AI "wow" effects              → Quiet capability
Fast snappy animations         → Breathing motion
Dense text blocks              → Short, measured phrases
Icons everywhere               → Selective, meaningful
```

---

## Inspiration Statement

> Think: **Apple Health** + **Calm** + **Notion** (but warmer) + **a living presence**

**Not:** Productivity dashboards, corporate tools, busy interfaces

**Instead:** Calm companion, emotional safety, quietly capable

---

## Brand Voice Examples

```
SITUATION                      AIMI SAYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Idle state                     "I'm here"
Analyzing priorities           "Thinking..."
Task completed                 "Done ✨"
User overwhelmed               "I can help clear your day"
No urgent items                "Everything's handled"
Success state                  "All set. You can relax."
Error (gentle)                 "Let me try that again"
```

**Tone:** Calm, reassuring, quietly capable  
**Never:** Urgent, technical, pushy, corporate

---

## Mobile Considerations

```
┏━━━━━━━━━━━━━━━┓
┃  ●  Hey Aimi  ┃
┣━━━━━━━━━━━━━━━┫
┃               ┃
┃  ● I'm here   ┃
┃               ┃
┃  ┌─────────┐ ┃
┃  │  One    │ ┃  Single column
┃  │  Thing  │ ┃  Stack vertically
┃  └─────────┘ ┃  Same spacing
┃               ┃
┃  ┌─────────┐ ┃
┃  │ Approval│ ┃
┃  └─────────┘ ┃
┃               ┃
┃  ┌─────────┐ ┃
┃  │Save Day │ ┃
┃  └─────────┘ ┃
┗━━━━━━━━━━━━━━━┛
```

**Principle:** Same calm experience, optimized for thumbs  
**Touch targets:** Minimum 44x44px  
**Font sizes:** +1 size on mobile for readability

---

**This is Hey Aimi's design language:**  
Calm. Luminous. Human-first. Emotionally intelligent.

Every visual decision reduces cognitive load and increases trust.
