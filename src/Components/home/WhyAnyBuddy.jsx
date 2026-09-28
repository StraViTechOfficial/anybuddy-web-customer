"use client";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";
import { TRUST, WHY_LEAD } from "./content";

// Why Any-Buddy (owner picked option B): centred heading, the five promises side by side
// with thin dividers (Airbnb "AirCover" style). Owner's original copy, word for word.
export default function WhyAnyBuddy() {
  return (
    <section className="ab-container hm-section hm-why" aria-labelledby="hm-why-title">
      <div className="hm-why__head ab-reveal">
        <span className="hm-kicker">Why Any-Buddy</span>
        <h2 id="hm-why-title" className="hm-title">Pros you can actually trust</h2>
        <p className="hm-sub">{WHY_LEAD}</p>
      </div>
      <ul className="hm-why__row">
        {TRUST.map((t, i) => (
          <li key={t.title} className="hm-why__item ab-reveal" style={{ "--ab-delay": `${i * 70}ms` }}>
            <span className="hm-why__icon"><Icon name={t.icon} size={20} stroke={1.8} /></span>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </li>
        ))}
      </ul>
      <div className="hm-why__more">
        <Link href="/trust-safety" className="hm-link">How we keep you safe <Icon name="arrowRight" size={16} /></Link>
      </div>
    </section>
  );
}
