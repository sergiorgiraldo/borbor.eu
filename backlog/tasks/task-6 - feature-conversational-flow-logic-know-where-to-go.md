---
id: TASK-6
title: 'feature: conversational flow logic (know where to go?)'
status: To Do
assignee: []
created_date: '2026-04-10 07:48'
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
- [ ] #1 Flow starts automatically when user opens where-to-go page
- [ ] #2 Each question appears as assistant message
- [ ] #3 User can type freely; LLM interprets the answer
- [ ] #4 Flow advances to next question after valid answer
- [ ] #5 If user says yes to knowing destination, skip continent/type steps
<!-- AC:END -->
