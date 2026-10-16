"use client";
import { useDataStore } from "@/api/store/store";
import { ProviderServicesApi } from "@/api/setting";
import RatingReview from "@/Components/CommonParts/RatingReview";
import SaveBuddy, { useSavedBuddies } from "@/Components/CommonParts/SaveBuddy";
import Link from "next/link";
import Icon from "@/Components/ui/Icon";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { bookWith } from "@/Until/bookingTask";
import { employeImg } from "@/Until/ImageExport";
import { buddyArea } from "@/Until";
import "@/Components/booking.css";

// Display helpers only.
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const to12h = (t) => {
  const [h, m] = String(t || "").split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const hh = h % 12 || 12;
  return `${hh}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};
const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function ProviderDetail() {
  const { slug } = useParams();
  const { back, push } = useRouter();
  const {
    ProviderDetail,
    fetchProviderDetail,
    RatingReviewList,
    fetchRatingReviewList,
  } = useDataStore();
  const [Loading, setLoading] = useState(false);
  const buddies = useSavedBuddies();

  useEffect(() => {
    setLoading(true);
    fetchProviderDetail({ vendorSlug: slug }).then(() => {
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (slug) fetchRatingReviewList({ vendorSlug: slug });
  }, [slug]);

  // The Buddy's services, matched by name to the site's services for their photo and page link.
  const { Homepage, fetchHomepage } = useDataStore();
  const [offered, setOffered] = useState([]);
  useEffect(() => {
    if (!slug) return;
    ProviderServicesApi({ vendorSlug: slug }).then((res) => setOffered(res?.data || []));
    if (!Homepage?.services) fetchHomepage({ limit: 50 });
  }, [slug]);
  const siteServices = (Homepage?.services || []).flatMap((g) => g.services.map((x) => ({ ...x, categorySlug: g.categorySlug })));
  const services = offered.map((o) => ({ ...o, site: siteServices.find((x) => x.serviceName === o.serviceName) }));

  const p = ProviderDetail || {};
  const name = p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "";
  const initials = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase() || "AB";
  const place = p._id ? buddyArea(p.address?.city, p.travelMiles) : "";
  const rated = Number(p.totalRating) > 0;
  const about = stripTags(p.description);
  const hours = Array.isArray(p.availability) ? p.availability : [];
  const hoursByDay = Object.fromEntries(hours.map((h) => [h.day, h]));
  const today = new Date().getDay();

  return (
    <section className="ab-prof">
      <div className="ab-container">
        <button
          type="button"
          className="ab-back"
          onClick={() => {
            back();
          }}
        >
          <Icon name="arrowLeft" size={18} /> Back
        </button>

        {Loading ? (
          <div className="ab-prof__grid" aria-busy="true">
            <div className="ab-prof__main">
              <div className="ab-prof__hero">
                <span className="ab-skeleton" style={{ width: 96, height: 96, borderRadius: "50%" }} />
                <div style={{ flex: 1, display: "grid", gap: 10 }}>
                  <span className="ab-skeleton" style={{ height: 28, width: "50%" }} />
                  <span className="ab-skeleton" style={{ height: 18, width: "30%" }} />
                </div>
              </div>
              <span className="ab-skeleton" style={{ height: 120, display: "block", marginTop: 32 }} />
            </div>
            <aside className="ab-prof__aside">
              <span className="ab-skeleton" style={{ height: 280, display: "block" }} />
            </aside>
          </div>
        ) : (
          <div className="ab-prof__grid">
            <div className="ab-prof__main">
              <header className="ab-prof__hero">
                <span className="ab-avatar ab-prof__avatar">
                  {p.logoUrl?.includes("http") ? (
                    <Image src={p.logoUrl} alt="" width={96} height={96} />
                  ) : (
                    <span aria-hidden="true">{initials}</span>
                  )}
                </span>
                <div className="ab-prof__who">
                  <h1 className="ab-prof__name">{name || "--"}</h1>
                  <div className="ab-prof__meta">
                    {rated ? (
                      <span className="ab-prof__rating">
                        <Icon name="star" size={16} className="ab-prof__star" />
                        <b className="ab-num">{Number(p.averageRating).toFixed(1)}</b>
                        <span>
                          · {p.totalRating} {Number(p.totalRating) === 1 ? "review" : "reviews"}
                        </span>
                      </span>
                    ) : (
                      <span className="ab-chip ab-chip--amber ab-prof__new">
                        <Icon name="sparkle" size={13} />
                        New on Any-Buddy
                      </span>
                    )}
                    {place && (
                      <span className="ab-prof__place">
                        <Icon name="pin" size={16} />
                        {place}
                      </span>
                    )}
                  </div>
                </div>
                {p._id && <SaveBuddy saved={buddies.isSaved(p._id)} onClick={() => buddies.toggle(p._id)} name={name} />}
              </header>

              {about && (
                <section className="ab-prof__block" aria-labelledby="ab-prof-about">
                  <h3 className="ab-prof__h" id="ab-prof-about">
                    About {p.firstName || "this pro"}
                  </h3>
                  <p className="ab-prof__about">{about}</p>
                </section>
              )}

              {services.length > 0 && (
                <section className="ab-prof__block" aria-labelledby="ab-prof-services">
                  <h3 className="ab-prof__h" id="ab-prof-services">Services</h3>
                  <ul className="ab-prof__services">
                    {services.map((x) => (
                      <li key={x._id}>
                        {/* Book this Buddy directly, as the contract asks (book from the Buddy's price list). The task step
                            comes first, then their open times, so the customer never has to find them again in the list. */}
                        <Link
                          href={x.site ? `/service/${x.site.categorySlug}/${x.site.slug}` : "/service"}
                          className="ab-prof__svc"
                          aria-label={x.site && x.serviceSlug ? `Book ${x.serviceName} with ${p.firstName || "this pro"}` : undefined}
                          onClick={(e) => {
                            if (!x.site || !x.serviceSlug) return; // Not matched to a site service, so open the service list.
                            e.preventDefault();
                            bookWith(push, x.site.categorySlug, x.site.slug, {
                              id: x.vendorId,
                              serviceSlug: x.site.slug,
                              venderSlug: x.serviceSlug,
                              name: name,
                              img: p.logoUrl?.includes("http") ? p.logoUrl : employeImg,
                            });
                          }}
                        >
                          <span className="ab-prof__svcImg">
                            <Image src={x.site?.icon || x.serviceUrl} alt="" fill sizes="96px" />
                          </span>
                          <span className="ab-prof__svcBody">
                            <span className="ab-prof__svcName">{x.serviceName}</span>
                            <span className="ab-prof__svcPrice ab-num">
                              ${Number(x.price).toFixed(2)}
                              {x.durationType === 1 ? "/hr" : ""}
                            </span>
                          </span>
                          <span className="ab-prof__svcBook">
                            Book <Icon name="arrowRight" size={16} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="ab-prof__block" aria-labelledby="ab-prof-reviews">
                <RatingReview
                  RatingReviewList={RatingReviewList}
                  ProviderDetail={ProviderDetail}
                  headingId="ab-prof-reviews"
                />
              </section>
            </div>

            <aside className="ab-prof__aside">
              <div className="ab-prof__card">
                {hours.length > 0 && (
                  <>
                    <h3 className="ab-prof__cardH">
                      <Icon name="clock" size={18} /> Weekly hours
                    </h3>
                    <ul className="ab-prof__hours">
                      {WEEK_ORDER.map((d) => {
                        const h = hoursByDay[d];
                        const open = h?.isOpen;
                        return (
                          <li key={d} className={d === today ? "is-today" : ""}>
                            <span>
                              {DAYS[d]}
                              {d === today && <span className="ab-prof__today">Today</span>}
                            </span>
                            <span className={`ab-num${open ? "" : " is-closed"}`}>
                              {open ? `${to12h(h.from)} – ${to12h(h.to)}` : "Closed"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {/* No contact details here. A Buddy's phone number is shown only in the customer's booking history
                    after they book, so chats and payments stay on Any-Buddy. */}
                <p className="ab-prof__note">
                  Choose a service to book {p.firstName || "this pro"}: describe the task, pick one of their
                  open times and see the full price before you pay.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProviderDetail;
