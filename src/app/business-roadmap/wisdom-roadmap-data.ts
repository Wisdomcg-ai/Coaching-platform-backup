/**
 * THE WISDOM ROADMAP - Complete Build Data
 * Author: Matt Malouf
 * Company: Wisdom
 *
 * 144 Total Builds: 8 Engines × 6 Stages × 3 Priorities Each
 * Each build follows the 6-part Wisdom Build Format
 */

export interface WisdomBuild {
  name: string // Asset name (e.g., "The Customer Magnet")
  description: string // One-line summary
  whatYoullHave: string // The exact deliverable
  howToBuild: string[] // 3-5 specific steps
  timeInvestment: string // Hours/days to complete
  successMetric: string // How you know it's working
  resultItProduces: string // The measurable outcome
  authorityReference?: string // Which expert frameworks this synthesizes
}

export interface StageBuilds {
  [key: string]: WisdomBuild[]
}

export interface EngineData {
  id: string
  name: string
  subtitle: string
  description: string // What this machine does
  stages: StageBuilds
  metrics: string[] // Key outputs this machine produces
}

// ====================
// FOUNDATION STAGE ($0-250K)
// ====================

export const WISDOM_ROADMAP_DATA: EngineData[] = [
  // ENGINE 1: ATTRACTION MACHINE
  {
    id: 'attract',
    name: 'The Attraction Machine',
    subtitle: 'Marketing & Lead Generation',
    description: 'Generates qualified leads predictably without you',
    metrics: ['Weekly qualified leads', 'Cost per lead', 'Lead-to-opportunity conversion', 'Predictable pipeline'],
    stages: {
      foundation: [
        {
          name: 'The Customer Magnet',
          description: 'Build Your Ideal Customer Profile',
          whatYoullHave: 'One-page document with photo, demographics, pain points, buying triggers, and objections - complete picture of your perfect customer',
          howToBuild: [
            'Schedule 30-minute interviews with your 3 best customers (highest revenue, lowest headache)',
            'Ask each: What problem were you facing? Why did you choose us? What almost stopped you from buying?',
            'Find patterns across all 3 interviews - what they have in common',
            'Create composite profile with fictional name, photo (stock image), and backstory',
            'Put on wall where you see it daily; share with anyone who touches customers'
          ],
          timeInvestment: '4 hours total (3 hours interviews, 1 hour creating document)',
          successMetric: 'You can describe your ideal customer in 60 seconds without notes; team can identify them in conversations',
          resultItProduces: '50% reduction in time wasted on wrong prospects; marketing messages that resonate; sales conversations that close faster',
          authorityReference: 'Synthesizes Dean Jackson\'s "Before Unit", Jay Abraham\'s "Strategy of Preeminence", and Dan Kennedy\'s "Magnetic Marketing"'
        },
        {
          name: 'The One Channel',
          description: 'Pick ONE lead source and make it work',
          whatYoullHave: 'Single lead generation channel producing 5-10 qualified leads per month consistently',
          howToBuild: [
            'List where your ideal customers spend time (LinkedIn, Google, referrals, networking, industry groups, etc.)',
            'Pick the ONE channel where you have best access and credibility',
            'Commit to 5 specific activities per week in that channel for 90 days (e.g., 5 LinkedIn posts, 5 networking conversations)',
            'Track every lead: source, date, outcome in simple spreadsheet',
            'After 90 days: if it\'s working, double down. If not, pick different channel and repeat.'
          ],
          timeInvestment: '1 hour/week for 12 weeks',
          successMetric: 'Generating minimum 5 qualified leads per month from this one source',
          resultItProduces: 'Predictable lead flow; confidence in your ability to generate business; foundation to build on',
          authorityReference: 'Based on Dan Kennedy\'s "Herd Strategy" and Ryan Deiss\'s "Traffic Temperature" framework'
        },
        {
          name: 'The 60-Second Story',
          description: 'Perfect your elevator pitch',
          whatYoullHave: 'Memorized 60-second pitch that makes people say "tell me more" instead of "that\'s nice"',
          howToBuild: [
            'Write down: Who you serve + Problem you solve + How you\'re different (not better, DIFFERENT)',
            'Record yourself delivering it. Listen back. Does it sound like a real human? If no, rewrite.',
            'Test on 10 people (not customers). Ask: "Is it clear what I do and who I help?" Refine based on feedback.',
            'Practice delivering it 20 times until it feels natural, not rehearsed',
            'Use it everywhere: networking, website, sales calls, LinkedIn, casual conversations'
          ],
          timeInvestment: '3 hours to write and perfect',
          successMetric: 'When you say it, people ask questions instead of changing the subject',
          resultItProduces: 'Networking converts to conversations, conversations convert to leads, you sound confident not desperate',
          authorityReference: 'Synthesizes Donald Miller\'s StoryBrand framework and Simon Sinek\'s "Start With Why"'
        }
      ],
      traction: [
        {
          name: 'The Lead Magnet',
          description: 'Create free resource that attracts ideal customers 24/7',
          whatYoullHave: 'Downloadable guide, checklist, or video that solves ONE specific problem your ideal customer has',
          howToBuild: [
            'Identify the #1 question prospects ask before they buy (if you don\'t know, ask last 5 customers)',
            'Create answer in format they\'ll consume (PDF guide, video, checklist, worksheet) - keep it under 10 pages or 10 minutes',
            'Set up landing page with headline: "Get the [Name] that helps you [Result]" - use Leadpages, Unbounce, or simple website page',
            'Gate it with email capture (name + email minimum)',
            'Promote on your One Channel for 30 days, track downloads'
          ],
          timeInvestment: '8 hours to create initial version',
          successMetric: '20-50 new email subscribers per month',
          resultItProduces: 'Leads generated while you sleep; email list growing automatically; authority positioning',
          authorityReference: 'Based on Russell Brunson\'s "Lead Magnet" framework and Frank Kern\'s "Give Value First" principle'
        },
        {
          name: 'The Follow-Up Sequence',
          description: 'Build 7-email automation that nurtures leads to sales calls',
          whatYoullHave: 'Automated email sequence that runs in your CRM/email system and books sales conversations',
          howToBuild: [
            'Write 7 emails: Day 0 (deliver lead magnet + welcome), Day 2 (education piece), Day 5 (customer success story), Day 7 (make your offer), Day 10 (objection handler), Day 14 (last chance), Day 21 (break-up email)',
            'Set up in email system (Mailchimp, ConvertKit, ActiveCampaign, or HubSpot free)',
            'Each email has ONE goal: click link to book call or reply',
            'Test with first 50 subscribers, track open rates (target 40%+) and click rates (target 10%+)',
            'Refine emails that underperform, keep testing'
          ],
          timeInvestment: '6 hours to write and setup',
          successMetric: '10-20% of leads book sales call within 14 days',
          resultItProduces: 'Systematic lead nurture; sales calls booked automatically; leverage your time',
          authorityReference: 'Synthesizes Russell Brunson\'s "Soap Opera Sequence" and Ben Settle\'s "Email Players" method'
        },
        {
          name: 'The Referral Request System',
          description: 'Build process that turns customers into referral machines',
          whatYoullHave: 'Scripted process and tracking system that generates referrals systematically',
          howToBuild: [
            'Identify the moment customer gets their first win/result (this is when they\'re most excited)',
            'Create trigger: when they hit this milestone, you or assistant asks: "Who else do you know facing [problem]?"',
            'Write script: "You just got [result]. That\'s awesome. Who else comes to mind who could use this? I\'d love to help them like I helped you."',
            'Make it easy: send them a pre-written intro email they can forward, or send email directly if they give you name/email',
            'Track in spreadsheet: Customer name, referral name, date asked, outcome',
            'Thank them immediately when referral converts'
          ],
          timeInvestment: '3 hours to create script and tracking',
          successMetric: '30% of customers refer at least 1 person within 90 days',
          resultItProduces: 'Referrals become predictable channel; best customers send you more best customers; lower acquisition cost',
          authorityReference: 'Based on John Jantsch\'s "Duct Tape Marketing" referral system and Jay Abraham\'s "Host-Beneficiary" relationships'
        }
      ],
      scaling: [
        {
          name: 'The Marketing Team Blueprint',
          description: 'Hire and train first marketing person',
          whatYoullHave: 'Job description, hiring process, training checklist, and first marketing hire executing your lead generation',
          howToBuild: [
            'Document your current marketing process: what you do daily/weekly, tools you use, results you track',
            'Write 1-page job description: "You\'ll own [tasks]. Success = [X leads/month]. Reports to [you]. Works [hours]. Pays [$amount]."',
            'Post on Indeed/LinkedIn, interview 5+ candidates, test top 2 with paid trial project (1 week, $500)',
            'Hire best performer, train using your documented process for 2 weeks (shadow, then do with you watching, then solo)',
            'Weekly 1-on-1: Review numbers (leads, cost, quality), what worked, what to test next'
          ],
          timeInvestment: '20 hours to hire + 10 hours to train',
          successMetric: 'Marketing hire generates same lead volume you did, freeing 10+ hours/week',
          resultItProduces: 'You\'re out of lead generation execution; marketing runs without you; time freed for sales/strategy',
          authorityReference: 'Adapts Gino Wickman\'s EOS "Right Person, Right Seat" and Who by Geoff Smart\'s "A Method for Hiring"'
        },
        {
          name: 'The Multi-Channel Orchestration',
          description: 'Run 3-4 channels simultaneously',
          whatYoullHave: 'Marketing calendar showing which channels run when, who owns each, and combined lead targets',
          howToBuild: [
            'Start with your proven channels (1-2 that already work), add 1-2 new ones to test',
            'Assign owner to each channel (you, marketing hire, VA, or outsourced)',
            'Create monthly calendar: which content/activities happen when across all channels',
            'Set lead targets per channel (e.g., referrals: 10/month, LinkedIn: 15/month, partnerships: 5/month)',
            'Weekly team meeting: review each channel\'s performance, kill what\'s not working, scale what is'
          ],
          timeInvestment: '4 hours to build calendar and assign ownership',
          successMetric: '3+ channels each producing minimum 10 qualified leads/month',
          resultItProduces: 'Diversified lead sources; predictable 50+ leads/month; insulation from any single channel drying up',
          authorityReference: 'Synthesizes Ryan Deiss\'s "Customer Value Optimization" and Aaron Ross\'s "Predictable Revenue"'
        },
        {
          name: 'The Content Engine',
          description: 'Build system that creates authority content at scale',
          whatYoullHave: 'Content production system that publishes 12+ pieces per month building your authority',
          howToBuild: [
            'Pick ONE content format you\'ll own (blog, podcast, video, LinkedIn posts, etc.)',
            'Create production process: 1) Batch create (record 4 episodes in one day), 2) Edit/polish, 3) Publish on schedule, 4) Promote',
            'Hire help for editing/posting (Upwork, Fiverr, or VA for $15-25/hour)',
            'Build content calendar 90 days out: topics, publish dates, promotion plan',
            'Repurpose everything: 1 video = 5 LinkedIn posts = 1 blog article = 10 tweets'
          ],
          timeInvestment: '2 hours/week creating content (after system built)',
          successMetric: 'Publishing 12+ pieces/month; inbound leads mention your content; seen as authority',
          resultItProduces: 'Authority positioning; inbound leads from content discovery; compounding SEO/discoverability',
          authorityReference: 'Based on Gary Vaynerchuk\'s "Content Model" and Joe Pulizzi\'s "Content Inc."'
        }
      ],
      optimization: [
        {
          name: 'The Data Dashboard',
          description: 'Build analytics system that optimizes every dollar',
          whatYoullHave: 'Dashboard showing: spend by channel, leads by channel, cost per lead, lead-to-customer rate, customer acquisition cost (CAC), lifetime value (LTV)',
          howToBuild: [
            'List all marketing channels and monthly spend on each',
            'Tag every lead with source (where they came from) in your CRM',
            'Build simple spreadsheet or use tool (Google Data Studio, Databox): Channel | Spend | Leads | Cost/Lead | Customers | CAC',
            'Review monthly: Kill channels where CAC > LTV/3. Double budget on channels where CAC < LTV/6.',
            'Set up weekly review ritual: every Monday 9am, review dashboard, make one optimization decision'
          ],
          timeInvestment: '6 hours to build initial dashboard',
          successMetric: 'Marketing ROI improves 20%+ in 90 days by killing losers and scaling winners',
          resultItProduces: 'Every marketing dollar working harder; data-driven decisions; confidence in spend',
          authorityReference: 'Synthesizes Keith Cunningham\'s "4D Thinking" and Lean Analytics by Alistair Croll'
        },
        {
          name: 'The Authority Position',
          description: 'Become THE known expert in your category',
          whatYoullHave: 'Speaking engagements, published articles, podcast appearances, and industry recognition that position you as the go-to expert',
          howToBuild: [
            'Define your category niche: "THE [descriptor] expert for [who]" (e.g., "THE pricing expert for service businesses")',
            'Create signature talk (20-30 min presentation) with your best insights + case studies',
            'Pitch to speak at: industry conferences, trade associations, virtual summits, podcasts (target 12 in next 12 months)',
            'Write and publish: guest articles for industry publications, LinkedIn articles, contribute to relevant media',
            'Collect proof: testimonials, logos, "as seen in" badges for website'
          ],
          timeInvestment: '8 hours to create signature content + 2 hours/month pitching',
          successMetric: 'Speaking/featured 12+ times per year; prospects say "I\'ve heard of you" when you meet',
          resultItProduces: 'Inbound leads from authority; ability to charge premium prices; trust established before first conversation',
          authorityReference: 'Based on Dan Kennedy\'s "Magnetic Marketing" and Jay Baer\'s "Youtility"'
        },
        {
          name: 'The Partnership Flywheel',
          description: 'Build relationships that feed your pipeline',
          whatYoullHave: '5-10 active partnerships with complementary businesses sending you qualified referrals monthly',
          howToBuild: [
            'List 20 businesses that serve your ideal customer but don\'t compete (e.g., if you\'re CPA, partner with attorneys, financial advisors, bankers)',
            'Reach out to top 10 with value-first offer: "I\'d love to refer my clients to you. Can we grab coffee?"',
            'In meeting: learn their ideal customer, offer to send referrals first (be a giver)',
            'After you\'ve sent them 3-5 referrals, propose formal partnership: "Let\'s make this systematic. Here\'s how we both win..."',
            'Track in CRM: partner name, referrals sent, referrals received, revenue generated'
          ],
          timeInvestment: '1 hour/week for 12 weeks to build relationships',
          successMetric: '5 active partners each sending 2-5 referrals per month',
          resultItProduces: 'Warm lead channel; trusted referrals that close faster; diversified lead sources',
          authorityReference: 'Jay Abraham\'s "Host-Beneficiary Relationships" and Bob Burg\'s "Endless Referrals"'
        }
      ],
      leadership: [
        {
          name: 'The Thought Leadership Platform',
          description: 'Lead industry conversations through speaking, writing, and media',
          whatYoullHave: 'Regular speaking circuit, published author status, media appearances, and recognized industry voice',
          howToBuild: [
            'Write your "point of view" (POV): What\'s broken in your industry? What should change? What do you stand for?',
            'Create hero content: write book (or self-publish guide), launch podcast, create video series - pick ONE major project',
            'Build media list: 50 podcasts, publications, conferences where your ideal customers consume content',
            'Systematize outreach: 5 pitches per week to speak/contribute (hire VA to help with logistics)',
            'Track: speaking gigs, media mentions, content published - goal: 50+ "brand impressions" per year'
          ],
          timeInvestment: '4 hours/week on thought leadership activities',
          successMetric: 'Known as "the [category] person"; inbound speaking requests; media seeking your opinion',
          resultItProduces: 'Premium positioning; inbound leads from authority; ability to command top-tier pricing',
          authorityReference: 'Based on Dorie Clark\'s "Entrepreneurial You" and Daniel Priestley\'s "Key Person of Influence"'
        },
        {
          name: 'The Magnet Brand',
          description: 'Build brand that attracts customers without outbound',
          whatYoullHave: 'Brand known for specific outcomes; customers come to you vs. you hunting them; waiting list or high inbound volume',
          howToBuild: [
            'Define your brand promise: "When you work with us, you get [specific outcome]" - make it measurable and remarkable',
            'Document 10 customer success stories with numbers: "[Customer] achieved [result] in [time] using our [method]"',
            'Build content around this: every piece of content reinforces the same promise and provides proof',
            'Create community: Facebook group, LinkedIn community, or email list where customers gather and create word-of-mouth',
            'Systematize proof collection: ask every customer for case study, testimonial video, or before/after data'
          ],
          timeInvestment: '10 hours to build brand foundation + ongoing content',
          successMetric: '50%+ of new leads are inbound (they found you vs. you finding them)',
          resultItProduces: 'Inverted marketing (pull vs. push); sales become easier; premium pricing justified',
          authorityReference: 'Synthesizes Al Ries\'s "Positioning" and Seth Godin\'s "Purple Cow"'
        },
        {
          name: 'The Strategic Alliance Network',
          description: 'Create partnerships that amplify reach exponentially',
          whatYoullHave: 'Joint ventures, co-marketing agreements, and strategic partnerships with larger/complementary brands',
          howToBuild: [
            'Identify 10 "whale" partners: businesses with your ideal customers at scale (e.g., if you sell to doctors, partner with medical associations)',
            'Create alliance offer: "What if we [joint webinar / co-created content / bundled service] that serves both our customers?"',
            'Pitch win-win: "You get [value for their customers]. We get [exposure]. Both of us win."',
            'Start small: pilot project first (one webinar, one event, one promotion)',
            'If it works, formalize: partnership agreement, regular cadence, revenue sharing if applicable'
          ],
          timeInvestment: '20 hours to build first major alliance',
          successMetric: 'Strategic partnerships driving 20%+ of new customer volume',
          resultItProduces: 'Access to larger audiences; credibility through association; exponential reach without exponential cost',
          authorityReference: 'Jay Abraham\'s "Exponential Growth Strategies" and Breakthrough Advertising principles'
        }
      ],
      mastery: [
        {
          name: 'The Category King Strategy',
          description: 'Own your category through brand dominance',
          whatYoullHave: 'Category leadership position where you\'re the default choice; competitors compared to you',
          howToBuild: [
            'Define (or create) your category: if you can\'t dominate existing category, create new one (e.g., not "CRM" but "CRM for real estate investors")',
            'Build category content: publish definitive guides, research reports, annual surveys that define the category',
            'Own category keywords: SEO dominance, paid search dominance, branded search volume growing',
            'Create barriers: proprietary methodology, certification program, technology platform others can\'t replicate',
            'Measure share of voice: track brand mentions vs. competitors; goal is 3:1 ratio or better'
          ],
          timeInvestment: '6-12 months strategic initiative',
          successMetric: 'Mentioned in same breath as category leaders; press covers you when writing about category',
          resultItProduces: 'Premium pricing power; first-mover advantage; competitors fight for scraps',
          authorityReference: 'Based on "Play Bigger" by Al Ramadan and "The 22 Immutable Laws of Marketing"'
        },
        {
          name: 'The Platform Infrastructure',
          description: 'Build marketing systems that scale infinitely',
          whatYoullHave: 'Technology platform, brand assets, and systems that can scale to any market size',
          howToBuild: [
            'Build marketing tech stack: CRM (HubSpot/Salesforce), marketing automation, analytics, content management - fully integrated',
            'Create brand playbook: positioning, messaging, visual identity, content templates - anyone can execute consistently',
            'Build content library: 100+ pieces of evergreen content that can be deployed in any market',
            'Systematize launches: playbook for entering new market/vertical (90-day plan that\'s repeatable)',
            'Train marketing team to run playbook without you - document everything, test with new market launch'
          ],
          timeInvestment: '3-6 months to build foundational infrastructure',
          successMetric: 'Can enter new market and achieve traction in 90 days using existing playbook',
          resultItProduces: 'Scalability without chaos; consistent brand across markets; acquisition-ready marketing',
          authorityReference: 'Synthesizes Verne Harnish\'s "Scaling Up" and franchising principles from "E-Myth"'
        },
        {
          name: 'The Acquisition Amplifier',
          description: 'Build marketing that integrates and multiplies through acquisitions',
          whatYoullHave: 'Marketing systems and brand that make acquired companies more valuable immediately',
          howToBuild: [
            'Document your marketing playbook: what you do in first 30/60/90 days to generate leads in new market',
            'Create integration checklist: how to rebrand acquired company, migrate to your systems, train their team',
            'Build shared services model: centralized marketing team that serves all portfolio companies',
            'Prove it works: run playbook with one business unit/market, measure lift in performance',
            'Use it as acquisition advantage: "When we acquire you, our marketing will 3x your leads in 90 days"'
          ],
          timeInvestment: '6 months to build and test acquisition playbook',
          successMetric: 'Acquired companies see 2-3x lead volume within 90 days of integration',
          resultItProduces: 'Acquisition synergies realized; platform value multiplier; competitive advantage in M&A',
          authorityReference: 'Based on "Buy Then Build" by Walker Deibel and roll-up strategy frameworks'
        }
      ]
    }
  },

  // ENGINE 2: CONVERSION MACHINE
  {
    id: 'convert',
    name: 'The Conversion Machine',
    subtitle: 'Sales & Conversion',
    description: 'Turns leads into paying customers consistently',
    metrics: ['Conversion rate', 'Average deal size', 'Sales cycle length', 'Monthly revenue'],
    stages: {
      foundation: [
        {
          name: 'Your Money Talk',
          description: 'Master confident pricing conversations',
          whatYoullHave: '1-page pricing sheet with 3 package options and practiced delivery that doesn\'t make you flinch',
          howToBuild: [
            'Calculate your costs: what it actually costs to deliver your service/product',
            'Add your margins: Cost + 30% overhead + 20% profit + what you need to earn per hour = your price',
            'Create 3 tiers: Good ($), Better ($$), Best ($$$) - each 30-50% more than previous',
            'Write pricing sheet: what\'s included in each tier, price clearly stated',
            'Practice delivery 10 times out loud: "Our packages start at $X for [tier 1]..." until numbers don\'t make you uncomfortable'
          ],
          timeInvestment: '3 hours to build + practice',
          successMetric: 'Can state your prices confidently without justifying or apologizing',
          resultItProduces: 'Confident pricing conversations; fewer objections; higher close rate; customers who value your work',
          authorityReference: 'Based on Alan Weiss\'s "Value-Based Fees" and Breakthrough Advertising pricing psychology'
        },
        {
          name: 'The Close Process',
          description: 'Document your repeatable sales steps',
          whatYoullHave: 'Written sales process from lead to close with scripts for each stage',
          howToBuild: [
            'Map your current sales process: 1) First contact, 2) Discovery call, 3) Proposal, 4) Follow-up, 5) Close, 6) Onboarding',
            'Time each stage: how long does each step take? This is your sales cycle.',
            'Write scripts for key moments: How you open discovery call, questions you ask, how you present price, how you handle objections',
            'Create proposal template: Problem, Solution, Investment, Timeline, Next Steps - fill-in-the-blank format',
            'Put it all in Google Doc: "Our Sales Process" - anyone should be able to follow it'
          ],
          timeInvestment: '4 hours to document',
          successMetric: 'Sales cycle time decreases 20%; can hand process to someone else and they can execute',
          resultItProduces: 'Consistent sales results; ability to train others; identified bottlenecks you can improve',
          authorityReference: 'Synthesizes Chet Holmes\'s "Ultimate Sales Machine" and Mike Weinberg\'s "New Sales Simplified"'
        },
        {
          name: 'The Follow-Up Discipline',
          description: 'Never let an opportunity slip away',
          whatYoullHave: 'CRM system tracking every lead with automatic follow-up reminders',
          howToBuild: [
            'Set up free CRM: HubSpot, Streak (Gmail), or Pipedrive - anything that tracks leads and sets reminders',
            'Create follow-up rule: Minimum 5 touches before giving up (call, email, call, email, final call)',
            'Build templates: 3 email templates for different follow-up situations (proposal sent, went quiet, objection raised)',
            'Set reminders: CRM automatically reminds you to follow up every 3 days if no response',
            'Track everything: log every interaction, take notes, track stage of conversation'
          ],
          timeInvestment: '3 hours to set up system',
          successMetric: '0 leads fall through cracks; 20% of "dead" leads come back to life through systematic follow-up',
          resultItProduces: 'Higher conversion rate; no missed opportunities; professional impression; systematic persistence',
          authorityReference: 'Based on Jeb Blount\'s "Fanatical Prospecting" and Aaron Ross\'s "Predictable Revenue"'
        }
      ],
      traction: [
        {
          name: 'The Sales Playbook',
          description: 'Create scripts and tools others can run',
          whatYoullHave: 'Complete sales playbook with scripts, email templates, objection handlers, and proposal templates anyone can use',
          howToBuild: [
            'Record your next 5 sales calls (with permission) - listen for what works',
            'Extract your best language: opening questions, transition phrases, closing statements',
            'Create scripts library: discovery call script, proposal presentation script, objection handling guide (top 10 objections + responses)',
            'Build email templates: first outreach, proposal follow-up, deal closing, staying in touch',
            'Test with colleague or new hire: can they use your playbook and sound natural?'
          ],
          timeInvestment: '8 hours to build complete playbook',
          successMetric: 'Someone else using your playbook closes at 70%+ of your conversion rate',
          resultItProduces: 'Transferable sales process; ability to hire sales help; consistent messaging; faster onboarding',
          authorityReference: 'Based on Chet Holmes\'s "Script Book" and Jordan Belfort\'s "Straight Line System"'
        },
        {
          name: 'The CRM Foundation',
          description: 'Track every lead systematically',
          whatYoullHave: 'CRM system capturing 100% of leads with pipeline stages, automated tasks, and reporting',
          howToBuild: [
            'Choose CRM that fits your needs: HubSpot (free, robust), Pipedrive (simple, visual), Salesforce (powerful, complex)',
            'Set up pipeline stages that match your sales process: Lead → Qualified → Proposal → Negotiation → Closed',
            'Create automation: when lead enters system, trigger email sequence and task reminders',
            'Import all existing leads/customers - clean data as you go',
            'Daily discipline: log every interaction, update stage immediately, review pipeline weekly'
          ],
          timeInvestment: '6 hours setup + 10 min/day maintenance',
          successMetric: '100% of leads tracked; can forecast revenue based on pipeline; nothing falls through cracks',
          resultItProduces: 'Visibility into sales performance; accurate forecasting; data to optimize conversion; professional systems',
          authorityReference: 'Synthesizes Mike Weinberg\'s sales management and "Predictable Revenue" methodologies'
        },
        {
          name: 'Pipeline Visibility',
          description: 'Know exactly what\'s coming and when',
          whatYoullHave: 'Weekly pipeline review showing: total pipeline value, expected close dates, conversion by stage, forecast accuracy',
          howToBuild: [
            'Pull CRM report showing all open opportunities with: prospect name, deal size, stage, expected close date',
            'Calculate total pipeline value (sum of all opportunities)',
            'Apply conversion rates: if you close 20% of proposals, multiply proposal stage value by 20% = likely revenue',
            'Build simple spreadsheet forecast: This month expected revenue, next month, next 90 days',
            'Weekly review every Monday: What closed last week? What moved forward? What stalled? What new came in?'
          ],
          timeInvestment: '2 hours to build + 30 min/week to review',
          successMetric: 'Forecast accuracy within 20%; can predict next quarter revenue with confidence',
          resultItProduces: 'No revenue surprises; proactive pipeline management; identify problems early; confident decision-making',
          authorityReference: 'Based on Aaron Ross\'s "Predictable Revenue" and sales forecasting best practices'
        }
      ],
      scaling: [
        {
          name: 'The Sales Team',
          description: 'Hire and train sales reps who can close like you',
          whatYoullHave: 'Team of 2-4 sales reps generating consistent revenue, with training system and compensation plan',
          howToBuild: [
            'Define your sales process step-by-step: what you do from first call to signed contract',
            'Record yourself on 10 sales calls - identify patterns in what works',
            'Create sales playbook: scripts, objection handlers, qualifying questions, close techniques',
            'Hire first rep: look for hunger + coachable + prior B2B experience, pay $40-60K base + 10% commission',
            'Train 30 days: shadow you on calls, role play, then solo with you listening, weekly coaching',
            'Scale: Once first rep hits quota 3 months straight, hire #2, then #3 using same system'
          ],
          timeInvestment: '40 hours to build system + 20 hours/rep to train',
          successMetric: 'Each rep generating $200K+ annual revenue; you\'re out of daily selling; sales growth without you',
          resultItProduces: 'Scalable revenue; predictable growth; time freedom from selling; leadership role vs. doer',
          authorityReference: 'Based on Aaron Ross\'s "Predictable Revenue" and Chet Holmes\'s "Ultimate Sales Machine"'
        },
        {
          name: 'The Sales Manager',
          description: 'Promote or hire someone to lead sales team',
          whatYoullHave: 'Sales manager running daily operations: coaching reps, running meetings, hitting team numbers',
          howToBuild: [
            'Promote your best rep (if they want leadership) OR hire experienced sales manager',
            'Define their role: coach team, run pipeline meetings, hold reps accountable, hit team quota',
            'Set their comp: $60-80K base + 3-5% of team revenue OR % of growth above last year',
            'Weekly rhythm: Monday pipeline review, daily stand-ups, Friday win celebration + coaching',
            'Give them tools: CRM access, hiring authority, budget for training/travel',
            'Meet weekly: review team metrics, coaching challenges, strategic sales decisions'
          ],
          timeInvestment: '30 hours to recruit + train manager',
          successMetric: 'Sales team runs without you; manager solves 90% of issues; you focus on strategy',
          resultItProduces: 'Removed from sales operations; scalable sales organization; leadership development',
          authorityReference: 'Based on Jack Daly\'s sales leadership model and EOS "Accountability Chart"'
        },
        {
          name: 'The Sales Playbook 2.0',
          description: 'Build advanced sales system with specialization',
          whatYoullHave: 'Specialized sales roles (SDRs, AEs, closers) with documented playbooks for each',
          howToBuild: [
            'Segment sales process: SDR (prospecting/qualifying), AE (discovery/demo), Closer (proposal/negotiation)',
            'Build role-specific playbooks: SDR (call scripts, qualification criteria), AE (demo flow, discovery questions), Closer (pricing authority, negotiation frameworks)',
            'Specialize team: some people prospect, some demo, some close - based on strengths',
            'Create handoff protocols: SDR to AE (what info to pass), AE to Closer (warm handoff script)',
            'Implement sales tech stack: Outreach/Salesloft for SDRs, Gong for call recording, advanced CRM workflows'
          ],
          timeInvestment: '60 hours to build specialized system',
          successMetric: 'Conversion rates improve 30%+; sales cycle shortens; each role optimized',
          resultItProduces: 'Efficient sales machine; higher close rates; scalable to $3M+ revenue',
          authorityReference: 'Based on Predictable Revenue model and enterprise sales specialization'
        }
      ],
      optimization: [
        {
          name: 'The Revenue Operations',
          description: 'Build RevOps function to optimize entire revenue engine',
          whatYoullHave: 'RevOps leader unifying sales, marketing, and customer success with shared metrics and systems',
          howToBuild: [
            'Hire RevOps leader: hybrid of sales ops, marketing ops, and data analytics, pay $100-140K',
            'Define RevOps scope: unified tech stack, data architecture, process optimization, revenue forecasting, cross-team alignment',
            'Implement revenue metrics dashboard: tracking full funnel from marketing to expansion revenue',
            'Optimize handoffs: marketing to sales, sales to delivery, delivery to upsell - eliminate friction',
            'Quarterly revenue review: analyze conversion rates, sales cycle, deal sizes, identify bottlenecks, test improvements'
          ],
          timeInvestment: '80 hours to hire + implement RevOps function',
          successMetric: 'Revenue per employee up 20%+; conversion rates improved across funnel; data-driven revenue decisions',
          resultItProduces: 'Efficient revenue engine; predictable growth; optimized customer journey; competitive advantage',
          authorityReference: 'Based on modern RevOps best practices and SaaS growth optimization'
        },
        {
          name: 'The Win/Loss Analysis',
          description: 'Systematically understand why you win and lose deals',
          whatYoullHave: 'Quarterly win/loss analysis revealing competitive advantages and blind spots',
          howToBuild: [
            'Interview process: hire third-party to interview lost prospects (more honest) and won customers (why they chose you)',
            'Ask key questions: Why did you buy/not buy? How did we compare to competitors? What almost stopped you? What sealed the deal?',
            'Identify patterns: across 20-30 interviews per quarter, what themes emerge?',
            'Act on insights: if losing on price, improve value communication or adjust positioning. If losing on features, prioritize roadmap.',
            'Share learnings: present to sales team, adjust playbooks, update marketing messaging',
            'Track trends: are we winning more over time? Losing less? How is competitive landscape shifting?'
          ],
          timeInvestment: '15 hours per quarter',
          successMetric: 'Win rate improves 10%+ from insights; competitive positioning sharpened; fewer losses to same objections',
          resultItProduces: 'Competitive intelligence; better positioning; higher win rates; strategic product/marketing decisions',
          authorityReference: 'Based on Clozd win/loss analysis methodology and competitive intelligence'
        },
        {
          name: 'The Sales Comp Optimization',
          description: 'Design compensation plan that drives desired behaviors',
          whatYoullHave: 'Comp plan that incentivizes right activities, attracts top talent, and drives profitable growth',
          howToBuild: [
            'Audit current comp: what behaviors does it drive? Are reps hitting quota? Is it competitive with market?',
            'Define desired behaviors: new logo acquisition, expansion revenue, retention, deal profitability, etc.',
            'Design comp structure: base/commission split, accelerators for over-quota, SPIFs for strategic priorities',
            'Benchmark market: use comp surveys to ensure you\'re competitive for the talent you want',
            'Model scenarios: how much will top/average/bottom performers make? Is it sustainable for company?',
            'Test and iterate: roll out to team, gather feedback, adjust quarterly based on results'
          ],
          timeInvestment: '30 hours to design and implement new comp plan',
          successMetric: 'Attracting better sales talent; reps focused on right activities; profitable growth; retention of top performers',
          resultItProduces: 'Aligned incentives; motivated sales team; predictable revenue; sustainable comp spend',
          authorityReference: 'Based on SaaS sales compensation best practices and behavioral economics'
        }
      ],
      leadership: [
        {
          name: 'The Enterprise Sales Motion',
          description: 'Build capability to close $100K+ enterprise deals',
          whatYoullHave: 'Enterprise sales process with multi-threading, executive sponsorship, and 6-12 month deal cycles',
          howToBuild: [
            'Define ICP for enterprise: $50M+ companies, 500+ employees, budget authority, strategic fit',
            'Build enterprise team: experienced AE ($120K+ base), sales engineer, customer success lead for implementation',
            'Multi-threading strategy: map org chart, build relationships at multiple levels (user, manager, VP, C-level)',
            'Create executive narrative: business case template, ROI calculator, competitive analysis, risk mitigation',
            'Pilot first: smaller engagement (3-6 months) to prove value before expanding company-wide',
            'Implementation planning: detailed rollout plan, change management, training program, success metrics'
          ],
          timeInvestment: '6 months to build enterprise capability and close first deal',
          successMetric: '3-5 enterprise deals closed annually; average deal size $100K+; 18-month LTV of $300K+',
          resultItProduces: 'Larger deal sizes; more stable revenue; strategic customer relationships; competitive moat',
          authorityReference: 'Based on Jill Konrath\'s "Selling to Big Companies" and enterprise sales methodologies'
        },
        {
          name: 'The Strategic Partnerships',
          description: 'Build channel partnerships that generate 30%+ of revenue',
          whatYoullHave: 'Network of 5-10 strategic partners referring qualified leads and co-selling',
          howToBuild: [
            'Identify ideal partners: complementary services, same ICP, trusted in your market (e.g., consulting firms, agencies, technology platforms)',
            'Create partner program: referral fees (10-20%), co-marketing support, joint sales calls, partner portal with resources',
            'Recruit partners: personal outreach to 20 targets, pilot with 3-5, formalize agreements',
            'Enable partners: training on your solution, sales collateral, case studies, demo environment, dedicated partner manager',
            'Co-selling motion: joint account planning, shared pipeline, quarterly business reviews',
            'Incentivize success: tiered program (bronze/silver/gold) based on revenue generated, exclusive benefits'
          ],
          timeInvestment: '80 hours to build program + ongoing partner management',
          successMetric: 'Partners driving 30%+ of new revenue; 3-5 active partners; referral close rate 40%+',
          resultItProduces: 'Scalable lead generation; lower CAC; credibility through association; geographic/vertical expansion',
          authorityReference: 'Based on channel partnerships best practices and "The Partnership Economy"'
        },
        {
          name: 'The Sales Analytics Engine',
          description: 'Build data infrastructure for sales insights and forecasting',
          whatYoullHave: 'Executive sales dashboard with predictive analytics, cohort analysis, and AI-driven insights',
          howToBuild: [
            'Centralize data: integrate CRM, marketing automation, product usage, customer success, financial systems',
            'Build executive dashboard: revenue attainment, pipeline coverage (3:1 ratio), win rates by segment, sales cycle trends, rep productivity',
            'Predictive analytics: machine learning models to forecast close likelihood, identify at-risk deals, recommend next actions',
            'Cohort analysis: track performance by industry, company size, use case, sales rep, quarter to identify patterns',
            'Weekly sales review with data: CFO, CRO, and CEO reviewing dashboard, making data-driven decisions',
            'Continuous improvement: A/B test sales approaches, measure impact, scale what works'
          ],
          timeInvestment: '120 hours to build analytics infrastructure',
          successMetric: 'Forecast accuracy 90%+; data-driven sales decisions; 20% improvement in key metrics annually',
          resultItProduces: 'Strategic sales intelligence; accurate forecasting; optimized sales motions; board-ready metrics',
          authorityReference: 'Based on modern sales operations and predictive analytics best practices'
        }
      ],
      mastery: [
        {
          name: 'The Global Sales Organization',
          description: 'Build sales capability across multiple regions and countries',
          whatYoullHave: 'Global sales organization with regional leaders, localized sales motions, and unified systems',
          howToBuild: [
            'Regional structure: North America, Europe, APAC - each with VP of Sales owning region',
            'Localize sales approach: adapt messaging, pricing, sales process to cultural norms and buying behaviors',
            'Hire regional leaders: local expertise, proven sales leadership, entrepreneurial, can build teams, $150-250K + equity',
            'Unified sales platform: global CRM, standardized processes, shared best practices, consolidated reporting',
            'Global sales enablement: centralized training, content, tools adapted for regional use',
            'Annual sales summit: bring global sales team together, share wins, align on strategy, build culture',
            'Regional P&Ls: each region accountable for growth targets, track contribution to global revenue'
          ],
          timeInvestment: '18 months to build global sales capability',
          successMetric: '40%+ revenue from international; 3+ regional sales leaders; consistent processes globally; $20M+ ARR',
          resultItProduces: 'Global market coverage; diversified revenue; local expertise; scalable to $50M+',
          authorityReference: 'Based on global sales organization design and international expansion frameworks'
        },
        {
          name: 'The Sales Transformation',
          description: 'Fundamentally reshape sales model for next growth phase',
          whatYoullHave: 'Transformed sales organization optimized for enterprise, digital channels, or new business model',
          howToBuild: [
            'Assess transformation need: moving upmarket? Adding product-led growth? New channel strategy? Geographic expansion?',
            'Engage transformation consultants: McKinsey, Bain, or sales-focused firms for outside perspective and expertise',
            'Redesign sales model: organizational structure, compensation, processes, tech stack, talent profiles',
            'Build transformation roadmap: 12-18 month plan with clear milestones and success metrics',
            'Execute systematically: pilot with one team/region, prove model, then scale company-wide',
            'Change management: communicate why, train organization, celebrate early wins, address resistance',
            'Measure impact: revenue growth, productivity per rep, win rates, sales cycle, customer acquisition cost'
          ],
          timeInvestment: '12-18 months transformation investment',
          successMetric: 'Sales productivity up 30%+; win new market segment; achieve $30M+ revenue; new growth trajectory',
          resultItProduces: 'Repositioned for growth; competitive advantage; scalable to $100M; acquisition premium',
          authorityReference: 'Based on sales transformation methodologies and organizational change management'
        },
        {
          name: 'The Revenue Infrastructure',
          description: 'Build world-class revenue operations and systems',
          whatYoullHave: 'Enterprise-grade revenue infrastructure with advanced analytics, automation, and AI',
          howToBuild: [
            'Hire CRO: owns all revenue (marketing, sales, CS), seasoned executive, proven at scale, $250-400K + equity',
            'Build RevOps team: 5-8 people (data analysts, systems admins, process experts, project managers)',
            'Enterprise tech stack: Salesforce, Outreach/Salesloft, Gong, 6sense, Clari, complete integration',
            'Revenue intelligence: AI-powered insights on deal risk, pipeline health, rep coaching, forecasting',
            'Automation everywhere: lead routing, proposal generation, contract execution, renewals, upsells',
            'Revenue science: experimentation culture, A/B testing sales approaches, data-driven decisions',
            'Continuous optimization: quarterly business reviews analyzing entire revenue engine, implementing improvements'
          ],
          timeInvestment: '$2-5M investment in people and systems',
          successMetric: 'Revenue per employee $500K+; 95% forecast accuracy; sales cycle reduced 30%; CAC payback <12 months',
          resultItProduces: 'Efficient revenue machine; predictable growth; competitive moat; public-company-ready',
          authorityReference: 'Based on enterprise revenue operations and modern sales tech stack best practices'
        }
      ]
    }
  },

  // ENGINE 3: DELIVERY MACHINE
  {
    id: 'deliver-cx',
    name: 'The Delivery Machine',
    subtitle: 'Customer Experience',
    description: 'Delivers exceptional results that create loyal, referring customers',
    metrics: ['Customer satisfaction (NPS)', 'Retention rate', 'Expansion revenue', 'Referrals generated'],
    stages: {
      foundation: [
        {
          name: 'The Service Promise',
          description: 'Define what great delivery looks like',
          whatYoullHave: '1-page document defining your service standards: what customers can expect, what great looks like, what you guarantee',
          howToBuild: [
            'List the 5-10 things that matter most to your customers (on-time delivery, responsiveness, quality, etc.)',
            'For each, define your standard: "We respond within X hours", "We deliver by X date", "Our work includes Y"',
            'Write your guarantee: "If we don\'t deliver [standard], we will [make it right]"',
            'Share with every new customer: set expectations from day one',
            'Post it visibly: remind yourself and team what you promised'
          ],
          timeInvestment: '2 hours to define and document',
          successMetric: 'Customers know what to expect; complaints decrease because expectations are clear',
          resultItProduces: 'Fewer misunderstandings; customers who value your standards; foundation for consistent delivery',
          authorityReference: 'Based on Fred Reichheld\'s "The Ultimate Question" and service excellence principles'
        },
        {
          name: 'The Quality Checklist',
          description: 'Build system to deliver consistently every time',
          whatYoullHave: 'Printed checklist for your core delivery process that catches mistakes before customers see them',
          howToBuild: [
            'Walk through your delivery process step-by-step: what do you do from start to finish?',
            'For each step, ask: "What could go wrong here?" Write down the check (e.g., "Spelling checked?", "Files uploaded?", "Customer informed?")',
            'Create simple checklist (10-15 items) - keep it scannable',
            'Print and laminate it, or create digital version in project management tool',
            'Use it for every delivery - literally check off each item before you hit send/ship/deliver'
          ],
          timeInvestment: '3 hours to create and test',
          successMetric: 'Zero defects/errors that reach customers; consistent quality every time',
          resultItProduces: 'Professional consistency; fewer mistakes; customer trust; ability to delegate quality delivery',
          authorityReference: 'Based on Atul Gawande\'s "Checklist Manifesto" and quality control principles'
        },
        {
          name: 'The Feedback Loop',
          description: 'Ask customers how you\'re doing and actually use it',
          whatYoullHave: 'Simple survey process that captures customer feedback after every delivery',
          howToBuild: [
            'Create 3-question survey: 1) "On 0-10, how likely are you to recommend us?" 2) "What did we do well?" 3) "What should we improve?"',
            'Set up in Google Forms, Typeform, or email (keep it under 2 minutes to complete)',
            'Send automatically after delivery (or manually if you\'re starting out)',
            'Review feedback weekly: celebrate wins, fix recurring complaints immediately',
            'Share testimonials: use "what we did well" responses on website/marketing'
          ],
          timeInvestment: '2 hours to build survey + 30 min/week to review',
          successMetric: '50%+ response rate; clear themes emerge; you actually fix what they mention',
          resultItProduces: 'Customer-driven improvements; early warning on problems; testimonials for marketing; customers who feel heard',
          authorityReference: 'Based on Fred Reichheld\'s Net Promoter System and continuous improvement methodology'
        }
      ],
      traction: [
        {
          name: 'The Onboarding Experience',
          description: 'Build world-class first 30 days for every customer',
          whatYoullHave: 'Step-by-step onboarding process that ensures every new customer gets quick wins and understands how to succeed with you',
          howToBuild: [
            'Map customer journey: Day 1 (welcome call, set expectations), Day 3 (first check-in), Day 7 (first win celebration), Day 14 (deep dive), Day 30 (success review)',
            'Create templates for each touchpoint: welcome email, check-in questions, success metrics worksheet',
            'Assign ownership: who does what and when (you, team member, automated system)',
            'Automate what you can: welcome sequence in email system, reminders in CRM, check-in tasks',
            'Track completion: did customer complete onboarding steps? Did they get first win within 30 days?'
          ],
          timeInvestment: '8 hours to design and document process',
          successMetric: '90%+ customers get first win within 30 days; onboarding runs without you',
          resultItProduces: 'Lower cancellation rates; faster time to value; customers who stick and refer; professional impression',
          authorityReference: 'Based on Lincoln Murphy\'s Customer Success methodology and "First Value" principle'
        },
        {
          name: 'The Proactive Account Management',
          description: 'Check in before problems become cancellations',
          whatYoullHave: 'Quarterly Business Review (QBR) process and health scoring system that identifies at-risk customers before they leave',
          howToBuild: [
            'Create health score: Green (using actively + getting results), Yellow (usage declining or no results yet), Red (disengaged or unhappy)',
            'Score every customer monthly based on: usage data, support tickets, payment issues, feedback',
            'For Yellows: proactive outreach within 48 hours. For Reds: immediate intervention (call, meeting, fix)',
            'Schedule QBRs: quarterly 30-min review with key customers: "Here\'s what we delivered, here\'s what\'s next, what do you need?"',
            'Track saves: when you turn Red to Yellow or Yellow to Green, document what worked'
          ],
          timeInvestment: '4 hours to build scoring system + 2 hours/week managing accounts',
          successMetric: 'Churn rate drops 30%+; you catch problems before they leave; customers feel cared for',
          resultItProduces: 'Predictable retention; revenue you keep vs. constantly replacing; customers who expand',
          authorityReference: 'Synthesizes Gainsight\'s Health Score model and Nick Mehta\'s Customer Success principles'
        },
        {
          name: 'The Customer Win Library',
          description: 'Document and celebrate every customer success',
          whatYoullHave: 'Database of customer wins, case studies, and testimonials that fuel your marketing and motivate your team',
          howToBuild: [
            'Create simple system to capture wins: when customer gets result, log it (name, result, date, story)',
            'Ask for testimonial immediately: "That\'s awesome! Would you mind sharing a quick testimonial?" (text or video)',
            'Turn best wins into case studies: Problem (before), Solution (what you did), Result (after) - one page max',
            'Share wins internally: weekly team meeting celebrating customer successes',
            'Use wins externally: website testimonials, sales presentations, social media, proposals'
          ],
          timeInvestment: '1 hour to set up system + 30 min/week capturing wins',
          successMetric: 'Capturing 5-10 wins per month; case studies convert better in sales; team energized by customer success',
          resultItProduces: 'Marketing fuel; proof that builds trust; team motivation; customer validation loop',
          authorityReference: 'Based on Marcus Sheridan\'s "They Ask You Answer" and case study marketing principles'
        }
      ],
      scaling: [
        {
          name: 'The Customer Success Team',
          description: 'Build dedicated team that ensures customer results',
          whatYoullHave: 'Customer Success Managers (CSMs) each owning 50-100 accounts, driving retention and expansion',
          howToBuild: [
            'Segment customers by revenue/complexity: Enterprise (high-touch CSM), Mid-market (pooled CSM), SMB (tech-touch)',
            'Hire CSMs: look for empathy + problem-solving + technical aptitude, pay $50-70K + bonus on retention/expansion',
            'Define CSM playbook: onboarding, quarterly reviews, renewal process, upsell triggers, churn prevention',
            'Set metrics per CSM: retention rate (target 90%+), NPS, expansion revenue, customer health score',
            'Weekly CSM team meeting: review at-risk accounts, share wins, solve common problems, update playbooks'
          ],
          timeInvestment: '50 hours to build CSM system + hire first 2 CSMs',
          successMetric: 'Churn drops below 10% annually; expansion revenue from existing customers 20%+ of new revenue',
          resultItProduces: 'Predictable retention; proactive customer management; expansion revenue engine; scalable support',
          authorityReference: 'Based on Lincoln Murphy\'s Customer Success methodology and Gainsight best practices'
        },
        {
          name: 'The Service Delivery Team',
          description: 'Build team that delivers your service without you',
          whatYoullHave: 'Delivery team of 3-5 people executing your core service, with quality standards and manager',
          howToBuild: [
            'Document your delivery process in painful detail: every step, every decision point, every quality check',
            'Hire delivery specialists: people who love execution more than strategy, pay based on market rate for skill',
            'Train using your docs: 2-week shadowing, 2-week doing together, 2-week solo with spot checks',
            'Promote or hire delivery manager: someone who ensures quality, manages team, handles escalations',
            'Weekly quality reviews: sample delivered work, measure against standards, coach team on gaps'
          ],
          timeInvestment: '80 hours to document + hire + train delivery team',
          successMetric: 'Delivering 80%+ of customer work without your involvement; quality maintained or improved',
          resultItProduces: 'Removed from delivery; time for strategy/sales; scalable operations; business runs without you',
          authorityReference: 'Based on Michael Gerber\'s E-Myth "Technician to Manager" transition'
        },
        {
          name: 'The VIP Experience',
          description: 'Create premium tier that drives expansion revenue',
          whatYoullHave: 'VIP/Premium offering that existing customers upgrade to, adding 30-50% more revenue per customer',
          howToBuild: [
            'Survey top 20% customers: "What would you pay more for?" (more access, faster delivery, premium features)',
            'Package VIP tier: 2-3x base price, include high-perceived-value items that don\'t cost you much (priority access, monthly strategy calls, dedicated account rep)',
            'Pilot with 5 customers: offer upgrade at special rate, validate they see value, refine offering',
            'Create upgrade path: offer to customers after 90 days or after first big win',
            'Track VIP metrics: upgrade rate (target 20% of base customers), NPS (should be higher), retention (should be 95%+)'
          ],
          timeInvestment: '20 hours to design and launch VIP tier',
          successMetric: '15-25% of customers upgrade; $50-100K additional annual revenue; higher retention in VIP',
          resultItProduces: 'Expansion revenue; higher LTV; reward best customers; premium positioning',
          authorityReference: 'Based on Patrick Campbell\'s pricing optimization and value-based tiering'
        }
      ],
      optimization: [
        {
          name: 'The Customer Experience Strategy',
          description: 'Build systematic approach to delight at every touchpoint',
          whatYoullHave: 'Documented customer journey map with experience standards and delight moments at each stage',
          howToBuild: [
            'Map complete customer journey: pre-sale, onboarding, active use, renewal, expansion, advocacy',
            'For each stage: define experience standard (minimum acceptable) and delight moments (wow factors)',
            'Interview customers: "What would make this experience 10x better?" Build delight backlog.',
            'Systematize delight: turn wow moments into repeatable processes (surprise gifts, milestone celebrations, exclusive access)',
            'Measure experience: NPS at each stage, track improvements, tie CX metrics to team bonuses',
            'Quarterly CX review: analyze feedback, implement top 3 improvements, measure impact'
          ],
          timeInvestment: '60 hours to map and implement CX strategy',
          successMetric: 'NPS 50+; customers rave about experience; referral rate 30%+; competitive differentiation',
          resultItProduces: 'Loyal customer base; word-of-mouth growth; premium pricing power; defensible moat',
          authorityReference: 'Based on Zappos CX excellence and Disney experience design principles'
        },
        {
          name: 'The Retention Playbook',
          description: 'Prevent churn before it happens',
          whatYoullHave: 'Early warning system and intervention playbooks that save 50%+ of at-risk customers',
          howToBuild: [
            'Analyze churn data: when do customers typically churn? What signals appear 30-60-90 days before?',
            'Build predictive model: usage decline, support tickets, payment issues, NPS drop - score risk level',
            'Create intervention playbooks: Red (immediate outreach), Yellow (proactive check-in), Green (expansion opportunity)',
            'Empower CSMs: authority to discount, add services, or invest to save customer (set $ limits)',
            'Track saves: measure save rate, cost to save, lifetime value of saved customers',
            'Root cause analysis: why were they leaving? Fix systemic issues, not just symptoms'
          ],
          timeInvestment: '40 hours to build retention system',
          successMetric: 'Churn rate drops to 5% annually or below; saves payback in 90 days; systematic retention',
          resultItProduces: 'Predictable recurring revenue; customer insights driving product; efficient growth',
          authorityReference: 'Based on Gainsight retention methodology and Customer Success playbooks'
        },
        {
          name: 'The Voice of Customer Program',
          description: 'Build systematic process to capture and act on customer feedback',
          whatYoullHave: 'VOC program with feedback loops that drive product, service, and experience improvements',
          howToBuild: [
            'Multi-channel feedback: NPS surveys, customer advisory board, user interviews, support ticket analysis, usage data',
            'Centralize insights: use tool (ProductBoard, Canny, or spreadsheet) to aggregate all feedback',
            'Categorize and prioritize: bucket by theme (features, bugs, pricing, support), score by frequency + impact',
            'Close the loop: tell customers "We heard you, here\'s what we\'re doing" - even if answer is "not now"',
            'Quarterly roadmap: use VOC data to inform what to build/improve next',
            'Showcase impact: "You asked, we built" communications that show you listen'
          ],
          timeInvestment: '30 hours to set up VOC program',
          successMetric: 'Feedback volume up 3x; customers feel heard; product decisions data-driven; builds loyalty',
          resultItProduces: 'Customer-driven innovation; product-market fit evolution; engaged customer community',
          authorityReference: 'Based on Voice of Customer best practices and Product-Led Growth principles'
        }
      ],
      leadership: [
        {
          name: 'The Customer Success Platform',
          description: 'Build CS organization that drives retention and expansion',
          whatYoullHave: 'Customer Success team with VP CS, CSMs, onboarding specialists, and renewal managers',
          howToBuild: [
            'Hire VP of Customer Success: owns retention, expansion, customer health, pay $140-180K + equity',
            'Structure CS team: onboarding (first 90 days), ongoing CSMs (strategic accounts), renewal managers (focus on at-risk)',
            'Define customer health score: product usage, support tickets, NPS, engagement metrics, renewal risk',
            'Segment by value: enterprise (white-glove), mid-market (pooled CSM), SMB (tech-touch automation)',
            'Quarterly business reviews: for top accounts, demonstrate ROI, identify expansion opportunities, co-create success plan',
            'CS playbooks: onboarding, adoption, renewal, expansion, win-back for churned customers'
          ],
          timeInvestment: '6 months to hire and build CS organization',
          successMetric: 'Net revenue retention 110%+; gross retention 90%+; expansion revenue 30% of total ARR',
          resultItProduces: 'Predictable recurring revenue; customer-funded growth; competitive moat through switching costs',
          authorityReference: 'Based on "Customer Success" by Nick Mehta and Gainsight methodology'
        },
        {
          name: 'The Customer Community',
          description: 'Build customer community that drives engagement and advocacy',
          whatYoullHave: 'Thriving customer community (3,000+ members) driving peer support, product feedback, and advocacy',
          howToBuild: [
            'Choose platform: dedicated community software (Khoros, Higher Logic) or Slack/Circle for smaller scale',
            'Hire community manager: owns engagement, content, events, pay $70-100K',
            'Launch strategy: invite top 100 customers first, create early value, then open to all',
            'Content pillars: peer Q&A, product updates, best practices, customer success stories, exclusive content',
            'Events: virtual meetups, annual user conference, local chapter events, executive dinners',
            'Gamification: badges, leaderboards, exclusive perks for active members (beta access, VIP support)',
            'Advocacy program: turn super-users into case studies, speakers, references, advisory board members'
          ],
          timeInvestment: '80 hours to launch + ongoing community management',
          successMetric: '40%+ customers active in community; 70% of support questions answered by peers; 50 customer advocates',
          resultItProduces: 'Lower support costs; product co-creation; authentic marketing content; customer retention',
          authorityReference: 'Based on community-led growth and "The Business of Belonging"'
        },
        {
          name: 'The Customer Intelligence Engine',
          description: 'Build data infrastructure to predict churn and expansion',
          whatYoullHave: 'Predictive analytics identifying at-risk accounts 90 days early and expansion opportunities',
          howToBuild: [
            'Integrate data: product usage, support interactions, NPS surveys, billing, contract terms, user engagement',
            'Build health scoring: machine learning model predicting renewal likelihood based on behavioral patterns',
            'Early warning system: alerts when customer health drops below threshold (e.g., 30% usage decline)',
            'Expansion signals: identify accounts with usage patterns indicating need for upsell/cross-sell',
            'CS workflows: automated playbooks trigger based on customer health (e.g., at-risk → exec escalation)',
            'Executive dashboard: retention metrics, expansion pipeline, customer lifetime value cohorts, churn analysis'
          ],
          timeInvestment: '120 hours to build customer intelligence infrastructure',
          successMetric: 'Predict 80% of churn 90 days early; identify expansion opportunities generating $1M+ ARR',
          resultItProduces: 'Proactive retention; maximized expansion revenue; data-driven CS strategy; board-ready metrics',
          authorityReference: 'Based on customer success analytics and predictive modeling best practices'
        }
      ],
      mastery: [
        {
          name: 'The Customer Experience Transformation',
          description: 'Build world-class end-to-end customer experience',
          whatYoullHave: 'Best-in-class CX across entire customer journey driving NPS 60+, retention 95%+, and viral growth',
          howToBuild: [
            'Hire Chief Customer Officer: owns entire customer experience, reports to CEO, $200-300K + equity',
            'Map complete journey: awareness → consideration → purchase → onboarding → adoption → expansion → advocacy',
            'Measure at every touchpoint: NPS, CSAT, effort score, time to value, feature adoption, support quality',
            'Identify friction points: where do customers struggle? Where does experience break down?',
            'Design ideal experience: for each journey stage, define what world-class looks like',
            'Close gaps systematically: prioritize improvements by impact, execute quarterly, measure results',
            'Empower front-line: give CS and support authority to solve problems, spend to delight customers',
            'Customer advisory board: 20 strategic customers advising on product, experience, strategy'
          ],
          timeInvestment: '18 months to transform CX',
          successMetric: 'NPS 60+; gross retention 95%+; net retention 120%+; customers as sales force',
          resultItProduces: 'Competitive moat through CX; viral growth; pricing power; customer-funded expansion',
          authorityReference: 'Based on "The Effortless Experience" and world-class CX frameworks'
        },
        {
          name: 'The Customer Success At Scale',
          description: 'Build CS organization supporting 1,000+ enterprise customers',
          whatYoullHave: 'Scaled CS org with segmentation, specialized roles, tech-enabled, data-driven',
          howToBuild: [
            'Segment customers: strategic (white-glove CSM), enterprise (pooled CSM), growth (digital CS), SMB (tech-touch only)',
            'Specialized CS roles: onboarding specialists, adoption coaches, renewal managers, expansion reps, technical CSMs',
            'CS platform: Gainsight/Totango driving workflows, health scores, automated playbooks, executive dashboards',
            'Digital CS motion: email nurture, in-app guidance, webinars, self-service resources for scale segments',
            'CS team structure: VP CS, regional directors, CSM managers, specialized teams (onboarding, renewals, etc.)',
            'Quarterly business reviews: for top 100 accounts, executive sponsors, co-create success plans',
            'CS as revenue center: expansion quotas, comp tied to retention + growth, measured on NDR'
          ],
          timeInvestment: '12 months to build scaled CS org',
          successMetric: 'Support 1,000+ customers; CS team of 30+; net dollar retention 120%+; expansion ARR $5M+',
          resultItProduces: 'Scalable CS model; efficient growth; customer-funded expansion; predictable revenue',
          authorityReference: 'Based on "Customer Success" and enterprise CS scaling frameworks'
        },
        {
          name: 'The Customer-Led Growth',
          description: 'Make customers your primary growth engine',
          whatYoullHave: 'Growth model where 60%+ of new revenue comes from existing customers (expansion + referrals)',
          howToBuild: [
            'Land and expand strategy: start with department, expand to division, capture entire company',
            'Usage-based expansion: pricing scales with usage, natural expansion as customer grows',
            'Build for virality: product features that require inviting others (collaboration, sharing, network effects)',
            'Reference program: top customers as referenceable, paid speaking engagements, advisory roles',
            'Customer marketing: case studies, video testimonials, customer events, user-generated content',
            'Advocacy program: gamified, rewards for referrals/references, exclusive benefits, community leadership',
            'Measure customer growth: track expansion revenue, referral-sourced pipeline, advocacy program ROI'
          ],
          timeInvestment: '12 months to build customer-led growth engine',
          successMetric: 'Net dollar retention 130%+; 40% of new logos from referrals; customers as unpaid sales force',
          resultItProduces: 'Lower CAC; higher LTV; compounding growth; strong competitive moat; capital efficiency',
          authorityReference: 'Based on product-led growth and customer-led growth strategies'
        }
      ]
    }
  },

  // ENGINE 4: PEOPLE MACHINE
  {
    id: 'deliver-people',
    name: 'The People Machine',
    subtitle: 'People & Team',
    description: 'Attracts, develops, and retains people who execute without you',
    metrics: ['Team size and quality', 'Retention rate', 'Productivity per person', 'Leadership bench'],
    stages: {
      foundation: [
        {
          name: 'First Great Hires',
          description: 'Bring in people who share values and execute',
          whatYoullHave: 'Job description, interview questions, and hiring process that finds people who fit',
          howToBuild: [
            'Define your core values (3-5 words that describe how you operate): e.g., "ownership", "excellence", "speed"',
            'Write 1-page job description: Role title, what they\'ll do daily, what success looks like, pay range',
            'Create interview questions that test values: "Tell me about a time you took ownership of a mistake" (tests ownership value)',
            'Post on Indeed/LinkedIn, interview minimum 5 candidates, check 2 references before hiring',
            'Hire for values fit first, skills second - skills can be taught, values can\'t'
          ],
          timeInvestment: '15 hours to hire first person (rushed decisions cost more later)',
          successMetric: 'First hire still with you 6+ months later; they embody your values',
          resultItProduces: 'Team member who makes your life easier not harder; foundation of healthy culture; time freed up',
          authorityReference: 'Synthesizes Jim Collins\'s "First Who, Then What" and Topgrading hiring methodology'
        },
        {
          name: 'Clear Expectations',
          description: 'Define roles so everyone knows their job',
          whatYoullHave: '1-page role document for each position defining: what they own, what success looks like, who they report to',
          howToBuild: [
            'For each person/role, write down: What are you responsible for? (3-5 key areas)',
            'Define success metrics: "Success in this role means [X metric/outcome]"',
            'Clarify reporting: "You report to [person]. We meet [frequency]. You\'re empowered to decide [what]."',
            'Create accountability: "These are your numbers to hit: [specific targets]"',
            'Review together in week 1: both sign it, refer back when there\'s confusion'
          ],
          timeInvestment: '1 hour per role',
          successMetric: 'Zero confusion about who owns what; team members can explain their role clearly',
          resultItProduces: 'Accountability without micromanaging; clear boundaries; reduced conflict; empowered team',
          authorityReference: 'Based on Gino Wickman\'s "Accountability Chart" from Traction/EOS'
        },
        {
          name: 'Basic Training',
          description: 'Get new people productive quickly',
          whatYoullHave: 'Training checklist and 2-week onboarding process that gets new hires contributing fast',
          howToBuild: [
            'List 10 things new hire must learn to be productive (tools, processes, key contacts, standards)',
            'Create training sequence: Days 1-3 (shadow you), Days 4-7 (do tasks while you watch), Days 8-14 (solo with check-ins)',
            'Document each skill: Loom video showing how + written checklist they can reference',
            'Assign mentor: existing team member who answers questions first 2 weeks',
            'Check off progress: daily check-in first week, every 2 days second week, then weekly'
          ],
          timeInvestment: '8 hours to build training system + 10 hours to train first person',
          successMetric: 'New hire productive in 2 weeks instead of 2 months; can do core tasks without asking',
          resultItProduces: 'Faster time to productivity; consistent training quality; reusable system; confident new hires',
          authorityReference: 'Synthesizes Michael Gerber\'s training systems and 70-20-10 learning model'
        }
      ],
      traction: [
        {
          name: 'The Hiring System',
          description: 'Build repeatable process that attracts and selects A-players',
          whatYoullHave: 'Job description template, interview scorecard, trial project system that consistently hires great people',
          howToBuild: [
            'Create job description template: role, outcomes expected, skills needed, your culture fit criteria',
            'Build interview process: phone screen (15 min), working interview (2 hours with real task), culture fit conversation (30 min)',
            'Design scorecard: rate candidates 1-5 on key criteria (skills, culture, track record, energy)',
            'Add trial project: pay candidates $200-500 for 1-week real project before hiring full-time',
            'Document: create hiring playbook so you (or future hiring manager) can replicate this'
          ],
          timeInvestment: '6 hours to build system + use it for every hire',
          successMetric: '80%+ of hires succeed past 90 days; bad hires caught in trial project',
          resultItProduces: 'Team of A-players; reduced hiring mistakes; confidence in growth; process you can delegate',
          authorityReference: 'Based on Geoff Smart\'s "Who" methodology and Topgrading principles'
        },
        {
          name: 'The Performance System',
          description: 'Set clear expectations and hold people accountable',
          whatYoullHave: '90-day goals for each person, weekly 1-on-1 structure, quarterly reviews that drive performance',
          howToBuild: [
            'Set 90-day goals with each person: 3-5 measurable outcomes they own (not tasks, OUTCOMES)',
            'Schedule weekly 1-on-1s (30 min): "What did you accomplish? What are you working on? Where are you stuck?"',
            'Track in simple doc: goals, progress, red flags, wins',
            'Quarterly review: Did they hit 80%+ of goals? If yes, new goals. If no, performance improvement plan.',
            'Celebrate wins publicly, address issues privately and quickly'
          ],
          timeInvestment: '2 hours/week on 1-on-1s + 2 hours/quarter on reviews',
          successMetric: 'Every team member knows what success looks like; 80%+ hit their quarterly goals',
          resultItProduces: 'Accountability culture; high performers thrive; low performers improve or leave; clarity on contribution',
          authorityReference: 'Synthesizes Patrick Lencioni\'s "First Team" and Kim Scott\'s "Radical Candor"'
        },
        {
          name: 'The Team Rhythm',
          description: 'Build meeting cadence that keeps everyone aligned',
          whatYoullHave: 'Daily huddle, weekly team meeting, monthly all-hands structure that prevents misalignment',
          howToBuild: [
            'Daily huddle (15 min, standing): Each person shares "What I\'m working on today + any blockers"',
            'Weekly team meeting (60 min): Review metrics, celebrate wins, solve 1-2 big problems, preview next week',
            'Monthly all-hands (60 min): Share financials, strategic updates, recognize team members, Q&A',
            'Create agenda templates for each meeting type - keep them crisp and valuable',
            'Cancel any meeting that becomes a waste of time - protect everyone\'s calendar'
          ],
          timeInvestment: '3 hours/week on meetings (but saves 10+ hours of miscommunication)',
          successMetric: 'Team feels connected and aligned; decisions happen faster; fewer "didn\'t know that" moments',
          resultItProduces: 'Aligned team; faster execution; problems surfaced quickly; culture of transparency',
          authorityReference: 'Based on Patrick Lencioni\'s "Death by Meeting" and Verne Harnish\'s "Scaling Up" rhythms'
        }
      ],
      scaling: [
        {
          name: 'The Leadership Team',
          description: 'Build executive team to run departments',
          whatYoullHave: 'Department heads (Sales, Delivery, Operations, Finance) who own outcomes and lead their teams',
          howToBuild: [
            'Define department leader roles: what outcomes they own, authority level, who reports to them',
            'Promote from within (if ready) or hire experienced leaders: look for player-coach types who can do + lead',
            'Set compensation: $80-120K base + bonus tied to department metrics + equity if appropriate',
            'Create leadership rhythm: weekly leadership team meeting (review company metrics, solve cross-department issues, strategic decisions)',
            'Give them real authority: hiring, budget, tactical decisions - you focus on strategy and coaching them',
            'Quarterly leadership offsite: strategic planning, team building, professional development'
          ],
          timeInvestment: '100 hours to recruit + onboard leadership team',
          successMetric: 'Each department runs without you; leaders making 80% of decisions; you work ON business not IN it',
          resultItProduces: 'Scalable leadership; business runs without you; focus on vision/strategy; exit-ready structure',
          authorityReference: 'Based on Verne Harnish\'s "Scaling Up" leadership structure and EOS "Leadership Team"'
        },
        {
          name: 'The Culture System',
          description: 'Codify and scale your company culture',
          whatYoullHave: 'Written core values, cultural behaviors, hiring/firing criteria, and rituals that reinforce culture',
          howToBuild: [
            'Define 3-5 core values: what behaviors do your best people exhibit? What\'s non-negotiable?',
            'Make values behavioral: not just "Integrity" but "We do what we say, even when it costs us"',
            'Integrate in hiring: interview for values fit, use values-based questions, check references for culture alignment',
            'Integrate in firing: if someone violates values repeatedly, they go (even if they hit numbers)',
            'Create cultural rituals: monthly all-hands, quarterly awards, annual retreat, regular celebrations',
            'Storytelling: share stories of people living the values, make heroes of culture carriers'
          ],
          timeInvestment: '20 hours to define + document culture',
          successMetric: 'Team can recite values; culture maintained as you grow; wrong-fit people self-select out',
          resultItProduces: 'Strong culture; hiring/firing clarity; team alignment; competitive advantage',
          authorityReference: 'Based on Patrick Lencioni\'s values integration and Netflix culture deck principles'
        },
        {
          name: 'The Talent Pipeline',
          description: 'Always be recruiting top talent before you need them',
          whatYoullHave: 'Always-on recruiting system building pipeline of A-players for future growth',
          howToBuild: [
            'Identify future needs: based on growth plan, what roles will you need in 6-12 months?',
            'Build talent network: coffee with great people, stay connected with candidates who didn\'t get hired, referral network',
            'Create "join our team" page: make careers page compelling (mission, culture, growth, testimonials)',
            'Passive recruiting: post on LinkedIn about wins, company culture, growth - attract people who want to join',
            'Keep pipeline warm: quarterly "talent check-in" with people in pipeline, share company updates',
            'Hire ahead of need: when you find A-player, create role for them (better than hiring out of desperation)'
          ],
          timeInvestment: '5 hours/month on talent pipeline',
          successMetric: 'Pipeline of 10-20 qualified candidates at any time; hiring takes weeks not months',
          resultItProduces: 'A-player team; hire from strength not desperation; faster growth; recruiting advantage',
          authorityReference: 'Based on "Topgrading" continuous recruiting and Google\'s always-on hiring'
        }
      ],
      optimization: [
        {
          name: 'The Organizational Structure',
          description: 'Design org chart that scales to 50+ people',
          whatYoullHave: 'Clear organizational structure with defined roles, reporting lines, and career paths',
          howToBuild: [
            'Build org chart: CEO → Department heads → Team leads → Individual contributors',
            'Define spans of control: managers with 5-8 direct reports, leaders with 3-5 managers',
            'Create career paths: IC track (individual contributor excellence) and management track (people leadership)',
            'Document each role: outcomes owned, authority level, skills required, comp range',
            'Plan for growth: where will you add headcount? What roles when? Budget accordingly.',
            'Review quarterly: is structure supporting growth or creating bottlenecks? Adjust as needed.'
          ],
          timeInvestment: '40 hours to design scalable org structure',
          successMetric: 'Clear reporting lines; everyone knows role/authority; promotions based on criteria; ready to scale',
          resultItProduces: 'Scalable structure; career growth for team; reduced confusion; professional organization',
          authorityReference: 'Based on EOS Accountability Chart and high-growth org design'
        },
        {
          name: 'The Performance Calibration',
          description: 'Build fair, consistent performance evaluation system',
          whatYoullHave: 'Calibrated performance reviews that drive growth and eliminate bias',
          howToBuild: [
            'Define performance framework: exceeds (top 10%), meets (solid 80%), needs improvement (bottom 10%)',
            'Manager training: how to assess performance, give feedback, document, handle tough conversations',
            'Calibration meetings: leaders review ratings together, ensure consistency, eliminate bias',
            'Performance improvement plans: clear 30-60-90 day plans for underperformers (coach up or out)',
            'Compensation alignment: exceeds gets raises/bonuses, meets gets modest increases, needs improvement frozen',
            'High performer retention: identify top 20%, pay competitively, give growth opportunities, keep them engaged'
          ],
          timeInvestment: '30 hours to build performance system',
          successMetric: 'Fair, consistent reviews; top performers retained; bottom performers coached up or out',
          resultItProduces: 'Meritocracy; high performer retention; clear standards; efficient team',
          authorityReference: 'Based on Google calibration process and performance management best practices'
        },
        {
          name: 'The Compensation Strategy',
          description: 'Build market-competitive comp structure',
          whatYoullHave: 'Comp bands for each role tied to market data and performance',
          howToBuild: [
            'Get market data: use Radford, Pave, or Payscale to benchmark roles',
            'Define comp philosophy: do you pay 50th percentile (market average), 75th (above average), 90th (top)?',
            'Create comp bands: for each role, min-mid-max based on experience and performance',
            'Equity strategy: who gets options/equity? How much? Vesting schedule?',
            'Build raise framework: performance-based (exceeds = 10%+, meets = 3-5%), market adjustments, promotions',
            'Budget annually: forecast comp spend, ensure sustainable, adjust if needed'
          ],
          timeInvestment: '40 hours to build comp strategy',
          successMetric: 'Attract/retain top talent; competitive pay; fair/consistent; sustainable for business',
          resultItProduces: 'Recruiting advantage; reduced turnover; budget predictability; pay transparency',
          authorityReference: 'Based on compensation best practices and startup equity standards'
        }
      ],
      leadership: [
        {
          name: 'The Executive Team',
          description: 'Build C-suite leadership team to run functions',
          whatYoullHave: 'Executive team (CFO, CRO, COO, CPO, CTO) running their functions independently',
          howToBuild: [
            'Define what you need: which functions need executive leadership? (common: CFO first, then CRO, then COO)',
            'Hire CFO ($160-220K + equity): owns finance, accounting, FP&A, investor relations, board reporting',
            'Hire CRO ($180-250K + equity): owns all revenue (marketing, sales, customer success), quota for company',
            'Hire COO ($160-220K + equity): owns operations, HR, legal, IT, internal systems',
            'Set operating rhythm: weekly exec team meeting, monthly business review, quarterly strategic planning',
            'Delegate authority: each executive owns P&L for their function, hiring decisions, strategic initiatives',
            'Hold accountable: OKRs per executive, quarterly performance reviews, compensation tied to results'
          ],
          timeInvestment: '6-12 months to recruit and onboard executive team',
          successMetric: 'Functions run independently; you focus on CEO role (vision, strategy, culture, capital); board-ready company',
          resultItProduces: 'Scalable leadership; deeper expertise; distributed decision-making; exit-ready organization',
          authorityReference: 'Based on "The CEO Next Door" and executive team building best practices'
        },
        {
          name: 'The Talent Development Program',
          description: 'Build systematic leadership development pipeline',
          whatYoullHave: 'Internal leadership academy developing next generation of managers and executives',
          howToBuild: [
            'Hire Head of Talent Development ($100-140K): owns leadership development, succession planning, high-potential programs',
            'Create leadership tracks: emerging leaders (first-time managers), experienced managers (scaling teams), executives (strategic leaders)',
            'Build curriculum: workshops, executive coaching, peer cohorts, 360 feedback, strategic project rotations',
            'Identify high-potentials: annual talent review, 9-box grid, development plans for top 10% of team',
            'Succession planning: identify backups for every key role, develop them actively, test with stretch assignments',
            'Measure impact: promotion from within rate (goal: 80%+), leadership quality scores, retention of high-potentials'
          ],
          timeInvestment: '80 hours to build + ongoing program management',
          successMetric: '80% of leadership roles filled from within; bench strength for every key position; reduced hiring costs',
          resultItProduces: 'Leadership bench; retention of A-players; cultural continuity; acquisition-ready talent',
          authorityReference: 'Based on "The Leadership Pipeline" and corporate talent development models'
        },
        {
          name: 'The Culture Scaling System',
          description: 'Systematize culture preservation through rapid growth',
          whatYoullHave: 'Culture operating system that maintains values and cohesion while scaling to 100+ people',
          howToBuild: [
            'Document culture: what makes your culture unique? Core behaviors? Stories that exemplify values?',
            'Hire Chief People Officer ($140-180K): owns culture, engagement, DEI, organizational health',
            'Culture rituals: weekly all-hands, monthly team celebrations, quarterly offsites, annual company summit',
            'Measure culture: quarterly engagement surveys (eNPS target: 40+), exit interview trends, Glassdoor monitoring',
            'Protect in hiring: structured interviews testing for values fit, panel interviews including culture-carriers, slow to hire',
            'Reinforce constantly: recognition programs, values-based awards, storytelling in company communications',
            'Manage out misalignment: fast to fire when values violated, even if performance is strong'
          ],
          timeInvestment: '60 hours to design + ongoing cultural stewardship',
          successMetric: 'Engagement scores maintain through growth; low regretted attrition; Glassdoor 4.5+; cultural consistency',
          resultItProduces: 'Differentiated culture; talent magnet; performance advantage; retention of top talent',
          authorityReference: 'Based on "The Culture Code" by Daniel Coyle and high-growth culture frameworks'
        }
      ],
      mastery: [
        {
          name: 'The Talent Magnet Organization',
          description: 'Build employer brand that attracts top 1% talent',
          whatYoullHave: 'Employer brand recognized as best place to work, attracting A-players without recruiting effort',
          howToBuild: [
            'Glassdoor excellence: 4.8+ rating, respond to every review, showcase culture authentically',
            'Build talent brand: LinkedIn thought leadership, employee stories, culture videos, behind-the-scenes content',
            'Best places to work: win Inc, Fortune, industry awards - PR value + recruiting advantage',
            'University relations: target school partnerships, internship programs, campus brand presence',
            'Referral culture: 60%+ of hires from employee referrals, significant referral bonuses ($5-10K)',
            'Candidate experience: white-glove from first contact, personalized, fast process, wow factor',
            'Rejected candidate nurture: stay in touch, quarterly updates, "when you\'re ready, we\'re here"',
            'Alumni network: treat departing employees as ambassadors, boomerang hires, customer referrals'
          ],
          timeInvestment: '18 months to build talent magnet brand',
          successMetric: '5,000+ applicants annually for key roles; 80% offer acceptance; Glassdoor 4.8+; unsolicited inbound talent',
          resultItProduces: 'Recruiting advantage; A-player density; lower recruiting costs; competitive moat',
          authorityReference: 'Based on employer branding and "Who" talent methodology'
        },
        {
          name: 'The Leadership Factory',
          description: 'Systematically develop leaders at scale',
          whatYoullHave: 'Leadership development system producing leaders internally, 90%+ leadership roles filled from within',
          howToBuild: [
            'Build in-house leadership academy: multi-year curriculum from emerging leaders to executives',
            'Cohort-based programs: 20 person cohorts, executive coaches, peer learning, strategic projects',
            'Leadership competency model: define what great leadership looks like at each level',
            '360 assessments: annual feedback from peers, direct reports, manager, self - development plans',
            'Stretch assignments: high-potentials get challenging projects, cross-functional roles, test readiness',
            'Executive coaching: top 50 leaders get 1:1 coaching, accelerate development',
            'Succession planning: 2-3 successors identified for every critical role, actively developing',
            'Leadership tracking: measure promotion rates, retention of high-potentials, leadership bench strength'
          ],
          timeInvestment: '$500K-1M annual investment in leadership development',
          successMetric: '90% of leadership filled from within; leadership bench 2-3 deep; reduced external hiring',
          resultItProduces: 'Scalable leadership; cultural continuity; retention advantage; organizational capability',
          authorityReference: 'Based on GE/P&G leadership development models and "The Leadership Pipeline"'
        },
        {
          name: 'The People Analytics Engine',
          description: 'Build data-driven people organization',
          whatYoullHave: 'Sophisticated people analytics predicting attrition, performance, and organizational health',
          howToBuild: [
            'Hire Head of People Analytics: data scientist focused on people, $150-200K',
            'Build data infrastructure: integrate HRIS, performance, engagement, recruiting, compensation data',
            'Predictive models: attrition risk (90 days early warning), performance prediction, promotion readiness',
            'Org network analysis: map informal networks, identify key connectors, optimize team structure',
            'Comp analytics: ensure pay equity, market competitiveness, ROI on compensation investments',
            'DEI metrics: representation at every level, pay equity, promotion rates, intersectional analysis',
            'Workforce planning: predictive models for hiring needs, skills gaps, organizational design',
            'Executive dashboard: real-time people metrics, trend analysis, scenario planning'
          ],
          timeInvestment: '12 months + $300K investment',
          successMetric: 'Predict 80% of attrition; data-driven people decisions; optimized org design; pay equity achieved',
          resultItProduces: 'Strategic people function; reduced attrition; optimized talent allocation; competitive advantage',
          authorityReference: 'Based on people analytics best practices and workforce science'
        }
      ]
    }
  },

  // ENGINE 5: OPERATIONS MACHINE
  {
    id: 'deliver-systems',
    name: 'The Operations Machine',
    subtitle: 'Systems & Process',
    description: 'Runs business operations efficiently without you',
    metrics: ['Process documentation %', 'Automation coverage', 'Error rate', 'Efficiency metrics'],
    stages: {
      foundation: [
        {
          name: 'Document the Basics',
          description: 'Write down core processes so they\'re repeatable',
          whatYoullHave: 'Your top 3 processes documented with step-by-step instructions and screenshots',
          howToBuild: [
            'Identify your 3 most-repeated tasks (the things you do weekly that eat time)',
            'For each one: Record Loom video of you doing it while narrating steps',
            'Write it as checklist: Step 1, Step 2, Step 3... (aim for 10-15 steps max)',
            'Add screenshots where helpful (how to access system, what button to click, etc.)',
            'Store in one place: Google Drive folder called "How We Do Things" or Notion page'
          ],
          timeInvestment: '1 hour per process = 3 hours total',
          successMetric: 'Someone else can follow your documentation and complete task without asking questions',
          resultItProduces: 'Knowledge out of your head; ability to delegate; consistency when you scale; training material',
          authorityReference: 'Based on Michael Gerber\'s "E-Myth" turnkey operation and Ray Dalio\'s principle documentation'
        },
        {
          name: 'Essential Tools',
          description: 'Choose technology that helps you deliver faster',
          whatYoullHave: 'Core tech stack (3-5 tools) that everyone uses for communication, projects, files, and customers',
          howToBuild: [
            'Audit current tools: what are you using now? What\'s causing friction?',
            'Choose your essential 3: 1) Project management (Asana, Trello, Monday), 2) Communication (Slack, Teams), 3) File storage (Google Drive, Dropbox)',
            'Optional adds: CRM (HubSpot), Accounting (QuickBooks), Scheduling (Calendly)',
            'Get everyone on same tools: delete random apps, consolidate, train team on the standard',
            'Set usage rules: "All projects go in [tool]. All files go in [tool]. Check [tool] daily."'
          ],
          timeInvestment: '4 hours to choose and set up',
          successMetric: 'Team uses same tools; information is findable; less "where is that file?" chaos',
          resultItProduces: 'Coordinated operations; less time searching for things; professional image; scalable infrastructure',
          authorityReference: 'Synthesizes productivity stack best practices and "Work the System" methodology'
        },
        {
          name: 'Quality Control',
          description: 'Catch mistakes before customers do',
          whatYoullHave: 'Before-you-ship checklist that prevents errors from reaching customers',
          howToBuild: [
            'List the mistakes you\'ve made in past 6 months that reached customers',
            'For each one, ask: "What check would have caught this?"',
            'Create master checklist: "Before sending to customer, verify: [X, Y, Z]"',
            'Print and post it where you work, or build into your project management tool',
            'Make it ritual: literally check each box before you deliver anything'
          ],
          timeInvestment: '2 hours to create',
          successMetric: 'Zero customer-facing errors; you catch mistakes internally before delivery',
          resultItProduces: 'Professional reputation; fewer apologies; customer trust; reduced rework time',
          authorityReference: 'Based on "Checklist Manifesto" and Six Sigma quality control principles'
        }
      ],
      traction: [
        {
          name: 'The Operations Manual',
          description: 'Document your 10 core processes so anyone can run them',
          whatYoullHave: 'Operations manual with your top 10 processes documented step-by-step with visuals',
          howToBuild: [
            'List your 10 most repeated processes (onboarding, delivery, billing, support, etc.)',
            'For each process: write it out as you do it, capture screenshots/videos, note tools used',
            'Use simple format: Process name, When to use, Steps (numbered), Tools needed, Common mistakes',
            'Store in shared location (Google Docs, Notion, wiki) where team can access',
            'Test each manual: have someone follow it without your help - refine where they get stuck'
          ],
          timeInvestment: '20 hours to document 10 processes',
          successMetric: 'New person can execute core processes using manual alone; you\'re not the answer to every question',
          resultItProduces: 'Business that runs without you; delegation becomes possible; training time reduced 70%+',
          authorityReference: 'Based on Michael Gerber\'s E-Myth "Systems-Dependent vs. People-Dependent" business model'
        },
        {
          name: 'The Automation Stack',
          description: 'Use technology to eliminate repetitive tasks',
          whatYoullHave: '5-10 automated workflows handling tasks that used to waste hours (billing, follow-ups, reporting, etc.)',
          howToBuild: [
            'Track your week: every repetitive task you do, write it down (invoicing, email follow-ups, data entry, etc.)',
            'Pick top 5 time-wasters: what takes most time and is most repetitive?',
            'Research automation: Zapier, Make, native integrations between your tools',
            'Build automations one at a time: Start simple (e.g., auto-send invoice when project complete)',
            'Test thoroughly, monitor for errors, then move to next automation'
          ],
          timeInvestment: '10 hours to set up initial automations',
          successMetric: 'Saving 10+ hours/week on tasks now automated; fewer things falling through cracks',
          resultItProduces: 'Time freedom; consistent execution; reduced human error; scalable operations',
          authorityReference: 'Based on "4-Hour Workweek" automation principles and modern no-code automation tools'
        },
        {
          name: 'The Vendor Team',
          description: 'Build network of reliable contractors who extend your capacity',
          whatYoullHave: 'Roster of 3-5 trusted vendors (VA, bookkeeper, designer, developer, etc.) you can activate anytime',
          howToBuild: [
            'Identify your bottleneck tasks: what could you delegate but haven\'t? (bookkeeping, design, admin, tech)',
            'For each area, hire on trial: post job (Upwork, Fiverr), test 2-3 people with small paid project',
            'Pick winner for each role, document how to work with them (communication style, turn-around time, what they need from you)',
            'Give them steady small work to keep relationship warm (even if just 2-5 hours/month)',
            'Build "activation playbook": when you need them for bigger project, you know exactly how to engage them'
          ],
          timeInvestment: '15 hours to build initial vendor team',
          successMetric: 'Can scale up/down based on workload; not blocked by your personal capacity',
          resultItProduces: 'Variable cost labor; ability to take bigger projects; focused on your zone of genius',
          authorityReference: 'Based on virtual team building principles and Dan Martell\'s "Buy Back Your Time"'
        }
      ],
      scaling: [
        {
          name: 'The Tech Stack',
          description: 'Implement integrated software systems that run operations',
          whatYoullHave: 'Integrated CRM, project management, accounting, and automation tools that talk to each other',
          howToBuild: [
            'Audit current tools: what are you using? What\'s working? What breaks? Where are gaps?',
            'Define requirements: what do you need software to do? (sales pipeline, project tracking, invoicing, reporting)',
            'Research best-in-class: CRM (HubSpot, Salesforce), PM (Asana, Monday), Accounting (QBO, Xero), Automation (Zapier, Make)',
            'Implement systematically: one system at a time, migrate data, train team, test before going live',
            'Integrate tools: use native integrations or Zapier to connect systems (e.g., deal closed in CRM → project created in PM → invoice sent from accounting)'
          ],
          timeInvestment: '100 hours to select + implement + integrate',
          successMetric: 'Data flows automatically between systems; team loves the tools; operations run smoothly at scale',
          resultItProduces: 'Scalable operations; data integrity; automation; reduced manual work; visibility across business',
          authorityReference: 'Based on SaaS best practices and modern operations stack'
        },
        {
          name: 'The COO Role',
          description: 'Hire operator to run day-to-day business',
          whatYoullHave: 'Chief Operating Officer who owns execution while you focus on vision and strategy',
          howToBuild: [
            'Define COO role: runs daily operations, manages department heads, executes annual plan, frees you for strategy',
            'Look for "operator" profile: detail-oriented, loves execution, complements your visionary style',
            'Compensation: $100-150K + bonus on company metrics + equity (1-5% over 4 years)',
            'Transition plan: first 90 days shadow you, next 90 days you shadow them, then they own it',
            'Weekly CEO-COO meeting: you set direction, they execute; you handle vision/strategy/fundraising/board, they handle everything else',
            'Give them real power: hire/fire authority, budget control, decision-making - trust them'
          ],
          timeInvestment: '60 hours to recruit + 180-day transition',
          successMetric: 'Business runs day-to-day without you; COO handles 90% of execution; you work on strategy only',
          resultItProduces: 'Freedom from operations; scalable leadership; work ON business; exit-ready structure',
          authorityReference: 'Based on Gino Wickman\'s EOS "Integrator" role and Visionary/Integrator partnership'
        },
        {
          name: 'The Standard Operating Procedures',
          description: 'Document every process in the business',
          whatYoullHave: 'Complete SOP library covering every function: sales, delivery, operations, finance, HR',
          howToBuild: [
            'Assign process owners: each department leader owns documenting their processes',
            'Use simple template: Process name, Purpose, When to use, Step-by-step, Tools needed, Quality checks, Common mistakes',
            'Document systematically: start with most repeated processes, then work through everything',
            'Store centrally: Notion, Trainual, or wiki where everyone can access',
            'Keep updated: quarterly review where teams update SOPs based on what changed',
            'Test SOPs: new hires should be able to execute processes using SOPs alone'
          ],
          timeInvestment: '200 hours across team to document everything',
          successMetric: 'Every core process documented; new hires trained 70% faster; quality consistency improves',
          resultItProduces: 'Scalable operations; institutional knowledge captured; business runs without key people; sale-ready',
          authorityReference: 'Based on Michael Gerber\'s E-Myth systems and franchise model'
        }
      ],
      optimization: [
        {
          name: 'The Business Intelligence',
          description: 'Build real-time dashboards for every department',
          whatYoullHave: 'BI system with live dashboards showing key metrics for sales, operations, finance, customer success',
          howToBuild: [
            'Choose BI platform: Tableau, Power BI, Mode, Metabase, or Looker based on complexity/budget',
            'Connect data sources: integrate CRM, accounting, project management, support systems',
            'Build department dashboards: sales (pipeline, quota attainment), operations (efficiency, capacity), finance (cash, P&L), CS (health scores, NPS)',
            'Executive dashboard: company-wide KPIs visible to leadership team, updated real-time',
            'Train teams: each person knows their metrics, can access dashboards, makes data-driven decisions',
            'Weekly review ritual: every department reviews their dashboard, discusses trends, adjusts actions'
          ],
          timeInvestment: '100 hours to implement BI system',
          successMetric: 'Real-time visibility into business; data-driven decisions; faster problem identification',
          resultItProduces: 'Operational excellence; proactive management; competitive advantage; scalable decision-making',
          authorityReference: 'Based on modern Business Intelligence best practices and data-driven operations'
        },
        {
          name: 'The Process Excellence',
          description: 'Implement continuous improvement culture',
          whatYoullHave: 'Kaizen/Lean culture where teams continuously optimize processes',
          howToBuild: [
            'Train team on process improvement: basic Lean/Six Sigma concepts, identify waste, test improvements',
            'Monthly improvement meetings: each team identifies biggest bottleneck, proposes solution, tests, measures',
            'Implement suggestion system: anyone can propose improvement, gets reviewed weekly, best ideas implemented',
            'Track improvements: log each change, measure impact (time saved, quality improved, cost reduced)',
            'Celebrate wins: recognize teams that drive improvements, share learnings across company',
            'Annual process audit: review all core processes, eliminate redundancies, standardize best practices'
          ],
          timeInvestment: '40 hours to implement continuous improvement culture',
          successMetric: '10+ improvements per quarter; efficiency gains 15%+ annually; engaged team driving improvements',
          resultItProduces: 'Continuously improving operations; competitive efficiency; innovative culture; sustainable excellence',
          authorityReference: 'Based on Toyota Kaizen and Lean manufacturing principles adapted for services'
        },
        {
          name: 'The Disaster Recovery',
          description: 'Build backup and recovery systems for business continuity',
          whatYoullHave: 'DR plan and systems ensuring business survives any disruption (tech failure, key person loss, disaster)',
          howToBuild: [
            'Identify critical systems: what systems/people/processes are single points of failure?',
            'Build redundancy: backup servers, cross-trained team, documented processes, off-site data backup',
            'Create DR runbooks: step-by-step recovery procedures for each disaster scenario',
            'Test recovery: quarterly DR drill (simulate system failure, key person out, etc.), measure recovery time',
            'Insurance coverage: ensure adequate coverage for business interruption, key person, cyber, liability',
            'Update quarterly: as business evolves, update DR plans to cover new systems/risks'
          ],
          timeInvestment: '60 hours to build DR plan and systems',
          successMetric: 'Recover from any disaster in <24 hours; business continuity assured; sleep better',
          resultItProduces: 'Business resilience; risk mitigation; customer confidence; sale-ready infrastructure',
          authorityReference: 'Based on enterprise DR best practices and business continuity planning'
        }
      ],
      leadership: [
        {
          name: 'The Enterprise Resource Planning',
          description: 'Implement ERP system to unify all business operations',
          whatYoullHave: 'Integrated ERP platform (NetSuite, SAP, Microsoft Dynamics) running all operations',
          howToBuild: [
            'Select ERP: evaluate NetSuite (mid-market leader), SAP/Oracle (enterprise), Microsoft Dynamics (SMB-friendly)',
            'Hire implementation partner: experienced consultants to customize and deploy, budget $200-500K',
            'Phase rollout: start with financials, then inventory/operations, then CRM, then HR over 12-18 months',
            'Migrate data: clean legacy data, map to new system, test thoroughly before cutover',
            'Train organization: every department trained on their modules, change management critical',
            'Customize workflows: automate approvals, invoicing, reporting, procurement, project management',
            'Hire ERP admin: full-time owner of system optimization, user support, continuous improvement'
          ],
          timeInvestment: '12-18 months implementation + $300K-1M investment',
          successMetric: 'Single source of truth; real-time operations visibility; 40% reduction in manual data entry',
          resultItProduces: 'Operational efficiency; scalability to $50M+; acquisition-ready systems; competitive advantage',
          authorityReference: 'Based on ERP implementation best practices and digital transformation frameworks'
        },
        {
          name: 'The Global Operations',
          description: 'Build capability to operate across multiple countries',
          whatYoullHave: 'Operations infrastructure supporting international expansion (3+ countries)',
          howToBuild: [
            'Choose expansion markets: analyze TAM, competitive landscape, regulatory environment, cultural fit',
            'Set up legal entities: incorporate in each country, establish banking, tax compliance, employment law',
            'Hire country managers: local leaders who understand market, can hire/manage teams, drive P&L',
            'Adapt operations: localize product/service, pricing, marketing, customer support, delivery model',
            'Build global operating rhythm: weekly country manager calls, quarterly global offsites, unified reporting',
            'Centralize shared services: finance, HR, IT, marketing remain centralized for efficiency',
            'Financial consolidation: multi-currency accounting, consolidated P&L, transfer pricing, global cash management'
          ],
          timeInvestment: '12 months per country expansion',
          successMetric: 'Operating profitably in 3+ countries; 40%+ revenue from international; local teams self-sufficient',
          resultItProduces: 'Market diversification; growth acceleration; global brand; exit optionality',
          authorityReference: 'Based on international expansion frameworks and global scaling best practices'
        },
        {
          name: 'The M&A Integration Playbook',
          description: 'Build repeatable system for acquiring and integrating companies',
          whatYoullHave: 'Documented M&A playbook with acquisition criteria, due diligence, and 100-day integration plan',
          howToBuild: [
            'Define acquisition thesis: what companies to acquire (capabilities, customers, geography, technology)?',
            'Build acquisition team: corporate development leader, integration PMO, finance/legal support',
            'Create deal flow: outbound sourcing, broker relationships, inbound inquiries, build target list',
            'Due diligence checklist: financial, legal, operational, cultural, technology, customer validation',
            'Integration playbook: Day 1 (communications, access), Week 1 (quick wins), Month 1-3 (systems integration, org structure), Month 4-6 (cultural integration)',
            'Prove with first acquisition: execute playbook, measure synergies realized, refine process',
            'Scale M&A: target 2-4 acquisitions annually, use playbook to accelerate integration and capture value'
          ],
          timeInvestment: '6 months to build + first acquisition to test',
          successMetric: 'First acquisition integrated successfully; synergies realized within 6 months; repeatable playbook',
          resultItProduces: 'Inorganic growth capability; competitive advantage in M&A; faster path to scale; strategic optionality',
          authorityReference: 'Based on "Buy Then Build" and strategic M&A integration frameworks'
        }
      ],
      mastery: [
        {
          name: 'The AI-Powered Operations',
          description: 'Implement AI and automation across operations',
          whatYoullHave: 'AI-driven operations with predictive analytics, automation, and intelligent decision-making',
          howToBuild: [
            'Hire Head of AI/Automation: experienced in enterprise AI, $180-250K',
            'Map automation opportunities: where are manual processes? Repetitive work? Data-driven decisions?',
            'Implement AI platforms: Microsoft AI, Google Cloud AI, custom models for specific use cases',
            'Start with high-value: customer support (chatbots), operations (demand forecasting), finance (anomaly detection)',
            'Robotic process automation: automate data entry, report generation, compliance checks, workflows',
            'Predictive operations: forecast demand, optimize inventory, predict maintenance, route optimization',
            'Continuous learning: AI improves over time, measure ROI, expand successful applications',
            'Ethical AI framework: bias detection, transparency, human oversight, responsible AI use'
          ],
          timeInvestment: '18 months + $1-3M investment',
          successMetric: '40% of operational tasks automated; 30% efficiency gains; predictive capabilities across functions',
          resultItProduces: 'Operational excellence; competitive advantage; scalability; cost structure advantage',
          authorityReference: 'Based on enterprise AI adoption and digital transformation frameworks'
        },
        {
          name: 'The Platform Business Model',
          description: 'Transform from linear to platform business model',
          whatYoullHave: 'Platform connecting multiple stakeholders, network effects, ecosystem economics',
          howToBuild: [
            'Identify platform opportunity: can you connect buyers/sellers, creators/consumers, service providers/customers?',
            'Build platform infrastructure: marketplace tech, payment processing, ratings/reviews, search/discovery',
            'Solve chicken-egg: start with one side (supply or demand), provide enough value to attract other side',
            'Drive network effects: more users = more value, viral loops, data advantages with scale',
            'Platform governance: rules, quality standards, dispute resolution, trust and safety',
            'Ecosystem development: enable third parties to build on your platform, APIs, developer tools',
            'Monetization: transaction fees, subscriptions, premium features, data monetization',
            'Scale aggressively: platforms are winner-take-all, move fast to achieve critical mass'
          ],
          timeInvestment: '24 months + significant investment',
          successMetric: 'Platform GMV $10M+; network effects evident; ecosystem partners building on platform',
          resultItProduces: 'Exponential growth potential; network effects moat; higher valuation multiples; market dominance',
          authorityReference: 'Based on "Platform Revolution" and marketplace strategy frameworks'
        },
        {
          name: 'The Operational Excellence at Scale',
          description: 'Build world-class operations supporting $100M+ revenue',
          whatYoullHave: 'Enterprise-grade operations with Six Sigma, lean principles, and continuous improvement culture',
          howToBuild: [
            'Hire COO from larger company: proven at $100M+ scale, brings playbook, $250-400K + equity',
            'Implement operating system: EOS, 4DX, or custom - unified methodology across company',
            'Six Sigma/Lean: certify leaders, continuous improvement projects, eliminate waste systematically',
            'Center of excellence: shared services (finance, HR, IT, legal) supporting all business units',
            'Global process standardization: same process everywhere, local adaptation where needed',
            'Real-time operations control tower: dashboards monitoring all critical processes, AI-driven alerts',
            'Quality management: ISO certification, audit processes, quality metrics, zero-defect mindset',
            'Operational resilience: redundant systems, disaster recovery, business continuity planning'
          ],
          timeInvestment: '18-24 months transformation',
          successMetric: 'Operating margin 25%+; process efficiency 90%+; zero critical incidents; ready for $100M+ scale',
          resultItProduces: 'Cost advantage; quality reputation; scalability; acquisition premium; IPO-ready operations',
          authorityReference: 'Based on operational excellence frameworks and enterprise scaling best practices'
        }
      ]
    }
  },

  // ENGINE 6: MONEY MACHINE
  {
    id: 'finance',
    name: 'The Money Machine',
    subtitle: 'Financial Management',
    description: 'Generates cash, profit, and owner wealth systematically',
    metrics: ['Revenue growth', 'Profit margin', 'Cash reserves', 'Owner wealth'],
    stages: {
      foundation: [
        {
          name: 'Money in the Bank',
          description: 'Know your cash position, burn rate, and runway',
          whatYoullHave: 'Weekly cash tracker showing: current balance, this week\'s in/out, 13-week projection, runway in months',
          howToBuild: [
            'Every Monday 9am: Open bank account, write down current balance in spreadsheet',
            'Log this week: money that came in (by source), money that went out (by category)',
            'Calculate weekly burn: average weekly expenses for last 4 weeks',
            'Project 13 weeks: if nothing changes, where will cash be? (current balance - (burn rate × 13 weeks))',
            'Calculate runway: current balance ÷ weekly burn = how many weeks until zero'
          ],
          timeInvestment: '30 minutes to set up + 10 min every Monday',
          successMetric: 'Always know within $500 how much cash you have; can answer "how many months of runway?" instantly',
          resultItProduces: 'No cash surprises; early warning on problems; sleep better at night; confident decision-making',
          authorityReference: 'Synthesizes Keith Cunningham\'s "Numbers Tell Story" and cash management best practices'
        },
        {
          name: 'Profitable Pricing',
          description: 'Set prices that cover costs and generate owner pay',
          whatYoullHave: 'Pricing formula: Cost + Overhead + Profit + Owner Pay = Your Price, documented and defended',
          howToBuild: [
            'Calculate direct costs: what it costs you to deliver (labor, materials, tools, time)',
            'Add overhead: rent, software, insurance, marketing - divide by projects/month to get overhead per project',
            'Add profit margin: 20% minimum (if $100 in costs, add $20)',
            'Add owner pay: what you need to earn per hour/project to pay yourself livable wage',
            'Test it: does this price make you profitable? If not, raise it. If customers won\'t pay it, fix your costs or find better customers.'
          ],
          timeInvestment: '3 hours to calculate properly',
          successMetric: 'Every sale is profitable; you\'re paying yourself; margin is healthy (15-20%+)',
          resultItProduces: 'Sustainable business; owner compensation; ability to invest in growth; no more "busy but broke"',
          authorityReference: 'Based on Mike Michalowicz\'s "Profit First" and value-based pricing principles'
        },
        {
          name: 'Financial Discipline',
          description: 'Track every dollar with simple, consistent systems',
          whatYoullHave: 'Daily money tracking habit: 10 minutes at end of day logging all income and expenses',
          howToBuild: [
            'Choose your tool: Wave (free), QuickBooks, Excel - anything you\'ll actually use',
            'Set categories: Revenue (by source), Cost of Goods Sold, Operating Expenses (by type: marketing, software, etc.)',
            'Daily ritual: end of day, log everything. "Money in: $X from [source]." "Money out: $Y for [category]."',
            'Takes 10 min/day vs. 8 hours of panic at tax time',
            'Weekly review: every Friday, look at week\'s numbers. Where did money go? Any surprises?'
          ],
          timeInvestment: '1 hour to set up + 10 min/day',
          successMetric: '100% of transactions logged within 24 hours; can produce P&L anytime; tax prep takes 2 hours not 20',
          resultItProduces: 'Financial clarity; no missed deductions; tax-ready always; data to make smart decisions',
          authorityReference: 'Based on Mike Michalowicz\'s "Profit First" daily discipline and accounting best practices'
        }
      ],
      traction: [
        {
          name: 'The Profit First System',
          description: 'Implement allocation system that guarantees profit',
          whatYoullHave: 'Bank account structure and allocation percentages that pay you first and force profitable operations',
          howToBuild: [
            'Open 5 bank accounts: Income (all deposits), Profit (5%), Owner Pay (50%), Tax (15%), Operating Expenses (30%)',
            'Every deposit goes to Income, then twice/month transfer to other accounts by percentages',
            'Run business only from Operating Expenses account - forces you to operate profitably',
            'Pay yourself from Owner Pay account every 2 weeks like an employee',
            'Quarterly profit distribution: take 50% of Profit account, leave 50% as reserve'
          ],
          timeInvestment: '4 hours to set up accounts + 1 hour twice/month for transfers',
          successMetric: 'Consistent profit every quarter; owner gets paid reliably; business lives within means',
          resultItProduces: 'Forced profitability; cash reserves growing; owner income predictable; financial peace of mind',
          authorityReference: 'Based on Mike Michalowicz\'s "Profit First" methodology - the envelope system for business'
        },
        {
          name: 'The Pricing Power',
          description: 'Raise prices without losing customers',
          whatYoullHave: 'New pricing structure + communication plan that increases revenue 15-30% in 90 days',
          howToBuild: [
            'Calculate current hourly rate: (annual revenue ÷ 2000 hours) - this is what you\'re really making',
            'Research market: what do competitors charge? Survey 5 customers: "What would you pay for this?"',
            'Set new prices: 20-30% higher for new customers, 10-15% higher for renewals (with 90-day notice)',
            'Improve packaging: change how you describe value, add guarantees, bundle in extras',
            'Test with next 5 prospects, measure close rate. If same or higher, keep new pricing.'
          ],
          timeInvestment: '6 hours to research and implement',
          successMetric: 'Prices increased; close rate stays same or improves; revenue per customer up 20%+',
          resultItProduces: 'Higher profit per sale; attract better customers; repel price shoppers; confidence in your value',
          authorityReference: 'Synthesizes Dan Kennedy\'s premium positioning and Jason Fried\'s value-based pricing'
        },
        {
          name: 'The Cash Flow Forecast',
          description: 'Build 90-day rolling forecast so you\'re never surprised',
          whatYoullHave: 'Spreadsheet showing projected cash in/out for next 90 days, updated weekly',
          howToBuild: [
            'List all expected income next 90 days: recurring revenue, proposals out, likely new deals',
            'List all expected expenses: payroll, rent, subscriptions, taxes, estimated variable costs',
            'Calculate week-by-week cash balance: starting balance + income - expenses',
            'Flag danger weeks: any week going below your minimum ($X in bank)',
            'Weekly update: every Monday, adjust forecast based on what actually happened + new information'
          ],
          timeInvestment: '3 hours to build initial forecast + 30 min/week to update',
          successMetric: 'No cash surprises; can see problems 30-60 days out; make decisions with clarity',
          resultItProduces: 'Cash confidence; proactive decisions; avoid panic; sleep better; strategic growth planning',
          authorityReference: 'Based on Keith Cunningham\'s "4D Cash Flow" and CFO-level financial management'
        }
      ],
      scaling: [
        {
          name: 'The CFO Function',
          description: 'Hire or outsource CFO to manage financial strategy',
          whatYoullHave: 'CFO (full-time or fractional) providing financial leadership, forecasting, and strategic guidance',
          howToBuild: [
            'Decide: Full-time CFO ($120-180K) if $2M+ revenue, or Fractional CFO ($3-10K/month) if $1-2M',
            'Define role: financial strategy, cash management, forecasting, board reporting, financing/fundraising',
            'Look for strategic partner: not just accountant, but business strategist who understands your industry',
            'Weekly CFO meeting: review metrics, discuss financial decisions, plan for growth',
            'Quarterly board package: CFO prepares financial reports, forecasts, scenario planning',
            'Leverage their network: fundraising, banking relationships, M&A advisors'
          ],
          timeInvestment: '40 hours to recruit fractional or full-time CFO',
          successMetric: 'Financial strategy improved; financing in place; you understand numbers; confident in financial decisions',
          resultItProduces: 'Strategic financial management; access to capital; investor-ready; sophisticated financial operations',
          authorityReference: 'Based on fractional CFO model and CFO best practices'
        },
        {
          name: 'The Unit Economics',
          description: 'Understand profitability at customer/product level',
          whatYoullHave: 'Dashboard showing profit per customer, per product, per channel - know what actually makes money',
          howToBuild: [
            'Calculate CAC by channel: how much to acquire customer from each source?',
            'Calculate LTV by segment: lifetime value for different customer types',
            'Calculate gross margin by offering: revenue minus direct costs (COGS, delivery labor)',
            'Build unit economics dashboard: CAC, LTV, LTV:CAC ratio (target 3:1), payback period (target <12 months)',
            'Monthly review: which customers/products/channels are profitable? Which aren\'t? Adjust strategy.',
            'Kill losers: products/channels with negative unit economics need to be fixed or cut'
          ],
          timeInvestment: '20 hours to build dashboard',
          successMetric: 'Know exactly which customers/products/channels make money; decisions based on unit economics',
          resultItProduces: 'Profitable growth; data-driven decisions; eliminate money losers; scale winners',
          authorityReference: 'Based on SaaS unit economics and David Skok\'s metrics'
        },
        {
          name: 'The Capital Strategy',
          description: 'Build 3-year capital plan for growth',
          whatYoullHave: 'Written capital strategy: how much you need, what for, where to get it, terms you\'ll accept',
          howToBuild: [
            'Forecast 3-year financials: revenue, expenses, cash flow based on growth plan',
            'Identify capital needs: when will you run out of cash? How much do you need to fund growth?',
            'Evaluate options: bootstrap (self-fund), debt (line of credit, term loan, SBA), equity (investors, partners)',
            'For each option: cost of capital, terms, dilution (if equity), personal guarantee required?',
            'Build relationships: meet with lenders/investors before you need money',
            'Decision framework: what terms are acceptable? What\'s non-negotiable? When would you take money vs. grow slower?'
          ],
          timeInvestment: '30 hours to build capital strategy',
          successMetric: 'Clear 3-year financial plan; access to capital when needed; grow at desired pace',
          resultItProduces: 'Growth optionality; avoid cash crisis; strategic capital use; investor-ready',
          authorityReference: 'Based on venture capital fundraising and strategic finance principles'
        }
      ],
      optimization: [
        {
          name: 'The Financial Forecasting',
          description: 'Build sophisticated 3-year financial model',
          whatYoullHave: 'Dynamic financial model with scenario planning (best/base/worst case) driving strategic decisions',
          howToBuild: [
            'Build driver-based model: revenue (units × price × growth), costs (fixed + variable), headcount plan',
            'Create scenarios: conservative (50% confidence), base (70%), aggressive (30%) with different assumptions',
            'Monthly actual vs. forecast: compare results to predictions, understand variances, update assumptions',
            'Sensitivity analysis: what happens if growth slows 20%? If we lose key customer? If costs rise 15%?',
            'Use for decisions: hiring (can we afford?), pricing (what impact?), investments (ROI timeline?)',
            'Board reporting: present forecast at board meetings, show progress against plan, discuss key risks'
          ],
          timeInvestment: '80 hours to build financial model',
          successMetric: 'Forecast accuracy improves quarterly; confident strategic decisions; prepared for multiple scenarios',
          resultItProduces: 'Strategic clarity; risk management; investor confidence; data-driven growth planning',
          authorityReference: 'Based on CFO-level financial modeling and scenario planning best practices'
        },
        {
          name: 'The Tax Strategy',
          description: 'Optimize tax structure for maximum efficiency',
          whatYoullHave: 'Tax-optimized entity structure, timing strategies, and advisor relationships saving significant taxes',
          howToBuild: [
            'Hire tax strategist: CPA who specializes in your business model, pay for proactive planning not just compliance',
            'Review entity structure: LLC vs. S-Corp vs. C-Corp? Multiple entities for IP, real estate? International structure?',
            'Implement timing strategies: when to recognize revenue/expenses, bonus timing, major purchases, retirement contributions',
            'Leverage tax credits: R&D credits, hiring credits, energy credits, state/local incentives',
            'Plan for exit: what structure optimizes sale tax treatment? QSB status? Installment sale?',
            'Quarterly tax planning: don\'t wait until year-end, make moves throughout year to optimize'
          ],
          timeInvestment: '40 hours with tax advisor',
          successMetric: 'Effective tax rate 5-10 points lower than before; confident in tax position; proactive not reactive',
          resultItProduces: 'Tax savings; optimized structure; cash retained for growth; compliant and strategic',
          authorityReference: 'Based on advanced tax planning strategies for operating businesses'
        },
        {
          name: 'The Wealth Building',
          description: 'Build personal wealth from business success',
          whatYoullHave: 'Wealth plan extracting value from business while funding personal financial goals',
          howToBuild: [
            'Define personal financial goals: retirement needs, kids education, real estate, lifestyle, charitable giving',
            'Optimize owner compensation: balance salary (predictable), distributions (tax-efficient), retained earnings (growth)',
            'Build personal wealth outside business: invest distributions in diversified portfolio, don\'t keep all eggs in business',
            'Plan for liquidity: when/how to extract wealth? Dividends, management fees, sale, recapitalization?',
            'Protect wealth: adequate insurance, estate planning, asset protection, succession planning',
            'Work with wealth advisor: fiduciary who understands business owners, integrates business and personal planning'
          ],
          timeInvestment: '30 hours with wealth advisor',
          successMetric: 'Clear wealth plan; extracting value tax-efficiently; diversified beyond business; sleep better',
          resultItProduces: 'Personal financial security; diversified wealth; family provided for; freedom from business dependency',
          authorityReference: 'Based on business owner wealth management and Exit Planning Institute principles'
        }
      ],
      leadership: [
        {
          name: 'The Strategic Capital',
          description: 'Build relationships with institutional capital sources',
          whatYoullHave: 'Access to growth capital (private equity, venture debt, family offices) for expansion',
          howToBuild: [
            'Hire CFO with capital markets experience: has raised capital before, relationships with investors',
            'Build investor relationships: coffee with PE firms, VCs, family offices - before you need capital',
            'Prepare company for capital: clean financials, board deck, growth story, competitive positioning',
            'Understand capital options: equity (dilutive, patient), debt (non-dilutive, covenants), revenue-based financing',
            'Run process when ready: banker/advisor manages process, competitive tension, negotiate terms',
            'Use capital strategically: M&A, geographic expansion, product development, sales team build-out'
          ],
          timeInvestment: '6 months to build relationships and prepare',
          successMetric: 'Term sheets from 3+ capital sources; competitive process; strategic partnership beyond capital',
          resultItProduces: 'Fuel for growth; strategic partners; optionality; validation of business value',
          authorityReference: 'Based on growth capital fundraising and private equity partnership frameworks'
        },
        {
          name: 'The Board of Directors',
          description: 'Build fiduciary board to govern company',
          whatYoullHave: 'Formal board of directors with independent directors providing governance and strategic guidance',
          howToBuild: [
            'Determine board composition: 5-7 members (CEO, 2 management, 2-3 independent, 1-2 investor seats if applicable)',
            'Recruit independent directors: former CEOs, functional experts (CFO, CRO), industry veterans - pay $25-50K + equity',
            'Set governance structure: quarterly board meetings, committee structure (audit, comp, nominating)',
            'Board materials: CFO prepares board deck (financial performance, KPIs, strategic updates, key decisions)',
            'Run professional meetings: pre-reads sent 1 week prior, structured agenda, executive session without management',
            'Fiduciary duties: board approves budgets, major investments, executive comp, M&A, financing',
            'D&O insurance: protect board members with adequate coverage'
          ],
          timeInvestment: '80 hours to recruit and establish board',
          successMetric: 'Board meets quarterly; strategic guidance driving business forward; governance protects all stakeholders',
          resultItProduces: 'Strategic oversight; accountability; expertise; exit-ready governance; fiduciary protection',
          authorityReference: 'Based on corporate governance best practices and board effectiveness research'
        },
        {
          name: 'The Capital Structure Optimization',
          description: 'Optimize debt/equity mix for growth and returns',
          whatYoullHave: 'Sophisticated capital structure balancing growth, risk, and returns',
          howToBuild: [
            'Work with investment banker: model different capital structures and their impact on returns',
            'Debt capacity: calculate sustainable leverage (typically 2-3x EBITDA), negotiate credit facility ($5-20M)',
            'Equity structure: recap to extract owner value, bring in strategic investors, create option pool for executives',
            'Tax optimization: structure to minimize tax drag (C-corp vs. pass-through, holdco structure, etc.)',
            'Model scenarios: how does capital structure perform under growth/flat/down scenarios?',
            'Refinance opportunistically: as business grows, access better terms, lower cost of capital',
            'Dividend policy: balance reinvestment with owner distributions, tax-efficient extraction'
          ],
          timeInvestment: '100 hours with advisors',
          successMetric: 'Optimized capital structure; owner wealth extracted tax-efficiently; balance sheet supports growth',
          resultItProduces: 'Financial flexibility; owner liquidity; growth capital; tax efficiency; enterprise value maximized',
          authorityReference: 'Based on corporate finance theory and middle-market capital structure optimization'
        }
      ],
      mastery: [
        {
          name: 'The IPO Readiness',
          description: 'Prepare company for public markets',
          whatYoullHave: 'Public-company-ready financials, governance, and operations',
          howToBuild: [
            'Hire public company CFO: SEC reporting experience, investor relations, $300-500K + equity',
            'SOX compliance: internal controls, audit processes, financial reporting infrastructure',
            'Build finance team: controllers, FP&A, treasury, tax, IR - 10-15 person finance org',
            'Audited financials: 3 years of clean audits from Big 4 accounting firm',
            'Board transformation: add independent directors with public company experience, audit/comp committees',
            'Quarterly earnings discipline: 13-week forecasts, monthly closes in 5 days, predictable performance',
            'S-1 preparation: work with investment banks, draft registration statement, roadshow materials',
            'Dual-track process: prepare for IPO while entertaining acquisition offers, maximize optionality'
          ],
          timeInvestment: '18-24 months + $2-5M investment',
          successMetric: 'SOX compliant; Big 4 clean audit; investment banker engaged; ready to file S-1',
          resultItProduces: 'Liquidity event; permanent capital; currency for M&A; brand value; exit achieved',
          authorityReference: 'Based on IPO preparation and public company readiness frameworks'
        },
        {
          name: 'The Strategic Exit',
          description: 'Execute strategic sale at premium valuation',
          whatYoullHave: 'Strategic exit to private equity or strategic buyer at 6-10x EBITDA',
          howToBuild: [
            'Hire investment banker: M&A advisor, industry expertise, track record, $1-2M+ success fee',
            'Prepare for sale: quality of earnings, clean legal, customer concentration reduced, management team locked in',
            'Build competitive process: identify 20-30 buyers (strategic + financial), create auction dynamics',
            'Prepare management presentation: growth story, market opportunity, competitive advantages, financial projections',
            'Data room preparation: clean VDR with all due diligence materials organized',
            'LOI negotiation: multiple offers, negotiate terms, exclusivity period, valuation optimization',
            'Due diligence: 60-90 days, respond quickly, maintain momentum, address concerns',
            'Close transaction: legal documents, financing secured, regulatory approvals, transition planning'
          ],
          timeInvestment: '12-18 months from prep to close',
          successMetric: 'Multiple offers; premium valuation (8x+ EBITDA); deal closed; wealth created',
          resultItProduces: 'Liquidity; wealth realization; optionality for next chapter; legacy secured',
          authorityReference: 'Based on M&A sell-side advisory and strategic exit frameworks'
        },
        {
          name: 'The Financial Legacy',
          description: 'Build multigenerational wealth and impact',
          whatYoullHave: 'Family office managing wealth, philanthropic foundation, intergenerational wealth transfer',
          howToBuild: [
            'Establish family office: manage investments, tax planning, estate planning, philanthropic giving, $50M+ typically',
            'Diversify wealth: exit proceeds invested across asset classes (stocks, bonds, real estate, PE, alternatives)',
            'Estate planning: trusts, gifting strategies, succession planning, minimize estate taxes',
            'Create philanthropic foundation: align with values, professional management, family involvement',
            'Next generation education: teach kids about wealth, responsibility, family values, financial literacy',
            'Document family story: capture business journey, lessons learned, values to pass on',
            'Ongoing governance: family council, investment committee, succession planning for next generation'
          ],
          timeInvestment: '12 months + ongoing management',
          successMetric: 'Wealth preserved and growing; family aligned on values; philanthropic impact; legacy secured',
          resultItProduces: 'Multigenerational wealth; family harmony; societal impact; values preserved; freedom',
          authorityReference: 'Based on family office management and multigenerational wealth transfer planning'
        }
      ]
    }
  },

  // ENGINE 7: LEADERSHIP MACHINE
  {
    id: 'leadership',
    name: 'The Leadership Machine',
    subtitle: 'Owner & Leadership Development',
    description: 'Develops you into the leader your business needs',
    metrics: ['Decision quality', 'Strategic clarity', 'Leadership effectiveness', 'Business direction'],
    stages: {
      foundation: [
        {
          name: 'Owner Mindset',
          description: 'Stop being the technician, start being the business builder',
          whatYoullHave: 'Weekly habit of tracking time spent ON business (strategy) vs. IN business (doing the work)',
          howToBuild: [
            'Every Friday: review your week, categorize hours into: IN (doing client work, execution) vs. ON (strategy, systems, planning)',
            'Set goal: shift from 90% IN to 70% IN, 30% ON over next 90 days',
            'Block "ON time": every week, schedule 4 hours minimum for working ON business (building systems, planning, thinking)',
            'Ask weekly: "What did I do this week that only I can do as the owner? What did I do that someone else should do?"',
            'Celebrate progress: when you delegate a task or build a system, that\'s a win'
          ],
          timeInvestment: '30 min/week to track and plan',
          successMetric: 'Shifting from 10% ON business to 30% ON business; can see the progress weekly',
          resultItProduces: 'Strategic thinking time; business that grows not just gets busy; mindset shift from worker to owner',
          authorityReference: 'Based on Michael Gerber\'s "E-Myth" and Dan Sullivan\'s "Entrepreneurial Time System"'
        },
        {
          name: 'Decision Confidence',
          description: 'Make calls with incomplete information and move forward',
          whatYoullHave: 'Decision journal tracking: decisions made, data used, outcome, lesson learned',
          howToBuild: [
            'Start decision journal (notebook or Google Doc): date, decision, what I knew, what I didn\'t know, what I decided, why',
            'Set decision speed goal: 24-48 hours max for most decisions (don\'t marinate for weeks)',
            'Use simple framework: Will this hurt us if wrong? (Low risk = decide fast. High risk = gather more data.)',
            'Review monthly: what decisions were right? Wrong? What can I learn?',
            'Build confidence: you\'ll see you\'re right more than wrong, and when wrong, you recover'
          ],
          timeInvestment: '10 min per decision to journal + 1 hour/month review',
          successMetric: 'Decision speed increases; fewer decisions agonized over; confidence in your judgment grows',
          resultItProduces: 'Faster action; less analysis paralysis; business moves forward; confidence compounds',
          authorityReference: 'Based on Keith Cunningham\'s "Thinking Time" and Jeff Bezos\'s "Two-Way Door" decisions'
        },
        {
          name: 'Get a Guide',
          description: 'Find mentor or coach who\'s been where you\'re going',
          whatYoullHave: 'Coach, mentor, or peer group that you meet with monthly minimum',
          howToBuild: [
            'Identify who\'s 3-5 years ahead of you in business (revenue, stage, industry)',
            'Reach out to 5 potential mentors: "I admire what you\'ve built. Could I buy you coffee and learn from you?"',
            'If they say yes: prepare 5 smart questions, show up on time, take notes, follow their advice',
            'Alternative: join peer group (Vistage, EO, local mastermind) or hire coach (investment but faster progress)',
            'Schedule recurring: monthly coffee, quarterly check-in, or weekly group - make it ritual not random'
          ],
          timeInvestment: '2 hours/month with mentor/coach',
          successMetric: 'Regular guidance from someone who\'s been there; implement at least 1 insight per conversation',
          resultItProduces: 'Avoid expensive mistakes; compressed learning curve; accountability; perspective when you\'re stuck',
          authorityReference: 'Based on Dan Sullivan\'s coaching model and "Positioning" book mentor principles'
        }
      ],
      traction: [
        {
          name: 'The Strategic Plan',
          description: 'Build simple 1-page annual plan you actually use',
          whatYoullHave: '1-page strategic plan with 3-year vision, 1-year goals, quarterly priorities, and key metrics',
          howToBuild: [
            '3-Year Vision: Where do you want business in 3 years? (revenue, team size, what you deliver, how you work)',
            '1-Year Goals: What needs to happen this year to move toward that vision? (3-5 goals max)',
            'Quarterly Rocks: Break year into quarters, pick 3-5 priorities per quarter (what gets focus)',
            'Key Metrics: Choose 5-7 numbers you\'ll track weekly (revenue, leads, profit, customer count, etc.)',
            'Review monthly: Are we on track? What needs to change? Update plan as you learn.'
          ],
          timeInvestment: '8 hours to create + 2 hours/quarter to update',
          successMetric: 'You can explain strategy in 5 minutes; team knows what matters; quarterly priorities completed',
          resultItProduces: 'Strategic clarity; aligned team; focused effort; measurable progress; confidence in direction',
          authorityReference: 'Based on Verne Harnish\'s "One-Page Strategic Plan" and EOS "Vision/Traction Organizer"'
        },
        {
          name: 'The Decision Framework',
          description: 'Build system for making faster, better decisions',
          whatYoullHave: 'Decision-making framework with criteria, process, and delegation rules',
          howToBuild: [
            'Categorize decisions: Type 1 (irreversible, high-impact) vs. Type 2 (reversible, lower stakes)',
            'Set authority levels: $0-500 (team decides), $500-5K (you approve), $5K+ (full analysis)',
            'Create criteria doc: "When deciding X, we consider: [1] customer impact, [2] profit impact, [3] team impact, [4] strategic fit"',
            'Speed rule: Type 2 decisions in 24 hours or less (decide fast, learn, adjust)',
            'Quarterly review: which decisions were good? Which weren\'t? What can we learn?'
          ],
          timeInvestment: '4 hours to build framework',
          successMetric: 'Decisions happen 2x faster; fewer bottlenecks; team empowered; fewer regrets',
          resultItProduces: 'Decision speed; team autonomy; consistent quality; learning culture; leadership leverage',
          authorityReference: 'Based on Jeff Bezos\'s "Type 1 vs Type 2" decisions and Ray Dalio\'s "Principles"'
        },
        {
          name: 'The Leadership Development',
          description: 'Invest in yourself systematically',
          whatYoullHave: 'Personal development plan with books, courses, coaching, and peer group',
          howToBuild: [
            'Assess gaps: What skills does your business need that you don\'t have? (finance, sales, leadership, marketing, strategy)',
            'Create learning plan: 1 book/month, 1 course/quarter, 1 conference/year on your gap areas',
            'Join peer group: EO, Vistage, YPO, or local mastermind with other business owners at your level',
            'Hire coach or advisor: someone who\'s built business to your next level',
            'Block learning time: 5 hours/week for reading, courses, reflection (Friday mornings work well)'
          ],
          timeInvestment: '5 hours/week on development',
          successMetric: 'Implementing new skills quarterly; feel less stuck; growing as fast as business',
          resultItProduces: 'Leadership capacity; fresh perspectives; network of peers; confidence in next level',
          authorityReference: 'Based on Marshall Goldsmith\'s "What Got You Here Won\'t Get You There" and continuous learning principles'
        }
      ],
      scaling: [
        {
          name: 'The Vision Clarity',
          description: 'Define compelling 10-year vision for the company',
          whatYoullHave: 'Written 10-year vision (BHAG), 3-year strategy, and annual plan that rally the team',
          howToBuild: [
            'Define BHAG (Big Hairy Audacious Goal): 10-year vision that\'s bold, clear, compelling (e.g., "$50M revenue, 500 employees, industry leader")',
            'Work backwards: what needs to be true in 3 years to hit 10-year vision? (revenue, team, market position)',
            'Define 1-year plan: quarterly goals that move toward 3-year strategy',
            'Communicate relentlessly: all-hands, one-on-ones, quarterly town halls - paint the picture repeatedly',
            'Cascade goals: each department/person knows how their work connects to vision',
            'Quarterly check: are we on track? What needs to change? Update plan as you learn.'
          ],
          timeInvestment: '40 hours to craft vision + ongoing communication',
          successMetric: 'Team can articulate the vision; decisions aligned with long-term goals; everyone knows "why"',
          resultItProduces: 'Aligned organization; inspired team; strategic clarity; magnet for talent; competitive advantage',
          authorityReference: 'Based on Jim Collins\'s "BHAG" and Cameron Herold\'s "Vivid Vision"'
        },
        {
          name: 'The Board of Advisors',
          description: 'Build advisory board of experienced operators',
          whatYoullHave: '3-5 advisors who provide strategic guidance, connections, and accountability',
          howToBuild: [
            'Identify gaps: what experience/expertise/network do you need? (industry, finance, scaling, exit)',
            'Recruit advisors: look for operators who\'ve built businesses 2-3 stages ahead of you',
            'Structure advisory board: formal or informal, equity (0.25-1% each) or consulting fee, quarterly meetings',
            'Set expectations: time commitment (4-10 hours/quarter), what you need from them, what they get',
            'Prepare well: send pre-read materials, agenda, specific questions - respect their time',
            'Follow through: implement their advice, report back on results, make them look good'
          ],
          timeInvestment: '60 hours to recruit + ongoing quarterly meetings',
          successMetric: 'Advisors providing high-value guidance; avoiding expensive mistakes; doors opening from their network',
          resultItProduces: 'Experienced guidance; expanded network; faster learning; better decisions; increased credibility',
          authorityReference: 'Based on advisory board best practices and strategic mentorship'
        },
        {
          name: 'The CEO Evolution',
          description: 'Transform from operator to strategic leader',
          whatYoullHave: 'Calendar showing 50%+ time on strategic work (vision, key relationships, major decisions)',
          howToBuild: [
            'Audit time: where do you spend time now? (likely 70% operations, 30% strategy - needs to flip)',
            'Define CEO role: only you can do vision, culture, key hires, major partnerships, fundraising, board',
            'Delegate everything else: sales, delivery, operations, day-to-day decisions go to your leadership team',
            'Restructure calendar: Monday (CEO Day), Tuesday-Thursday (key meetings/decisions), Friday (learning/planning)',
            'Kill old habits: stop jumping into tactical work; coach leaders to solve problems instead of solving for them',
            'Join CEO peer group: Vistage, EO, YPO, or private mastermind to stay in CEO mindset'
          ],
          timeInvestment: '90 days to fully transition mindset and calendar',
          successMetric: '50%+ time on strategic work; business grows without you in operations; working ON not IN',
          resultItProduces: 'Strategic leadership; business scales faster; preparing for exit; life as CEO not operator',
          authorityReference: 'Based on Dan Sullivan\'s "Strategic Coach" and entrepreneurial time management'
        }
      ],
      optimization: [
        {
          name: 'The Exit Readiness',
          description: 'Build business that\'s attractive to buyers',
          whatYoullHave: 'Exit-ready business with clean financials, transferable value, and documented systems',
          howToBuild: [
            'Hire exit planning advisor: understand what buyers want, typical multiples, dealbreakers to fix',
            'Build sellable assets: recurring revenue, customer diversification (no single customer >15%), documented IP',
            'Clean financials: separate personal/business expenses, accurate books, 3 years of audited or reviewed statements',
            'Reduce owner dependency: business runs 90 days without you; management team in place; not a "job you own"',
            'Document everything: SOPs, customer lists, vendor contracts, employee agreements, compliance records',
            'Annual business valuation: track enterprise value, understand what drives it, make decisions to increase value'
          ],
          timeInvestment: '100 hours to make business exit-ready',
          successMetric: 'Business valued at 4-6x EBITDA; ready to sell on 90 days notice; optionality',
          resultItProduces: 'Exit optionality; increased enterprise value; leverage in life decisions; wealth creation',
          authorityReference: 'Based on Exit Planning Institute and Built to Sell principles'
        },
        {
          name: 'The Strategic Alliances',
          description: 'Build partnerships that accelerate growth',
          whatYoullHave: '3-5 strategic partnerships with larger companies that distribute your product/service',
          howToBuild: [
            'Identify potential partners: who serves your ideal customer? Who could distribute you? Who has complementary offerings?',
            'Research partners: understand their business model, what they value, what they need',
            'Craft partnership proposal: how do they win? (revenue share, customer satisfaction, competitive advantage)',
            'Start small: pilot partnership with one partner, prove ROI, use as case study for others',
            'Formalize agreements: clear contracts, revenue splits, lead requirements, support obligations',
            'Manage relationships: quarterly business reviews with partners, optimize performance, expand successful partnerships'
          ],
          timeInvestment: '80 hours to build first strategic partnerships',
          successMetric: 'Partners driving 20-30% of new revenue; accelerated distribution; reduced customer acquisition cost',
          resultItProduces: 'Scaled distribution; strategic moats; faster growth; valuable relationships',
          authorityReference: 'Based on strategic partnership playbooks and channel development'
        },
        {
          name: 'The Thought Leadership',
          description: 'Become recognized industry expert',
          whatYoullHave: 'Published book, speaking circuit presence, media appearances establishing you as industry authority',
          howToBuild: [
            'Write book: document your methodology, publish on Amazon (self-pub or traditional), use for credibility/lead gen',
            'Speaking strategy: keynote at industry conferences (10-15x/year), virtual summits, corporate events',
            'Media relations: build relationships with journalists, provide expert commentary, get quoted in industry publications',
            'Podcast tour: appear on 20-30 podcasts per year reaching your ideal customers',
            'Create IP: trademark your methodology, copyright materials, build defensible intellectual property',
            'Leverage for business: thought leadership drives inbound leads, premium pricing, strategic partnerships'
          ],
          timeInvestment: '200 hours to write book + ongoing speaking/media',
          successMetric: 'Book published; speaking 10+ times/year; media mentions; inbound leads from thought leadership',
          resultItProduces: 'Industry authority; competitive moat; premium pricing; inbound opportunities',
          authorityReference: 'Based on thought leadership strategies and personal branding'
        }
      ],
      leadership: [
        {
          name: 'The CEO Role Definition',
          description: 'Clarify and protect your role as CEO',
          whatYoullHave: 'Clear definition of CEO role focusing on 4 responsibilities: vision, capital, culture, accountability',
          howToBuild: [
            'Define CEO-only work: [1] Vision (where are we going?), [2] Capital (access to money/resources), [3] Culture (who are we?), [4] Accountability (holding leaders accountable)',
            'Delegate everything else: operations, sales, delivery, finance, HR - all owned by executives',
            'Time allocation target: 40% vision/strategy, 30% people/culture, 20% capital/board, 10% accountability',
            'Weekly CEO time: Monday (plan week), Tuesday-Thursday (meetings/execution), Friday (strategic thinking)',
            'Say no to operational work: "That\'s [Executive]\'s decision. I trust them to handle it."',
            'Review quarterly: is your time allocated to CEO work or are you doing others\' jobs?'
          ],
          timeInvestment: '20 hours to define and delegate role',
          successMetric: 'Calendar reflects CEO priorities; executives making 90% of decisions; strategic work gets done',
          resultItProduces: 'Role clarity; maximum leverage; empowered executives; strategic focus',
          authorityReference: 'Based on "The CEO Next Door" and CEO role definition frameworks'
        },
        {
          name: 'The Executive Coach',
          description: 'Hire executive coach for CEO development',
          whatYoullHave: 'Executive coach meeting monthly to develop leadership capability and strategic thinking',
          howToBuild: [
            'Find coach: vetted by other CEOs, experience with $5M-10M companies, chemistry matters ($2-5K/month)',
            'Set coaching goals: strategic clarity, leadership effectiveness, decision quality, work-life integration',
            'Monthly 2-hour sessions: reflect on challenges, explore options, make better decisions, hold yourself accountable',
            'Between sessions: implement coaching insights, journal progress, bring new challenges',
            'Peer CEO group alternative: Vistage, EO, YPO - monthly peer advisory with professional facilitation',
            'Measure impact: better decisions, less stress, faster growth, clearer thinking'
          ],
          timeInvestment: '2 hours/month + cost $2-5K/month',
          successMetric: 'Consistently better decisions; less lonely; accountability; accelerated growth',
          resultItProduces: 'CEO development; strategic clarity; emotional support; faster learning',
          authorityReference: 'Based on executive coaching effectiveness research and CEO peer groups'
        },
        {
          name: 'The Strategic Thinking Time',
          description: 'Protect time for deep strategic thinking',
          whatYoullHave: 'Weekly 4-hour block and quarterly 2-day offsite dedicated to strategic thinking',
          howToBuild: [
            'Weekly strategic time: every Friday morning 8am-12pm, no meetings, no interruptions',
            'Strategic thinking questions: What are we becoming? What should we stop? What trends affect us? What bold moves should we make?',
            'Read and learn: books, case studies, competitor analysis, industry trends, customer feedback',
            'Quarterly offsite: 2 days away from office, review strategy, test assumptions, make big decisions',
            'Strategic projects: use thinking time to work ON business (new market entry, M&A, product strategy)',
            'Document insights: write memos capturing strategic thinking, share with executive team'
          ],
          timeInvestment: '4 hours/week + 2 days/quarter',
          successMetric: 'Strategic initiatives completed; proactive not reactive; business evolves ahead of market',
          resultItProduces: 'Strategic advantage; proactive leadership; innovation; competitive positioning',
          authorityReference: 'Based on "Good Strategy/Bad Strategy" and strategic thinking frameworks'
        }
      ],
      mastery: [
        {
          name: 'The Next Chapter',
          description: 'Define life and career after exit',
          whatYoullHave: 'Clear vision for next chapter - new venture, board work, teaching, philanthropy, or retirement',
          howToBuild: [
            'Reflect on purpose: now that financial success achieved, what drives you? What impact do you want?',
            'Explore options: portfolio career (multiple boards), start new venture, teach/mentor, philanthropy, travel/hobbies',
            'Trial periods: try different activities before committing, board positions, advisory roles, passion projects',
            'Build next identity: beyond "business owner" - who are you? What do you want to be known for?',
            'Manage transition: don\'t rush, grieve old identity, embrace new possibilities, stay connected',
            'Give back: mentor entrepreneurs, teach at university, angel invest, share your wisdom',
            'Life design: intentionally craft next chapter aligned with values, relationships, health, purpose'
          ],
          timeInvestment: '6-12 months exploration',
          successMetric: 'Clarity on next chapter; activities aligned with purpose; fulfillment beyond wealth; smooth transition',
          resultItProduces: 'Purpose; fulfillment; continued growth; meaningful impact; life satisfaction',
          authorityReference: 'Based on "Halftime" by Bob Buford and life transition frameworks'
        },
        {
          name: 'The Wisdom Sharing',
          description: 'Document and share your business wisdom',
          whatYoullHave: 'Book, course, or methodology sharing your business wisdom with next generation',
          howToBuild: [
            'Capture your methodology: what did you learn building your business? What frameworks work?',
            'Choose medium: book (credibility), online course (scale), speaking circuit (impact), coaching practice (depth)',
            'Write your book: your business story, lessons learned, frameworks others can use, publish via traditional or self-pub',
            'Build following: podcast, YouTube channel, newsletter sharing wisdom, build audience of entrepreneurs',
            'Teach formally: adjunct professor at university, guest lecturer, executive education programs',
            'Mentor systematically: formal mentoring program, office hours for entrepreneurs, pay it forward',
            'Create certification: train others in your methodology, build network of practitioners'
          ],
          timeInvestment: '500+ hours to build wisdom-sharing platform',
          successMetric: 'Book published or course launched; 1,000+ followers; mentoring 10+ entrepreneurs; impact beyond your business',
          resultItProduces: 'Legacy; impact multiplied; next generation accelerated; wisdom preserved; fulfillment',
          authorityReference: 'Based on thought leadership and wisdom-sharing frameworks'
        },
        {
          name: 'The Legacy Leadership',
          description: 'Lead beyond your company through boards and advisory',
          whatYoullHave: 'Portfolio of 3-5 board seats, advisory roles, and strategic investments',
          howToBuild: [
            'Professional board work: join public/private company boards leveraging your expertise, $50-200K per board',
            'Advisory board portfolio: advise 5-10 companies, equity compensation, lighter commitment than board seats',
            'Invest actively: angel invest in 10-20 companies, provide hands-on support, leverage your experience',
            'Industry leadership: trade association board, industry advocacy, shape future of industry',
            'Non-profit boards: align with causes you care about, governance expertise, strategic guidance',
            'Build director brand: board certification (NACD), network with other directors, thought leadership',
            'Manage portfolio: limit commitments, focus on where you can add most value, maintain work-life balance'
          ],
          timeInvestment: '20-30 hours/month across portfolio',
          successMetric: '3-5 quality board seats; respected director; meaningful impact; compensated appropriately',
          resultItProduces: 'Continued relevance; intellectual stimulation; network; income; impact beyond your business',
          authorityReference: 'Based on professional board service and portfolio career frameworks'
        }
      ]
    }
  },

  // ENGINE 8: TIME MACHINE (Featuring The Stop Doing List)
  {
    id: 'time',
    name: 'The Time Machine',
    subtitle: 'Focus & Productivity',
    description: 'Frees your time to work ON the business, not IN it',
    metrics: ['Hours freed per week', '% time on strategic work', 'Delegation effectiveness', 'Work/life balance'],
    stages: {
      foundation: [
        {
          name: 'The Stop Doing List',
          description: 'Build Matt Malouf\'s Stop Doing List - Free up 10+ hours/week',
          whatYoullHave: 'Written list of tasks you\'re STOPPING, with plan for what happens to each (delegate, automate, or delete)',
          howToBuild: [
            'Track everything you do for 1 full week - log every task in 30-min blocks (use notebook or Toggl)',
            'On Friday: review your list, highlight tasks that: drain your energy, someone else could do 80% as well, or don\'t directly make money',
            'Circle the top 10 energy drains/low-value tasks - these go on your STOP DOING LIST',
            'For each one, decide: Delegate it (who?), Automate it (what tool?), or Delete it (just stop)',
            'This week: STOP doing 3 of them. Next week: stop 3 more. Within a month, you\'ve freed 10+ hours.'
          ],
          timeInvestment: '3 hours to build list + courage to actually stop',
          successMetric: '10+ hours per week freed up; doing only work that matters; energy level increases',
          resultItProduces: 'Time freedom; focus on high-value work; less busy-ness more business; foundation for leverage',
          authorityReference: 'Matt Malouf\'s "The Stop Doing List" framework - YOUR signature system'
        },
        {
          name: 'Revenue Work First',
          description: 'Focus on activities that directly generate income',
          whatYoullHave: 'Daily 2-hour "money time" block dedicated to sales or delivery - protected and non-negotiable',
          howToBuild: [
            'Identify your revenue activities: what actually makes money? (Usually sales calls or doing the work for customers)',
            'Block 2 hours every morning: 9-11am or 8-10am - whatever works for your energy',
            'Lock phone in drawer, close email, close Slack - ONLY do revenue work',
            'Everything else waits until after 11am: email, admin, meetings, social media',
            'Track results: how much revenue came from your money time? Watch it compound.'
          ],
          timeInvestment: '2 hours/day (but it\'s your highest-value time)',
          successMetric: '80% of revenue comes from this focused time; everything else is supporting work',
          resultItProduces: 'Revenue increases without working more hours; compound effect of focus; confidence in your productivity',
          authorityReference: 'Synthesizes Cal Newport\'s "Deep Work" and Brian Tracy\'s "Eat That Frog"'
        },
        {
          name: 'The $10 Task Purge',
          description: 'Eliminate or delegate work below your value per hour',
          whatYoullHave: 'List of 10 tasks you do weekly that someone could do for $15/hour + plan to offload them',
          howToBuild: [
            'Calculate your value per hour: revenue goal ÷ 2000 hours = your hourly value (e.g., $100K ÷ 2000 = $50/hour)',
            'List every task you do regularly: email management, data entry, scheduling, social media posting, invoice follow-up, etc.',
            'Circle ones someone could do for $15-25/hour (way below your value)',
            'Hire virtual assistant on Upwork: 5 hours/week to start, hand off 3 tasks',
            'Use your freed time for $50-100/hour work (sales, strategy, high-value delivery)'
          ],
          timeInvestment: '4 hours to hire + train VA + 5 hours freed per week ongoing',
          successMetric: 'Delegated 5+ hours of low-value work; spending freed time on high-value work; positive ROI',
          resultItProduces: 'Leverage - earning more by doing less; focus on genius zone; scalable time management',
          authorityReference: 'Based on Dan Sullivan\'s "Unique Ability" and Tim Ferriss\'s "4-Hour Workweek" delegation principles'
        }
      ],
      traction: [
        {
          name: 'The Delegation Playbook',
          description: 'Build system to delegate effectively without micromanaging',
          whatYoullHave: 'Delegation framework with task assessment, handoff process, and accountability check-ins',
          howToBuild: [
            'List everything on your plate: all recurring tasks, projects, decisions',
            'Score each task: 1) Can someone else do this 80% as well? 2) Does it require your unique expertise? 3) Is it strategic?',
            'Delegation targets: tasks scored "yes/no/no" go first',
            'Create handoff doc per task: What it is, Why it matters, How to do it (step-by-step), What success looks like, When to check in',
            'Delegate with clarity: "You own X. Success = Y. Check in every Z. Questions?"',
            'Trust but verify: check-ins in the beginning, reduce as competence builds'
          ],
          timeInvestment: '10 hours to document and hand off first 5 tasks',
          successMetric: '10-15 hours/week freed up; team executing delegated tasks at 80%+ quality',
          resultItProduces: 'Time freedom; team growth; focus on high-value work; scalable operations',
          authorityReference: 'Based on Dan Martell\'s "Buyback Principle" and delegation frameworks'
        },
        {
          name: 'The Leverage Matrix',
          description: 'Identify and eliminate low-value, high-time activities',
          whatYoullHave: '2×2 matrix showing where your time goes + action plan to shift to high-leverage work',
          howToBuild: [
            'Track 2 weeks: log every task and time spent (be honest, capture everything)',
            'Plot on matrix: High Value / Low Value (vertical), Low Time / High Time (horizontal)',
            'Four quadrants: [1] High Value/Low Time (do more), [2] High Value/High Time (delegate/systematize), [3] Low Value/Low Time (automate), [4] Low Value/High Time (STOP)',
            'Create action plan: For each quadrant 2, 3, 4 item: delegate to whom? Automate how? Stop when?',
            'Execute over 90 days: move one item per week from low-value to high-value or off your plate'
          ],
          timeInvestment: '4 hours to analyze + 90 days to shift',
          successMetric: '60%+ of time on high-value work vs. 20% before; visible business impact',
          resultItProduces: 'Strategic time allocation; exponential impact; business growth without burnout',
          authorityReference: 'Synthesizes Stephen Covey\'s "Important/Urgent Matrix" and 80/20 Principle'
        },
        {
          name: 'The CEO Day',
          description: 'Block one full day per week for strategic work only',
          whatYoullHave: 'Protected weekly "CEO Day" for planning, thinking, and working ON the business',
          howToBuild: [
            'Pick your day: Friday works well (plan next week), or Monday (set the tone)',
            'Block 8am-5pm: no meetings, no client work, no interruptions',
            'Set agenda template: [1] Review metrics (1 hr), [2] Strategic project work (4 hrs), [3] Learning (2 hrs), [4] Planning next week (1 hr)',
            'Protect it fiercely: tell team "I\'m unavailable Fridays unless emergency", decline all meeting requests',
            'Work somewhere different: home, coffee shop, library - break the pattern'
          ],
          timeInvestment: '8 hours/week (but this IS your highest-value time)',
          successMetric: 'Consistent CEO Day weekly; strategic projects completed; business moves forward proactively',
          resultItProduces: 'Strategic progress; prevented firefighting; clear thinking time; leadership vs. management',
          authorityReference: 'Based on Dan Sullivan\'s "Free Days" and strategic thinking frameworks'
        }
      ],
      scaling: [
        {
          name: 'The Executive Assistant',
          description: 'Hire EA to manage your calendar and life',
          whatYoullHave: 'Executive Assistant managing your calendar, inbox, travel, and administrative work',
          howToBuild: [
            'Define EA role: calendar management, email triage, meeting prep, travel booking, expense reports, project coordination',
            'Hire profile: organized, proactive, discretion, tech-savvy, can anticipate needs, pay $45-65K',
            'Grant access: calendar, email, CRM, project tools, credit card for expenses',
            'Train decision-making: "Accept meetings about X, decline Y, flag Z for my review"',
            'Daily rhythm: EA reviews calendar/email each morning, flags priorities, schedules around your focus time',
            'Weekly sync: 30 min on upcoming week, travel, projects, what to delegate'
          ],
          timeInvestment: '30 hours to hire + train EA',
          successMetric: 'Reclaim 15+ hours/week; calendar optimized; only see emails that matter',
          resultItProduces: 'Time leverage; focus on high-value work; reduced admin burden; professional support system',
          authorityReference: 'Based on executive productivity and Dan Martell\'s "Buyback Your Time"'
        },
        {
          name: 'The Energy Management',
          description: 'Optimize calendar around your energy patterns',
          whatYoullHave: 'Calendar structured around peak energy times and energy recovery rituals',
          howToBuild: [
            'Track energy: for 2 weeks, rate your energy 1-10 every 2 hours - when are you most focused? Most creative? Most drained?',
            'Block peak times: use high-energy hours (often mornings) for strategic work, important decisions, creative thinking',
            'Schedule low-energy work: admin, emails, routine meetings during lower energy times',
            'Build recovery: schedule breaks, workouts, walks, lunch away from desk - protect recovery time',
            'Say no strategically: decline meetings/commitments that drain energy or don\'t align with priorities',
            'Weekly reset: Friday afternoon review + plan next week aligned with energy patterns'
          ],
          timeInvestment: '10 hours to optimize calendar structure',
          successMetric: 'Working with your energy not against it; sustained high performance; avoiding burnout',
          resultItProduces: 'Peak performance; better decisions; more creative; healthier; sustainable pace',
          authorityReference: 'Based on Tony Schwartz\'s "The Way We\'re Working Isn\'t Working" and energy management research'
        },
        {
          name: 'The Sabbatical System',
          description: 'Build business that runs during extended time off',
          whatYoullHave: 'Ability to take 4-week sabbatical annually while business operates smoothly',
          howToBuild: [
            'Announce sabbatical: tell team 6 months in advance, explain why (rest, perspective, test business resilience)',
            'Prepare team: ensure each leader can handle their domain, cross-train for redundancy, document escalation paths',
            'Set rules: true offline (no email, no calls, only contact for emergencies), trust team completely',
            'Emergency protocol: define what constitutes emergency (legal, financial crisis, not day-to-day issues)',
            'Pre-sabbatical: front-load key decisions, clear blockers, set team up for success',
            'Return: debrief with team on what worked/didn\'t, refine for next sabbatical, celebrate their success'
          ],
          timeInvestment: '40 hours to prepare business + annual 4-week sabbatical',
          successMetric: 'Business operates successfully for 4 weeks without you; team steps up; you return refreshed',
          resultItProduces: 'Business resilience; leadership development; personal renewal; work-life integration; true ownership freedom',
          authorityReference: 'Based on Stefan Sagmeister\'s sabbatical model and business resilience principles'
        }
      ],
      optimization: [
        {
          name: 'The Board of Advisors',
          description: 'Build formal advisory board for strategic guidance',
          whatYoullHave: '3-5 person advisory board meeting quarterly to guide major decisions',
          howToBuild: [
            'Identify gaps: where do you need expertise? (finance, operations, sales, specific industry knowledge)',
            'Recruit advisors: former executives, successful entrepreneurs, functional experts - people 10 years ahead of you',
            'Structure compensation: equity (0.25-1% over 2-4 years) or cash ($5-15K/year), plus expenses',
            'Set expectations: 4 quarterly meetings (2-3 hours each), available for ad-hoc calls, review major decisions',
            'Meeting format: prep packet sent 1 week before, 30 min company update, 90 min strategic discussion on 1-2 topics, 30 min action items',
            'Leverage between meetings: email advisors for specific questions, intro to their networks, learn from their experience'
          ],
          timeInvestment: '60 hours to recruit + 4 meetings/year ongoing',
          successMetric: 'Board meets 4x/year; advisors contribute meaningful insights; you make better decisions; doors open through their networks',
          resultItProduces: 'Access to senior expertise; avoid costly mistakes; accelerated growth; network effects',
          authorityReference: 'Based on advisory board best practices and startup governance models'
        },
        {
          name: 'The Strategic Offsites',
          description: 'Quarterly planning sessions away from the office',
          whatYoullHave: 'Quarterly 2-day offsite for strategic planning and team alignment',
          howToBuild: [
            'Schedule 4x/year: Jan (annual planning), April (Q2 strategy), July (mid-year review), Oct (budgeting)',
            'Location strategy: away from office (resort, retreat center, Airbnb) - break patterns, minimize interruptions',
            'Who attends: leadership team (5-8 people), occasionally advisors or outside facilitators',
            'Agenda template: Day 1 - review metrics, analyze market trends, identify opportunities/threats, strategic discussions; Day 2 - priorities for quarter, resource allocation, key initiatives, accountability',
            'Pre-work: everyone submits analysis/ideas 1 week before, CFO prepares financial review, each leader presents department',
            'Output: written strategic plan, 3-5 key initiatives for quarter, clear ownership, resources allocated'
          ],
          timeInvestment: '2 days per quarter + 1 day prep',
          successMetric: 'Clear quarterly priorities; team aligned; strategic initiatives completed; proactive vs. reactive',
          resultItProduces: 'Strategic clarity; team alignment; proactive execution; competitive advantage',
          authorityReference: 'Based on Verne Harnish\'s quarterly planning rhythm and strategic offsites'
        },
        {
          name: 'The Time Audit System',
          description: 'Quarterly analysis and optimization of time allocation',
          whatYoullHave: 'Systematic quarterly review of how you and leadership team spend time',
          howToBuild: [
            'Track for 2 weeks quarterly: log every activity in 30-min blocks (calendar + time tracking tool)',
            'Categorize time: Strategic (planning, innovation), Revenue (sales, key accounts), Leadership (coaching, hiring), Operations (meetings, admin), Personal (health, family)',
            'Analyze vs. targets: CEO should be 40% Strategic, 30% Revenue, 20% Leadership, 10% Operations - compare actual',
            'Identify drains: recurring meetings that don\'t drive results, admin that should be delegated, interruptions, low-value work',
            'Optimize quarterly: eliminate 1-2 low-value activities, delegate 2-3 operational tasks, protect 2-3 strategic blocks',
            'Team audit: leadership team does same exercise, compare patterns, reallocate work for better fit'
          ],
          timeInvestment: '8 hours per quarter for analysis + ongoing optimization',
          successMetric: 'Time allocation matches strategic priorities; 60%+ time on strategic/revenue work; team optimized for strengths',
          resultItProduces: 'Intentional time use; maximum leverage; strategic progress; leadership effectiveness',
          authorityReference: 'Based on Peter Drucker\'s time management research and executive effectiveness'
        }
      ],
      leadership: [
        {
          name: 'The Chief of Staff',
          description: 'Hire Chief of Staff to extend CEO leverage',
          whatYoullHave: 'Chief of Staff managing CEO priorities, strategic projects, and cross-functional initiatives',
          howToBuild: [
            'Define CoS role: CEO right-hand, manages strategic projects, coordinates exec team, runs meetings, follows up on decisions',
            'Hire profile: ex-consultant or high-potential internal, strategic thinker, execution focused, trusted confidant, pay $100-150K',
            'Weekly CEO/CoS sync: review priorities, assign strategic projects, troubleshoot blockers',
            'CoS runs exec meetings: agenda, pre-reads, notes, follow-up, decision tracking',
            'Strategic projects: CoS leads cross-functional initiatives (M&A, new market entry, systems implementation)',
            'Frees CEO for: strategic thinking, key relationships, board work, culture, capital'
          ],
          timeInvestment: '60 hours to hire and onboard CoS',
          successMetric: 'CEO focused on CEO-only work; strategic projects completed; exec team coordinated; 10+ hours/week freed',
          resultItProduces: 'CEO leverage; strategic execution; cross-functional coordination; faster decision-making',
          authorityReference: 'Based on Chief of Staff best practices and executive operations'
        },
        {
          name: 'The Personal Board of Directors',
          description: 'Build personal advisory board for life and career guidance',
          whatYoullHave: '5-person personal board advising on career, wealth, family, health, and purpose',
          howToBuild: [
            'Identify 5 advisors for different domains: [1] Business mentor (career/growth), [2] Wealth advisor (financial), [3] Executive coach (leadership), [4] Peer CEO (accountability), [5] Trusted friend/spiritual advisor (purpose/meaning)',
            'Recruit each: personal invitation, explain what you need, quarterly check-ins',
            'Annual personal offsite: 2-day retreat to reflect on life, set goals, make big decisions',
            'Quarterly check-ins: rotate through advisors, different topic each time',
            'Integrate advice: business decisions considering impact on wealth, family, health, purpose',
            'Measure holistic success: business + wealth + relationships + health + meaning'
          ],
          timeInvestment: '3 hours/quarter per advisor',
          successMetric: 'Balanced life decisions; integrated business/personal strategy; avoid burnout; sustainable success',
          resultItProduces: 'Life balance; holistic success; wisdom; avoided regrets; sustainable high performance',
          authorityReference: 'Based on personal board of directors concept and life design frameworks'
        },
        {
          name: 'The Legacy Planning',
          description: 'Define what you\'re building beyond financial success',
          whatYoullHave: 'Written legacy plan defining impact beyond business - family, community, industry, knowledge sharing',
          howToBuild: [
            'Reflect on legacy questions: What do you want to be known for? What impact beyond money? What will outlast you?',
            'Define legacy pillars: [1] Family (values, wealth, stories), [2] Business (culture, people developed, industry impact), [3] Community (philanthropy, mentoring, causes)',
            'Write legacy statement: 1-page vision of your life impact 30 years from now',
            'Build legacy into decisions: "Does this decision move me toward my legacy?"',
            'Legacy projects: mentor 5 entrepreneurs, create scholarship fund, teach/speak, document methodology, give back strategically',
            'Annual legacy review: progress on legacy goals, adjust as you evolve, share with family/team'
          ],
          timeInvestment: '20 hours to define + annual review',
          successMetric: 'Clear legacy vision; business decisions aligned with legacy; actively building impact beyond wealth',
          resultItProduces: 'Purpose; meaning; impact beyond money; values-driven decisions; fulfillment',
          authorityReference: 'Based on "Die with Zero" by Bill Perkins and legacy planning frameworks'
        }
      ],
      mastery: [
        {
          name: 'The Freedom Calendar',
          description: 'Design ideal life calendar with complete autonomy',
          whatYoullHave: 'Calendar reflecting your ideal life - work/travel/family balanced, discretionary time maximized',
          howToBuild: [
            'Design ideal year: when do you work? Travel? Spend with family? Pursue hobbies? Map it out.',
            'Calculate freedom number: how many weeks vacation? Days for passion projects? Board meetings? Speaking?',
            'Block ideal calendar: Q1 (strategic work + winter vacation), Q2 (board season), Q3 (family summer), Q4 (planning + holidays)',
            'Protect fiercely: calendar is your life design, say no to anything that doesn\'t fit',
            'Business supports life: your calendar dictates when you engage with businesses/boards, not vice versa',
            'Annual calibration: review last year, adjust for next year, optimize for energy and fulfillment',
            'Share with family: ensure family knows your calendar, plan together, make commitments as family unit'
          ],
          timeInvestment: '10 hours annually to design ideal calendar',
          successMetric: 'Calendar reflects your priorities; 100 days+ vacation/personal time; complete autonomy; life satisfaction',
          resultItProduces: 'Freedom; life by design; no regrets; integrated work/life; fulfillment',
          authorityReference: 'Based on "Die with Zero" and time affluence research'
        },
        {
          name: 'The Portfolio Life',
          description: 'Build portfolio of activities that energize you',
          whatYoullHave: 'Balanced portfolio: board work, advising, angel investing, teaching, hobbies, family, fitness',
          howToBuild: [
            'Define portfolio buckets: [1] Paid work (boards, advising), [2] Impact (non-profit boards, mentoring), [3] Learning (courses, reading, hobbies), [4] Health (fitness, wellness), [5] Relationships (family, friends)',
            'Allocate time: example - 30% paid work, 20% impact, 20% learning, 15% health, 15% relationships',
            'Set boundaries: limit paid commitments to avoid becoming too busy, protect time for other buckets',
            'Experiment: try new activities quarterly, keep what energizes, drop what drains',
            'Track energy: which activities give energy vs. take energy? Optimize for net positive energy',
            'Seasonal variation: some quarters focus on work, others on family/travel, design flexibility',
            'Regular review: quarterly check-in on portfolio balance, adjust as needed'
          ],
          timeInvestment: 'Ongoing life management',
          successMetric: 'Energized by your portfolio; balanced across all dimensions; fulfillment across life domains',
          resultItProduces: 'Holistic success; life satisfaction; sustained energy; no regrets; meaningful impact',
          authorityReference: 'Based on portfolio life concept and life design frameworks'
        },
        {
          name: 'The Ultimate Freedom',
          description: 'Live completely on your own terms',
          whatYoullHave: 'Complete freedom - financial, time, geographic, relational - to live however you choose',
          howToBuild: [
            'Financial freedom: wealth sufficient for lifestyle without work, passive income exceeds expenses',
            'Time freedom: no obligations you don\'t choose, calendar entirely discretionary',
            'Geographic freedom: live wherever you want, work remotely, multiple homes, travel extensively',
            'Relational freedom: relationships by choice not obligation, invest in people who energize you',
            'Purpose freedom: pursue what matters to you, not what society expects, define your own success',
            'Health freedom: prioritize wellness, fitness, longevity, energy to enjoy your freedom',
            'Give freely: mentor, donate time/money, serve causes you believe in, make impact',
            'Continuous calibration: annually assess freedom dimensions, protect gains, expand further'
          ],
          timeInvestment: 'Lifetime journey',
          successMetric: 'Complete autonomy; living on your terms; no regrets; fulfillment; positive impact',
          resultItProduces: 'Ultimate freedom; life by design; legacy achieved; fulfillment; gratitude',
          authorityReference: 'Based on "The 4-Hour Workweek" and freedom-based life design'
        }
      ]
    }
  }
]

