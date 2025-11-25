# 🧪 Feature Testing Guide - Quick Start

**Server Running:** `http://localhost:3001`

---

## 🎯 Where to Go to Test Each Feature

### For CLIENT Users (Login as a client)

#### 1. **Analytics Dashboard** ⭐ NEW
**URL:** `http://localhost:3001/client/analytics`

**What you'll see:**
- Health score gauge (0-100)
- Session frequency line chart
- Action completion bar chart
- Financial goal progress bars
- Key metrics cards (sessions, completion rate, etc.)
- Automated insights

**What to test:**
- ✅ Charts load with your data
- ✅ Health score displays correctly
- ✅ Metrics cards show accurate counts
- ✅ Mobile responsiveness
- ✅ Empty states (if no data)

---

#### 2. **Actions Dashboard** ⭐ NEW
**URL:** `http://localhost:3001/client/actions`

**What you'll see:**
- List of all action items from sessions
- Filter buttons (All, Pending, Completed)
- Checkboxes to mark complete/incomplete
- Due dates with overdue indicators
- Stats cards

**What to test:**
- ✅ Click checkbox to toggle completion
- ✅ Filter by status
- ✅ See overdue actions highlighted in red
- ✅ Stats update when you complete actions

---

#### 3. **Documents Library** ⭐ NEW
**URL:** `http://localhost:3001/client/documents`

**What you'll see:**
- Drag-and-drop upload area
- List of uploaded documents
- Search box
- Folder filter dropdown
- File type icons (PDF, Word, Excel, etc.)
- Download buttons

**What to test:**
- ✅ Drag a file onto the upload area
- ✅ Click to browse and upload
- ✅ Search for a document by name
- ✅ Filter by folder
- ✅ Download a document

---

### For COACH Users (Login as a coach)

#### 4. **Coach Analytics Dashboard** ⭐ NEW
**URL:** `http://localhost:3001/coach/analytics`

**What you'll see:**
- Total clients count
- Session performance metrics
- Client engagement rankings (top 10)
- Action completion trends
- Performance insights
- Multiple charts

**What to test:**
- ✅ See all your clients
- ✅ View engagement scores
- ✅ Check session frequency chart
- ✅ Review action completion trends
- ✅ Read automated insights

---

#### 5. **Coach Dashboard (Updated)** ⭐ UPDATED
**URL:** `http://localhost:3001/coach/clients`

**What you'll see (NEW):**
- Blue gradient stats banner at top
- Real-time metrics:
  - Total clients
  - Sessions this month
  - Pending actions
  - Total sessions
- Recent activity feed (last 10 events)

**What to test:**
- ✅ Stats load correctly
- ✅ Activity feed shows recent events
- ✅ Client list still works
- ✅ Click a client to view details

---

## 🤖 AI Features (Requires OpenAI API Key)

#### 6. **AI Transcript Analyzer** ⭐ NEW
**URL:** Navigate to any session detail page

**Setup first:**
1. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
2. Restart the dev server

**What you'll see:**
- Purple-themed upload area
- File upload or paste transcript
- "Analyze Transcript" button
- Results showing:
  - Summary (3-5 sentences)
  - Sentiment badge
  - Key topics as tags
  - Goals mentioned
  - Number of actions created

**What to test:**
- ✅ Upload a .txt transcript file
- ✅ Or paste transcript text
- ✅ Click "Analyze Transcript"
- ✅ See AI-extracted insights
- ✅ Verify actions were auto-created
- ✅ Check session notes were updated

---

## 📧 Email Notifications (Requires Setup)

#### 7. **Notification Bell** ⭐ NEW
**Location:** Top right header (once set up)

**Setup required:**
1. Run migration:
   ```sql
   -- Run the file:
   supabase/migrations/20251124_create_notifications_table.sql
   ```
2. Set Resend API key
3. Deploy Edge Functions

**What you'll see:**
- Bell icon in header
- Red badge with unread count
- Dropdown with notifications
- "Mark as read" buttons
- "Mark all read" button

**What to test:**
- ✅ Click bell to open dropdown
- ✅ See notification list
- ✅ Mark one as read
- ✅ Mark all as read
- ✅ Click "View" to go to linked page

**Trigger notifications:**
- Upload a document as coach → client gets notified
- Mark action complete as client → coach gets notified

---

## 🚀 Quick Test Route

**Fastest way to see everything:**

1. **Start here:**
   ```
   http://localhost:3001/client/analytics
   ```
   - See charts and metrics immediately
   - No setup needed (uses existing data)

