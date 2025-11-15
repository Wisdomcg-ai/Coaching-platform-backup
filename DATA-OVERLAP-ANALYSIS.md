# Business Profile vs Assessment - Data Overlap Analysis

## Business Profile (business-profile/page.tsx)
**Purpose**: Collect static, factual information about the business

### Step 1: Company Information
- Business Name ✓
- Industry ✓
- Years in Business ✓
- Business Model
- Website & Social Media
- Locations / Service Areas

### Step 2: Owner Info
- Owner Name
- Ownership %
- Years in business (total & this business)
- How business was started
- Age range
- Key expertise
- Business partners (name, role, involvement)
- Primary goal (income, freedom, impact, sell, legacy, survive)
- Time horizon
- Exit strategy
- Current & desired hours per week
- Desired role
- What they love/hate doing
- Minimum & target income
- Risk tolerance

### Step 3: Financial Snapshot
- Annual Revenue ✓
- Revenue Growth Rate
- Gross Margin
- Net Margin

### Step 4: Team & Organisation
- Total Employees ✓
- Key Roles (team members)

### Step 5: Current Situation
- Top 3 Challenges
- Top 3 Growth Opportunities
- Additional context

---

## Business Assessment (assessment/page.tsx)
**Purpose**: Evaluate business health, maturity, and operational effectiveness

### Section 1: Business Foundation (5 questions, 50 pts)
1. Are you paying yourself a market-rate salary consistently?
2. How many people work in your business? ✓ (OVERLAP with employee count)
3. How dependent is the business on you personally?
4. How predictable is your monthly revenue?
5. If you wanted to sell your business tomorrow, could you?

### Section 2: Strategic Clarity (7 questions, 70 pts)
6. How clear and compelling is your business vision?
7. How well-defined is your target market and ideal customer?
8. Do you have a sustainable competitive advantage?
9. When did you last launch a new product/service/offering?
10. How strong is your team and culture?
11. How systematic is your business execution?
12. How well do you track business performance with metrics?

### Section 3: Business Engines (18 questions, 180 pts)

**Attract Engine**
13. How many qualified leads do you generate monthly?
14. How many reliable marketing channels generate leads?
15. How sophisticated is your lead generation system?

**Convert Engine**
16. What's your lead-to-customer conversion rate?
17. How long is your average sales cycle?
18. How effective is your sales process?

**Deliver Engine**
19. What percentage of customers are delighted with your delivery?
20. How systematized is your customer experience?
21. What % of your revenue comes from repeat customers?
22. How strategic is your approach to talent?
23. How comprehensive is your process documentation?

**Finance Engine**
24. How would you describe your cash flow situation?
25. What % of revenue comes from your top 3 customers?
26. When did you last increase prices?
27. What's your revenue growth rate over the past 12 months? ✓ (OVERLAP with revenue growth)
28. What % of revenue do you invest in marketing?
29. Do you know your Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)?
30. How sophisticated is your financial management?

---

## IDENTIFIED OVERLAPS

### ⚠️ Direct Overlaps (Same Data):
1. **Employee Count**
   - Profile: "Total Employees" (Step 4)
   - Assessment: Q2 "How many people work in your business?"

2. **Revenue Growth Rate**
   - Profile: "Revenue Growth Rate (%)" (Step 3)
   - Assessment: Q27 "What's your revenue growth rate?"

### 🤔 Conceptual Overlaps (Related but Different):
3. **Team Quality**
   - Profile: Asks for team member names/roles
   - Assessment: Q10 "How strong is your team and culture?" (qualitative)

4. **Financial Health**
   - Profile: Annual Revenue, Margins (hard numbers)
   - Assessment: Q24 Cash flow situation, Q30 Financial sophistication (qualitative assessment)

5. **Business Dependency**
   - Profile: "Desired Role in Business" (future state)
   - Assessment: Q3 "How dependent is business on you?" (current state)

---

## RECOMMENDATIONS

### ✅ Keep As Is (Good Separation):
Most questions are actually complementary:
- **Profile** = Static facts (what is)
- **Assessment** = Dynamic evaluation (how well)

Example:
- Profile asks: "What's your annual revenue?" → $2M
- Assessment asks: "How predictable is your revenue?" → Very predictable

### 🔧 Suggested Changes:

#### 1. Remove Employee Count from Assessment Q2
**Current**: Q2 asks "How many people work in your business?"
**Better**: Change to "How effectively is your team structured and operating?"

Options:
- Just me, struggling with capacity
- Small team, some role confusion
- Clear roles, effective delegation
- Well-structured, highly effective team
- Exceptional team with clear accountability

**Why**: This measures team effectiveness instead of size, which Profile already captures.

#### 2. Remove Revenue Growth from Profile
**Current**: Profile Step 3 asks "Revenue Growth Rate (%)"
**Better**: Remove this field - the Assessment Q27 handles it better with context

**Why**:
- Assessment Q27 gives qualitative ranges (declining, flat, 10-25%, 25-50%, 50%+)
- More meaningful than asking users to calculate an exact %
- Reduces form fatigue in Profile

#### 3. Pre-fill Assessment from Profile
**Enhancement**: When starting assessment, pre-populate Q2 answer based on Profile employee count
- 1 employee → "Just me"
- 2-5 → "2-5 people"
- 6-15 → "6-15 people"
- etc.

**Why**: Saves user time, ensures consistency

---

## SUMMARY

### Current State:
- **2 direct overlaps** (employee count, revenue growth)
- **3 conceptual overlaps** (but serve different purposes)

### Recommended Actions:
1. ✅ **Rework Q2** in assessment to focus on team effectiveness, not size
2. ✅ **Remove revenue growth rate** from Profile Step 3
3. 🔮 **Future**: Auto-populate assessment answers from Profile where possible

### Result:
- Eliminates duplicate data entry
- Profile = What & Who (facts)
- Assessment = How Well (evaluation)
- Better user experience
