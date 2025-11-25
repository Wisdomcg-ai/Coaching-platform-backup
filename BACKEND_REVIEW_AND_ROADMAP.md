# Backend Architecture Review & Development Roadmap

**Date:** November 23, 2025
**Status:** Phase 1 in Progress
**Current Focus:** Coach Admin Portal Foundation

---

## Executive Summary

The coaching platform is currently in **Phase 1** with core admin and coach functionality partially complete. The backend architecture is solid, but development has been scattered across multiple features. This document provides a clear state of completion and a prioritized roadmap to get back on track.

**Key Achievement:** Successfully implemented professional coach portal with client access to goals and forecasts.

**Next Priority:** Complete Phase 1 before moving to new features.

---

## Current Backend Architecture

### Database Schema Status

#### ✅ **COMPLETED TABLES**

1. **`system_roles`** - Three-tier role system (super_admin, coach, client)
2. **`user_roles`** - Business-level role assignments (owner, admin, member)
3. **`user_permissions`** - Granular feature permissions per user/business
4. **`businesses`** - Client company records with coach assignment
5. **`coaching_sessions`** - Session records (table exists, not in use yet)
6. **`session_actions`** - Action items from sessions (table exists, not in use yet)
7. **`chat_messages`** - Coach-client messaging (table exists, not in use yet)
8. **`shared_documents`** - Document library (table exists, not in use yet)
9. **`onboarding_progress`** - Track client onboarding steps

#### 📊 **EXISTING TABLES (Pre-Coach Portal)**

These tables power the core business intelligence features:

- `financial_forecasts` - P&L forecasting with versioning
- `goals` - Strategic goals and KPIs
- `annual_plans` - Annual strategic plans
- `kpis` - Key performance indicators
- `strategic_initiatives` - Business initiatives
- And ~20 other tables for forecasting, planning, assessment features

---

## Authentication & Authorization

### ✅ **COMPLETED**

**Three-Tier Role System:**
- **Super Admin** (`super_admin`) - Full platform access, client management
- **Coach** (`coach`) - Access assigned clients only
- **Client** (`client`) - Access own business data only

**Auth Implementation:**
- `/src/lib/auth/roles.ts` - Role checking utilities
- `/src/lib/supabase/server.ts` - Server-side Supabase client
- Row-Level Security (RLS) policies on all tables
- Cookie-based session management

**Access Control:**
- Business-level isolation via `assigned_coach_id` FK
- Permission system via `user_permissions` table
- Module-level access control via `enabled_modules` JSONB

### 🔴 **GAPS**

1. **No coach-level access to client data in RLS policies** - Currently relies on app-level filtering
2. **Missing middleware for route protection** - Auth checks happen in components
3. **No session timeout handling** - Sessions persist indefinitely
4. **User invitation flow incomplete** - `client_invitations` table exists but not used

---

## API Routes Audit

### ✅ **WORKING ROUTES**

#### Admin Routes
- `POST /api/admin/clients` - Create new client with auto-generated credentials
- `GET /api/admin/check-auth` - Verify admin authentication

#### Existing Business Intelligence Routes
- `/api/forecasts/*` - Financial forecast operations
- `/api/goals/*` - Goals management
- `/api/annual-plan/*` - Annual planning
- `/api/wizard/chat` - AI-powered planning assistant
- `/api/Xero/*` - Xero accounting integration

### 🔴 **MISSING ROUTES**

Critical routes needed for Phase 1 completion:

1. **Coach Routes**
   - `GET /api/coach/clients` - List assigned clients
   - `GET /api/coach/clients/[id]` - Get client details
   - `PUT /api/coach/clients/[id]` - Update client settings

2. **Session Routes** (tables exist, no API)
   - `POST /api/sessions` - Create coaching session
   - `GET /api/sessions?business_id=X` - List sessions
   - `PUT /api/sessions/[id]` - Update session notes
   - `POST /api/sessions/[id]/actions` - Add action items

