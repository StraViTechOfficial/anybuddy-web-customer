"use client";
import Icon from "@/Components/ui/Icon";
import { DateDisplay } from "@/Until";
import Image from "next/image";

const KEYS = [
  ["5", "fiveRating"],
  ["4", "fourRating"],
  ["3", "threeRating"],
  ["2", "twoRating"],
  ["1", "oneRating"],
];
const initialsOf = (u) =>
  `${u?.firstName?.[0] || ""}${u?.lastName?.[0] || ""}`.toUpperCase() || "AB";
// Reviews are plain text; drop any markup instead of injecting it.
const plain = (html) =>
  String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function Stars({ value = 0, size = 16 }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / 5) * 100));
  const row = (cls) => (
    <span className={cls}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} />
      ))}
    </span>
  );
  return (
    <span
      className="ab-stars"
      role="img"
      aria-label={`${Number(value).toFixed(1)} out of 5 stars`}
    >
      {row("ab-stars__base")}
      <span className="ab-stars__fill" style={{ width: `${pct}%` }}>
        {row("ab-stars__on")}
      </span>
    </span>
  );
}

function RatingReview(props) {
  const data = props.RatingReviewList?.data;
  const reviews = data?.reviews || [];
  const counts = data?.ratingCounts || {};
  const totalCounted = KEYS.reduce((n, [, k]) => n + (counts[k] || 0), 0);
  const average =
    Number(data?.averageCount) || Number(props.ProviderDetail?.averageRating) || 0;
  const total =
    Number(props.RatingReviewList?.count) ||
    Number(props.ProviderDetail?.totalRating) ||
    reviews.length;
  const firstName = props.ProviderDetail?.firstName;

  return (
    <div className="ab-rev">
      <h3 className="ab-prof__h" id={props.headingId}>
        Ratings &amp; reviews
      </h3>

      {reviews.length > 0 ? (
        <>
          <div className="ab-rev__summary">
            <div className="ab-rev__score">
              <span className="ab-rev__big ab-num">{average.toFixed(1)}</span>
              <Stars value={average} size={18} />
              <span className="ab-rev__based">
                Based on <span className="ab-num">{total}</span>{" "}
                {total === 1 ? "review" : "reviews"}
              </span>
            </div>
            <ul className="ab-rev__bars" aria-label="Rating breakdown">
              {KEYS.map(([label, key]) => {
                const n = counts[key] || 0;
                const pct = totalCounted ? Math.round((n / totalCounted) * 100) : 0;
                return (
                  <li key={key}>
                    <span className="ab-rev__barLabel ab-num">{label}</span>
                    <span className="ab-rev__bar" aria-hidden="true">
                      <span style={{ width: `${pct}%` }} />
                    </span>
                    <span className="ab-rev__barCount ab-num">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="ab-rev__grid">
            {reviews.map((item, i) => {
              const u = item?.userDetails;
              const who = u?.firstName
                ? `${u.firstName} ${u.lastName ? `${u.lastName[0]}.` : ""}`.trim()
                : "Any-Buddy customer";
              const text = plain(item?.feedBack);
              return (
                <li className="ab-rev__card" key={`rev-${i}`}>
                  <div className="ab-rev__cardTop">
                    <Stars value={item?.rating} size={15} />
                    <span className="ab-num ab-rev__cardScore">
                      {Number(item?.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  {text && <blockquote className="ab-rev__quote">{text}</blockquote>}
                  <div className="ab-rev__author">
                    <span className="ab-avatar ab-rev__avatar">
                      {u?.logoUrl?.includes("http") ? (
                        <Image src={u.logoUrl} alt="" width={40} height={40} />
                      ) : (
                        <span aria-hidden="true">{initialsOf(u)}</span>
                      )}
                    </span>
                    <span>
                      <b>{who}</b>
                      {item?.createdAt && (
                        <span className="ab-rev__date">{DateDisplay(item.createdAt)}</span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="ab-empty ab-rev__empty">
          <span className="ab-empty__icon">
            <Icon name="sparkle" size={26} />
          </span>
          <p className="ab-rev__emptyTitle">New on Any-Buddy</p>
          <p>
            {firstName || "This pro"} hasn&apos;t been reviewed yet. Reviews
            appear here after customers complete a booking.
          </p>
        </div>
      )}
    </div>
  );
}

export default RatingReview;
