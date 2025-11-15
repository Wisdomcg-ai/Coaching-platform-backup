# Testing Business Assessment

## Prerequisites
1. ✅ Run the SQL script in Supabase: `fix-assessments-table.sql`
2. ✅ Dev server is running: `npm run dev`
3. ✅ You're logged in to the app

## How to Test

### Step 1: Take a New Assessment
1. Open your browser and go to: **http://localhost:3000/assessment**
2. Answer all 30 questions (takes ~12-15 minutes)
   - Just click through and select any answers
   - Press Enter or click Next to move forward
3. On the last question, click **"Complete Assessment"**
4. You should be redirected to the results page automatically

### Step 2: View Results
- **Automatic redirect**: After completing, you'll see your results at `/dashboard/assessment-results?id=xxx`
- You should see:
  - Overall score (percentage and points)
  - Health status badge (THRIVING, STRONG, STABLE, BUILDING, STRUGGLING, or URGENT)
  - Section breakdown:
    - Business Foundation (max 50 points)
    - Strategic Clarity (max 70 points)
    - Business Engines (max 180 points)
  - Next steps recommendations

### Step 3: View Assessment History
1. Go to: **http://localhost:3000/assessment/history**
2. You should see:
   - List of all your completed assessments
   - Date, score, and health status for each
   - Click on an assessment to see details
   - "View Full Report" button to see complete results
   - "Take New Assessment" button to start a new one

### Step 4: Manage Assessments
1. Go to: **http://localhost:3000/assessment/manage**
2. You should be able to:
   - See all your assessments
   - Delete individual assessments
   - Start a new assessment

## What Gets Saved to Supabase

When you complete an assessment, the following is saved to the `assessments` table:

```json
{
  "user_id": "your-user-id",
  "answers": {
    "q1": {"value": "yes_full", "points": 10, "question": "..."},
    "q2": {"value": "6_15", "points": 6, "question": "..."},
    // ... all 30 questions
  },
  "total_score": 245,
  "percentage": 82,
  "health_status": "STRONG",
  "foundation_score": 42,
  "strategic_wheel_score": 58,
  "engines_score": 145,
  "status": "completed",
  "completed_at": "2025-11-11T10:30:00Z"
}
```

## Troubleshooting

### If assessment doesn't save:
1. Check browser console for errors (F12)
2. Verify SQL script ran successfully in Supabase
3. Check Supabase logs in the dashboard
4. Ensure RLS policies are enabled

### If you get a 404:
- The assessment routes should be working now
- Try restarting the dev server: `Ctrl+C` then `npm run dev`

### If scores don't display:
- The field names have been updated to match the new schema
- Assessment history page now uses `foundation_score`, `strategic_wheel_score`, `engines_score`

## Quick Links

- Take Assessment: http://localhost:3000/assessment
- Assessment History: http://localhost:3000/assessment/history
- Manage Assessments: http://localhost:3000/assessment/manage
- Dashboard: http://localhost:3000/dashboard
