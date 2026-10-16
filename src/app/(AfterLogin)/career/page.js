import Icon from "@/Components/ui/Icon";
import "@/Components/content.css";

// Careers — the client's copy word for word (lifted from the old page by script), in the content layout.
// Only changes: all-caps headings shown in normal case, and the "US TimezonePreferred" typo spaced.
// Apply links are a mailto to the company's careers contact.
const WHY = [
  [
    "Early team. Real ownership.",
    "We're at the beginning of something big. Joining now means your decisions shape the product, the culture, and the direction of the company — not just your corner of it."
  ],
  [
    "Remote-first, results-driven.",
    "We don't believe in managing people's hours. We believe in clear goals, honest communication, and giving talented people the space to do their best work — wherever they are."
  ],
  [
    "Work that ships.",
    "No long approval chains, no endless roadmap debates. We move fast, we launch, we learn, and we improve. If you like seeing your work in front of real users quickly, you'll thrive here."
  ],
  [
    "A mission worth showing up for.",
    "Any-Buddy exists to make quality home services accessible to every household and to create meaningful earning opportunities for skilled workers in every community. That's not a marketing line — it's why we built this."
  ]
];

const JOBS = [
  {
    "title": "Technical Head",
    "meta": "Full-Time • Remote (US Timezone Preferred) • Mid–Senior Level (5–7 Years)",
    "about": [
      "As Technical Head at Any-Buddy, you will be the senior technical owner of our platform post-launch. You'll take full responsibility for the health, stability, and ongoing development of our multi-platform codebase — spanning a Node.js/Express backend API, two Next.js web applications, native Android (Kotlin) and iOS (Swift) apps for both customers and service providers, and an internal admin panel.",
      "This is a hands-on, ownership-level role. You will manage the day-to-day technical operations of the platform, oversee developers, implement security updates and bug fixes, ensure platform reliability, and drive the technical execution of new features as the product evolves. You will work closely with the CTO and founder on technical strategy while taking full day-to-day responsibility for delivery."
    ],
    "apply": "mailto:asif@any-buddy.com",
    "applyText": "Apply for Technical Head",
    "sections": [
      {
        "h": "Key Responsibilities",
        "items": [
          "Own the stability and uptime of the Any-Buddy platform across all 7 codebases (backend API, admin panel, customer website, customer iOS app, customer Android app, service provider iOS app, service provider Android app).",
          "Manage, review, and merge code from the development team — enforce quality standards, secure coding practices, and consistent architecture across all repos.",
          "Triage, prioritize, and resolve bugs, crashes, and security vulnerabilities in a timely manner — including critical issues such as authentication, payment flows, and data security.",
          "Implement ongoing security hardening: API key management, token lifecycle, server-side credential handling, and dependency updates.",
          "Oversee the integration and reliability of third-party services: Stripe (payments), AWS S3 (file storage), Firebase (push notifications), Google Maps/Places, Twilio/SendGrid (OTP/email), and Agora (chat/video).",
          "Manage the release process for iOS (App Store) and Android (Google Play) app updates.",
          "Write and maintain technical documentation, environment setup guides, and deployment runbooks for each repo.",
          "Collaborate with the CTO on technical roadmap decisions and architectural upgrades.",
          "Ensure the platform scales to support growth across additional US markets as Any-Buddy expands."
        ]
      },
      {
        "h": "What We're Looking For",
        "items": [
          "5–7 years of professional software development experience, with at least 2 years in a technical lead or senior engineering role.",
          "Strong working knowledge of Node.js/Express and MongoDB — able to read, debug, and improve backend API code confidently.",
          "Familiarity with Next.js / React for web applications.",
          "Ability to review and understand native mobile code in both Kotlin (Android) and Swift (iOS) — direct coding in both is a plus, but not a requirement if you can manage and review mobile developers effectively.",
          "Solid understanding of application security best practices: JWT/token management, API authentication, secure credential storage, encrypted communications, and OWASP top 10 awareness.",
          "Experience managing third-party payment integrations (Stripe preferred), cloud storage (AWS S3), and push notification platforms (Firebase).",
          "Comfortable with Git-based workflows (GitHub/GitLab), branching strategies, code review, and CI/CD pipelines.",
          "Strong written communication skills — you will be coordinating with remote developers and non-technical stakeholders regularly.",
          "Self-directed and accountable: able to identify problems, escalate what needs escalation, and solve what doesn't without needing to be chased."
        ]
      },
      {
        "h": "Nice to Have",
        "items": [
          "Experience with iOS App Store and Google Play submission and release management.",
          "Background in marketplace or service-platform products.",
          "Exposure to Agora (real-time video/chat), Twilio, or SendGrid integrations."
        ]
      }
    ]
  },
  {
    "title": "Project Coordinator",
    "meta": "Full-Time • Remote (US Timezone Preferred) • Mid-Level (4–6 Years)",
    "about": [
      "Any-Buddy is looking for a Project Coordinator to bring structure, clarity, and momentum to everything we build and launch. You'll sit at the center of our operations — keeping the product roadmap moving, tracking deliverables across the development team, coordinating between technical and business stakeholders, and making sure nothing slips through the cracks.",
      "This is a role for someone who thrives in the organized chaos of an early-stage company — someone who can create process without creating bureaucracy, and who understands both the product and the people well enough to keep everything on track."
    ],
    "apply": "mailto:asif@any-buddy.com",
    "applyText": "Apply for Project Coordinator",
    "sections": [
      {
        "h": "Key Responsibilities",
        "items": [
          "Own the project management workflow for the Any-Buddy platform — maintain a clear, up-to-date view of what is being built, by whom, by when, and what is blocking it.",
          "Work directly with the Technical Head and CTO to translate product goals into clearly scoped, time-bound development tasks.",
          "Run regular progress check-ins with the development team — gather status updates, identify blockers early, and escalate appropriately.",
          "Maintain project documentation: sprint plans, task boards, release notes, and decision logs.",
          "Coordinate the release cycle for app updates and new features across iOS, Android, and web.",
          "Act as the communication bridge between technical teams and business/operations stakeholders — translating technical updates into plain-language summaries for the founder and leadership.",
          "Track and report on key delivery milestones: feature launches, bug resolution timelines, platform uptime, and third-party integration health.",
          "Identify and flag scope creep, timeline risks, and resource constraints before they become problems.",
          "Support onboarding of new developers or contractors as the team grows."
        ]
      },
      {
        "h": "What We're Looking For",
        "items": [
          "4–6 years of experience in project coordination, product operations, or a related role — ideally in a software or technology company.",
          "Solid understanding of software development workflows: sprint planning, backlog grooming, release cycles, and bug triage.",
          "Experience using project management tools such as Jira, Asana, Trello, Linear, or equivalent.",
          "Strong written and verbal communication skills — you'll be the connective tissue between teams and stakeholders.",
          "Comfortable working with remote, distributed teams across different time zones.",
          "Highly organized with strong attention to detail — you keep track of a lot of moving pieces simultaneously without dropping any.",
          "Proactive, not reactive: you identify problems before they're raised to you and you drive resolutions rather than waiting for direction.",
          "Ability to understand technical concepts well enough to have credible conversations with engineers — you don't need to write code, but you need to understand what's being built."
        ]
      },
      {
        "h": "Nice to Have",
        "items": [
          "Experience coordinating mobile app releases (App Store / Google Play).",
          "Background in marketplace, on-demand, or consumer app products.",
          "Familiarity with Agile/Scrum methodologies."
        ]
      }
    ]
  },
  {
    "title": "Business Analyst",
    "meta": "Full-Time • Remote (US Timezone Preferred) • Mid-Level (4–6 Years)",
    "about": [
      "Any-Buddy is hiring a Business Analyst to help us understand how our platform is performing, what our users need, and where our biggest opportunities lie. You will dig into platform data, gather and translate requirements from business stakeholders into product specifications, and work closely with the technical and operations teams to ensure what we build actually solves the right problems.",
      "This is a high-visibility role at an early stage — your analysis will directly influence product decisions, service expansion priorities, and how we communicate our value to customers and service providers. You'll be a core part of the team, not a support function."
    ],
    "apply": "mailto:asif@any-buddy.com",
    "applyText": "Apply for Business Analyst",
    "sections": [
      {
        "h": "Key Responsibilities",
        "items": [
          "Analyze platform data — booking volumes, user behavior, conversion rates, churn, service category performance, and provider supply/demand — to identify trends, gaps, and growth opportunities.",
          "Gather, document, and validate business requirements from the founder, operations, and customer-facing teams — translating them into clear product specifications that the development team can act on.",
          "Map and document current workflows (booking flow, provider onboarding, payment processing, customer support) and identify inefficiencies or friction points.",
          "Build and maintain dashboards and reporting frameworks that give leadership a clear, real-time picture of platform health and business performance.",
          "Support feature prioritization by providing data-backed analysis of customer needs, competitive positioning, and operational impact.",
          "Conduct competitive analysis of the home services marketplace landscape (TaskRabbit, Handy, Urban Company, Amazon Home Services) to identify positioning opportunities for Any-Buddy.",
          "Work with the Project Coordinator and Technical Head to ensure new feature requirements are clearly understood and properly scoped before development begins.",
          "Support customer and provider feedback analysis — surfacing recurring themes from reviews, support tickets, and surveys to inform product improvements."
        ]
      },
      {
        "h": "What We're Looking For",
        "items": [
          "4–6 years of experience in a business analyst, product analyst, or data analyst role — preferably in a technology, marketplace, or consumer product company.",
          "Strong analytical skills with the ability to work with data tools (Excel/Google Sheets at a minimum; SQL, Tableau, Mixpanel, or similar analytics platforms a strong plus).",
          "Experience writing clear, structured requirements documents, user stories, and process flow documentation.",
          "Comfort communicating complex analysis to non-technical stakeholders — you can turn data into a clear story and a clear recommendation.",
          "Understanding of two-sided marketplace dynamics: balancing supply (service providers) and demand (customers), CAC, LTV, retention, and unit economics.",
          "Experience with user research methods — surveys, interviews, support ticket analysis — to complement quantitative data with qualitative insight.",
          "Self-sufficient and intellectually curious — you ask good questions, find the data to answer them, and present findings with clear recommendations."
        ]
      },
      {
        "h": "Nice to Have",
        "items": [
          "Experience in the home services, on-demand, or local services industry.",
          "Familiarity with Stripe analytics, Firebase Analytics, or Google Analytics for mobile/web platforms.",
          "Experience supporting go-to-market strategy or market expansion planning."
        ]
      }
    ]
  }
];

