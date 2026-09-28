"use client";
import Icon from "@/Components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HOW_STEP_MS, STEPS } from "./content";
import { useOverlayOpen, useReducedMotion, useSlideWindow } from "./motion";
import { useDataStore } from "@/api/store/store";

// What each step looks like in the product, drawn as a small card over the photo (no fake people or reviews).
function Scene({ step }) {
  if (step === 0)
    return (
      <div className="hm-scene">
        <p className="hm-scene__title">Book a service</p>
        <p className="hm-scene__row"><Icon name="home" size={15} /> Standard house cleaning</p>
        <p className="hm-scene__row"><Icon name="calendar" size={15} /> Tue · 10:00 AM</p>
        <p className="hm-scene__row hm-scene__muted"><Icon name="chat" size={15} /> Describe the job</p>
        <span className="hm-scene__btn">Continue</span>
      </div>
    );
  if (step === 1)
    return (
      <div className="hm-scene">
        <p className="hm-scene__title">Your Buddy</p>
        <p className="hm-scene__row"><span className="hm-scene__avatar"><Icon name="user" size={16} /></span> Local pro · 2 mi away</p>
        <p className="hm-scene__ok"><Icon name="fileCheck" size={15} /> ID and certificates reviewed</p>
        <p className="hm-scene__row hm-scene__muted">Profile · Ratings · Reviews</p>
      </div>
    );
  return (
    <div className="hm-scene">
      <p className="hm-scene__title"><Icon name="checkCircle" size={18} /> Job done</p>
      <p className="hm-scene__ok"><Icon name="lock" size={15} /> Paid securely through the app</p>
    </div>
  );
}

// How it works: a three-step journey with one photo per step.
export default function HowItWorks() {
  // How it works journey: runs only while the section is on screen, so it starts at step 1 for the reader.
  const [step, setStep] = useState(0);
  const hasBooked = useDataStore((store) => store.getProfile?.hasBooked); // from the profile the header loads
  const overlay = useOverlayOpen();
  const howRunning = !useReducedMotion() && !overlay; // runs all the time (owner), except behind a pop-up
  const last = STEPS.length - 1;
  const showSlide = useSlideWindow(step, STEPS.length);
  useEffect(() => {
    if (!howRunning) return;
    const t = setTimeout(() => setStep((n) => (n + 1) % STEPS.length), HOW_STEP_MS);
    return () => clearTimeout(t);
  }, [howRunning, step]);

  // A journey: steps advance on their own while on screen (never locks scrolling, keeps going on hover);
  // a line flows down the connector from one step to the next; click a step to jump. One photo per step.
  return (
    <section id="how-it-works" className="hm-how">
        <div className="ab-container hm-section hm-how__grid">
          <div className="hm-how__media" aria-hidden="true">
            {STEPS.map((x, i) =>
              showSlide(i) ? (
                <Image key={x.title} src={x.photo} alt="" fill sizes="(max-width: 991px) 100vw, 45vw" className={i === step ? "is-on" : ""} />
              ) : null,
            )}
            <span className="hm-how__badge">Step {step + 1} of {STEPS.length}</span>
            <Scene key={step} step={step} />
          </div>
          <div className="hm-how__copy">
            <span className="hm-kicker">How it works</span>
            <h2 className="hm-title">Getting help has never been easier.</h2>
            <p className="hm-sub">Three simple steps, and your Buddy is on the way.</p>
            <ol className="hm-how__steps">
              {STEPS.map((x, i) => (
                <li key={x.title} className={`hm-how__step${i === step ? " is-on" : ""}${i < step ? " is-done" : ""}`}>
                  <button type="button" className="hm-how__btn" onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}>
                    <span className="hm-how__num">{i + 1}</span>
                    <span>
                      <span className="hm-how__name">{x.title}</span>
                      <span className="hm-how__text">{x.text}</span>
                    </span>
                  </button>
                  {/* Line to the next step: fills over one step's time, so the next circle lights up
                      (and the photo changes) exactly when the line reaches it. No line after the last step. */}
                  {i < last && (
                    <span className="hm-how__seg" aria-hidden="true">
                      <span
                        key={i === step ? `run-${step}` : "still"}
                        className={`hm-how__seg-fill${i < step ? " is-full" : ""}${i === step && howRunning ? " is-running" : ""}`}
                      />
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <Link href="/service" className="hm-btn hm-btn--primary">
              {hasBooked ? "Book a service" : "Book your first service"} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>
  );
}