// ========================================
// 🎉 ALL STAGES COMPLETE! THE WISDOM ROADMAP IS FINISHED! 🎉
// ========================================
// ✓ Foundation: 24 builds (8 engines × 3 each) - $0-250K
// ✓ Traction: 24 builds (8 engines × 3 each) - $250K-1M
// ✓ Scaling: 24 builds (8 engines × 3 each) - $1M-3M
// ✓ Optimization: 24 builds (8 engines × 3 each) - $3M-5M
// ✓ Leadership: 24 builds (8 engines × 3 each) - $5M-10M
// ✓ Mastery: 24 builds (8 engines × 3 each) - $10M+
//
// 🏆 TOTAL: 144 BUILDS COMPLETE (100%)
//
// The complete Wisdom Roadmap provides tactical, implementable guidance
// for building a business from $0 to $10M+ across all 8 Wealth Machines:
// 1. Attract Machine (Marketing & Lead Generation)
// 2. Conversion Machine (Sales & Revenue)
// 3. Delivery Machine (Customer Experience)
// 4. People Machine (Team & Culture)
// 5. Operations Machine (Systems & Process)
// 6. Money Machine (Financial Management)
// 7. Leadership Machine (Owner Development)
// 8. Time Machine (Focus & Productivity - featuring The Stop Doing List)
//
// Each build includes: name, description, what you'll have, how to build,
// time investment, success metrics, results, and authority references.
