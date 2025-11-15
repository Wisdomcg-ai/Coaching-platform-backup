/**
 * THE ABUNDANCE ROADMAP 2025
 *
 * 5 Revenue Stages: Foundation → Traction → Growth → Scale → Mastery
 * 8 Business Engines: Attract, Convert, Deliver, People, Systems, Finance, Leadership, Time
 *
 * Format inspired by Abundance Global methodology
 * Updated with modern tools, AI capabilities, and 2025 best practices
 */

export interface RoadmapBuild {
  name: string
  outcome: string
  toDo: string[]
  engine: string
}

export interface EngineData {
  id: string
  name: string
  subtitle: string
  icon: string
  color: string
  bgColor: string
}

export interface StageData {
  id: string
  name: string
  range: string
  description: string
  focus: string
  builds: RoadmapBuild[]
}

// 8 Business Engines
export const ENGINES: EngineData[] = [
  {
    id: 'attract',
    name: 'Attract',
    subtitle: 'Marketing & Lead Generation',
    icon: 'Megaphone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600'
  },
  {
    id: 'convert',
    name: 'Convert',
    subtitle: 'Sales & Closing',
    icon: 'ShoppingCart',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700'
  },
  {
    id: 'deliver',
    name: 'Deliver',
    subtitle: 'Client Experience & Results',
    icon: 'Heart',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600'
  },
  {
    id: 'people',
    name: 'People',
    subtitle: 'Team, Culture, Hiring',
    icon: 'Users',
    color: 'text-slate-700',
    bgColor: 'bg-slate-700'
  },
  {
    id: 'systems',
    name: 'Systems',
    subtitle: 'Operations, Process, Tech',
    icon: 'Settings',
    color: 'text-slate-800',
    bgColor: 'bg-slate-800'
  },
  {
    id: 'finance',
    name: 'Finance',
    subtitle: 'Money, Metrics, Wealth',
    icon: 'Calculator',
    color: 'text-blue-800',
    bgColor: 'bg-blue-800'
  },
  {
    id: 'leadership',
    name: 'Leadership',
    subtitle: 'Vision, Strategy, You',
    icon: 'Crown',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-700'
  },
  {
    id: 'time',
    name: 'Time',
    subtitle: 'Freedom, Productivity, Leverage',
    icon: 'Target',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-800'
  }
]

