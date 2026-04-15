---
id: TASK-11
title: 'BUG: no suggestions'
status: Done
assignee: []
created_date: '2026-04-15 18:20'
updated_date: '2026-04-15 18:27'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The call to api/suggestions is being called twice and in the second nothing is coming, see some output of the calls. Further the suggestion are not from the country asked. First sample I chose East Timor, second I chose Thailand

POST /api/suggestions 200 in 1208ms (next.js: 7ms, proxy.ts: 93ms, application-code: 1108ms)
{"cities":[{"city":"Malé","country":"Maldives","lat":4.2000,"lng":73.2207},{"city":"Phuket","country":"Thailand","lat":7.8804,"lng":98.3923},{"city":"Bali","country":"Indonesia","lat":-8.4095,"lng":115.1889},{"city":"Da Nang","country":"Vietnam","lat":16.0733,"lng":108.2208},{"city":"Boracay","country":"Philippines","lat":11.9685,"lng":121.9211}]}
 POST /api/suggestions 200 in 2.9s (next.js: 10ms, proxy.ts: 195ms, application-code: 2.7s)
--
POST /api/suggestions 200 in 1098ms (next.js: 6ms, proxy.ts: 59ms, application-code: 1033ms)
{"city":"Malé","country":"Maldives","lat":4.1755,"lng":73.5093}
 POST /api/suggestions 200 in 1477ms (next.js: 3ms, proxy.ts: 97ms, application-code: 1377ms)
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed 2 bugs: (1) Wrong country suggestions — prompt said "in or near" allowing nearby countries; changed to "strictly within" with explicit constraint. (2) Double API call — added AbortController to useEffect in SuggestionsList so StrictMode's double-invoke cancels the first request cleanly.
<!-- SECTION:FINAL_SUMMARY:END -->
