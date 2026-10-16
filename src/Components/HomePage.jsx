"use client";
// The home page follows a standard marketplace layout. The sections follow the customer's decision first, then the
// second audience: 1 Hero (search), 2 Explore (browse), 3 How it works, 4 Why Any-Buddy (trust), 5 Reviews (proof),
// 6 App (the customer call to action) and 7 For local pros (for Buddies). The Buddy section comes last so it never
// interrupts the customer's story.
// Backgrounds alternate so each section reads as its own block: photo, white, cream, white, cream, then white cards.
// Every section has the same padding, and two card sections in a row share a single gap (.hm-cta + .hm-cta).
// The copy is the client's original wording where it exists, and the data comes from /api/user/homepage.
import { useDataStore } from "@/api/store/store";
import Icon from "@/Components/ui/Icon";
import { SIGNED_IN } from "@/Until";
import Cookies from "@/Until/cookies";
import Image from "next/image";
import Link from "next/link";
import { getSavedLocation, LOCATION_EVENT } from "@/Until/searchLocation";
import { useEffect, useState } from "react";
import SearchForm from "./Header/SearchForm";
import AppSection from "./home/AppSection";
import { useOverlayOpen, useSlideWindow } from "./home/motion";
import Explore from "./home/Explore";
import HowItWorks from "./home/HowItWorks";
import WhyAnyBuddy from "./home/WhyAnyBuddy";
import { CATEGORY_ICON, HERO_STEP_MS, heroPhoto, HERO_LINE, PRO_PHOTO, OWNER_REVIEWS } from "./home/content";
import "./home.css";


const cap = (t = "") => t.charAt(0).toUpperCase() + t.slice(1); // The admin data stores names in lower case, such as "cleaning" and "electrician".

