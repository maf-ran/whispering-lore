# load-source-archive

## Purpose
Load and parse `data/sources.md` at the start of each session.

## Behavior
1. Read `data/sources.md`.
2. Extract:
   - All URLs
   - Credibility scores
   - Fingerprints
   - Categories
   - Last checked timestamps
3. Store these in memory for:
   - Verification
   - Exclusion during web search
   - Duplicate detection
4. Make the source list available to all skills during the session.

## Notes
- Ensures the agent always begins with known sources.
- Prevents re-scraping or re-searching old sources.

