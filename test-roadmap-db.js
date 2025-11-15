// Test script to check if roadmap_progress table exists
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uudfstpvndurzwnapibf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZGZzdHB2bmR1cnp3bmFwaWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDQ1NTYsImV4cCI6MjA2OTgyMDU1Nn0.a5kEevxYE_TyYNI15HnWq3U6ZlbHfhxElkPD88-kiEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoadmapTable() {
  console.log('🔍 Checking if roadmap_progress table exists...\n')

  try {
    const { data, error } = await supabase
      .from('roadmap_progress')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Table does not exist!')
        console.log('\n📋 To create the table, follow these steps:')
        console.log('   1. Go to https://uudfstpvndurzwnapibf.supabase.co')
        console.log('   2. Navigate to SQL Editor')
        console.log('   3. Create a new query')
        console.log('   4. Copy and paste the contents of: roadmap-progress-migration.sql')
        console.log('   5. Run the query')
        console.log('\n✨ Then test again by running: node test-roadmap-db.js\n')
      } else {
        console.log('❌ Error:', error.message)
      }
      process.exit(1)
    } else {
      console.log('✅ Table exists and is accessible!')
      console.log('📊 Current records:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('\n📝 Sample data:')
        data.forEach(record => {
          console.log(`   User: ${record.user_id}`)
          console.log(`   Completed builds: ${record.completed_builds?.length || 0}`)
        })
      }
      console.log('\n🎉 Database is ready! You can now test the roadmap page at:')
      console.log('   http://localhost:3002/business-roadmap\n')
      process.exit(0)
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

testRoadmapTable()
