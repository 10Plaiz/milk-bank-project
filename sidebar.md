Yes, that's the right direction and it maps cleanly onto how the milk bank actually works. Here's what it would look like concretely:

**Program switcher at the top of the sidebar:**
```
[ All Programs ▾ ]   or tabs:  All | Supsup Todo | Milky Way | Mom's Act
```

**Sidebar nav updates per selection:**

| Nav Item               | All | Supsup Todo | Milky Way | Mom's Act |
| ---------------------- | --- | ----------- | --------- | --------- |
| Screening              | ✓   | ✓           | —         | —         |
| Milk Collection        | ✓   | ✓           | ✓         | ✓         |
| Lab Testing            | ✓   | ✓           | ✓         | ✓         |
| Pasteurization         | ✓   | ✓           | ✓         | ✓         |
| Dispensing             | ✓   | ✓           | ✓         | ✓         |
| Inquiry & Waiting List | ✓   | ✓           | ✓         | —         |
| Reports / Admin        | ✓   | ✓           | ✓         | ✓         |

**One complication to plan for:** `batches.program` has a `mixed` value for pooled collections. A `mixed` batch wouldn't naturally belong to any single program view. The safest handling is: in Supsup Todo or Milky Way views, show `mixed` batches alongside that program's batches in Lab/Pasteurization (since those are the two programs that can be pooled). Under "All Programs," everything shows.

**Implementation is straightforward:**
- Add a `activeProgram` state to `App.tsx` (or `Layout.tsx`)
- Pass it down to `NAV_GROUPS` — each item gets an optional `programs` allowlist; if the active program isn't in it, hide the item
- Each screen receives `activeProgram` and applies `.eq('program', activeProgram)` to its queries (with a branch for `All` that omits the filter)

No schema changes, no new screens — just a filter state and conditional rendering. Want me to implement this?