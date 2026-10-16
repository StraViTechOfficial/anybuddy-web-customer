"use client";
import { useEffect, useState } from "react";
import { RemoveBuddyApi, SavedBuddiesApi } from "@/api/setting";
import { buddyArea } from "@/Until";
import "@/app/(AfterLogin)/profile/profile.css";
import Icon from "@/Components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

// Saved Buddies: the pros this customer hearted, to book again.
function SavedBuddiesSec() {
  const [Loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    SavedBuddiesApi().then((res) => {
      setList(res?.data || []);
      setLoading(false);
    });
  }, []);

  // Gone from the list at once; back in its place if the server says no.
  const remove = (buddy) => {
    const before = list;
    setList(list.filter((b) => b.vendorId !== buddy.vendorId));
    RemoveBuddyApi({ vendorId: buddy.vendorId }).then((res) => {
      if (res?.status === 1) return;
      setList(before);
      toast.error(res?.message || "We couldn't remove this Buddy. Please try again.");
    });
  };

  if (Loading) {
    return (
      <div className="ab-buddies" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="ab-buddy" aria-hidden="true">
            <span className="ab-skeleton" style={{ width: 56, height: 56, borderRadius: "50%" }} />
            <span className="ab-skeleton" style={{ height: 16, width: "40%" }} />
          </div>
        ))}
        <span className="visually-hidden">Loading Saved Buddies</span>
      </div>
    );
  }
  if (list.length === 0) {
    return (
      <div className="ab-empty">
        <span className="ab-empty__icon">
          <Icon name="heart" size={28} />
        </span>
        <h3>No saved Buddies yet</h3>
        <p>Tap the heart on a Buddy to keep them here.</p>
        <Link href="/service" className="ab-btn ab-btn--primary" style={{ marginTop: 8 }}>
          Browse services
          <Icon name="arrowRight" size={18} className="ab-arrow" />
        </Link>
      </div>
    );
  }
  return (
    <ul className="ab-buddies">
      {list.map((b) => {
        const name = `${b.firstName || ""} ${b.lastName || ""}`.trim();
        const initials = `${b.firstName?.[0] || ""}${b.lastName?.[0] || ""}`.toUpperCase() || "AB";
        return (
          <li key={b.vendorId} className="ab-buddy">
            <span className="ab-avatar">
              {b.logoUrl?.includes("http") ? (
                <Image src={b.logoUrl} alt="" width={56} height={56} />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </span>
            <div className="ab-buddy__who">
              <p className="ab-buddy__name">{name || "--"}</p>
              <p className="ab-buddy__meta">
                {b.rating != null ? (
                  <span>
                    ★ <b className="ab-num">{Number(b.rating).toFixed(1)}</b> · {b.reviewCount}{" "}
                    {b.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                ) : (
                  <span>New on Any-Buddy</span>
                )}
                <span> · {buddyArea(b.city, b.travelMiles)}</span>
              </p>
            </div>
            <div className="ab-buddy__actions">
              <Link href={`/provider/${b.vendorSlug}`} className="ab-btn ab-btn--primary ab-btn--sm">
                Book again
              </Link>
              <button type="button" className="ab-btn ab-btn--ghost ab-btn--sm" onClick={() => remove(b)}>
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default SavedBuddiesSec;
