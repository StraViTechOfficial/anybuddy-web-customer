"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Cookies from "js-cookie";
import { useCookie } from "@/Until/useCookie";
import { ChangeName, TOKEN_NAME } from "@/Until";
import Icon from "@/Components/ui/Icon";

const PROMISES = [
  "Competitive rates from local pros our team has approved",
  "No booking fees for customers",
  "Secure payment through the app or website",
  "Cancel or reschedule up to 24 hours before your booking at no charge",
];

// Plain text of the description, so a description that only repeats the name is not shown twice.
const plain = (html) => html?.replace(/<[^>]*>/g, "").trim();

function ServicesDetail(props) {
  const token = useCookie(TOKEN_NAME); // after load: avoids a server/browser mismatch on the Book link
  const promises = (
    <ul className="ab-sd__list">
      {PROMISES.map((text) => (
        <li key={text}>
          <span className="ab-sd__tick" aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
  const pricingText = (
    <>
      <h4 className="ab-sd__panelTitle" id="ab-sd-pricing">
        Fair, upfront pricing. Always.
      </h4>
      <p className="ab-sd__panelText">
        Every quote on Any-Buddy shows you the full price before you confirm —
        no hidden fees, no surprise add-ons at the door. Pricing is based on
        the type of service, the size of the job, and your location.
        You&apos;ll see your total before you book.
      </p>
    </>
  );
  const pricing = (
    <>
      <h4 className="ab-sd__panelTitle" id="ab-sd-pricing">
        Fair, upfront pricing. Always.
      </h4>
      <p className="ab-sd__panelText">
        Every quote on Any-Buddy shows you the full price before you confirm —
        no hidden fees, no surprise add-ons at the door. Pricing is based on
        the type of service, the size of the job, and your location.
        You&apos;ll see your total before you book.
      </p>
      <ul className="ab-sd__list">
        {PROMISES.map((text) => (
          <li key={text}>
            <span className="ab-sd__tick" aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
            {text}
          </li>
        ))}
      </ul>
      <Link
        href="/service"
        className="ab-link ab-sd__browse"
        onClick={() => {
          props.handleShow?.();
        }}
      >
        Browse all services
        <Icon name="arrowRight" size={16} />
      </Link>
    </>
  );

  // No Book button here: on the pros list each pro's "Select & Continue" is the action.
  if (props.inline) {
    const img = props.Item?.image || props.Item?.icon;
    const desc = props.Item?.description;
    return (
      <aside className={`ab-sd ab-sd--inline${props.className ? ` ${props.className}` : ""}`} aria-label="About this service">
        {img?.includes("http") && (
          <span className="ab-sd__media">
            <Image src={img} alt="" fill sizes="(max-width: 991px) 64px, 340px" />
          </span>
        )}
        {desc && plain(desc) !== props.Item?.serviceName && (
          <div className="ab-sd__desc" dangerouslySetInnerHTML={{ __html: desc }}></div>
        )}
        {/* Compact beside the pros (owner 28 Sep: the full panel needed a scroll): the four promises stay in view,
            the pricing paragraph folds away. Same owner wording as the pop-up. */}
        <div className="ab-sd__panel">
          <p className="ab-sd__kicker">Pricing &amp; booking</p>
          {promises}
          <details className="ab-sd__more">
            <summary>How pricing works</summary>
            {pricingText}
          </details>
        </div>
      </aside>
    );
  }

  return (
    <div className="ab-sd">
      {props.service && <p className="ab-sd__eyebrow">{props.service}</p>}
      <h3 className="ab-sd__title">{props.Item?.serviceName}</h3>
      {props.Item?.description && (
        <div
          className="ab-sd__desc"
          dangerouslySetInnerHTML={{ __html: props.Item?.description }}
        ></div>
      )}

      <Link
        href={
          token
            ? `/service/${ChangeName(props.service)}/${props.Item?.slug}/book`
            : "/login"
        }
        className="ab-btn ab-btn--primary ab-sd__cta"
        onClick={() => {
          Cookies.set("path", props.pathname);
          props.handleShow();
        }}
      >
        Book {props.Item?.serviceName || "this service"}
        <Icon name="arrowRight" size={18} className="ab-arrow" />
      </Link>

      <section className="ab-sd__panel" aria-labelledby="ab-sd-pricing">
        <p className="ab-sd__kicker">Pricing &amp; booking</p>
        {pricing}
      </section>
    </div>
  );
}

export default ServicesDetail;
