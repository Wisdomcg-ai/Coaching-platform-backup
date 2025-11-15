# 🔧 Supabase Database Refactor Plan - Option B

## Strategy: Normalize to businesses (parent) + business_profiles (child)

---

## Phase 1: Database Schema (SQL) ✅ READY TO RUN

**File:** `supabase-refactor.sql`

**What it does:**
- Adds missing columns to `business_profiles` table
- Keeps `businesses` table minimal (id, name, owner_id, timestamps)
- Adds indexes for performance
- Adds RLS policies for security
- Creates helper function `get_or_create_business_profile()`

**Action:** Run this SQL in Supabase SQL Editor

---

## Phase 2: Update Business Profile Page

**Current Issue:**
- Saves to `businesses` table
- Tries to save fields that don't exist (industry, key_roles, owner_info, etc.)
- No relationship to `business_profiles` table

**Fix Required:**
1. Query BOTH `businesses` and `business_profiles` on load
2. Save detailed data to `business_profiles` (not `businesses`)
3. Only save `name` to `businesses` table
4. Create `business_profile` record if it doesn't exist

**Files to modify:**
- `/src/app/business-profile/page.tsx`

---

## Phase 3: Update Goals Wizard

**Current Issue:**
- Queries `business_profiles` table ✅ CORRECT
- Uses `business_profiles.business_name` as businessId ❌ WRONG
- Should use `business_profiles.id` or `business_profiles.business_id`

**Fix Required:**
1. Change line 316 in `useStrategicPlanning.ts`:
   ```typescript
   // OLD:
   const bizId = profile?.business_name || user.id

   // NEW:
   const bizId = profile?.id || user.id
   ```

2. Update all service calls to use `business_profiles.id` as the business_id

**Files to modify:**
- `/src/app/goals/hooks/useStrategicPlanning.ts`
- `/src/app/goals/services/financial-service.ts`
- `/src/app/goals/services/kpi-service.ts`
- `/src/app/goals/services/strategic-planning-service.ts`

---

## Phase 4: Create Business Profile Service

**Purpose:** Centralize business profile operations (like Goals services)

**Create new file:** `/src/app/business-profile/services/business-profile-service.ts`

**Methods needed:**
```typescript
class BusinessProfileService {
  static async getOrCreateBusinessProfile(userId: string): Promise<{business, profile}>
  static async saveBusinessProfile(profileId: string, data: any): Promise<{success, error?}>
  static async loadBusinessProfile(userId: string): Promise<{business, profile}>
}
```

---

## Phase 5: Testing Checklist

**Test these flows:**

1. ✅ New user signs up
   - [ ] Creates `businesses` record
   - [ ] Creates `business_profiles` record
   - [ ] Both records linked via `business_id`

2. ✅ Business Profile page
   - [ ] Loads existing data correctly
   - [ ] Saves to `business_profiles` table
   - [ ] Auto-save works
   - [ ] All 5 steps save data

3. ✅ Goals wizard
   - [ ] Finds correct business_profile
   - [ ] Saves financial goals with correct business_id
   - [ ] Saves KPIs with correct business_id
   - [ ] Saves strategic initiatives with correct business_id
   - [ ] All 6 steps work

4. ✅ Data consistency
   - [ ] Business Profile and Goals wizard see same business
   - [ ] No duplicate business records
   - [ ] business_id is consistent across all tables

---

## Phase 6: Update Database Types

**File:** `/src/types/database.ts`

**Action:** Regenerate types from Supabase after running SQL

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## Phase 7: Clean Up Old Code

**After everything works:**

1. Remove any references to `business_profiles.business_name`
2. Remove localStorage fallbacks if Supabase is working
3. Add TypeScript types to Business Profile page
4. Document the data model in README

---

## Data Model Summary (After Refactor)

```
auth.users
  ↓
businesses (parent)
  - id (PK)
  - name
  - owner_id → FK to auth.users
  ↓
business_profiles (child)
  - id (PK)
  - business_id → FK to businesses.id
  - user_id → FK to auth.users
  - [all detailed fields: industry, owner_info, key_roles, etc.]
  ↓
business_financial_goals
business_kpis
strategic_initiatives
sprint_key_actions
  - business_id → References business_profiles.id
```

---

## Next Steps

1. **Run SQL** in Supabase (supabase-refactor.sql)
2. **Test current state** - see what's actually broken
3. **Fix Business Profile page** first
4. **Fix Goals wizard** second
5. **Create service layer** for Business Profile
6. **Test everything**
7. **Celebrate!** 🎉
