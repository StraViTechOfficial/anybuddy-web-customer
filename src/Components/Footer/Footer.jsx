import { APP_LINKS, PRO_URL, SHOW_APP_BADGES } from "@/Until";
import Image from "next/image";
import Link from "next/link";
import AppBtnLink from "../CommonParts/AppBtnLink";
import "./footer.css";

// Footer: the owner's live-site text and links, on the brand navy. Every link opens its one page in the same tab.
// Social icons are left out until the owner gives the real Any-Buddy accounts (the live site links to the bare
// instagram.com / facebook.com / x.com home pages). The blurb says "documents are verified" instead of the live
// "vetted, background-checked": no background checks exist yet (flagged to the owner).
const COLUMNS = [
  {
    title: "Company",
    links: [
      ["About Us", "/about_us"],
      ["Become a Buddy", "/become-buddy"],
      ["Buddy log in", `${PRO_URL}/login`],
      ["Trust & Safety", "/trust-safety"],
      ["Careers", "/career"],
    ],
  },
  {
    title: "Support",
    links: [
      ["FAQ", "/faq"],
      ["Contact Us", "/support"],
      ["Terms & Conditions", "/terms-conditions"],
      ["Privacy Policy", "/privacy-policy"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="ab-footer">
      <div className="ab-container ab-footer__grid">
        <div className="ab-footer__brand">
          {/* White logo made from the full-colour one (single colour, same edges); the old whiteLogo.png was 76px and
              tinted. The line under it is the owner's footer text from the live site. */}
          <Link href="/" className="ab-footer__logo" aria-label="Any-Buddy home">
            <Image src="/assets/images/logo-white.png" alt="Any-Buddy" width={96} height={86} />
          </Link>
          <p className="ab-footer__tag">Any-Buddy — Service for Everybody</p>
          <p className="ab-footer__blurb">
            Any-Buddy connects Massachusetts homeowners with local home service pros our team has approved. Book in
            minutes.
          </p>
        </div>

        {COLUMNS.map((c) => (
          <nav className="ab-footer__col" key={c.title} aria-label={c.title}>
            <h2 className="ab-footer__h">{c.title}</h2>
            <ul>
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {SHOW_APP_BADGES && (
          <div className="ab-footer__col">
            <h2 className="ab-footer__h">Download the App</h2>
            <div className="ab-footer__stores">
              <AppBtnLink {...APP_LINKS} />
            </div>
          </div>
        )}
      </div>

      <div className="ab-container ab-footer__base">
        <p>
          Have a question? <Link href="/support">Support</Link>
          <span aria-hidden="true"> · </span>
          Contact us at <a href="mailto:info@any-buddy.com">info@any-buddy.com</a>
        </p>
        <p>© {new Date().getFullYear()} Any-Buddy. All rights reserved.</p>
      </div>
    </footer>
  );
}
