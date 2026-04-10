---
id: TASK-7
title: 'feature: destination suggestions list with radio select'
status: To Do
assignee: []
created_date: '2026-04-10 07:49'
labels:
  - feature-1
  - ui
  - llm
dependencies:
  - TASK-6
priority: high
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After flow collects answers, LLM returns 5 destination suggestions. Display each as a card: city name, country, radio button to select. Include "More suggestions" button that re-calls LLM for 5 new options (same trip type/continent context).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 5 suggestions rendered as cards with city, country, radio button
- [ ] #2 Only one destination selectable at a time
- [ ] #3 'More suggestions' button visible below list
- [ ] #4 Clicking 'More suggestions' fetches 5 new options (no duplicates with previous batch)
- [ ] #5 Selected destination persists while browsing more suggestions
<!-- AC:END -->
