import "@/Components/content.css";

// FAQ — the client's questions and answers word for word (lifted from the old page by script), in the content layout.
// Native <details>: keyboard and screen-reader friendly, no script. The first answer starts open.
// Answers that don't match the product yet:
//  - cancel/reschedule "up to 24 hours" free (24 h everywhere); rescheduling is not built.
//  - "we match you with a vetted local pro": customers pick the pro themselves.
//  - Buddies "standard rate structure": the contract and Terms say pros set their own prices (ToU s29).
//  - Buddy payouts "within 3-5 business days" and a Buddy cancellation fee: not built.
const FAQ = [
  {
    title: "For Customers",
    items: [
      { q: "How does Any-Buddy work?", a: "You choose a service, pick a date and time, and we match you with a vetted local pro. You'll see their profile and reviews before you confirm. Pay securely through the app or website — no cash needed." },
      { q: "Are service providers' documents verified?", a: "Yes. Every Buddy submits their documents, and our team reviews and verifies them before they can take any jobs. This step is non-negotiable." },
      { q: "How much does it cost?", a: "Pricing depends on the service, the size of the job, and your location. You'll always see the full price before you confirm a booking — no surprise fees." },
      { q: "Can I choose the same Buddy for repeat bookings?", a: "Yes. If you love your Buddy, you can request them for future bookings directly through the app. We encourage building those long-term relationships." },
      { q: "What if I need to cancel or reschedule?", a: "You can cancel or reschedule your booking through the app up to 24 hours before your scheduled time at no charge. Cancellations made after that window may incur a small fee." },
      { q: "What if I'm not happy with the work?", a: "We stand behind every job booked on Any-Buddy. If you're not satisfied, contact our support team within 24 hours and we'll make it right — either by sending a Buddy back to fix the issue or issuing a refund." },
      { q: "Which areas do you currently serve?", a: "Any-Buddy is currently live across Massachusetts. We're growing our network and will be expanding to new states soon. Sign up to be notified when we reach your area." },
      { q: "Is my payment information safe?", a: "Absolutely. All payments are processed through a secure, encrypted payment system (Stripe). Any-Buddy never stores your card details." }
    ],
  },
  {
    title: "For Buddies (Service Providers)",
    items: [
      { q: "How do I sign up as a Buddy?", a: "Sign up on the Any-Buddy Pro website, create your provider profile, list your services, share license and credential details for skilled jobs, and submit your documents for verification. Once approved, your profile goes live and you can start accepting jobs." },
      { q: "Is there a fee to join Any-Buddy?", a: "No. Signing up as a Buddy is completely free. Any-Buddy takes a small service fee from each completed booking — you keep the rest." },
      { q: "How and when do I get paid?", a: "Payments are released to your account after each completed job. You'll receive a notification once payment is on its way. Funds typically arrive within 3-5 business days depending on your bank." },
      { q: "Can I set my own rates?", a: "Pricing on Any-Buddy is based on our standard rate structure for each service category to ensure fairness and transparency for customers. You'll know exactly what a job pays before you accept it." },
      { q: "What happens if a customer cancels?", a: "If a customer cancels within 24 hours of your scheduled job, you're entitled to a cancellation fee. Full details are in the Buddy Terms & Conditions." },
      { q: "What if a customer is rude or makes me feel unsafe?", a: "Your safety is our priority too. If a customer behaves inappropriately, contact our support team immediately. Accounts that violate our community standards are removed from the platform." }
    ],
  }
];

function FAQPage() {
  return (
    <>
      <section className="ab-container ab-cp-hero ab-cp-hero--text ab-cp-hero--center">
        <div className="ab-cp-hero__grid">
          <div className="ab-cp-hero__copy">
            <h1 className="ab-cp-hero__title">Frequently Asked Questions</h1>
            <p className="ab-lead">Find answers to common questions from customers and Buddies.</p>
          </div>
        </div>
      </section>

      <section className="ab-container" style={{ paddingBottom: "clamp(48px, 6vw, 88px)" }}>
        <div className="ab-cp-column">
        {FAQ.map((g, gi) => (
          <div className="ab-faq__group" key={g.title}>
            <h2>{g.title}</h2>
            <div className="ab-faq">
              {g.items.map((it, i) => (
                <details key={it.q} open={gi === 0 && i === 0}>
                  <summary>{it.q}</summary>
                  <div className="ab-faq__a">
                    <p>{it.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
        </div>
      </section>
    </>
  );
}

export default FAQPage;
