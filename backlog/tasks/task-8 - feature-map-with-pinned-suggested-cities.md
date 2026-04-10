---
id: TASK-8
title: 'feature: map with pinned suggested cities'
status: To Do
assignee: []
created_date: '2026-04-10 07:49'
labels:
  - feature-1
  - map
  - ui
dependencies:
  - TASK-7
priority: medium
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Below suggestions list, render interactive map. Pin each suggested city. When user selects radio button, highlight that city's pin. Map updates when "More suggestions" loads new cities. Pick map library compatible with Next.js (e.g. Leaflet/react-leaflet or Mapbox GL).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Map renders below suggestions list
- [ ] #2 Each suggested city has a pin at correct coordinates
- [ ] #3 Selected city pin is visually highlighted
- [ ] #4 Map re-renders with new pins when suggestions refresh
- [ ] #5 Map is responsive (works on mobile width)
<!-- AC:END -->
