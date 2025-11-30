# OkAimy UI Standards & Conventions

**Last Updated:** November 30, 2025  
**Version:** 1.0.0

## 🎯 Core Principle

**Always utilize native and intuitive UI standards and conventions where applicable throughout this entire project. Both for Desktop and for Mobile browser formats - where both may need to be different.**

---

## 📱 Mobile-First Native UI Patterns

### 1. **Navigation & Tabs**

#### ❌ **Don't Use:**
- Horizontal scrolling tabs on mobile
- Hidden content without visual indicators
- Non-discoverable navigation patterns

#### ✅ **Do Use:**
- **Native `<select>` dropdowns** for tab navigation on mobile (< 768px)
- **Visual tab bars** for desktop/tablet (≥ 768px)
- **Bottom sheets** for modal dialogs on mobile

**Example Implementation:**
```jsx
{/* Mobile Dropdown (< md breakpoint) */}
<div className="md:hidden p-3">
  <label htmlFor="tab-select" className="sr-only">Select Tab</label>
  <select
    id="tab-select"
    value={activeTab}
    onChange={(e) => setActiveTab(e.target.value)}
    className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white appearance-none cursor-pointer"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem'
    }}
  >
    {tabs.map(tab => (
      <option key={tab.id} value={tab.id}>
        {tab.icon} {tab.label}
      </option>
    ))}
  </select>
</div>

{/* Desktop Tabs (md+ breakpoint) */}
<div className="hidden md:flex border-b border-gray-200">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-3 font-medium transition-all ${
        activeTab === tab.id ? 'border-b-2 border-primary' : ''
      }`}
    >
      {tab.icon} {tab.label}
    </button>
  ))}
</div>
```

**Benefits:**
- ✅ All options visible in native OS dropdown
- ✅ Familiar interaction pattern (iOS/Android convention)
- ✅ Accessible by default (screen readers, keyboard nav)
- ✅ No hidden content confusion
- ✅ Touch-friendly (44px+ tap targets)

---

### 2. **Modal Dialogs**

#### Mobile Pattern: **Bottom Sheet**
```jsx
<div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
  <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
    {/* Modal content */}
  </div>
</div>
```

**Key Features:**
- Slides up from bottom on mobile (`items-end`)
- Rounded top corners only on mobile (`rounded-t-2xl`)
- Nearly full-height for maximum content (`h-[95vh]`)
- Centered on desktop (`sm:items-center`)
- Fully rounded on desktop (`sm:rounded-2xl`)

---

### 3. **Form Inputs**

#### Touch Targets
- **Minimum height:** 44px (iOS Human Interface Guidelines)
- **Minimum tap area:** 44x44px
- **Spacing between interactive elements:** 8px minimum

#### Native Controls
```jsx
{/* Mobile-friendly select */}
<select className="w-full px-4 py-3 text-base border-2 rounded-lg">
  {/* Options */}
</select>

{/* Mobile-friendly button */}
<button className="w-full px-4 py-3 text-base font-medium rounded-lg">
  Action
</button>
```

---

### 4. **Data Display**

#### Mobile: **Card Layout**
```jsx
<div className="md:hidden space-y-4">
  {items.map(item => (
    <div key={item.id} className="p-4 bg-white rounded-lg border">
      {/* Card content */}
    </div>
  ))}
</div>
```

#### Desktop: **Table Layout**
```jsx
<div className="hidden md:block overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

**Benefits:**
- Cards: Touch-friendly, scannable, stackable on small screens
- Tables: Dense information display for larger screens

---

## 🖥️ Desktop UI Patterns

### 1. **Navigation**
- **Sidebar menus** for primary navigation
- **Tab bars** for section switching (visible, not dropdown)
- **Breadcrumbs** for deep hierarchies

### 2. **Hover States**
- Always provide visual feedback on hover
- Use subtle transitions (150-200ms)
- Don't rely on hover for critical functionality

### 3. **Keyboard Navigation**
- Support Tab, Enter, Escape, Arrow keys
- Visible focus states (`focus:ring-2`)
- Skip links for accessibility

---

## 🎨 Responsive Design Breakpoints

```css
/* Mobile First (default) → < 640px */
/* Tailwind breakpoints: */
sm: 640px+   /* Tablets (portrait) */
md: 768px+   /* Tablets (landscape) / Small laptops */
lg: 1024px+  /* Desktops */
xl: 1280px+  /* Large desktops */
```

### Common Patterns:
```jsx
{/* Show on mobile, hide on desktop */}
<div className="md:hidden">Mobile only</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Different layouts */}
<div className="flex-col sm:flex-row">
  {/* Stacks on mobile, horizontal on tablet+ */}
</div>
```

---

## ♿ Accessibility Standards

