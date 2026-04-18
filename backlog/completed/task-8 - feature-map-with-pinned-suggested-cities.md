---
id: TASK-8
title: 'feature: map with pinned suggested cities'
status: Done
assignee: []
created_date: '2026-04-10 07:49'
updated_date: '2026-04-13 19:52'
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
- [x] #1 Map renders below suggestions list
- [x] #2 Each suggested city has a pin at correct coordinates
- [x] #3 Selected city pin is visually highlighted
- [x] #4 Map re-renders with new pins when suggestions refresh
- [x] #5 Map is responsive (works on mobile width)
<!-- AC:END -->
