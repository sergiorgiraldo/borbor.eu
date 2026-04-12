---
id: TASK-6
title: 'feature: conversational flow logic (know where to go?)'
status: Done
assignee: []
created_date: '2026-04-10 07:48'
updated_date: '2026-04-12 10:33'
labels:
  - feature-1
  - flow
  - llm
dependencies:
  - TASK-4
  - TASK-5
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Wire the guided question flow into the chat UI. Steps: (1) Do you know where to go? (2) If no → which continent? (3) What type of trip? Each step waits for user reply before advancing. Flow state managed on client. LLM processes free-text answers to extract structured intent.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Flow starts automatically when user opens where-to-go page
- [x] #2 Each question appears as assistant message
- [x] #3 User can type freely; LLM interprets the answer
- [x] #4 Flow advances to next question after valid answer
- [x] #5 If user says yes to knowing destination, skip continent/type steps
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Wired guided question flow into chat UI. Created `app/api/flow/route.ts` — POST handler authenticates user, fetches API keys (Anthropic preferred, OpenAI fallback), builds step-specific system prompts, calls LLM, parses JSON response, determines next step. Flow steps: destination → continent → tripType → done; skips continent/tripType when user knows destination. Updated `ChatShell.tsx` with flow state, loading indicator, disabled input on done. 18 unit tests in `__tests__/flow-route.test.ts`, all passing.
<!-- SECTION:FINAL_SUMMARY:END -->
