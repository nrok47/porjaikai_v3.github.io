# Design System Specification: The Modern Hearth

## 1. Overview & Creative North Star
This design system is built to transcend the utility of a standard "food app" and move into the realm of a **High-End Digital Marketplace**. The Creative North Star is **"The Modern Hearth"**—a concept that balances the warmth of community-sourced food with the precision of a professional kitchen. 

We avoid the "template" look by rejecting rigid grids and thin borders. Instead, we use **intentional asymmetry**, **tonal depth**, and **editorial typography** to create an experience that feels curated rather than automated. The interface should feel like a premium lifestyle magazine: breathable, appetizing, and authoritative.

---

## 2. Colors & Signature Textures
The palette is rooted in appetizing, organic tones. The Earthy Orange (`primary`) evokes cooked warmth, while the Deep Forest Green (`secondary`) signals freshness and local harvest.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition needed without the visual "noise" of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine, heavy-weight paper.
- **Base Layer:** `surface` (#fff4ee) - The warm, inviting canvas.
- **Sectioning:** Use `surface-container-low` (#ffeee1) to group related items (like a category of food).
- **Interactive Cards:** Use `surface-container-lowest` (#ffffff) to provide a crisp, clean lift for individual order items or stock cards.

### The "Glass & Gradient" Rule
To add "soul" to the app:
- **Floating Navigation:** Use Glassmorphism for the bottom navigation bar. Use `surface` at 80% opacity with a `20px` backdrop blur.
- **Action Gradients:** For primary Call-to-Actions (CTAs), use a subtle linear gradient from `primary` (#914700) to `primary_container` (#f97f06) at a 135-degree angle. This prevents the "flat" look and adds professional polish.

---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** for its modern, friendly, yet geometric precision. It scales beautifully from tiny labels to massive display headers.

- **The Hero Moment:** Use `display-sm` or `headline-lg` for food categories and merchant names. This high-contrast scale creates an "Editorial" feel.
- **The Information Layer:** Use `title-md` for item names and `body-md` for descriptions. 
- **The Utility Layer:** `label-md` should be used for status indicators and metadata (e.g., "Order #1234"). 

**Hierarchy Tip:** Pair a `headline-sm` title with a `body-sm` description to create a sophisticated, high-contrast lockup that guides the eye immediately to the most important content.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a sign of "lazy" design. In this system, we achieve hierarchy through **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` section. The subtle shift in hex code creates a natural, soft lift.
- **Ambient Shadows:** When a "floating" effect is mandatory (e.g., a floating "View Basket" button), use a "Sunlight Shadow":
  - **Blur:** 24px
  - **Opacity:** 6% 
  - **Color:** Derived from `on_surface` (#472701), never pure black.
- **The Ghost Border Fallback:** If a container requires further definition for accessibility, use the "Ghost Border": `outline-variant` (#d7a372) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Prominent Action Buttons
- **Primary:** Pill-shaped (`rounded-full`). Gradient of `primary` to `primary_container`. White text (`on_primary`).
- **Secondary:** `rounded-xl`. Background of `secondary_container` (#9df197) with text in `on_secondary_container` (#005c15). Use this for "Add to Cart" or "Confirm Stock."

### Lists & Order Views
- **Strict Rule:** Forbid the use of divider lines. 
- **Separation:** Separate list items using `12px` of vertical white space. Use a `surface-container-low` background for the entire list area and `surface-container-lowest` for the individual item cards to create a "tabbed" look.

### Status Indicators & Chips
- **Success/Paid:** Use `secondary` (#176a21) with a small, thick checkmark.
- **Pending:** Use `tertiary` (#005caa) for a calm, trustworthy "processing" state.
- **Alert/Error:** Use `error_container` (#f95630) for stock issues, ensuring it stands out against the warm orange palette.

### Input Fields
- **Styling:** Use `surface-container-highest` (#ffd5b1) for the input background with `rounded-md`.
- **Interaction:** On focus, the background should shift to `surface-container-lowest` (#ffffff) with a 2px `primary_fixed` (#f97f06) "Ghost Border."

---

## 6. Do's and Don'ts

### Do:
- **Do** use generous white space. If you think there is enough space, add 8px more.
- **Do** use the `secondary` green sparingly to highlight "Freshness," "Availability," or "Success."
- **Do** treat food photography as a core component. Photos should have `rounded-lg` or `rounded-xl` corners to match the UI.

### Don't:
- **Don't** use 1px grey lines (`#EEEEEE` or similar) to separate content.
- **Don't** use standard Material Design "Floating Action Buttons" (circular FABs). Use wide, pill-shaped buttons that feel integrated into the layout.
- **Don't** use high-contrast black text. Always use `on_surface` (#472701) to maintain the "Modern Hearth" warmth.
- **Don't** crowd the "Admin" view. Even for complex stock management, maintain the editorial breathing room to reduce user fatigue and errors.