import AppBtnLink from "@/Components/CommonParts/AppBtnLink";
import { PRO_PHOTO } from "@/Components/home/content";
import Icon from "@/Components/ui/Icon";
import { PRO_URL, SHOW_APP_BADGES } from "@/Until";
import Image from "next/image";
import "@/Components/content.css";
import "@/Components/home.css"; // the shared navy app card (hm-app)

// Become a Buddy — the owner's copy word for word, in the content-page layout (Components/content.css).
// Buddies sign up on the Any-Buddy Pro website, so every "Apply" goes to its sign-up page.
// Claims to confirm with the owner: "Payments are released directly to your account after every completed job"
// (provider payouts are not built yet, AB-014) and the two Buddy quotes (real people?).
const PRO_APP = "https://apps.apple.com/us/app/any-buddy-pro/id6771679358";
// Real screens from the Pro app's App Store listing ("Work Smarter, Earn Better" and "Manage Your Booking").
// The listing's earnings screen is left out: it shows "500+ professionals / 10k+ happy customers" we can't back.
const PRO_SHOTS = [
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/be/5d/15/be5d15ab-c8ff-20b2-533b-1878d35ad066/2.jpg/600x1300bb.webp",
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/eb/57/41/eb5741fb-236f-f606-1324-8c50f60cfb53/4.jpg/600x1300bb.webp",
];

const benefits = [
  { icon: "clock", title: "You're in Control", desc: "Work when you want, as much as you want. Accept only the jobs that fit your schedule and skills. No boss, no mandatory shifts." },
  { icon: "calendar", title: "Steady Job Flow", desc: "Any-Buddy handles the marketing, customer acquisition, and booking. You focus on the work while we send customers to you." },
  { icon: "card", title: "Get Paid Fast", desc: "Payments are released directly to your account after every completed job. No chasing invoices or waiting weeks." },
  { icon: "star", title: "Grow Your Reputation", desc: "Every 5-star review builds your profile and puts you in front of more customers." },
  { icon: "chat", title: "You're Not Alone", desc: "Our support team is available whenever you need help with bookings or customer issues." },
];

const steps = [
  { title: "Create Your Profile", desc: "Tell us what services you offer, where you work, and your availability. Upload a photo and description of your experience. Skilled workers can add licenses and credentials." },
  { title: "Get Your Documents Verified", desc: "Our team reviews and verifies the documents every Buddy submits, to protect customers and maintain trust." },
  { title: "Start Accepting Jobs", desc: "Once approved, your profile goes live and customers can start booking your services." },
];

const quotes = [
  { text: "I was picking up odd jobs here and there before Any-Buddy. Now I have consistent bookings every week in my own neighborhood. It changed everything for me.", by: "Marcus T., Handyman, Springfield MA" },
  { text: "The app makes it so easy. I see the job, I accept it, I show up, I get paid. No paperwork, no back and forth.", by: "Diana R., Cleaning Professional, Boston MA" },
];

const needs = [
  "18 years of age or older",
  "US work authorization",
  "Verifiable skill or experience in the services you offer",
  "Valid documents for verification",
  "A phone, tablet or computer to manage bookings",
  "Reliability and professionalism — your reputation is everything on Any-Buddy",
];

const Apply = ({ children, ghost }) => (
  <a href={`${PRO_URL}/signup`} className={`ab-btn ${ghost ? "ab-btn--ghost" : "ab-btn--primary"} ab-btn--lg`}>
    {children}
    <Icon name="arrowRight" size={18} className="ab-arrow" />
  </a>
);

function BecomeBuddy() {
  return (
    <>
      <section className="ab-container ab-cp-hero">
        <div className="ab-cp-hero__grid">
          <div className="ab-cp-hero__copy">
            <span className="ab-eyebrow">Become a Buddy</span>
            <h1 className="ab-cp-hero__title">Turn your skills into steady income.</h1>
            <p className="ab-lead">
              Join Any-Buddy and connect with homeowners across Massachusetts who need exactly what you&apos;re good at.
              Set your own hours, choose your jobs, and get paid fast.
            </p>
            <div className="ab-cp-hero__actions">
              <Apply>Apply to Become a Buddy</Apply>
            </div>
          </div>
          <div className="ab-cp-hero__media">
            <Image src={PRO_PHOTO} alt="" fill sizes="(max-width: 991px) 100vw, 45vw" priority />
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
          <div className="ab-cp-grid ab-cp-grid--center">
            {benefits.map((b) => (
              <article className="ab-cp-card" key={b.title}>
                <span className="ab-cp-card__icon" aria-hidden="true">
                  <Icon name={b.icon} size={22} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-section-head ab-section-head--center">
            <div>
              <h2 className="ab-h2">Get Started in 3 Steps</h2>
            </div>
          </div>
          <ol className="ab-cp-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="ab-cp-hero__actions" style={{ justifyContent: "center", marginTop: 32 }}>
            <Apply>Apply Now — It&apos;s Free</Apply>
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--cream">
        <div className="ab-container">
          <div className="ab-section-head ab-section-head--center">
            <div>
              <h2 className="ab-h2">What Buddies Are Saying</h2>
            </div>
          </div>
          <div className="ab-cp-quotes">
            {quotes.map((q) => (
              <figure className="ab-cp-quote" key={q.by}>
                <blockquote>“{q.text}”</blockquote>
                <figcaption>— {q.by}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-container ab-cp-split">
          <div className="ab-section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="ab-h2">What We Look for in a Buddy</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 28, justifyItems: "start" }}>
            <ul className="ab-cp-checks">
              {needs.map((n) => (
                <li key={n}>
                  <Icon name="checkCircle" size={20} />
                  {n}
                </li>
              ))}
            </ul>
            <Apply ghost>Ready? Apply to Become a Buddy Today</Apply>
          </div>
        </div>
      </section>

      {/* Closing card: same design as Home's app section. The Pro app's store screens show only while store badges are on. */}
      <div className="ab-home">
      <section className="ab-container hm-section hm-cta" id="join" aria-labelledby="bb-app-title">
        <div className="hm-app">
          <div className="hm-app__copy">
            <span className="hm-kicker hm-kicker--light">Any-Buddy Pro</span>
            <h2 id="bb-app-title" className="hm-title">Join as a Buddy</h2>
            <p className="hm-sub hm-sub--light">Sign up on the Any-Buddy Pro website. It works on your phone, tablet or computer.</p>
            <ul className="hm-app__points">
              {steps.map((s) => (
                <li key={s.title}>
                  <Icon name="check" size={18} /> {s.title}
                </li>
              ))}
            </ul>
            <div className="hm-app__stores">
              {/* White on the navy card: the page's main action. */}
              <a href={`${PRO_URL}/signup`} className="ab-btn ab-btn--light ab-btn--lg">
                Join as a Buddy
                <Icon name="arrowRight" size={18} className="ab-arrow" />
              </a>
              <AppBtnLink app={PRO_APP} play="" />
            </div>
          </div>
          {SHOW_APP_BADGES && (
            <div className="hm-app__shots">
              <Image src={PRO_SHOTS[1]} alt="" width={300} height={650} className="hm-app__shot hm-app__shot--back" />
              <Image src={PRO_SHOTS[0]} alt="Any-Buddy Pro app: bookings and earnings at a glance" width={300} height={650} className="hm-app__shot hm-app__shot--front" />
            </div>
          )}
        </div>
      </section>
      </div>
    </>
  );
}

export default BecomeBuddy;
