---
id: TASK-7
title: 'feature: destination suggestions list with radio select'
status: Done
assignee: []
created_date: '2026-04-10 07:49'
updated_date: '2026-04-13 11:49'
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
- [x] #1 5 suggestions rendered as cards with city, country, radio button
- [x] #2 Only one destination selectable at a time
- [x] #3 'More suggestions' button visible below list
- [x] #4 Clicking 'More suggestions' fetches 5 new options (no duplicates with previous batch)
- [x] #5 Selected destination persists while browsing more suggestions
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `/api/suggestions` route with `buildSuggestionsPrompt` and `parseSuggestions` helpers. Created `SuggestionsList` component with radio-select cards and "More suggestions" button that tracks seen cities to avoid duplicates. Updated `ChatShell` to collect flow data and render suggestions when flow completes. 15 new tests, all passing.
<!-- SECTION:FINAL_SUMMARY:END -->
