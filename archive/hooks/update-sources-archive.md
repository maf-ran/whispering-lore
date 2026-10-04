# update-sources-archive

## Purpose
Automatically append newly discovered sources to `data/sources.md` after each research session.

## Behavior
1. Read the list of new sources generated during the research session.
2. For each source:
   - Check if the URL already exists in `data/sources.md`.
   - If it exists, skip it.
   - If it does not exist:
     - Assign a credibility score (1.0, 0.8, 0.6, 0.4, etc.).
     - Generate a fingerprint (hash of content or URL).
     - Categorize the source:
       - Primary (archives, museums, academic databases)
       - Secondary (researchers, folklore societies)
       - Tertiary (blogs, summaries, general web)
     - Append the source to the correct section.
3. Update metadata:
   - Total number of sources
   - Last updated timestamp

## Notes
- This hook ensures the source archive grows over time.
- Prevents duplicate sources from being added.
- Ensures consistent formatting and categorization.

