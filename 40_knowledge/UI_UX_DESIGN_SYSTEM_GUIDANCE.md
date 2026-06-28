# UI/UX Design System Guidance

Use this module with `skills/ui-ux-design-quality/SKILL.md`.

## Source Position

This is a WCBS-native synthesis. It adapts useful patterns from external UI/UX design skills under APIVR and the Elite Build Goals. It is not a separate source of truth.

## Design Brief Inputs

Every Standard or higher UI task needs:

- subject and product category;
- audience and primary user task;
- page or screen job;
- brand constraints and existing design system;
- content and proof available;
- visual direction;
- accessibility and responsive requirements;
- verification method.

## Design System Shape

Prefer a clear master system with deliberate page overrides:

```text
design-system/
  MASTER.md
  pages/
    dashboard.md
    landing.md
    checkout.md
```

Rules:

- `MASTER.md` defines global tokens, type, spacing, components, states and accessibility.
- Page overrides explain deliberate deviations.
- Component-level one-offs must not become a hidden second design system.

## Design Direction Fields

| Field | Decision |
|---|---|
| Product/category | What kind of thing is this? |
| Audience | Who is using it and under what pressure? |
| Screen job | What must this page help the user do? |
| Palette | 4 to 6 named colors with roles. |
| Type | Display, body and utility choices or local equivalents. |
| Layout | Information hierarchy and responsive behavior. |
| Signature element | One memorable choice that serves the subject. |
| Microcopy | Plain action labels, errors, empty states and success language. |
| Accessibility | Contrast, focus, keyboard, motion and touch target requirements. |

## UI Quality Gates

- The first viewport must communicate the real product, place, task or offer.
- Navigation and primary action must match the user's next likely move.
- Loading, empty, error and success states must be designed, not left accidental.
- Forms need visible labels, useful errors and clear completion states.
- Charts need labels, legends, units and a table or text fallback when needed.
- Dashboards should favor scanning and repeated use over marketing composition.
- Mobile must not be a squeezed desktop.
- Motion must serve attention or feedback and respect reduced motion.

## Accessibility Floor

- Text contrast should meet WCAG AA unless a stronger local rule applies.
- Focus states must be visible.
- Keyboard navigation must reach meaningful controls.
- Click/tap targets must be usable on touch devices.
- Color cannot be the only signal.
- Images need useful alt text or empty alt when decorative.
- Error messages must tell users what happened and how to fix it.

## Anti-Patterns

- generic purple/blue gradient SaaS look without subject justification;
- oversized hero that hides the actual product or task;
- decorative cards inside decorative cards;
- charts without labels, units or interpretation;
- vague CTAs like `Submit`;
- emoji used as production icons;
- visual polish that weakens accessibility;
- animation that hides layout flaws;
- stock-like images that do not reveal the real product, place or state.

## UI Copy Rules

Words in the interface are design material.

- Say what the user controls.
- Use the same action name across button, toast, confirmation and history.
- Make empty states invite the next action.
- Make errors specific and fixable.
- Use active voice.
- Avoid cleverness when clarity is needed.

## Verification

For user-facing UI, verify:

- target viewport widths: 375, 768, 1024 and 1440 where practical;
- no overlapping or clipped text;
- visible focus states;
- reduced-motion behavior when animation exists;
- contrast and readable type;
- hover, active, disabled, loading, empty, error and success states;
- rendered screenshots or browser checks when tooling is available.