// 5 Revenue Stages with Builds
export const STAGES: StageData[] = [

  // ==================== FOUNDATION STAGE ====================
  {
    id: 'foundation',
    name: 'Foundation',
    range: '$0-500K',
    description: 'Finding product-market fit and proving the model works',
    focus: 'Get your first clients, validate your offer, establish basic systems',
    builds: [
      {
        name: "The Hero's Quest",
        outcome: "Commit to building a business that creates freedom, not just income",
        toDo: [
          "Define your 3-year vision: revenue goal, team size, lifestyle freedom",
          "Calculate your Freedom Number - monthly income needed for ideal life",
          "Identify the #1 thing stealing your joy right now",
          "Block weekly CEO time (2 hours minimum) for strategic work",
          "Share vision with accountability partner"
        ],
        engine: 'leadership'
      },
      {
        name: "Money in the Bank",
        outcome: "Know your cash position and collect money owed",
        toDo: [
          "Every Monday 9am: check bank balance, write it down",
          "Log money in and out weekly in spreadsheet or Xero/QuickBooks",
          "Calculate weekly burn rate (average expenses last 4 weeks)",
          "Project 13 weeks: where will cash be if nothing changes?",
          "Calculate runway: current balance ÷ weekly burn = weeks until zero",
          "Call clients with invoices 30+ days old",
          "Set up Stripe payment links for faster collection"
        ],
        engine: 'finance'
      },
      {
        name: "Niche & Offer",
        outcome: "Get crystal clear on who you serve and what you sell",
        toDo: [
          "Define ideal client: industry, revenue, size, main problem",
          "Interview 5 current/past clients: 'What problem did we solve?'",
          "Package ONE core offer (no complexity)",
          "Name it simply - avoid fancy names",
          "Price it: calculate cost + 50-70% margin minimum",
          "Write one-page offer: Who it's for, Problem solved, What they get, Price",
          "Test with 3-5 prospects, adjust based on feedback"
        ],
        engine: 'attract'
      },
      {
        name: "Leads Aplenty",
        outcome: "Generate consistent leads from your network and database",
        toDo: [
          "Export ALL contacts to spreadsheet (email, phone, LinkedIn, old CRMs)",
          "Categorize: Hot, Warm, Cold, Dead",
          "Set up simple CRM (HubSpot free, Notion, or Google Sheets)",
          "Email warm/cold contacts with value (not a pitch)",
          "Reactivate past clients: check in, ask how they're doing",
          "Ask top 10 clients for referrals",
          "Post value on LinkedIn 3x/week (lessons, case studies, insights)",
          "Join 2-3 communities where ideal clients hang out",
          "Goal: 20 new conversations per month"
        ],
        engine: 'attract'
      },
      {
        name: "Getting to Yes",
        outcome: "Close good-fit prospects with a simple sales process",
        toDo: [
          "Map your sales steps: Contact → Discovery → Proposal → Close",
          "Create simple sales script: Problem discovery, Solution, Pricing, Next steps",
          "Set up Calendly or Cal.com for easy booking",
          "Build sales pipeline in CRM - track every prospect",
          "Create FAQ doc - answer top 10 objections",
          "Follow up 3-5 times minimum (most sales happen on follow-up #4-7)",
          "Send personalized Loom videos in follow-ups",
          "Track conversion rate: aim for 30-50% close rate",
          "Simplify payment: Stripe links, payment plans available",
          "Offer guarantee: 30-day money-back or 'we'll make it right'"
        ],
        engine: 'convert'
      },
      {
        name: "Getting Things Done",
        outcome: "Deliver great results and get clients wins",
        toDo: [
          "Document your delivery process (use Loom to record yourself)",
          "Create client onboarding checklist",
          "Set clear expectations: timeline, deliverables, communication",
          "Use project management tool (ClickUp, Asana, or simple spreadsheet)",
          "Weekly client check-ins - proactive communication",
          "Celebrate client wins - small and big",
          "Ask for testimonials when clients get results",
          "Collect feedback: 'What could we do better?'"
        ],
        engine: 'deliver'
      },
      {
        name: "Zone of Genius",
        outcome: "Focus on your strengths, delegate or eliminate the rest",
        toDo: [
          "Track time for one week (Toggl, Clockify, or spreadsheet)",
          "Categorize: Genius (love + great at), Excellence, Competence, Incompetence",
          "Goal: 70%+ time in Genius + Excellence",
          "List all Incompetence tasks - must delegate, automate, or eliminate",
          "Identify your ONE superpower - what you do better than anyone",
          "Find someone to handle Incompetence tasks (VA, contractor, $500-1000/month)",
          "Use AI (ChatGPT, Claude) for repetitive writing/research",
          "Block 'Genius Time' in calendar (10+ hours/week)"
        ],
        engine: 'time'
      },
      {
        name: "Strategic Time",
        outcome: "Protect your calendar and invest time in high-leverage work",
        toDo: [
          "Audit last month's calendar: Revenue-generating vs Operations vs Waste",
          "Goal: 50%+ time on revenue activities (sales, delivery, marketing)",
          "Create ideal week template in Google Calendar - time-block everything",
          "Set up morning routine (30-60 min before work starts)",
          "Install Focus Blocks: 90-min deep work, phone on airplane mode",
          "Use Pomodoro or Flow app for focused sessions",
          "Decline meetings that don't require you",
          "Weekly planning session (Friday afternoon or Sunday evening)",
          "Use AI calendar tools (Reclaim.ai, Motion) to optimize your week"
        ],
        engine: 'time'
      }
    ]
  },

  // ==================== TRACTION STAGE ====================
  {
    id: 'traction',
    name: 'Traction',
    range: '$500K-$1M',
    description: 'Proven model, now building infrastructure for growth',
    focus: 'Systemize delivery, build team, create consistent lead flow',
    builds: [
      {
        name: "The Integrated Action Plan",
        outcome: "Create a strategic plan that connects daily actions to your 3-year vision",
        toDo: [
          "Complete 3-year vision with specifics: revenue, team, lifestyle",
          "Work backward: What must be true in 1 year to hit 3-year goal?",
          "Set quarterly goals (3-5 big outcomes per quarter)",
          "Define monthly milestones toward quarterly goals",
          "Use OKR framework: Objective (goal) + Key Results (measurements)",
          "Create visual roadmap in Notion, Miro, or simple timeline",
          "Weekly: review if daily actions align with vision",
          "Quarterly: 2-day planning session to review and adjust",
          "Share with team so everyone knows how their work connects"
        ],
        engine: 'leadership'
      },
      {
        name: "Financial Forecast",
        outcome: "Predict revenue and cashflow with confidence for the next 13 weeks",
        toDo: [
          "Set up cashflow forecast in spreadsheet, Xero, or QuickBooks",
          "List all confirmed income for next 13 weeks",
          "List all committed expenses for next 13 weeks",
          "Calculate weekly net cashflow (income - expenses)",
          "Identify danger weeks (negative cashflow), create action plan",
          "Weekly 'Money Monday' ritual (15 min) to update forecast",
          "Track key metrics: revenue, gross profit %, net profit %, cash balance",
          "Monthly P&L review with bookkeeper/accountant",
          "Set revenue and profit targets for next 6-12 months",
          "Build financial dashboard (simple spreadsheet or tool like Jirav)"
        ],
        engine: 'finance'
      },
      {
        name: "Content Engine",
        outcome: "Implement consistent marketing that builds your brand and generates leads",
        toDo: [
          "Choose ONE primary content platform (LinkedIn, YouTube, podcast, blog)",
          "Create content calendar: 3-5 posts/week minimum",
          "Use AI to help create content (ChatGPT for ideas/drafts, Canva for design)",
          "Content types: lessons learned, case studies, client wins, industry insights",
          "Repurpose: one piece of content becomes 10 (video → blog → social posts → email)",
          "Optimize LinkedIn profile: creator mode, SEO headline, featured section",
          "Install Google Business Profile, optimize for local SEO",
          "Generate 5-star Google reviews from happy clients",
          "Track lead source: where did every lead come from?",
          "Double down on channels with best ROI"
        ],
        engine: 'attract'
      },
      {
        name: "The Sales Pipeline",
        outcome: "Install a systematic sales process so no leads fall through cracks",
        toDo: [
          "Set up proper CRM: HubSpot, Pipedrive, or upgrade from spreadsheets",
          "Define pipeline stages: Lead → Qualified → Discovery → Proposal → Negotiation → Won/Lost",
          "Log every prospect: name, company, source, stage, next action, close date",
          "Set up automated reminders for follow-ups",
          "Track conversion rates at each stage - find bottlenecks",
          "Weekly pipeline review: move deals forward or disqualify",
          "Create lead scoring: A (hot-30 days), B (warm-60-90 days), C (cold-nurture)",
          "Use Calendly with pre-meeting questionnaire to qualify before calls",
          "Integrate CRM with calendar - automatically log meetings",
          "Monthly: track leads, conversion rate, average deal size, sales cycle length"
        ],
        engine: 'convert'
      },
      {
        name: "Smooth Delivery",
        outcome: "Streamline delivery to reduce time while maintaining quality",
        toDo: [
          "Document every step of delivery process (Loom videos + written SOPs)",
          "Identify bottlenecks: where do projects get stuck?",
          "Remove unnecessary steps - challenge 'is this essential?'",
          "Create templates for recurring deliverables (reports, presentations)",
          "Build client portal: Notion, ClickUp, or Google Drive with clear structure",
          "Standardize onboarding: welcome email, questionnaire, kickoff call agenda",
          "Use project management: clients see progress in real-time",
          "Batch similar work: all calls on specific days, all delivery on others",
          "Use AI to speed delivery: ChatGPT for drafts, Canva for design, Descript for video",
          "Measure delivery time: look for ways to cut 20-30% without sacrificing quality"
        ],
        engine: 'deliver'
      },
      {
        name: "The Next Hire",
        outcome: "Hire your first A-player team member who can take work off your plate",
        toDo: [
          "Define the role clearly - use Big Picture Job Description (outcomes, not tasks)",
          "What will they own? What results do you expect in 90 days?",
          "Execute Affinity Mapping: list all your tasks, group by theme, identify what to delegate",
          "Write compelling job post - focus on mission and growth, not just tasks",
          "Include 2-min video explaining role and why it's exciting",
          "Post on LinkedIn, AngelList, We Work Remotely + your network",
          "Screen: phone screen (15 min) → skills test → working interview (paid trial) → final interview",
          "Check references: call 2+ past managers/colleagues",
          "Create 90-day onboarding plan with weekly milestones",
          "Weekly 1-on-1s first 90 days - coaching, not micromanaging",
          "Document everything you hand off (Loom + written SOPs in Notion)"
        ],
        engine: 'people'
      },
      {
        name: "Productivity Systems",
        outcome: "Install tools and automation to work smarter, not harder",
        toDo: [
          "Choose ONE task management system: Todoist, ClickUp, Notion",
          "Set up project management: ClickUp, Asana, Monday.com for team visibility",
          "Install communication tools: Slack/Teams for daily, Zoom for meetings",
          "Set up email automation: HubSpot, MailChimp, ConvertKit for marketing",
          "Use Zapier or Make.com for workflow automation (auto-add leads to CRM, send follow-ups)",
          "Create email templates for common scenarios",
          "Use AI writing assistant: ChatGPT, Claude for drafting emails, content, proposals",
          "Set up Calendly with smart routing and automated reminders",
          "Use Loom for async communication and training",
          "Monthly tech audit: what's slow or frustrating? What can we upgrade?"
        ],
        engine: 'systems'
      },
      {
        name: "Personal Rhythm",
        outcome: "Design your ideal week to maintain energy and focus on high-impact work",
        toDo: [
          "Track your energy for one week: when do you have peak energy?",
          "Schedule most important work during peak energy hours",
          "Create ideal week template - time-block everything including breaks",
          "Morning routine (30-60 min): exercise, mindfulness, or planning before work",
          "Install 90-minute Focus Time blocks with phone on airplane mode",
          "Set boundaries: no meetings before 10am or after 3pm (adjust to your energy)",
          "Weekly planning session: Friday afternoon or Sunday evening (1 hour)",
          "Use AI calendar tools (Reclaim.ai, Motion) to auto-optimize your schedule",
          "Daily: identify 3 Most Important Tasks (MITs), do these first",
          "Protect your Genius Time: 10+ hours/week on your superpower work"
        ],
        engine: 'time'
      }
    ]
  },

  // ==================== GROWTH STAGE ====================
  {
    id: 'growth',
    name: 'Growth',
    range: '$1M-$5M',
    description: 'Building the team, systems, and processes to scale',
    focus: 'Hire key roles, install scalable systems, build marketing and sales engines',
    builds: [
      {
        name: "Capacity Planning",
        outcome: "Build a resourced team that scales with your business growth",
        toDo: [
          "Set revenue goals for next 12-36 months (be ambitious but realistic)",
          "Work backward: units to sell → campaigns needed → team capacity required",
          "Create hiring roadmap: when do you need each role?",
          "Document each role before hiring - create role scorecard with outcomes and KPIs",
          "Calculate: (Target revenue - Current revenue) ÷ Revenue per employee = Hires needed",
          "Build recruiting pipeline BEFORE you need people - always talent scouting",
          "Create attractive employer brand: careers page, culture videos, team testimonials",
          "Set up onboarding system: Week 1 (culture/tools), Week 2-4 (learn), Week 5-12 (do)",
          "Use capacity planning tool or spreadsheet to project team needs quarterly",
          "Budget for team growth: salaries, benefits, tools, training"
        ],
        engine: 'leadership'
      },
      {
        name: "The Core Product",
        outcome: "Package your methodology into a scalable, profitable core offer",
        toDo: [
          "Interview your best 10 clients: what transformation did we deliver?",
          "Unpack your unique method - what's your proprietary process? Name it simply",
          "Design delivery to minimize your involvement - use team, templates, automation",
          "Create modular delivery: break into phases so clients can start small and expand",
          "Build recurring profit model: monthly retainer, subscription, or phased payments",
          "Price for scale and profit: true cost to deliver + 60-70% margin",
          "Create delivery playbook in Notion: every step documented with templates and videos",
          "Set up client portal (ClickUp, Notion, or dedicated software) for self-service",
          "Launch to 10 clients, gather feedback, iterate rapidly",
          "Use AI to create delivery assets: ChatGPT for content, Canva for design",
          "Track delivery metrics: on-time %, client satisfaction, profit per client"
        ],
        engine: 'deliver'
      },
      {
        name: "Marketing Machine",
        outcome: "Install multiple lead generation channels that work together",
        toDo: [
          "Build on your content engine (from Traction) - now add paid amplification",
          "Install '100 leads bundle' paid campaign: LinkedIn ads, Facebook ads, or Google ads ($1500-3000/month)",
          "Create lead magnet: PDF guide, calculator, assessment, or video training",
          "Build landing page with form (Carrd, Leadpages, Webflow, HubSpot)",
          "Set up email nurture sequence: 5-7 emails to build trust and soft pitch",
          "Implement referral program: automate the process, make it easy, offer incentives",
          "Activate partnership strategy: 2-3 partners referring 10-20% of leads",
          "Host quarterly events: webinar, workshop, challenge, or virtual summit",
          "Syndicate content across platforms: LinkedIn, YouTube, podcast, email",
          "Track full funnel: visitors → leads → MQLs → SQLs → customers",
          "Hire marketing coordinator or VA to help execute (10-20 hrs/week)"
        ],
        engine: 'attract'
      },
      {
        name: "Sales Team Launch",
        outcome: "Hire your first salesperson and hand off sales process",
        toDo: [
          "Build comprehensive Sales Playbook: target customers, discovery framework, demo structure, proposals, objection handling, closing",
          "Record yourself on 5-10 sales calls - these become training materials",
          "Capture 10+ testimonials and case studies",
          "Create sales onboarding: 2-week training program",
          "Hire salesperson: advertise → screen → working interview → hire",
          "90-day ramp: Week 1-2 (learn), Week 3-6 (shadow you), Week 7-12 (close with coaching)",
          "Set compensation: base + commission structure (60/40 or 70/30 split)",
          "Weekly 1-on-1s: pipeline review, deal coaching, skill development",
          "Use conversation intelligence: Gong, Chorus, or Fireflies.ai to review calls",
          "Track: calls, meetings, proposals, close rate per salesperson"
        ],
        engine: 'convert'
      },
      {
        name: "Client Success System",
        outcome: "Ensure every client gets results and becomes a promoter",
        toDo: [
          "Map full client journey: onboarding → delivery → success → expansion → advocacy",
          "Implement NPS (Net Promoter Score) surveys: after onboarding, at completion, quarterly",
          "Follow-up: 'On scale 0-10, how likely to recommend us?' + 'Why that score?'",
          "Action on feedback: Promoters (9-10) = ask for referrals, Detractors (0-6) = fix immediately",
          "Create success metrics dashboard: track client results, not just your activities",
          "Weekly client check-ins: proactive outreach, celebrate wins",
          "Build customer support system: help desk (Intercom, Front) or simple email + tracking",
          "Create expansion offers: upsell and cross-sell to existing clients",
          "Quarterly Business Reviews (QBRs) with top clients: strategic conversations",
          "Hire Customer Success Manager when you hit 30-50 active clients",
          "Track: retention rate, expansion revenue, NPS score, testimonials collected"
        ],
        engine: 'deliver'
      },
      {
        name: "People Power",
        outcome: "Build and manage a productive team with clear roles and accountability",
        toDo: [
          "Create org chart: current and 12-month future state",
          "Define company core values (3-5 values that drive behavior)",
          "Create Big Picture Job Descriptions for each role (outcomes, not tasks)",
          "Assign roles, responsibilities, KPIs for each position",
          "Implement weekly team meeting: wins, metrics, problem-solving, action items",
          "Daily standup (15 min): yesterday's progress, today's plan, any blockers?",
          "Use ClickUp, Asana, or Monday.com for task management and visibility",
          "Install performance review process: quarterly check-ins, annual reviews",
          "Create team training plan: onboarding, skills development, career progression",
          "Build coaching culture: use GROW model, ask questions rather than give answers",
          "Set up Slack/Teams for communication with clear norms (what tool for what)",
          "Celebrate wins: recognize great work publicly, reward top performers"
        ],
        engine: 'people'
      },
      {
        name: "Know Your Numbers",
        outcome: "Master the financial metrics that drive profit and make data-driven decisions",
        toDo: [
          "Build financial team: you (CEO) + bookkeeper + accountant + CFO/advisor",
          "Monthly financial review (by 10th of following month): P&L, balance sheet, cashflow",
          "Track the 5 financial dials: Revenue, Gross Profit %, Operating Expenses, Net Profit %, Cash",
          "Understand unit economics: profit per client, CAC (cost to acquire), LTV (lifetime value)",
          "Calculate and track: LTV:CAC ratio (should be 3:1 or better)",
          "Define breakeven and breakeven for profit targets",
          "Build financial dashboard: real-time visibility into key metrics",
          "Monthly meeting with accountant: review financials, tax planning, identify opportunities",
          "Set up proper accounting: accrual basis, clean chart of accounts",
          "Separate business and personal finances completely",
          "Plan for taxes: quarterly estimates, year-end planning",
          "Work with financial advisor on wealth extraction strategy"
        ],
        engine: 'finance'
      },
      {
        name: "Systems & Automation",
        outcome: "Install technology and automation to handle 3x growth",
        toDo: [
          "Audit your current tech stack: what's working? What's slowing you down?",
          "Upgrade to enterprise tools: CRM (HubSpot/Salesforce), Project management (ClickUp/Asana), Accounting (Xero/QuickBooks)",
          "Map top 10-20 business processes, document with SOPs in Notion or Trainual",
          "Install Zapier or Make.com automation: connect apps, eliminate manual work",
          "Use AI strategically: ChatGPT for content/emails, customer service chatbot, data analysis",
          "Create 'how we work' playbook: every process documented, easy to find",
          "Build data infrastructure: centralized dashboard pulling from all systems",
          "Train team on systems thinking: 'Could this be automated or simplified?'",
          "Quarterly tech review: what's new? What could we upgrade? What should we cut?",
          "Budget 2-3% of revenue for technology investment"
        ],
        engine: 'systems'
      }
    ]
  },

  // ==================== SCALE STAGE ====================
  {
    id: 'scale',
    name: 'Scale',
    range: '$5M-$10M',
    description: 'Building leadership team and preparing for exit or next level',
    focus: 'Hire executive team, build brand authority, create systems to run without you',
    builds: [
      {
        name: "Leadership Team",
        outcome: "Build an executive team that runs the business while you focus on strategy",
        toDo: [
          "Determine roles needed: typically COO, CFO, CMO, VP Sales, VP Delivery",
          "Promote from within where possible, recruit externally for gaps",
          "Create leadership team charter: how we work together, make decisions, communicate",
          "Weekly leadership meeting: review metrics, solve systemic problems, align on priorities",
          "Monthly strategic meeting: bigger picture, longer-term planning (3-12 months)",
          "Quarterly offsite: 2-day vision, strategy, team building session",
          "Clarify decision-making authority: what can leaders decide without you? (Almost everything)",
          "Install EOS (Traction), Scaling Up, or OKR framework for accountability",
          "Develop your leaders: executive coaching, conferences, leadership training",
          "Create succession plan: who could step into your role if you left?",
          "Your role shifts: set vision, coach leaders, allocate capital, strategic relationships"
        ],
        engine: 'leadership'
      },
      {
        name: "Build to Sell",
        outcome: "Design your business to run without you and maximize value",
        toDo: [
          "Identify your 'core scalable unit' - the product/service that grows without your direct involvement",
          "Reduce key person risk: if you disappeared tomorrow, could business continue?",
          "Standardize delivery: playbooks, templates, automation ensure consistent quality",
          "Build institutional knowledge: document everything, nothing lives only in heads",
          "Create recurring revenue model: subscriptions, retainers, multi-year contracts",
          "Diversify customer base: no single customer > 15% of revenue",
          "Build brand that transcends you: people buy the company, not you personally",
          "Implement franchise-like systems: someone else could run this with your playbook",
          "Work with M&A advisor: get professional valuation, understand what buyers want",
          "Prepare for due diligence: clean financials, legal compliance, organized data room",
          "Track business value drivers: recurring revenue, retention rate, growth rate, profit margins"
        ],
        engine: 'deliver'
      },
      {
        name: "Brand Authority",
        outcome: "Become the recognized leader in your market category",
        toDo: [
          "Create public relations strategy: strategic visibility that builds credibility",
          "Publish a book: traditional or high-quality self-publish (not just lead magnet)",
          "Apply for business awards: Inc 5000, Best Places to Work, industry-specific",
          "Media strategy: podcast interviews, articles in industry publications, conferences",
          "Original research: conduct surveys, publish industry reports, share data",
          "Build thought leadership: publish consistently on LinkedIn, Medium, or your blog",
          "Host signature event: annual summit, conference, or workshop",
          "Strategic partnerships: align with recognized brands in your space",
          "Speaking strategy: apply to top industry conferences, host your own events",
          "Build social proof: 100+ testimonials, video case studies, recognizable client logos",
          "Contribution practices: B1G1, 1% for the Planet, pro bono work - build goodwill",
          "Track brand metrics: website traffic, social following, media mentions, speaking invites"
        ],
        engine: 'attract'
      },
      {
        name: "Sales at Scale",
        outcome: "Build a predictable sales machine with dedicated team and proven processes",
        toDo: [
          "Build sales team structure: SDRs (prospecting), AEs (closing), CSMs (expansion)",
          "Hire VP Sales or Head of Sales to lead the team",
          "Create comprehensive Sales Playbook: methodology, processes, scripts, training",
          "Implement sales methodology: MEDDIC, Challenger Sale, Sandler, or custom",
          "Use conversation intelligence: Gong, Chorus, or Fireflies.ai to analyze calls and coach",
          "Build sales dashboard: track individual and team performance in real-time",
          "Weekly sales meetings: pipeline review, deal coaching, skill development",
          "Create compensation plan: base + commission that rewards right behaviors",
          "Implement sales enablement: training, content, tools to help reps sell",
          "Track full funnel metrics: MQL → SQL → Opportunity → Close → Expansion",
          "Regular role-playing and practice: sales is a skill that must be practiced",
          "Your role: set strategy and targets, coach sales leaders, close strategic deals"
        ],
        engine: 'convert'
      },
      {
        name: "Client Advisory Board",
        outcome: "Turn top clients into strategic partners who guide your business",
        toDo: [
          "Identify 8-12 top clients: diverse industries, sizes, use cases",
          "Invite to join advisory board: meet quarterly, provide strategic input",
          "Create compelling invitation: exclusive group, shape the future, networking",
          "Quarterly meetings (virtual or in-person): share roadmap, get feedback, discuss trends",
          "Use advisory board input to guide product development and strategy",
          "Build deeper relationships: these become your biggest advocates and references",
          "Compensate appropriately: discounts, early access, special perks, or advisory fees",
          "Share how their feedback influenced decisions: close the loop",
          "Create advisory board portal: share materials, updates, exclusive content",
          "Annual in-person event: bring full board together for strategy and networking",
          "Track outcomes: product improvements, referrals generated, case studies",
          "This increases retention and creates powerful word-of-mouth marketing"
        ],
        engine: 'deliver'
      },
      {
        name: "Talent Acquisition",
        outcome: "Build always-on recruiting system to attract A-players",
        toDo: [
          "Create employer brand: careers page with culture videos, team testimonials, values",
          "Build talent pool in CRM: track potential hires even without current opening",
          "Share behind-the-scenes content: what it's like to work here (LinkedIn, Instagram)",
          "Implement employee referral program: pay bonuses for successful hires",
          "Partner with recruiters: build relationships with 2-3 specialized recruiters",
          "Proactive sourcing: use LinkedIn Recruiter to find passive candidates",
          "Create interview process that assesses for values fit and potential, not just experience",
          "Hire for diversity: diverse teams outperform homogeneous ones",
          "Offer competitive packages: benchmark salaries, offer equity/profit share",
          "Build career progression framework: people see bright future within your company",
          "Quarterly talent review: assess bench strength, identify succession risks",
          "Track: time to hire, quality of hire, retention rate, employee satisfaction"
        ],
        engine: 'people'
      },
      {
        name: "Strategic Finance",
        outcome: "Use financial data to make strategic decisions and build wealth",
        toDo: [
          "Hire fractional or full-time CFO: strategic financial leadership",
          "Implement FP&A (Financial Planning & Analysis): forecasting, scenario planning, modeling",
          "Build 3-statement model: P&L, balance sheet, cashflow integrated",
          "Monthly board package: key metrics, variance analysis, commentary",
          "Quarterly board meetings: review financials, discuss strategy, approve initiatives",
          "Implement driver-based forecasting: understand what drives your numbers",
          "Cash management: optimize working capital, manage cash conversion cycle",
          "Capital allocation strategy: reinvest in growth vs. distribute to owners",
          "Work with tax strategist: legal tax minimization, wealth extraction planning",
          "Consider capital raise: if aggressive growth, evaluate debt or equity financing",
          "Track: Rule of 40 (growth rate + profit margin), burn multiple, cash runway",
          "Build wealth outside business: personal investment portfolio, real estate, diversification"
        ],
        engine: 'finance'
      },
      {
        name: "Remote Operations",
        outcome: "Build systems to run business from anywhere with real-time visibility",
        toDo: [
          "Build executive dashboard: your 'cockpit' for running the business remotely",
          "Real-time visibility: financial, growth, operations, team metrics all in one place",
          "Key metrics dashboard: revenue, profit, cash, leads, pipeline, client satisfaction",
          "Red/yellow/green indicators: see problems at a glance",
          "Drill-down capability: click any metric to see underlying data",
          "Mobile access: check business health from phone anywhere",
          "Set up alerts: notifications if key metrics go outside acceptable range",
          "Weekly exec dashboard review: 30 minutes to see everything important",
          "Use BI tools: Tableau, Looker, Metabase, or custom dashboard",
          "Document all processes: SOPs in Trainual or Notion, video walkthroughs",
          "Implement approval workflows: important decisions have clear process",
          "Reduce your working hours to 30/week: proof business runs without constant presence",
          "Quarterly: take 2-week vacation, business runs smoothly without you"
        ],
        engine: 'systems'
      }
    ]
  },

  // ==================== MASTERY STAGE ====================
  {
    id: 'mastery',
    name: 'Mastery',
    range: '$10M+',
    description: 'Exit-ready business running without you, ultimate freedom achieved',
    focus: 'Transition to board chair, build generational wealth, design your legacy',
    builds: [
      {
        name: "The Board Chair",
        outcome: "Transition from CEO to board chair while business thrives without you",
        toDo: [
          "Shift mindset: your job is to coach leaders and set vision, not manage operations",
          "Reduce working hours to 20/week or less: proof business doesn't need you daily",
          "Quarterly board meetings: review strategy, financials, approve major initiatives",
          "Annual strategic planning: 3-day offsite with leadership team to set direction",
          "Focus on 'board-level work': M&A opportunities, capital allocation, market positioning",
          "Understand Business Value = Earnings × Multiple - optimize both",
          "Work with M&A advisor: understand exit options and timeline",
          "Explore: full sale, partial sale, private equity, family succession, or dividend business",
          "Build personal board of advisors: entrepreneurs who've exited, industry experts",
          "Your legacy: what impact do you want this business to have?",
          "Mentor next-generation leaders: prepare them to run without you",
          "Work on identity transition: who are you beyond 'business owner'?"
        ],
        engine: 'leadership'
      },
      {
        name: "The Succession Plan",
        outcome: "Create a business that can be sold or passed on at maximum value",
        toDo: [
          "Complete corporate cleanliness audit: legal, financial, operational",
          "Organize all documents in data room: contracts, financials, IP, processes",
          "Get financials audited or reviewed by CPA firm",
          "Ensure all IP is properly protected: trademarks, copyrights, patents",
          "Customer concentration analysis: no customer > 10-15% of revenue",
          "Build management bench: leadership team that doesn't need you",
          "Create comprehensive operating manual: someone could run this business with your playbook",
          "Document institutional knowledge: everything written, videoed, accessible",
          "Install governance structure: board of directors/advisors, clear decision-making",
          "Work with tax attorney and wealth advisor: structure for optimal tax outcome",
          "Consider holding company structure: separate operating company from IP/real estate",
          "Get professional valuation: understand what your business is worth today"
        ],
        engine: 'deliver'
      },
      {
        name: "Marketplace Domination",
        outcome: "Become the undisputed category leader in your market",
        toDo: [
          "Build multi-channel attraction: SEO, paid ads, partnerships, content, PR, events",
          "Hire dedicated marketing team: CMO, content, paid ads, brand, events",
          "Launch signature annual event: industry conference, summit, or awards",
          "Create industry certification or training program: set the standard",
          "Publish research and thought leadership: become the data source for your industry",
          "Build strategic partnerships with major brands: co-marketing, integration partners",
          "Consider acquisition: buy competitors or complementary businesses",
          "Expand into adjacent markets: new geographies, verticals, or services",
          "Build ecosystem: partners, resellers, affiliates amplify your reach",
          "Track share of voice: are you the most talked-about brand in your category?",
          "Invest in brand: premium positioning, world-class design, consistent experience",
          "Your marketing budget: 10-15% of revenue for aggressive growth"
        ],
        engine: 'attract'
      },
      {
        name: "The Sales Machine",
        outcome: "Build a world-class sales organization that predictably closes enterprise deals",
        toDo: [
          "Build full sales org: VP Sales, sales managers, SDRs, AEs, SEs, CSMs",
          "Segment sales by deal size: SMB (self-serve), mid-market (AEs), enterprise (strategic)",
          "Implement enterprise sales process: multi-stakeholder, longer cycles, custom solutions",
          "Use sales tech stack: CRM, conversation intelligence, sales enablement, forecasting",
          "Build sales playbook for each segment: different processes for different deal sizes",
          "Create sales compensation plans that drive right behaviors at each level",
          "Weekly pipeline reviews: accurate forecasting, deal progression, risk identification",
          "Monthly sales QBRs: review performance, adjust strategy, solve systemic issues",
          "Invest in sales enablement: dedicated team creating content, training, tools",
          "Track: win rate, deal velocity, average contract value, sales efficiency (CAC ratio)",
          "Build strategic sales: you close 5-10 biggest deals/year, team handles rest",
          "Your sales team should drive 80%+ of revenue without your involvement"
        ],
        engine: 'convert'
      },
      {
        name: "The Flywheel",
        outcome: "Create self-reinforcing cycle where happy clients drive growth",
        toDo: [
          "Optimize every touchpoint in client journey: remove friction, add value",
          "Track NPS quarterly: goal is 50+ (world-class)",
          "Build customer community: exclusive network, events, peer connections",
          "Create executive sponsor program: leaders build relationships with top accounts",
          "Implement success metrics: track client outcomes, not just your activities",
          "Build expansion engine: 20-30% revenue from existing clients (upsell, cross-sell)",
          "Automate customer success: AI chatbots, self-service portal, proactive monitoring",
          "Create referral flywheel: make it easy and rewarding to refer",
          "Host annual user conference: celebrate clients, share roadmap, build community",
          "Publish client success stories: case studies, videos, testimonials",
          "Track flywheel metrics: retention rate, expansion revenue, referral rate, NPS",
          "Goal: net revenue retention > 110% (grow revenue from existing customers)"
        ],
        engine: 'deliver'
      },
      {
        name: "Culture & Legacy",
        outcome: "Build an organization that attracts top talent and creates lasting impact",
        toDo: [
          "Codify company culture: values, behaviors, stories that define 'how we work here'",
          "Build employer brand: recognized as top place to work in your industry/region",
          "Apply for 'Best Places to Work' awards: external validation attracts talent",
          "Create comprehensive benefits: competitive salary, equity, health, learning, flexibility",
          "Build learning organization: training budgets, conferences, mentorship, career paths",
          "Implement employee stock ownership plan (ESOP) or profit-sharing: everyone wins",
          "Create leadership development program: grow your own leaders",
          "Build diversity, equity, inclusion initiatives: diverse teams outperform",
          "Host company-wide events: quarterly all-hands, annual retreat, celebration events",
          "Track employee metrics: retention, satisfaction, engagement, internal mobility",
          "Create alumni network: stay connected with people who leave",
          "Your legacy: the leaders you developed, the culture you built, the impact you made"
        ],
        engine: 'people'
      },
      {
        name: "Generational Wealth",
        outcome: "Build wealth that supports your family for generations",
        toDo: [
          "Work with wealth advisor and estate attorney: comprehensive wealth plan",
          "Diversify wealth beyond business: don't keep all eggs in operating company",
          "Build investment portfolio: index funds, real estate, private equity, alternatives",
          "Consider family office: if net worth > $20M, centralized wealth management",
          "Create estate plan: wills, trusts, wealth transfer to next generation",
          "Tax optimization: legal strategies to minimize taxes on exit and wealth transfer",
          "Plan liquidity event: full sale, partial sale, recapitalization, or ongoing distributions",
          "Set up charitable giving: donor-advised fund, foundation, or legacy giving",
          "Financial education for family: teach kids about wealth stewardship",
          "Create family governance: family meetings, communication, values alignment",
          "Protect wealth: asset protection structures, insurance, risk management",
          "Your Freedom Number achieved: business funds ideal lifestyle + wealth compounds"
        ],
        engine: 'finance'
      },
      {
        name: "Ultimate Freedom",
        outcome: "Design your life exactly how you want it with complete time freedom",
        toDo: [
          "Reduce to 10-20 hours/week: only highest-value activities (or retire completely)",
          "Your role: vision, strategy, key relationships, coaching leaders - that's it",
          "Take extended time off: 4-6 week trips, business runs perfectly without you",
          "Pursue passion projects: write a book, start a podcast, angel invest, serve on boards",
          "Explore portfolio career: board positions, advisory roles, speaking, teaching",
          "Mentor next-generation entrepreneurs: give back, create impact beyond your business",
          "Invest in other businesses: angel investing, venture capital, buy other companies",
          "Create content and thought leadership: share your journey and lessons",
          "Build personal brand: separate from your business, focus on your expertise",
          "Join CEO peer groups: Vistage, EO, YPO - stay sharp, give back",
          "Work on identity: who are you beyond business owner? What's your next chapter?",
          "Your calendar: filled with choices, not obligations - complete autonomy over your time"
        ],
        engine: 'time'
      }
    ]
  }
]

// Helper functions to get data
export const getStageById = (stageId: string): StageData | undefined => {
  return STAGES.find(stage => stage.id === stageId)
}

export const getEngineById = (engineId: string): EngineData | undefined => {
  return ENGINES.find(engine => engine.id === engineId)
}

export const getBuildsByEngine = (stageId: string, engineId: string): RoadmapBuild[] => {
  const stage = getStageById(stageId)
  if (!stage) return []
  return stage.builds.filter(build => build.engine === engineId)
}

export const getAllBuildsByEngine = (engineId: string): RoadmapBuild[] => {
  return STAGES.flatMap(stage =>
    stage.builds.filter(build => build.engine === engineId)
  )
}
