import Icon from "@/Components/ui/Icon";
import Image from "next/image";
import "@/Components/content.css";

// Trust & Safety — the client's copy word for word, in the content-page layout (Components/content.css).
// Claims the product does not fully back yet: "Every completed job is reviewed" (no review process is built),
// "our rating system works both ways" (customers are not rated today), "We verify the real identity" (ID documents are
// uploaded and checked by the admin team; no identity-verification service).
const HOME_PHOTO = "https://images.unsplash.com/photo-1666585958641-4f70887372a1"; // a calm, lived-in living room

const features = [
  { icon: "fileCheck", title: "Verified Documents", desc: "Every service provider submits their documents before joining the platform, and our team reviews and verifies them before the provider can take a job." },
  { icon: "user", title: "Profile Verification", desc: "We verify the real identity behind every Buddy profile. The name, photo, and credentials you see are the person who will show up at your door." },
  { icon: "star", title: "Ongoing Performance Monitoring", desc: "Every completed job is reviewed. Buddies who receive consistent complaints or low ratings are reviewed and removed if standards aren't met. We don't let problems quietly continue." },
  { icon: "lock", title: "Secure, Cashless Payments", desc: "All payments go through Any-Buddy's secure platform. There's no cash exchanged, which reduces risk for both customers and service providers." },
  { icon: "chat", title: "Customer Support When You Need It", desc: "If anything feels wrong before, during, or after a booking, our support team is reachable directly through the app. You're never left to deal with an issue on your own." },
];

function TrustSafety() {
  return (
    <>
      <section className="ab-container ab-cp-hero">
        <div className="ab-cp-hero__grid">
          <div className="ab-cp-hero__copy">
            <span className="ab-eyebrow">Trust &amp; Safety</span>
            <h1 className="ab-cp-hero__title">Your home is your safe space. We treat it that way.</h1>
            <p className="ab-lead">
              Everything we do at Any-Buddy is built around one question: would I feel safe and comfortable letting this
              person into my home? If the answer isn&apos;t an unqualified yes, they don&apos;t become a Buddy.
            </p>
          </div>
          <div className="ab-cp-hero__media">
            <Image src={HOME_PHOTO} alt="" fill sizes="(max-width: 991px) 100vw, 45vw" priority />
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--cream">
        <div className="ab-container">
          <div className="ab-section-head ab-section-head--center">
            <div>
              <h2 className="ab-h2">How We Vet Every Buddy</h2>
              <p className="ab-lead">Trust and safety are at the core of every booking.</p>
            </div>
          </div>
          <div className="ab-cp-grid ab-cp-grid--center">
            {features.map((f) => (
              <article className="ab-cp-card" key={f.title}>
                <span className="ab-cp-card__icon" aria-hidden="true">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-container ab-cp-split">
          <div className="ab-section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="ab-h2">For Buddies — Safety on the Job</h2>
            </div>
          </div>
          <div className="ab-cp-prose">
            <p>
              We take our Buddies&apos; wellbeing seriously too. All customers on Any-Buddy go through account
              verification, and our rating system works both ways.
            </p>
            <p>If a customer is disrespectful or creates an unsafe environment, they can be removed from the platform.</p>
            <p>
              If you ever feel unsafe on a job, contact our support team immediately. Your safety matters just as much as
              the customer&apos;s.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default TrustSafety;
