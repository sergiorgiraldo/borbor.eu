---
id: TASK-4
title: 'feature: LLM API key management in settings'
status: Done
assignee: []
created_date: '2026-04-10 07:48'
updated_date: '2026-04-10 15:10'
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
- [x] #1 Settings page has LLM section with fields for OpenAI, Anthropic, Google API keys
- [x] #2 Keys are stored securely (not in plain localStorage)
- [x] #3 Keys can be updated or cleared
- [x] #4 UI indicates which provider is active/configured
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added LLM API key management to settings page. Migration creates `user_api_keys` table with RLS. `saveApiKey` and `clearApiKey` server actions upsert/delete via Supabase. Config page fetches configured providers and shows each with save/clear form, plus green "Configured" badge. 8 new unit tests, all passing.
<!-- SECTION:FINAL_SUMMARY:END -->
