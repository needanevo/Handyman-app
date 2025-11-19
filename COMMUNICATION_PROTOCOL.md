# Claude-to-Claude Communication Protocol

## The Setup
- **Server Claude**: Works on server (172.234.70.157)
- **Local Claude**: Works on local Windows machine (this instance)
- **Communication Channel**: Git (dev branch) + User relay

## Communication Flow

```
┌─────────────────┐
│  Server Claude  │
└────────┬────────┘
         │ 1. Fix backend, write LINODE_STATUS.md
         │ 2. Push to dev branch
         ▼
    ┌─────────┐
    │   Git   │ ◄────────┐
    │  (dev)  │          │
    └────┬────┘          │
         │ 3. User: "Server done"
         ▼               │
┌─────────────────┐      │
│  Local Claude   │      │
└────────┬────────┘      │
         │ 4. Pull dev, read status
         │ 5. Test frontend, write FRONTEND_TESTS.md
         │ 6. Push to dev ───────┘
         ▼
      [Done]
```

## Files for Communication

### LINODE_STATUS.md (Server → Local)
Server Claude writes this with:
- Diagnostic results
- Fixes applied
- Current backend status
- What Local Claude should test

### FRONTEND_TESTS.md (Local → Server)
Local Claude writes this with:
- Frontend test results
- API endpoint responses
- Error messages from frontend
- What Server Claude should fix next (if needed)

## Step-by-Step Process

### Phase 1: Server Fixes (Server Claude)
1. User starts Server Claude
2. User gives it: `SERVER_CLAUDE_INSTRUCTIONS.md`
3. Server Claude:
   - Runs diagnostics
   - Fixes Linode configuration
   - Writes LINODE_STATUS.md
   - Pushes to dev branch
   - Tells user: "Done, status pushed"

### Phase 2: Local Tests (Local Claude - ME)
4. User tells me: "Server Claude finished, pull dev"
5. I:
   - Pull dev branch
   - Read LINODE_STATUS.md
   - Adjust frontend tests based on findings
   - Test photo upload from frontend
   - Write FRONTEND_TESTS.md
   - Push to dev branch

### Phase 3: Iterate if Needed
6. If frontend still fails:
   - I document errors in FRONTEND_TESTS.md
   - User tells Server Claude: "Check FRONTEND_TESTS.md"
   - Server Claude pulls, reads, fixes
   - Repeat from Phase 1

## User's Role
You're the **relay operator**:
- Start Server Claude when ready
- Tell me when to pull and continue
- Tell Server Claude when to check my results
- Break the loop if we're stuck

## Success Criteria
✅ LINODE_STATUS.md shows: "Backend storage: ✅ Working"
✅ FRONTEND_TESTS.md shows: "Photo upload: ✅ Success"
✅ Both Claudes agree: Photos work end-to-end

## If We Get Stuck
After 2 rounds of back-and-forth, if still broken:
1. Both Claudes write detailed findings
2. User reviews both documents
3. User decides: Try different approach? Different storage service?
