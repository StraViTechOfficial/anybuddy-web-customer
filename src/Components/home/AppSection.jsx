"use client";
import AppBtnLink from "@/Components/CommonParts/AppBtnLink";
import Icon from "@/Components/ui/Icon";
import { APP_LINKS } from "@/Until";
import Image from "next/image";
import { APP_COPY, APP_SHOTS } from "./content";

// The app: copy + store badge, beside real screens from the app's App Store listing.
export default function AppSection() {
  return (
    <section className="ab-container hm-section hm-cta" aria-labelledby="hm-app-title">
      <div className="hm-app ab-reveal">
        <div className="hm-app__copy">
          <span className="hm-kicker hm-kicker--light">The Any-Buddy app</span>
          <h2 id="hm-app-title" className="hm-title">Book anywhere, anytime.</h2>
          <p className="hm-sub hm-sub--light">{APP_COPY}</p>
          <ul className="hm-app__points">
            <li><Icon name="calendar" size={18} /> Manage your bookings</li>
            <li><Icon name="pin" size={18} /> Track your Buddy in real time</li>
            <li><Icon name="chat" size={18} /> Chat with your pro</li>
          </ul>
          <div className="hm-app__stores"><AppBtnLink {...APP_LINKS} /></div>
        </div>
        {/* Real App Store screens: "Manage & Track" in front (matches the copy), "All-In-One" behind. The "All in one place" screen is not used: it shows 500+ / 10k+ figures we cannot back. */}
        <div className="hm-app__shots">
          <Image src={APP_SHOTS[2]} alt="" width={300} height={650} className="hm-app__shot hm-app__shot--back" />
          <Image src={APP_SHOTS[3]} alt="Any-Buddy app: manage and track all your bookings" width={300} height={650} className="hm-app__shot hm-app__shot--front" />
        </div>
      </div>
    </section>
  );
}
