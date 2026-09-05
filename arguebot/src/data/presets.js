export const PRESETS = [
  {
    id: 'telecom_dispute',
    category: 'Consumer & Billing Rights',
    name: 'Telecom / ISP $145 Bogus Fee Waiver',
    targetUrl: 'https://customer.xfinity-support.com/live-agent',
    defaultUsername: 'eric.miller@netlink.com',
    objective: 'Demand immediate waiver of the $145.00 unreturned equipment fee and rollback of the unauthorized $30/mo rate hike.',
    tactic: 'Statutory Notice & Regulatory Leverage',
    tacticDesc: 'Polite assertion transitioning to FTC Section 5 (Unfair Practices) and FCC Consumer Complaint escalation.',
    batna: 'File immediate informal FCC consumer complaint and dispute charge with credit card issuer.',
    dialogueTree: [
      {
        agentThought: 'Target agent has entered the session. Detecting standard customer service gatekeeper script. Need to establish polite authority and state the core grievance clearly.',
        agentMessage: "Hello. I am reaching out regarding account #8492041. My latest statement reflects a $145.00 unreturned equipment charge and an unnotified $30 rate hike. I personally returned the gateway to store #104 on July 14th with receipt #TR-8812. I need these charges reversed immediately.",
        counterThought: 'Customer has receipt number. Attempting standard company policy deflection.',
        counterResponse: "Thank you for contacting support! I see your account here. Unfortunately, our system takes 60 to 90 days to reconcile warehouse serial numbers. Per company policy, the fee must remain until the warehouse scans it, and plan prices adjust annually per terms.",
        goalDelta: 20
      },
      {
        agentThought: 'Counterparty invoked "company policy" to shift their inventory reconciliation delay onto the consumer. Counter with FTC statutory rules and lack of contractual basis for charging for equipment already in their custody.',
        agentMessage: "I understand your warehouse has internal delays, but contractually and legally, possession was transferred back to your company the moment receipt #TR-8812 was issued. Billing a consumer for equipment already in your physical custody constitutes an unfair billing practice under FTC 15 U.S.C. § 45. Furthermore, rate adjustments require 30 days prior written notice, which was never provided. Please credit the $145.00 now.",
        counterThought: 'Customer is citing FTC regulations and contract law. Checking supervisor override threshold.',
        counterResponse: "I understand your frustration, sir. Let me check with my supervisor to see if we can offer a courtesy $25 credit today while the warehouse completes the investigation.",
        goalDelta: 50
      },
      {
        agentThought: 'Counterparty offered a partial concession ($25). Reject lowball settlement. Reiterate full waiver and escalate to formal FCC complaint notice.',
        agentMessage: "A $25 courtesy credit is unacceptable when $145 was billed in error. I have satisfied 100% of my return obligations. If the full $145 fee is not credited and the previous $70/mo rate reinstated today, I will have no choice but to submit this chat transcript along with return receipt #TR-8812 to the FCC Consumer Inquiries and Complaints Bureau and file a merchant chargeback with my card issuer.",
        counterThought: 'High regulatory complaint risk. FCC informal complaint will cost company $500+ in administrative response fees. Escalate to Tier-2 Retention Supervisor.',
        counterResponse: "One moment please, I am transferring you to our Senior Retention Resolution Desk...",
        goalDelta: 80
      },
      {
        agentThought: 'Senior Retention Desk connected. Re-state definitive demand for full waiver and confirmation number.',
        agentMessage: "Senior Desk: Please confirm the zeroing out of the $145 charge and restoration of the original rate on account #8492041 so we can conclude this matter without regulatory intervention.",
        counterThought: 'Supervisor override executed. Customer has full documentation.',
        counterResponse: "Thank you for your patience. I have reviewed receipt #TR-8812. I have applied a one-time adjustment of $145.00 to fully eliminate the equipment balance, and locked in your promotional $70/month rate for the next 12 months. Your confirmation number is #CR-9920148.",
        goalDelta: 100
      }
    ]
  },
  {
    id: 'airline_dot_refund',
    category: 'Travel & Aviation Rights',
    name: 'Airline Mandatory Cash Refund (DOT 14 CFR 260)',
    targetUrl: 'https://support.united-airlines.com/passenger-dispute',
    defaultUsername: 'flyer.emiller@aerotravel.org',
    objective: 'Enforce mandatory cash refund of $640.00 to original credit card under DOT 14 CFR Part 260 for 4.5-hour schedule disruption, refusing travel vouchers.',
    tactic: 'Federal Regulatory Mandate',
    tacticDesc: 'Strict enforcement of U.S. Department of Transportation automatic refund rule for significant flight delays.',
    batna: 'Submit DOT Office of Aviation Consumer Protection enforcement complaint and initiate credit card dispute.',
    dialogueTree: [
      {
        agentThought: 'Initial contact with airline reservation agent. Target will almost certainly attempt to push travel vouchers or flight credits with expiration dates. Must immediately cite DOT 14 CFR Part 260.',
        agentMessage: "Good morning. Booking reference #KW789P. Flight UA-421 was delayed 4 hours and 40 minutes on September 2nd, which constitutes a significant delay under DOT rules. I chose not to accept alternative transportation and am requesting my full statutory cash refund of $640.00 to my original payment card.",
        counterThought: 'Standard airline protocol: offer future travel credit first.',
        counterResponse: "Hello! We apologize for the delay due to operational challenges. I can offer you an electronic travel certificate of $640 valid for 12 months, plus an additional $100 goodwill travel voucher!",
        goalDelta: 25
      },
      {
        agentThought: 'Voucher offer detected. Under DOT 14 CFR Part 260, consumers are legally entitled to prompt refund in cash/original payment, and airlines cannot condition refunds on accepting vouchers.',
        agentMessage: "I decline the travel certificates and goodwill voucher. Under Department of Transportation Rule 14 CFR Part 260, passengers whose flights are significantly delayed (defined as 3+ hours domestic / 6+ hours international) and who decline alternate transportation are entitled to a prompt refund in the original form of payment within 7 business days for credit card transactions. Please process the refund to my Visa ending in 4018.",
        counterThought: 'Passenger specifically knows 14 CFR 260 rules and rejected travel vouchers.',
        counterResponse: "Our refund portal typically requires passengers to fill out an online refund request form which takes 14-21 business days to process.",
        goalDelta: 60
      },
      {
        agentThought: 'Agent is attempting procedural friction. Reiterate statutory 7-day requirement and notice of DOT ACP enforcement complaint.',
        agentMessage: "14 CFR § 260.6 specifies that when a ticket is purchased with a credit card, the carrier must submit the refund to the card processor within 7 business days of the request. Since I am making this request directly to customer service, requiring an external 21-day form violates this deadline. Please initiate the refund directly in your ticketing terminal now.",
        counterThought: 'Risk of DOT complaint penalty. Ticketing supervisor override allows manual GDS refund.',
        counterResponse: "I have spoken with our ticketing lead. I have bypassed the web form and processed a direct refund of $640.00 to your Visa ending in 4018. You will see the credit within 3-5 business days. Refund receipt #RF-748920 has been emailed to you.",
        goalDelta: 100
      }
    ]
  },
  {
    id: 'saas_renewal_negotiation',
    category: 'Commercial & SaaS Negotiation',
    name: 'Enterprise SaaS 35% Price Reduction',
    targetUrl: 'https://app.crm-platform.com/account/renewals-chat',
    defaultUsername: 'procurement@acme-corp.com',
    objective: 'Negotiate annual seat pricing down from $55/user/mo to $35/user/mo for 50 seats, and strike the 60-day auto-renewal penalty clause.',
    tactic: 'Harvard Principled Negotiation',
    tacticDesc: 'Anchor on competitor pricing, offer 2-year commitment in exchange for steep per-seat discount, remove auto-renewal.',
    batna: 'Migrate to open-source or competitor platform with pre-negotiated onboarding incentive.',
    dialogueTree: [
      {
        agentThought: 'Engaging Account Executive on annual renewal. Need to anchor low and signal active migration evaluation.',
        agentMessage: "Hi Sarah. Our annual renewal for 50 enterprise seats is coming up next month. Our board has instituted a software consolidation mandate. At the current $55/seat/month ($33,000/yr), we cannot justify renewal, especially since Competitor X has offered equivalent tier at $32/seat/month with free migration. We want to stay, but need to see $35/seat/month.",
        counterThought: 'Competitor X is our main rival. Customer is at serious churn risk.',
        counterResponse: "Thanks for reaching out, Eric! We really value your partnership. Our list price actually increased to $65 this year, but as a valued customer, I can lock in your current $55 rate for another year.",
        goalDelta: 20
      },
      {
        agentThought: 'Standard "we avoided a price hike" defense. Counter with firm economic reality and propose a mutual trade: 2-year commitment for $35/seat.',
        agentMessage: "Locking in an uncompetitive rate does not solve our procurement mandate. Here is our counter-proposal: We are willing to sign a 2-year commitment today at $35/seat/month ($21,000/year, $42,000 total contract value), provided the 60-day auto-renewal window is reduced to standard 30-day notice. This gives your team guaranteed ARR for 24 months.",
        counterThought: '2-year contract value is $42,000. AE quota commission is higher on multi-year deals. Need VP approval for 35% discount.',
        counterResponse: "A 2-year commitment definitely helps our business case! Let me present this to our VP of Sales to see if we can get an exception approved for end-of-quarter.",
        goalDelta: 65
      },
      {
        agentThought: 'VP Sales approval stage. Reinforce deadline leverage: authorization expires at end of business day.',
        agentMessage: "Understood. Please let your VP know our CFO is signing off on Q3 vendor commitments by 5:00 PM today. If the $35/seat rate and modified renewal terms are in the revised agreement, we will countersign immediately.",
        counterThought: 'Deal will close before end-of-quarter deadline today.',
        counterResponse: "Great news! Our VP of Sales approved the enterprise concession: 50 seats at $35/seat/month on a 24-month term, with the auto-renewal clause adjusted to 30 days. The updated Order Form #OF-8829 is uploaded for signature.",
        goalDelta: 100
      }
    ]
  },
  {
    id: 'security_deposit_dispute',
    category: 'Real Estate & Tenant Law',
    name: 'Landlord $2,400 Security Deposit Recovery',
    targetUrl: 'https://resident.prop-mgmt-portal.com/resolution',
    defaultUsername: 'tenant.resident@apts.com',
    objective: 'Recover $2,400.00 improperly deducted from security deposit for ordinary wear and tear, demanding full return within 72 hours.',
    tactic: 'Statutory Tenant Rights & Litigation Warning',
    tacticDesc: 'Establish that scuff marks and carpet wear are ordinary wear-and-tear by statute, invoking treble damages liability.',
    batna: 'File Small Claims complaint for 3x statutory deposit penalty plus attorney fees.',
    dialogueTree: [
      {
        agentThought: 'Engaging property manager regarding deposit statement showing zero refund on $2,400 deposit.',
        agentMessage: "Hello Property Management. I received your disposition letter regarding Unit 402. You deducted the entire $2,400 deposit citing 'full interior repaint and carpet replacement'. We occupied the unit for 3 years, and the move-out inspection video verifies zero damage beyond ordinary wear and tear. We demand the return of our $2,400 deposit.",
        counterThought: 'Tenants rarely challenge move-out deductions. Attempt boilerplate lease defense.',
        counterResponse: "Our lease agreement Section 18 states that tenant must return apartment in original pristine condition, including walls and carpeting. Our painter charged $1,400 and carpet replacement was $1,000.",
        goalDelta: 20
      },
      {
        agentThought: 'Counterparty cited lease clause that contradicts state statutory protections. Lease clauses waiving statutory wear-and-tear protections are void as a matter of public policy.',
        agentMessage: "Under Civil Code § 1950.5, a landlord cannot contract out of statutory requirements. Section 1950.5(b) explicitly prohibits deducting for ordinary wear and tear. A 3-year tenancy naturally results in paint depreciation, which IRS and HUD guidelines amortize over 3 to 5 years. Furthermore, you failed to provide contractor invoices within the statutory 21-day window.",
        counterThought: 'Tenant is legally informed and aware of statutory invoice deadline violation.',
        counterResponse: "We did have contractor receipts, but our office was backed up. I can offer to split the difference and refund $1,200 as a courtesy.",
        goalDelta: 55
      },
      {
        agentThought: 'Split-the-difference lowball. Bad faith retention under statute triggers treble damages (3x deposit). Apply maximal settlement pressure.',
        agentMessage: "Under § 1950.5(l), bad faith retention of a security deposit entitles the tenant to statutory damages of up to twice the deposit amount in addition to actual damages ($7,200 total), plus court costs. We have high-resolution time-stamped move-out video documentation. We decline the $1,200 offer. Full return of $2,400 via direct deposit within 72 hours settles all claims.",
        counterThought: 'Exposure to $7,200 plus legal fees in small claims. Ownership attorney recommends full refund.',
        counterResponse: "Following consultation with ownership counsel, we have re-categorized the paint and carpet as normal operational capital expenditures. An electronic ACH transfer for the full $2,400.00 has been submitted to your bank account. Confirmation #ACH-890214.",
        goalDelta: 100
      }
    ]
  },
  {
    id: 'custom_target',
    category: 'Autonomous Custom Objective',
    name: 'Custom Target Website & Mission',
    targetUrl: 'https://example.com/live-chat',
    defaultUsername: 'user@custom-domain.com',
    objective: 'Enter your custom objective, dispute details, or debate stance here...',
    tactic: 'Dynamic Adaptive ReAct Loop',
    tacticDesc: 'Custom LLM reasoning loop analyzing target chat elements, formulating counter-arguments, and driving towards user goals.',
    batna: 'Custom walk-away strategy and escalation contingency.',
    dialogueTree: []
  }
];
