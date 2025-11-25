# Client Setup & Onboarding Flow

## 📋 **Client Setup Form**

### **Step 1: Business Information**
```
┌─────────────────────────────────────────────────┐
│ Create New Client Account                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Business Name*         [________________]       │
│ Industry               [________________]       │
│ ABN/ACN                [________________]       │
│ Website                [________________]       │
│                                                 │
│ Business Address       [________________]       │
│ City                   [________________]       │
│ State                  [▼ Select State  ]       │
│ Postcode               [________________]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Step 2: Primary Contact (Business Owner)**
```
┌─────────────────────────────────────────────────┐
│ Primary Contact Details                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ First Name*            [________________]       │
│ Last Name*             [________________]       │
│ Email*                 [________________]       │
│ Mobile                 [________________]       │
│ Position               [________________]       │
│                                                 │
│ ☑ Send welcome email with login details        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Step 3: Coaching Details**
```
┌─────────────────────────────────────────────────┐
│ Coaching Engagement                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Assigned Coach*        [▼ Select Coach  ]      │
│ Program Type           [▼ Select Program]      │
│ Start Date             [📅 Select Date  ]      │
│ Session Frequency      [▼ Fortnightly   ]      │
│                                                 │
│ Notes (internal)                                │
│ [                                         ]     │
│ [                                         ]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Step 4: Access & Modules**
```
┌─────────────────────────────────────────────────┐
│ Platform Access                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Enable these modules for client:               │
│                                                 │
│ ☑ Annual Planning                              │
│ ☑ Financial Forecasting                        │
│ ☑ Goals & Targets                              │
│ ☑ Chat with Coach                              │
│ ☑ Document Library                             │
│ ☐ Advanced Analytics (coming soon)             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Step 5: Review & Create**
```
┌─────────────────────────────────────────────────┐
│ Review & Create Account                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Business: ABC Construction Pty Ltd              │
│ Contact:  John Smith (john@abc.com.au)         │
│ Coach:    Matt Malouf                          │
│ Program:  Business Transformation               │
│                                                 │
│ What happens next:                             │
│ 1. Account created in Wisdom BI                │
│ 2. Welcome email sent to john@abc.com.au       │
│ 3. Login credentials generated                 │
│ 4. Initial setup completed                     │
│                                                 │
│ [Cancel]              [Create Client Account]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 📧 **Welcome Email Template**

```
Subject: Welcome to Wisdom BI - Your Business Intelligence Platform

Hi John,

Welcome to Wisdom BI! Your business intelligence platform is now ready.

Your coach, Matt Malouf, has set up your account for ABC Construction Pty Ltd.

LOGIN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal: https://app.wisdombi.com.au
Email: john@abc.com.au
Password: [Auto-generated secure password]

For security, you'll be prompted to change your password on first login.

WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Create and track your Annual Business Plan
✓ Build Financial Forecasts
✓ Set and monitor Goals & Targets
✓ Chat directly with your coach
✓ Share and collaborate on documents

GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Log in to your account
2. Complete your business profile
3. Schedule your first coaching session
4. Start building your business plan

Need help? Reply to this email or chat with Matt in the platform.

Best regards,
The Wisdom BI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent to john@abc.com.au
Wisdom Business Intelligence | www.wisdombi.com.au
```

## 🔧 **Technical Implementation**

### **Database Changes**
```sql
-- Add to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS
  assigned_coach_id UUID REFERENCES auth.users(id);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS
  program_type TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS
  engagement_start_date DATE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS
  session_frequency TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS
  enabled_modules JSONB DEFAULT '{"plan": true, "forecast": true, "goals": true}';

-- System roles table
CREATE TABLE IF NOT EXISTS public.system_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('super_admin', 'coach', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Account Creation Flow**
```typescript
// 1. Create user in Supabase Auth
const password = generateSecurePassword()
const { user } = await supabase.auth.admin.createUser({
  email: formData.email,
  password: password,
  email_confirm: true,
  user_metadata: {
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.mobile
  }
})

// 2. Create business record
const { business } = await supabase
  .from('businesses')
  .insert({
    business_name: formData.businessName,
    industry: formData.industry,
    abn: formData.abn,
    assigned_coach_id: formData.coachId,
    user_id: user.id
  })

// 3. Assign user role (owner)
await supabase
  .from('user_roles')
  .insert({
    user_id: user.id,
    business_id: business.id,
    role: 'owner'
  })

// 4. Set system role
await supabase
  .from('system_roles')
  .insert({
    user_id: user.id,
    role: 'client'
  })

// 5. Send welcome email
await sendWelcomeEmail({
  to: formData.email,
  name: formData.firstName,
  business: formData.businessName,
  password: password,
  coach: 'Matt Malouf'
})
```

## 🔐 **Login Flow Differentiation**

### **Route-Based Login**
```
/admin/login     → Super Admin Login
/coach/login     → Coach Login
/login           → Client Login
```

### **Smart Redirect After Login**
```typescript
// After successful login
const { data: systemRole } = await supabase
  .from('system_roles')
  .select('role')
  .eq('user_id', user.id)
  .single()

if (systemRole.role === 'super_admin') {
  redirect('/admin')
} else if (systemRole.role === 'coach') {
  redirect('/coach/clients')
} else {
  redirect('/dashboard')
}
```

## 🎨 **Admin Dashboard Features**

### **Client Management Table**
```
┌────────────────────────────────────────────────────────────────┐
│ Clients                                      [+ Add New Client]│
├────────────────────────────────────────────────────────────────┤
│ Search: [_____________]  Filter: [All ▼]  Sort: [Name ▼]      │
├────────────────────────────────────────────────────────────────┤
│ Business Name      │ Contact │ Coach │ Status  │ Actions      │
├────────────────────────────────────────────────────────────────┤
│ ABC Construction   │ John S. │ Matt  │ Active  │ Edit | View  │
│ XYZ Consulting     │ Jane D. │ Matt  │ Active  │ Edit | View  │
│ 123 Retail Group   │ Bob J.  │ Matt  │ Pending │ Edit | View  │
└────────────────────────────────────────────────────────────────┘
```

### **Quick Stats**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Active       │ Pending      │ This Month   │
│ Clients      │ Engagements  │ Setup        │ Added        │
│             │             │             │             │
│     24       │     20       │      4       │      3       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## ✅ **Implementation Checklist**

- [ ] Create `/admin` route structure
- [ ] Build client setup form with validation
- [ ] Implement Supabase Auth admin functions
- [ ] Create welcome email template
- [ ] Set up password generation
- [ ] Build admin client list view
- [ ] Add system_roles table
- [ ] Implement smart login redirects
- [ ] Create admin/coach/client login pages
- [ ] Test complete onboarding flow

---

**Built for simplicity and scale**
