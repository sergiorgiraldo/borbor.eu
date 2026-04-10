---
id: TASK-4
title: 'feature: LLM API key management in settings'
status: To Do
assignee: []
created_date: '2026-04-10 07:48'
labels:
  - feature-1
  - settings
  - llm
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add settings page section where user can save API keys for LLM providers (OpenAI, Anthropic, Google Gemini). Keys stored securely. Used by where-to-go feature to call LLMs on behalf of user.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Settings page has LLM section with fields for OpenAI, Anthropic, Google API keys
- [ ] #2 Keys are stored securely (not in plain localStorage)
- [ ] #3 Keys can be updated or cleared
- [ ] #4 UI indicates which provider is active/configured
<!-- AC:END -->
