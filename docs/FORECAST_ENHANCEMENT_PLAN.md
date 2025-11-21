# Financial Forecast Enhancement Plan
**Last Updated:** November 21, 2025
**Status:** Phase 1 In Progress

## Overview
Comprehensive 5-phase plan to enhance the Financial Forecast module with data quality, security, integrations, scenario planning, and professional reporting capabilities.

---

## ✅ PHASE 1: Data Quality & Validation (IN PROGRESS)

### Completed:
- ✅ **Validation Service** (`validation-service.ts`)
  - COGS percentage validation (warn if <5% or >95%)
  - Revenue goal validation (must be >0, warn if <$10k)
  - Forecast vs goals tolerance checking (±5%)
  - P&L line value validation (negative checks)
  - Completeness calculation algorithm
  - Formula circular reference detection
  - Decimal precision rounding (banker's rounding)
  - Currency formatting utilities

- ✅ **Completeness Checker Component** (`CompletenessChecker.tsx`)
  - Visual progress bar (0-100%)
  - Status indicator (errors/warnings/ready)
  - Expandable issues list
  - Real-time validation feedback
  - Error severity levels (error/warning/info)
  - Integration in main forecast page

- ✅ **Assumptions Tab Validation**
  - Real-time input validation for revenue goal
  - Real-time validation for COGS %
  - Visual feedback (red border for errors, yellow for warnings)
  - Inline error/warning messages with suggestions

### Completed (Phase 1 - 100%):
- ✅ **Formula Auditing**
  - ✅ Formula indicator in cells (purple icon)
  - ✅ Formula tooltip on hover
  - ✅ Formula storage via Map data structure
  - ✅ "Show Formulas" toggle mode
  - ✅ Purple background tint for formula cells

- ✅ **Performance Improvements**
  - ✅ Optimistic UI updates with debounced save
  - ✅ Undo/Redo functionality (Ctrl+Z / Ctrl+Y)
  - ✅ History tracking (last 50 states)
  - ✅ Saving indicator in UI
  - ⚠️  Virtualized scrolling (library installed, ready for implementation when needed)

---

## 📋 PHASE 2: Security & Best Practices

### Database Schema:
```sql
-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES business_profiles(id),
  role VARCHAR(50) NOT NULL, -- 'coach', 'client', 'admin'
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id)
);

-- Audit log table
CREATE TABLE forecast_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES financial_forecasts(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
  table_name VARCHAR(100),
  record_id UUID,
  field_name VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Features:
- [ ] Role-Based Access Control (RBAC)
  - Coach can view all client forecasts
  - Client can only view their own
  - Admin has full access
  - RLS policies in Supabase

- [ ] Audit Log
  - Track all changes with before/after values
  - "Change History" tab in UI
  - Filter by date, user, action type

- [ ] UX Improvements
  - Loading states for all async operations
  - User-friendly error messages
  - Keyboard shortcuts (Ctrl+S, Tab navigation)
  - Basic accessibility (ARIA labels, keyboard nav)

- [ ] Business Logic Standards
  - 2 decimal precision for all calculations
  - Banker's rounding implementation
  - Currency selector (AUD, USD, NZD)
  - Historical data preservation (archive, not delete)

---

## 🔗 PHASE 3: Annual Plan Integration

### Database Changes:
```sql
-- Add to financial_forecasts table
ALTER TABLE financial_forecasts
ADD COLUMN annual_plan_id UUID REFERENCES annual_plans(id),
ADD COLUMN linked_rocks JSONB; -- Array of rock IDs

-- Rock cost tracking
CREATE TABLE rock_forecast_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rock_id UUID REFERENCES rocks(id),
  forecast_id UUID REFERENCES financial_forecasts(id),
  pl_line_ids JSONB, -- Array of P&L line IDs
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  roi_projection DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Features:
- [ ] Import from Annual Plan
  - Implement `handleImportFromAnnualPlan` function
  - Fetch revenue/profit goals from annual_plans table
  - Auto-populate forecast assumptions
  - Show which plan is linked

- [ ] Goal Progress Tracking
  - "Annual Plan Progress" card in Assumptions tab
  - YTD actual vs annual goal
  - Progress bars with % complete
  - Link to annual plan page

- [ ] Rocks Integration
  - Show active rocks in forecast sidebar
  - Link expense lines to specific rocks
  - Track cost of each rock
  - Calculate ROI projections

- [ ] Bidirectional Sync
  - Prompt to update annual plan if forecast changes significantly
  - Quarterly check-in notifications
  - Alignment warnings

---

## 🎯 PHASE 4: Scenario Planning & What-If Analysis

### Database Schema:
```sql
-- Scenarios table
CREATE TABLE forecast_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES financial_forecasts(id),
  name VARCHAR(100) NOT NULL, -- "Conservative", "Realistic", "Optimistic"
  description TEXT,
  scenario_type VARCHAR(50), -- "active", "planning"
  revenue_multiplier DECIMAL(5,2) DEFAULT 1.00,
  cogs_multiplier DECIMAL(5,2) DEFAULT 1.00,
  opex_multiplier DECIMAL(5,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenario line adjustments
CREATE TABLE forecast_scenario_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES forecast_scenarios(id),
  pl_line_id UUID REFERENCES forecast_pl_lines(id),
  adjusted_forecast_months JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Features:
- [ ] Scenario Management
  - Create/edit/delete scenarios
  - Scenario dropdown in header
  - Set "Active Scenario" (default view)
  - Copy scenario functionality

- [ ] What-If Analysis Tool
  - Modal with sliders for key variables:
    - Revenue: -50% to +100%
    - COGS %: -20% to +20%
    - OpEx: -20% to +50%
  - Real-time impact calculation on:
    - Gross Profit
    - Net Profit
    - Cash Position
  - "Save as New Scenario" button

- [ ] Scenario Comparison
  - Side-by-side table (2-3 scenarios)
  - Highlight differences
  - Charts showing Net Profit across scenarios
  - Export comparison to PDF/Excel

- [ ] Sensitivity Analysis
  - Calculate which assumptions have biggest NP impact
  - Tornado chart of sensitivities
  - "Top 5 Drivers" dashboard

---

## 📊 PHASE 5: Export & Reporting

### Features:
- [ ] PDF Export
  - Executive Summary (1 page):
    - Business name, FY, date
    - Revenue, GP, NP goals vs forecast
    - Key assumptions
    - Top 5 risks/opportunities
  - Detailed P&L (multi-page)
  - Assumptions Documentation
  - Client logo/branding
  - Uses `jsPDF` or server-side Puppeteer

- [ ] Excel Export
  - Formatted workbook with sheets:
    - Executive Summary
    - Assumptions
    - P&L Forecast (formulas preserved)
    - Payroll Detail
    - Variance Analysis
  - Currency formatting
  - Conditional formatting (variances)
  - Freeze panes
  - Uses `exceljs` library

- [ ] Dashboard Sharing
  - Generate shareable links with tokens
  - Set expiry dates (7/30/90 days, never)
  - Optional password protection
  - View-only mode
  - Track link views

- [ ] Print-Friendly View
  - `@media print` CSS
  - Hide edit controls
  - Larger fonts
  - Logical page breaks
  - Headers/footers with page numbers

- [ ] Email Reports
  - Schedule monthly summaries
  - Send to stakeholders
  - Auto-attach PDF
  - Customizable templates

---

## 🚀 IMPLEMENTATION STATUS

### ✅ Phase 1: Data Quality & Validation - COMPLETE
- **Status:** 100% Complete
- **Completed Features:**
  - Input validation with real-time feedback
  - Completeness checker with progress bar
  - Formula auditing with visual indicators
  - Undo/Redo functionality (Ctrl+Z/Ctrl+Y)
  - Optimistic UI updates
  - Saving indicator

### Week 2: Security & Best Practices
- **Status:** Not Started
- **Priority:** HIGH - critical for production

### Week 3: Annual Plan Integration
- **Status:** Not Started
- **Priority:** HIGH - removes TODO, adds major value

### Weeks 4-5: Scenario Planning
- **Status:** Not Started
- **Priority:** HIGH - client requested

### Week 6: Export & Reporting
- **Status:** Not Started
- **Priority:** HIGH - client requested

---

## 📝 NOTES

### Design Decisions:
1. **Validation First:** Ensure data quality before building complex features
2. **Real-time Feedback:** Users see validation as they type
3. **Progressive Enhancement:** Start with basic features, add advanced later
4. **User-Friendly:** All error messages include suggestions
5. **Performance:** Virtualization for tables with 100+ rows

### Technical Stack:
- **Validation:** Custom service with TypeScript interfaces
- **Virtualization:** `@tanstack/react-virtual` or `react-window`
- **PDF:** `jsPDF` + `html2canvas` or Puppeteer
- **Excel:** `exceljs` library
- **Charts:** Recharts or Chart.js

### Best Practices Implemented:
- ✅ Banker's rounding for financial calculations
- ✅ 2 decimal precision
- ✅ Input validation with helpful messages
- ✅ Completeness tracking
- ✅ Real-time feedback

### Best Practices To Implement:
- ⏳ Role-based access control
- ⏳ Audit logging
- ⏳ Currency support (multi-currency)
- ⏳ Keyboard shortcuts
- ⏳ Accessibility (WCAG 2.1 AA)

---

## 🔄 NEXT STEPS

1. **Commit Phase 1 Progress**
   - Validation service
   - Completeness checker
   - Assumptions tab enhancements

2. **Complete Phase 1**
   - Formula auditing
   - Performance improvements

3. **Begin Phase 2**
   - Database schema for roles/audit
   - RLS policies
   - Audit log UI

4. **Parallel Track: Annual Plan Integration**
   - High priority since button says "TODO"
   - Can work alongside Phase 2

---

## 📖 REFERENCES

- [Original Enhancement Plan](./PROJECT_STATUS.md)
- [Forecast Types](../src/app/finances/forecast/types.ts)
- [Validation Service](../src/app/finances/forecast/services/validation-service.ts)
- [Completeness Checker](../src/app/finances/forecast/components/CompletenessChecker.tsx)