3. **Chat Routes** (tables exist, no API)
   - `GET /api/chat/messages?business_id=X` - Get messages
   - `POST /api/chat/messages` - Send message
   - WebSocket/Realtime subscription for live chat

4. **Document Routes** (tables exist, no API)
   - `POST /api/documents/upload` - Upload document
   - `GET /api/documents?business_id=X` - List documents
   - `GET /api/documents/[id]/download` - Download file

---

## Frontend Status

### ✅ **COMPLETED PAGES**

#### Admin Portal (`/admin`)
- `/admin` - Admin dashboard
- `/admin/login` - Admin login page
- `/admin/clients/new` - Simplified client creation (6 fields)
- `/admin/clients/success` - Show generated credentials

#### Coach Portal (`/coach`)
- `/coach/login` - Coach login
- `/coach/clients` - Master-detail client list (professional design)
- `/coach/clients/[id]` - Client detail page with module cards

#### Client Portal (`/client`)
- `/client/sessions` - View coaching sessions (reads from DB)
- `/client/chat` - Chat interface (UI only, no backend)
- `/client/documents` - Document library (UI only, no backend)
- `/client/actions` - Action tracker (UI only, no backend)

#### Shared Business Intelligence
- `/goals` - Strategic planning wizard ✅ **Working with CoachNavbar**
- `/finances/forecast` - Financial forecasting ✅ **Working with CoachNavbar**
- `/dashboard` - Client dashboard

### 🔴 **ISSUES TO FIX**

1. **CoachNavbar business_id handling** - Currently expects `business_id` query param, but some routes use it incorrectly
2. **Client portal pages not functional** - Sessions/chat/docs/actions have UI but no real data
3. **No coach dashboard analytics** - `/coach/clients` shows client cards but no metrics
4. **Missing navigation consistency** - Some pages have navbar, others don't

---

## Feature Completion Status

### Phase 1: Foundation (From COACHING_PLATFORM_ARCHITECTURE.md)

| Feature | Status | Completion | Notes |
|---------|--------|-----------|-------|
| **Enhanced Coach Dashboard** | 🟡 Partial | 60% | Client list works, missing metrics/activity feed |
| **Client Detail View** | ✅ Done | 90% | Professional card layout, need to wire up coming soon features |
| **Database Schema** | ✅ Done | 100% | All tables created, RLS needs coach access policies |
| **Admin Client Creation** | ✅ Done | 100% | Simplified 6-field form working perfectly |
| **Coach Access to Goals** | ✅ Done | 100% | Full CRUD access via `/goals?business_id=X` |
| **Coach Access to Forecast** | ✅ Done | 100% | Full CRUD access via `/finances/forecast?business_id=X` |
| **CoachNavbar Context** | ✅ Done | 100% | Shows client name + "Back to Client" link |

**Phase 1 Overall: 70% Complete** ✅

### Phase 2: Session Management (Not Started)

| Feature | Status | Completion |
|---------|--------|-----------|
| Session Calendar | 🔴 Not Started | 0% |
| Session Detail Page | 🔴 Not Started | 0% |
| Transcript Upload | 🔴 Not Started | 0% |
| Action Tracking | 🔴 Not Started | 0% |

**Phase 2 Overall: 0% Complete** 🔴

### Phase 3: Communication Hub (Not Started)

| Feature | Status | Completion |
|---------|--------|-----------|
| Real-time Chat | 🔴 Not Started | 0% |
| Q&A System | 🔴 Not Started | 0% |
| Notifications Center | 🔴 Not Started | 0% |

**Phase 3 Overall: 0% Complete** 🔴

---

## Technical Debt & Issues

### 🔴 **CRITICAL**

1. **Missing RLS policies for coach access** - Coaches can only access clients via app-level filtering, not database-level
2. **No API route protection middleware** - Auth checks scattered across components
3. **Client portal features are UI shells** - Sessions, chat, docs, actions have no backend integration