export default function HomePage() {
  const { Homepage, fetchHomepage } = useDataStore();
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(!!Cookies.get(SIGNED_IN)), []);

  useEffect(() => {
    fetchHomepage({ limit: 50 }).then(() => setLoaded(true));
  }, []);

  const categories = Homepage?.listCategories || [];
  // The hero rotates through the categories except Trending, which has its own row under the search.
  const heroCats = categories.filter((c) => c.slug !== "trending");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false); // True while the cursor is in the search.
  const [userPaused, setUserPaused] = useState(false); // True when the visitor has pressed pause.
  const overlay = useOverlayOpen(); // True while a pop-up is open, so the photos stop behind it.
  const showSlide = useSlideWindow(active, heroCats.length || 1);

  // Coming back to the page (with the back button or a restored tab) always starts the rotation again.
  useEffect(() => {
    const resume = () => setPaused(false);
    window.addEventListener("pageshow", resume);
    return () => window.removeEventListener("pageshow", resume);
  }, []);

  useEffect(() => {
    if (paused || userPaused || overlay || heroCats.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % heroCats.length), HERO_STEP_MS);
    return () => clearTimeout(t);
  }, [paused, userPaused, overlay, heroCats.length, active]);
  const groups = Homepage?.services || [];
  const trendGroup = groups.find((g) => g.categorySlug === "trending" && g.services?.length);
  const trending = (
    trendGroup
      ? trendGroup.services.map((x) => ({ ...x, cat: trendGroup.categorySlug }))
      : groups.flatMap((g) => g.services.map((x) => ({ ...x, cat: g.categorySlug }))).sort((a, b) => (b.pros || 0) - (a.pros || 0))
  ).slice(0, 4)
  // Reviews confirmed from the original site come first, followed by real reviews from the database.
  const reviews = [...OWNER_REVIEWS, ...(Homepage?.reviews || [])];

  const [place, setPlace] = useState("");
  useEffect(() => {
    const read = () => setPlace(getSavedLocation()?.label || "");
    read();
    window.addEventListener(LOCATION_EVENT, read);
    return () => window.removeEventListener(LOCATION_EVENT, read);
  }, []);

  return (
    <main className="ab-home">
      {/* ── Hero: category photos crossfade behind a centred search, with a pause button and trending services
             under the search. It advances on its own and pauses only while the cursor is in the search. ── */}
      <section className="hm-hero">
      <div className="hm-hero__card">
        <div className="hm-hero__bg" aria-hidden="true">
          {heroCats.map((c, i) =>
            showSlide(i) ? (
              <Image key={c._id} src={heroPhoto(c).src} alt="" fill sizes="100vw" priority={i === 0} className={i === active ? "is-on" : ""} style={{ objectPosition: heroPhoto(c).focus }} />
            ) : null,
          )}
        </div>
        {/* The current category, its place in the set and the pause button form one control group (the WAI-ARIA
            carousel pattern). Automatic changes are not announced, because aria-live is off while it runs. */}
        {heroCats.length > 1 && (
          <div className="hm-hero__now" aria-live={userPaused ? "polite" : "off"}>
            {/* The name sits over its progress lines at a fixed width, so the control never changes size between categories. */}
            <Icon name={CATEGORY_ICON[heroCats[active]?.slug] || "home"} size={18} className="hm-hero__now-icon" />
            <span className="hm-hero__now-info">
              <Link href={`/service/${heroCats[active]?.slug}`} className="hm-hero__now-link" title={cap(heroCats[active]?.categoryName)}>
                <span className="hm-hero__now-names">
                  {heroCats.map((c, i) => (
                    <span key={c._id} className={i === active ? "is-on" : ""}>{cap(c.categoryName)}</span>
                  ))}
                </span>
              </Link>
              <span className="hm-hero__segs" role="img" aria-label={`Photo ${active + 1} of ${heroCats.length}`}>
                {heroCats.map((c, i) => (
                  <span key={c._id} className={`hm-hero__seg${i < active ? " is-done" : ""}`}>
                    {i === active && !paused && !userPaused && !overlay && (
                      <i key={active} style={{ animationDuration: `${HERO_STEP_MS}ms` }} />
                    )}
                  </span>
                ))}
              </span>
            </span>
            <button
              type="button"
              className="hm-hero__pause"
              onClick={() => setUserPaused((v) => !v)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Play the photos" : "Pause the photos"}
            >
              <Icon name={userPaused ? "play" : "pause"} size={16} />
            </button>
          </div>
        )}
        <div className="ab-container hm-hero__inner">
          <span className="hm-hero__eyebrow">Any-Buddy — Service for Everybody</span>
          <h1 className="hm-hero__title">
            <span className="visually-hidden">Your Neighborhood, Handled. </span>
            <span className="hm-hero__lines" aria-hidden="true">
              {(heroCats.length ? heroCats : [{ _id: "default" }]).map((c, i) => (
                <span key={c._id} className={`hm-hero__line${i === active ? " is-on" : ""}`}>
                  {HERO_LINE[c.slug] || "Your Neighborhood, Handled."}
                </span>
              ))}
            </span>
          </h1>
          <p className="hm-hero__lead">Book trusted home service pros in Massachusetts, with every pro&apos;s documents verified. Cleaning, repairs, handyman help, and more — on your schedule.</p>
          {/* Pause only while the cursor is in the search. Leaving it (for a chip, the page or the back button) resumes the rotation. */}
          <div
            className="hm-hero__search"
            onFocus={() => setPaused(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
          >
            <SearchForm id="hero-search" className="ab-sb--hero" />
          </div>
          {/* The trending services under the search come from the admin's "Trending" category. If it is empty, we
              show the services with the most bookable Buddies. Each is a real link, one click away from the service. */}
          <div className="hm-hero__trend" aria-label="Trending services">
            {trending.length > 0 && (
              <>
                <span className="hm-hero__trend-label">
                  <Icon name="trending" size={15} /> Trending
                </span>
                {trending.map((s) => (
                  <Link key={s.slug} href={`/service/${s.cat}/${s.slug}`} className="hm-hero__trend-link">
                    {cap(s.serviceName)}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      </section>

      <Explore categories={categories} groups={groups} loaded={loaded} place={place} />
      <HowItWorks />

      <WhyAnyBuddy />

      {/* ── Reviews: confirmed reviews from the original site, then real ones from the database ── */}
      {reviews.length > 0 && (
        <section className="hm-reviews-band" aria-labelledby="hm-reviews-title">
          <div className="ab-container hm-section">
          <span className="hm-kicker">Reviews</span>
          <h2 id="hm-reviews-title" className="hm-title">What Massachusetts homeowners are saying.</h2>
          <ul className="hm-reviews">
            {reviews.map((r, i) => (
              <li key={r._id} className="hm-review ab-reveal" style={{ "--ab-delay": `${(i % 3) * 80}ms` }}>
                <span className="hm-review__stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <Icon key={k} name="star" size={16} className={k < r.rating ? "is-on" : ""} />
                  ))}
                </span>
                <blockquote>“{r.feedBack}”</blockquote>
                <cite>{r.name}</cite>
              </li>
            ))}
          </ul>
          </div>
        </section>
      )}

      <AppSection />

      {/* ── For local pros: the original copy with a fitting photo. It is hidden for signed-in customers, who came to book,
             and the Buddy invite stays in their account menu and the footer. It is the last section, so hiding it moves nothing. ── */}
      {!signedIn && (
      <section className="ab-container hm-section hm-cta">
        <div className="hm-pro ab-reveal">
          <div className="hm-pro__copy">
            <span className="hm-kicker">For local pros</span>
            <h2 className="hm-title">Are you a skilled pro? Earn on your own terms.</h2>
            <p className="hm-sub">
              Join the Any-Buddy network and connect with homeowners in your area who need exactly what you do best.
              Set your own schedule, choose your jobs, and get paid fast.
            </p>
            <ul className="hm-pro__list">
              <li><Icon name="check" size={18} stroke={2} /> Customers nearby find and book you</li>
              <li><Icon name="check" size={18} stroke={2} /> You set your services and working hours</li>
              <li><Icon name="check" size={18} stroke={2} /> Get paid through the app</li>
            </ul>
            <Link href="/become-buddy" className="hm-btn hm-btn--primary">Become a Buddy <Icon name="arrowRight" size={16} /></Link>
          </div>
          <div className="hm-pro__media">
            <Image src={PRO_PHOTO} alt="" fill sizes="(max-width: 991px) 100vw, 45vw" />
          </div>
        </div>
      </section>
      )}
    </main>
  );
}
