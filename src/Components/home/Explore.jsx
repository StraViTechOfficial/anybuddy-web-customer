"use client";
import Icon from "@/Components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_ICON, heroPhoto } from "./content";
import { openSiteSearch } from "@/Until/searchLocation";

// Explore services: a directory of category cards (owner 27 Sep). Each card: the category photo, its name, its top 3
// services (most bookable pros first, from the API; pro counts are not shown) and one "View all N" link.
// Every card is the same height whatever the admin adds; a new category is a new card. A closing card links to the
// full list. Nothing moves on its own. Phones: one compact row per category (photo, name, count), tap to open.
const TOP = 3;
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1); // admin data has "cleaning", "electrician"

export default function Explore({ categories, groups, loaded, place }) {
  const byCat = Object.fromEntries(groups.map((g) => [g.categorySlug, g.services]));
  const shown = categories.filter((c) => byCat[c.slug]?.length);
  const total = shown.reduce((n, c) => n + byCat[c.slug].length, 0);

  return (
    <section className="ab-container hm-section hm-explore" aria-labelledby="hm-explore-title">
      <div className="hm-head">
        <div>
          <span className="hm-kicker">Explore services</span>
          <h2 id="hm-explore-title" className="hm-title">Whatever the task, there&apos;s a Buddy for that.</h2>
          <p className="hm-sub">
            From a quick clean to a full handyman job — we&apos;ve got you covered{place ? ` near ${place}` : ""}.
          </p>
        </div>
      </div>

      <div className="hm-dir" aria-busy={!loaded}>
        {!loaded
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="hm-dir__card hm-dir__card--skeleton ab-skeleton" />)
          : shown.map((c) => {
              const services = byCat[c.slug];
              const href = `/service/${c.slug}`;
              const name = cap(c.categoryName);
              const photo = heroPhoto(c);
              return (
                <article key={c._id} className="hm-dir__card">
                  <Link href={href} className="hm-dir__photo" tabIndex={-1} aria-hidden="true">
                    {photo.src && (
                      <Image src={photo.src} alt="" fill sizes="(max-width: 767px) 96px, (max-width: 1199px) 45vw, 300px" style={{ objectPosition: photo.focus }} />
                    )}
                  </Link>
                  <div className="hm-dir__body">
                    <h3 className="hm-dir__name">{name}</h3>
                    <ul className="hm-dir__list">
                      {services.slice(0, TOP).map((s) => (
                        <li key={s.slug}>
                          <Link href={`${href}/${s.slug}`} title={cap(s.serviceName)}>
                            {cap(s.serviceName)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {/* One action per card (primary-action); the count lives in it. */}
                    <Link href={href} className="hm-dir__all" aria-label={`View all ${services.length} ${name} services`}>
                      View all {services.length} <Icon name="arrowRight" size={16} />
                    </Link>
                    <p className="hm-dir__count">
                      {services.length} {services.length === 1 ? "service" : "services"}
                    </p>
                  </div>
                  <span className="hm-dir__chev" aria-hidden="true">
                    <Icon name="arrowRight" size={18} />
                  </span>
                </article>
              );
            })}
        {loaded && total > 0 && (
          // Not a link to /service: that page shows these same categories again. Searching is the next step for a
          // customer who did not see their task above (search covers every service, category and pro, C16).
          <button type="button" className="hm-dir__end" onClick={() => openSiteSearch("service")}>
            <span className="hm-dir__end-icon" aria-hidden="true">
              <Icon name="search" size={20} />
            </span>
            <span className="hm-dir__end-title">Search any task or pro</span>
            <span className="hm-dir__end-sub">Type a job, a service or a pro&apos;s name</span>
          </button>
        )}
      </div>
    </section>
  );
}