### 🟡 **IMPORTANT**

1. **No error boundary components** - App crashes ungracefully on errors
2. **No loading state consistency** - Different components show different loaders
3. **Database migrations scattered** - 20+ migration files, hard to track what's applied
4. **No database seed script** - Manual setup required for development

### 🟢 **NICE TO HAVE**

1. **No TypeScript types for database** - Using inline interfaces instead of generated types
2. **No API response standardization** - Different routes return different error formats
3. **No centralized error handling** - Each route has custom error logic

---

## Prioritized Development Roadmap

### **IMMEDIATE (Next 1-2 Days)**

**Goal: Complete Phase 1 - Make coach portal production-ready**

#### 1. Fix RLS Policies for Coach Access
- **Why:** Security issue - coaches can currently see all businesses via RLS bypass
- **Files to modify:**
  - Create new migration: `supabase/migrations/fix_coach_rls_policies.sql`
- **Actions:**
  - Add coach access policy to `businesses` table
  - Add coach access policy to `financial_forecasts` table
  - Add coach access policy to `goals` table
  - Test that coaches can only see assigned clients

#### 2. Add Coach API Routes
- **Why:** Currently relying on direct DB queries from client components
- **Files to create:**
  - `/src/app/api/coach/clients/route.ts` - List assigned clients
  - `/src/app/api/coach/clients/[id]/route.ts` - Get client details
- **Actions:**
  - Move business queries to server-side API routes
  - Add proper error handling and response formatting
  - Return computed metrics (session count, last session date, etc.)

#### 3. Improve Coach Dashboard with Metrics
- **Why:** Current dashboard is just a list, needs actionable insights
- **Files to modify:**
  - `/src/app/coach/clients/page.tsx`
- **Actions:**
  - Add "Total Clients", "Active Clients", "Sessions This Month" metrics
  - Add "Recent Activity" feed (last updated goals, recent sessions)
  - Add filter/sort options (by status, industry, last activity)

### **SHORT TERM (Next 1 Week)**

**Goal: Complete Phase 2 - Session Management**

#### 4. Build Session Management System
- **Why:** Core coach workflow - schedule sessions, take notes, create actions
- **Files to create:**
  - `/src/app/api/sessions/route.ts` - CRUD for sessions
  - `/src/app/api/sessions/[id]/actions/route.ts` - Session actions
  - `/src/app/coach/sessions/page.tsx` - Session calendar view
  - `/src/app/coach/sessions/[id]/page.tsx` - Session detail/notes
- **Tables:** `coaching_sessions`, `session_actions` (already exist)
- **Features:**
  - Calendar view with upcoming/past sessions
  - Create session form (title, date, duration, agenda)
  - Session notes editor (rich text)
  - Action item tracker linked to session

#### 5. Wire Up Client Portal Session Page
- **Why:** Clients need to see their sessions and action items
- **Files to modify:**
  - `/src/app/client/sessions/page.tsx` - Already has UI, connect to DB
  - `/src/app/client/actions/page.tsx` - Already has UI, connect to DB
- **Actions:**
  - Fetch real session data from API
  - Show session summaries and notes
  - Display action items with due dates and status

### **MEDIUM TERM (2-3 Weeks)**

**Goal: Complete Phase 3 - Communication Hub**

#### 6. Implement Real-time Chat
- **Why:** Core value prop - coach-client async communication
- **Files to create:**
  - `/src/app/api/chat/messages/route.ts` - Message CRUD
  - `/src/components/chat/ChatWindow.tsx` - Shared chat component
- **Technology:**
  - Supabase Realtime for live updates
  - File attachment support via Supabase Storage
- **Pages to update:**
  - `/src/app/client/chat/page.tsx`
  - `/src/app/coach/clients/[id]` - Add chat tab