2. **Then go to:**
   ```
   http://localhost:3001/client/documents
   ```
   - Upload a test file
   - See drag-and-drop in action

3. **Then check:**
   ```
   http://localhost:3001/client/actions
   ```
   - Toggle some action items
   - Watch stats update

4. **For coaches:**
   ```
   http://localhost:3001/coach/analytics
   ```
   - See client engagement rankings
   - View performance metrics

5. **Finally (if you want AI):**
   - Set OpenAI API key
   - Go to any session detail page
   - Find the TranscriptAnalyzer component
   - Test with sample transcript

---

## 📱 Navigation Updates

**Client Navigation (Top tabs):**
- ✅ Dashboard
- ✅ Business Plan
- ✅ Forecast
- ✅ Goals
- ✅ Sessions
- ✅ Messages
- ✅ Documents
- ✅ Actions
- ✅ **Analytics** ⭐ NEW TAB

**Coach Pages:**
- `/coach/clients` - Client list with metrics
- `/coach/analytics` - Performance dashboard ⭐ NEW
- `/coach/sessions` - Session management

---

## 🎨 What You Should See

### Client Analytics Page
```
┌─────────────────────────────────────────┐
│  Analytics & Insights                   │
├─────────────────────────────────────────┤
│  [Sessions] [Completion] [Gap] [Score]  │  ← Metric cards
├─────────────────────────────────────────┤
│  [Health Gauge]  [Session Chart    ]    │  ← Charts row 1
├─────────────────────────────────────────┤
│  [Action Completion Bar Chart      ]    │  ← Chart row 2
├─────────────────────────────────────────┤
│  [Financial Goals Progress         ]    │  ← Chart row 3
├─────────────────────────────────────────┤
│  [Insights Banner - Blue Gradient  ]    │  ← Insights
└─────────────────────────────────────────┘
```

### Documents Page
```
┌─────────────────────────────────────────┐
│  Documents                              │
├─────────────────────────────────────────┤
│  [Drag & Drop Upload Area          ]    │  ← Upload
├─────────────────────────────────────────┤
│  [Search...]  [Folder Filter ▼]         │  ← Filters
├─────────────────────────────────────────┤
│  [📄 File1]  [📊 File2]  [📷 File3]    │  ← Grid
│  [Download]  [Download]  [Download]     │
└─────────────────────────────────────────┘
```

### Actions Page
```
┌─────────────────────────────────────────┐
│  My Actions                             │
├─────────────────────────────────────────┤
│  [Total: 10] [Pending: 3] [Done: 7]     │  ← Stats
├─────────────────────────────────────────┤
│  [All] [Pending] [Completed]            │  ← Filters
├─────────────────────────────────────────┤
│  ☐ Action 1 - Due in 3 days             │
│  ☑ Action 2 - Completed yesterday       │
│  ☐ Action 3 - Overdue! ⚠️               │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

**Charts not showing?**
- You need some session/action data in the database
- The system looks back 12 months
- Create a few test sessions and actions first

**Upload not working?**
- Check Supabase Storage bucket is created
- Verify RLS policies on `shared_documents` table
- Check browser console for errors

**Analytics page blank?**
- Need at least one session or action
- Check browser console for API errors
- Verify you're logged in as the right user

**AI not working?**
- Set `OPENAI_API_KEY` in `.env.local`
- Restart dev server after adding key
- Check console for API errors
- Verify you have OpenAI credits

---

## ✅ Quick Checklist

Copy this and check off as you test:

```
Client Features:
[ ] Visit /client/analytics
[ ] See health score gauge
[ ] View session frequency chart
[ ] Check action completion chart
[ ] Upload a document at /client/documents
[ ] Search for uploaded document
[ ] Toggle action completion at /client/actions
[ ] Filter actions by status

Coach Features:
[ ] Visit /coach/analytics
[ ] See total clients count
[ ] View client engagement chart
[ ] Check session trends
[ ] Review coach dashboard at /coach/clients
[ ] See stats banner with metrics
[ ] View recent activity feed

AI Features (if API key set):
[ ] Go to session detail page
[ ] Upload or paste transcript
[ ] Click "Analyze Transcript"
[ ] See extracted summary
[ ] Verify actions auto-created
```

---

## 🎉 That's It!

**Start with:** `http://localhost:3001/client/analytics`

This is the easiest way to see the new features in action immediately!

The analytics page will show you charts and metrics based on any existing data in your database, so you can see the visualizations right away.