const HOW_STEPS = [
  "Send your resume and a short note (3–5 sentences) on why this role and why Any-Buddy to asif@any-buddy.com.",
  "If there's a fit, we'll schedule a 30-minute introductory call within a week.",
  "From there, a short practical exercise relevant to the role — nothing that takes more than a couple of hours.",
  "A final conversation with the founder or CTO. Then a decision."
];

function Careers() {
  return (
    <>
      <section className="ab-container ab-cp-hero ab-cp-hero--text">
        <div className="ab-cp-hero__grid">
          <div className="ab-cp-hero__copy">
            <span className="ab-eyebrow">Careers</span>
            <h1 className="ab-cp-hero__title">Build something that matters — from day one.</h1>
            <p className="ab-lead">Any-Buddy is a fast-growing home services marketplace launching across Massachusetts. We&apos;re a small, focused team building a platform that connects real people with the trusted help they need. If you want your work to have immediate impact, this is where you want to be.</p>
            <ul className="ab-job__tags">
              <li>Remote-first</li>
              <li>Full-time</li>
              <li>US Timezone Preferred</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--cream">
        <div className="ab-container">
          <div className="ab-section-head ab-section-head--center">
            <div>
              <h2 className="ab-h2">Why Join Any-Buddy?</h2>
            </div>
          </div>
          <div className="ab-cp-grid">
            {WHY.map(([title, text]) => (
              <article className="ab-cp-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-section-head">
            <div>
              <h2 className="ab-h2">Open Positions</h2>
            </div>
          </div>
          <div className="ab-jobs">
            {JOBS.map((j) => (
              <details className="ab-job" key={j.title}>
                <summary className="ab-job__sum">
                  <div className="ab-job__head">
                    <h3>{j.title}</h3>
                    <ul className="ab-job__tags" aria-label="Role details">
                      {j.meta.split("•").map((t) => (
                        <li key={t}>{t.trim()}</li>
                      ))}
                    </ul>
                  </div>
                  <span className="ab-job__toggle">
                    <span className="ab-job__more">View role details</span>
                    <span className="ab-job__less">Hide details</span>
                    <Icon name="arrowRight" size={16} />
                  </span>
                </summary>
                <div className="ab-job__body">
                  <div className="ab-job__about">
                    <h4>About the Role</h4>
                    {j.about.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                  <div className="ab-job__cols">
                    {j.sections.map((sec) => (
                      <div key={sec.h}>
                        <h4>{sec.h}</h4>
                        <ul>
                          {sec.items.map((i) => (
                            <li key={i.slice(0, 32)}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <a href={j.apply} className="ab-btn ab-btn--primary" style={{ justifySelf: "start" }}>
                    {j.applyText}
                    <Icon name="arrowRight" size={18} className="ab-arrow" />
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--cream">
        <div className="ab-container">
          <div className="ab-section-head ab-section-head--center">
            <div>
              <h2 className="ab-h2">How to Apply</h2>
              <p className="ab-lead">We keep our hiring process simple and respectful of your time.</p>
            </div>
          </div>
          <ol className="ab-cp-steps ab-cp-steps--four">
            {HOW_STEPS.map((s) => (
              <li key={s.slice(0, 24)}>
                <p>{s}</p>
              </li>
            ))}
          </ol>
          <div className="ab-apply-end">
            <p>We don&apos;t have a long list of interview rounds. We move fast, we&apos;re direct, and we respect that you&apos;re evaluating us as much as we&apos;re evaluating you.</p>
            <a href="mailto:asif@any-buddy.com" className="ab-btn ab-btn--primary ab-btn--lg">
              Send your application
              <Icon name="arrowRight" size={18} className="ab-arrow" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Careers;
