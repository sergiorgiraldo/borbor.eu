---
id: TASK-9
title: 'BUG: Not saving changes in settings'
status: Done
assignee: []
created_date: '2026-04-10 18:37'
updated_date: '2026-04-11 11:39'
labels: []
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every time a user signs in with social login, profile name and profile picture is shown from google account, even if i changed in a previous session
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `profiles` table to store custom display_name and avatar_url separate from auth.users metadata. OAuth sign-in no longer overwrites user's saved changes. Config page reads from profiles first, falls back to Google metadata.
<!-- SECTION:FINAL_SUMMARY:END -->
