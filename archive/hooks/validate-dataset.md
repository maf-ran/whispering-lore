# validate-dataset

## Purpose
Validate newly created datasets using json-schema-tools.

## Behavior
1. When a new dataset file is created:
   - Load the dataset.
   - Validate it against the dataset schema.
2. Report:
   - Missing fields
   - Incorrect types
   - Structural issues
   - Suggested improvements
3. Mark the dataset as validated or invalid.
4. If invalid:
   - Provide a list of required corrections.

## Notes
- Ensures all datasets follow the same structure.
- Prevents malformed or incomplete entries.