#### 7. Document Library
- **Why:** Share resources, templates, reports with clients
- **Files to create:**
  - `/src/app/api/documents/route.ts` - Document CRUD + upload
  - `/src/components/documents/DocumentList.tsx`
- **Technology:**
  - Supabase Storage for file hosting
  - Folder organization (root, templates, reports, etc.)
- **Features:**
  - Drag-and-drop upload
  - Preview for PDFs/images
  - Download tracking

### **LONG TERM (1+ Month)**

**Goal: Polish and Scale**

#### 8. Analytics & Insights Dashboard
- Aggregate coach performance metrics
- Client progress tracking over time
- Goal completion rates, session frequency analysis

#### 9. Multi-Coach Support (SaaS Prep)
- Coach signup/onboarding flow
- Stripe subscription integration
- Usage limits and billing

#### 10. Mobile Optimization
- Responsive design improvements
- Progressive Web App (PWA) features
- Push notifications for mobile

---

## Database Migrations Strategy

### Current Problem
- 20+ migration files scattered across `database/migrations/` and `supabase/migrations/`
- Hard to know which migrations have been applied
- No clear versioning strategy

### Recommended Approach
1. **Consolidate existing migrations** into a single `schema.sql` baseline
2. **Use Supabase CLI** for future migrations: `supabase db diff`
3. **Version format:** `YYYYMMDD_description.sql`
4. **Track applied migrations** in `schema_migrations` table

---

## Testing Strategy (Currently Missing)

### Immediate Needs
1. **API route tests** - Ensure coach can only access assigned clients
2. **RLS policy tests** - Verify database-level security works
3. **E2E tests for critical flows:**
   - Admin creates client
   - Coach logs in and accesses client
   - Client logs in and views their data

### Tools to Add
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **Supabase local dev** for testing against real DB

---

## Success Metrics

### Phase 1 Complete When:
- ✅ Coach can create and view clients (DONE)
- ✅ Coach can access client goals and forecasts (DONE)
- ✅ Professional UX without "rainbow gradients" (DONE)
- 🔴 Coach dashboard shows actionable metrics (PENDING)
- 🔴 RLS policies enforce coach-client isolation (PENDING)

### Phase 2 Complete When:
- 🔴 Coach can schedule and manage sessions
- 🔴 Coach can take session notes
- 🔴 Coach can create action items for clients
- 🔴 Clients can view their sessions and actions

### Phase 3 Complete When:
- 🔴 Real-time chat between coach and client works
- 🔴 Document upload and sharing functional
- 🔴 Notification system in place

---

## Recommendations

### 1. **Focus on Completing Phase 1 First**
Don't start Phase 2 until Phase 1 is production-ready. This means:
- Fix RLS policies
- Add coach API routes
- Improve dashboard metrics

### 2. **Establish Development Workflow**
- Create feature branches for each task
- Use pull requests for code review
- Test each feature before merging to main

### 3. **Set Up Proper Dev Environment**
- Use Supabase local dev (`supabase start`)
- Seed script for test data
- Environment variables documented in `.env.example`

### 4. **One Feature at a Time**
Previous work was scattered - admin panel, UX redesign, email changes all at once. Moving forward:
- Pick ONE feature from roadmap
- Complete it fully (backend + frontend + tests)
- Deploy and verify
- Move to next feature

### 5. **Professional Quality Standards**
User feedback was clear: "Come on you are better than this - your UI/UX is slipping"
- No rainbow gradients, stick to blue/white professional palette
- No nested iframes, use direct navigation
- Consistent component design (cards, buttons, spacing)
- Test on actual devices before showing to user

---

## Next Steps (This Week)

1. **Fix RLS policies for coach access** - Security critical
2. **Add coach API routes** - Better architecture
3. **Improve coach dashboard metrics** - Make it useful
4. **Start session management** - Begin Phase 2

**Estimated Time:** 3-4 days for Phase 1 completion
