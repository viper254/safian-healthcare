# Safian Healthcare Admin Dashboard — Design Directions

## Three possible directions

### 1. Clinical Operations Ledger

**Very Brief Intro:** A precise, composed internal workspace inspired by modern clinical records and operational ledgers. It feels calm under pressure, with strong hierarchy, high information density, and selective colour for action states.

**Probability:** 0.07

### 2. Night-Shift Command Centre

**Very Brief Intro:** A dark, low-light control surface for after-hours operations, using electric status signals and dense monitoring panels. It communicates urgency and live coordination.

**Probability:** 0.04

### 3. Heritage Dispensary Desk

**Very Brief Intro:** A warm, archival administrative interface inspired by pharmacy labels, specimen cards, and carefully indexed paper records. It prioritises humane detail and tactile order.

**Probability:** 0.09

## Chosen direction — Clinical Operations Ledger

### Design Movement

Contemporary Swiss information design interpreted through the visual grammar of a clinical operations ledger.

### Core Principles

1. **Calm authority:** The dashboard should lower cognitive load by making status, action, and provenance immediately legible.
2. **Structured asymmetry:** A permanent operational rail, expansive workspace, and small contextual side panels replace a generic centred-card layout.
3. **Signal over decoration:** Colour, animation, and elevation are reserved for meaningful order, stock, and customer events.
4. **Traceable detail:** Every operational view should make recency, ownership, and next action explicit.

### Color Philosophy

The ground is a soft surgical off-white that remains comfortable during long work sessions. Deep ink creates stable reading contrast, while a single controlled clinical green signals confirmed, healthy, or completed states. A muted cobalt is used for in-progress workflow states, while a restrained amber identifies attention without simulating alarm.

### Layout Paradigm

The interface uses an offset three-zone desk: a narrow branded navigation rail, a broad operational canvas, and context-aware supporting modules. Content flows like a ledger rather than a card gallery, alternating between full-width process strips, data tables, and compact metric clusters.

### Signature Elements

1. **Ledger rules:** Fine horizontal and vertical rules quietly align modules, filters, and data summaries.
2. **Clinical index tabs:** Small labelled bands identify the active operational section and its live state.
3. **Status capsules:** Rectangular, low-radius status markers show paid, pending, low stock, and fulfilment actions consistently.

### Interaction Philosophy

Interactions should feel deliberate and administrative. Quick actions expand from the relevant record, filters preserve context, and selection states are clear rather than animated theatrically. Destructive actions always require explicit confirmation.

### Animation

Use 160–220ms ease-out transitions for hover, navigation, filter, and drawer interactions. Data rows may fade and translate upward by 4px on first load in a short stagger; status changes use a subtle background wash rather than pulse or glow. Respect reduced-motion preferences and keep keyboard action immediate.

### Typography System

Use **Space Grotesk** for display headings and section labels, **Source Sans 3** for dense operational text, and **IBM Plex Mono** for order references, times, and inventory identifiers. Headlines use compact, assertive tracking; labels are uppercase with generous letter spacing; numerical values use tabular figures.

### Brand Essence

**Safian Admin is the clinical operations desk for a healthcare supply business that needs clear, dependable control across orders, inventory, and customers.**

**Personality:** Exacting, composed, dependable.

### Brand Voice

Headlines are direct and operational; CTAs are specific and action-led; microcopy names the system state without filler.

> “Nine orders need fulfilment before the next dispatch window.”

> “Review low-stock items before confirming today’s orders.”

### Wordmark & Logo

Use a graphic mark formed by an offset medical cross nested inside a ledger bracket, suggesting both clinical care and organised operations. The visual mark is separate from the wordmark and scales clearly for the rail header and favicon.

### Signature Brand Color

**Safian Clinical Green — `#167A5A`**
