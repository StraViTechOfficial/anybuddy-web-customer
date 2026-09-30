import { SHOW_APP_BADGES, STORE_LINKS_LIVE } from "@/Until";
import { AppPlay, AppStore } from "@/Until/ImageExport";
import Link from "next/link";
import React from "react";
import { Image } from "react-bootstrap";

// Store badges. A store with a real link is a normal link; a store without one yet (Google Play, until the
// Android app is published) still shows its badge, but as plain, non-clickable text — no broken or dead link.
const isLink = (href) => STORE_LINKS_LIVE && typeof href === "string" && /^https?:\/\//.test(href);

function Badge({ href, img, label }) {
  const art = <Image src={img} alt="" width={130} height={40} className="object-fit-contain" />;
  return isLink(href) ? (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="ab-store" aria-label={label}>
      {art}
    </Link>
  ) : (
    <span className="ab-store ab-store--soon" aria-label={`${label} (coming soon)`} title="Coming soon">
      {art}
    </span>
  );
}

function AppBtnLink(props) {
  if (!SHOW_APP_BADGES) return null;
  return (
    <>
      <Badge href={props.play} img={AppPlay} label="Get it on Google Play" />
      <Badge href={props.app} img={AppStore} label="Download on the App Store" />
    </>
  );
}

export default AppBtnLink;
