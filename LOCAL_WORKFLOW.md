# Local-Only Development Workflow

## 🚨 Important: DO NOT PUSH TO REMOTE

To avoid conflicts and breaking changes from other sources, we'll work entirely locally.

---

## Current Safe State

- **Branch:** `main` (local only)
- **Last Known Working State:** Commit `e41656f0`
- **Dev Server:** http://localhost:3000
- **Status:** ✅ ALL FILES RESTORED AND WORKING

---

## Daily Workflow

### 1. Start Work (Every Session)
```bash
# Verify you're on local main
git branch --show-current

# Should show: main

# Start dev server
npm run dev
```

### 2. Make Changes
```bash
# Create feature branch for experiments
git checkout -b experiment/my-feature

# Make changes, test locally
# If it works: merge to main
# If it breaks: delete branch

git checkout main
git merge experiment/my-feature

# OR if it broke:
git checkout main
git branch -D experiment/my-feature
```

### 3. Commit Locally (Never Push!)
```bash
# Save your work locally
git add .
git commit -m "description of changes"

# DO NOT RUN: git push
```

### 4. Backup Locally
```bash
# Create local backup daily
cp -r . ../business-coaching-platform-backup-$(date +%Y%m%d)

# OR use git tags for snapshots
git tag working-$(date +%Y%m%d-%H%M)
```

---

## 🛡️ Safety Rules

### DO:
✅ Commit frequently to local git
✅ Use feature branches for experiments
✅ Create local backups with `cp -r`
✅ Tag working states with `git tag`
✅ Test every change immediately

### DON'T:
❌ Run `git push` (stay local only)
❌ Run `git pull` (avoid remote conflicts)
❌ Run `git fetch origin`
❌ Change multiple files at once

---

## Recovery Procedures

### If Something Breaks:

#### Option 1: Revert Last Commit
```bash
git log --oneline -5  # Find the commit
git revert HEAD       # Undo last commit
```

#### Option 2: Return to Working Tag
```bash
git tag               # List all tags
git checkout <tag-name>
git checkout -b main-recovered
git branch -D main
git branch -m main
```

#### Option 3: Restore from Backup
```bash
ls -la ../business-coaching-platform-backup-*
# Copy files from most recent backup
```

---

## Current Working Files Verified

✅ `/src/app/goals/` - Complete with all components
✅ `/src/app/open-loops/page.tsx` - Working
✅ `/src/app/todo/page.tsx` - Working
✅ `/src/app/issues-list/page.tsx` - Working
✅ `/src/app/business-roadmap/page.tsx` - Working
✅ All other pages intact

---

## When You're Ready to Deploy

**Only after everything is fully tested and stable:**

1. Review all changes carefully
2. Ensure dev works perfectly locally
3. Test all features manually
4. Create deployment branch (separate from main)
5. Deploy from that branch only

---

## Daily Backup Command

Run this at the end of each day:

```bash
# Full backup
tar -czf ../backups/business-coaching-$(date +%Y%m%d).tar.gz .

# Quick copy backup
cp -r . ../business-coaching-backup-$(date +%Y%m%d)
```

---

**Remember: Local work only. No push = No conflicts = No breaks!**