### 1. **Semantic HTML**
```jsx
<label htmlFor="input-id">Label Text</label>
<input id="input-id" />

<button type="button">Action</button>
<a href="/path">Link</a>
```

### 2. **ARIA Labels**
```jsx
{/* Screen reader only text */}
<label htmlFor="select" className="sr-only">Choose option</label>

{/* ARIA attributes */}
<button aria-label="Close modal" aria-expanded={isOpen}>
  ×
</button>
```

### 3. **Focus Management**
- Always show focus indicators
- Use `focus:ring-2 focus:ring-primary`
- Manage focus in modals (trap focus, return on close)

### 4. **Color Contrast**
- **Minimum contrast ratio:** 4.5:1 for text
- **Touch targets:** Clearly distinguishable
- Don't rely solely on color to convey information

---

## 📐 Spacing & Sizing

### Progressive Sizing Pattern
```jsx
{/* Text sizes */}
className="text-sm md:text-base lg:text-lg"

{/* Padding */}
className="p-3 md:p-4 lg:p-6"

{/* Gaps */}
className="gap-2 md:gap-4 lg:gap-6"

{/* Icon sizes */}
className="text-xl md:text-2xl"
```

### Consistent Increments
- Use Tailwind spacing scale: 2, 3, 4, 6, 8, 12, 16
- Mobile: Tighter spacing (p-3, gap-2)
- Desktop: Generous spacing (p-6, gap-4)

---

## 🎭 Animation & Transitions

### Principles
1. **Subtle, not distracting** - 150-300ms duration
2. **Purposeful** - Indicate state changes
3. **Consistent** - Same easing across app
4. **Respectful** - Honor `prefers-reduced-motion`

### Standard Transitions
```jsx
className="transition-all duration-200 ease-in-out"
className="hover:scale-105 transition-transform"
className="animate-spin" // Loading states only
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ **Don't:**
1. **Horizontal scrolling without indicators** - Users won't discover hidden content
2. **Tiny touch targets** - Must be 44x44px minimum
3. **Hamburger menus for < 5 items** - Use native dropdowns instead
4. **Auto-playing content** - Respect user control
5. **Hidden functionality on hover** - Mobile has no hover
6. **Non-native form controls** - Unless absolutely necessary
7. **Blocking modals without escape** - Always provide close button + Escape key
8. **Fixed positioning that blocks content** - Especially on mobile
9. **Infinite scroll without pagination** - Provide alternatives
10. **Desktop-only layouts** - All features must work on mobile

---

## ✅ Components Following These Standards

### Fully Compliant:
- ✅ **ProfileHub** - Native dropdown on mobile, tabs on desktop
- ✅ **ProfileSettings** - Native dropdown tabs, bottom sheet modal
- ✅ **EnhancedMessages** - Native category dropdown on mobile
- ✅ **TrustedContactsManager** - Card view mobile, table desktop
- ✅ **MainDashboard** - Bottom sheet modals, responsive grids
- ✅ **UniversalCalendar** - Single-letter day headers, compact events
- ✅ **EventDetailsPopup** - Bottom sheet with sticky header
- ✅ **AimyWizard** - Bottom sheet, reversed buttons on mobile
- ✅ **MessageDetailPopup** - Bottom sheet, responsive actions

---

## 🔧 Implementation Checklist

When creating new components:

- [ ] Mobile dropdown for 3+ navigation options
- [ ] Bottom sheet pattern for mobile modals
- [ ] 44px minimum touch targets
- [ ] Card layout for mobile data display
- [ ] Native `<select>`, `<input>`, `<button>` elements
- [ ] Semantic HTML with proper labels
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Responsive text sizing (text-sm md:text-base)
- [ ] Responsive spacing (p-3 md:p-4 md:p-6)
- [ ] Screen reader labels (sr-only)
- [ ] Color contrast ≥ 4.5:1
- [ ] Transitions under 300ms
- [ ] No horizontal scrolling on mobile
- [ ] Test on real iOS and Android devices

---

## 📚 Resources

### External Standards:
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://m3.material.io/)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Internal Documentation:
- `MOBILE_RESPONSIVE_PLAN.md` - Mobile implementation strategy
- `SESSION_LOG_NOV29_2025.md` - Mobile responsive patterns
- Component files for reference implementations

---

## 🔄 Version History

### v1.0.0 - November 30, 2025
- Initial UI standards document
- Native dropdown pattern for mobile tabs
- Bottom sheet pattern for mobile modals
- Card vs table data display patterns
- Accessibility requirements
- Responsive sizing patterns

---

## 📝 Notes

This document is a **living standard**. As we discover better patterns or platform conventions evolve, update this document and increment the version number.

**Key Takeaway:** When in doubt, use native platform conventions. Users already know how to interact with native UI elements - don't reinvent the wheel.

