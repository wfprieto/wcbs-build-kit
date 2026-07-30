# Media And Asset Pipeline Guidance

Use this module with `skills/media-and-asset-pipeline/SKILL.md`.

## Asset Route

| Need | Prefer |
|---|---|
| Known brand/product/person/place | retrieve approved real asset |
| Generic illustrative support | generate or license asset |
| Legal/compliance-sensitive use | approved source with rights evidence |
| High-performance UI | optimized responsive asset |
| User upload | validation, moderation, storage, retention |
| Large media delivery | CDN/cache with fallback |

## Generate vs Retrieve vs Reference

- Retrieve when accuracy, brand, product, venue, or real-world identity matters.
- Generate when custom art, mockups, textures, or non-real illustrative assets are needed.
- Reference external assets only when rights, uptime, privacy, and performance risks are acceptable.

## Delivery Controls

Define dimensions, compression, responsive variants, lazy loading, alt text/captions, reduced-motion behavior, cache policy, fallback, and cost impact.

## Verification

For user-facing media, inspect rendered output in representative viewports. For commercial/brand media, verify it supports the approved visual direction.

