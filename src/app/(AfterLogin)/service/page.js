"use client";
import { useDataStore } from "@/api/store/store";
import ServicesBox from "@/Components/CommonParts/ServicesBox";
import Loader from "@/Components/Loader/Loader";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "@/Components/CommonParts/cards.css";

function AllServiceContent() {
  const [Loading, setLoading] = useState(false);
  const { CategoryList, fetchCategoryList, Homepage, fetchHomepage } = useDataStore();
  // Each category's real services (e.g. "Weekly housekeeping · Laundry & ironing") from the homepage data.
  useEffect(() => {
    if (!Homepage?.services) fetchHomepage({ limit: 50 });
  }, []);
  // A short preview, not the whole list: first three services, then "+N more" (long lists broke the card grid).
  const subsOf = (slug) => {
    const names = Homepage?.services?.find((g) => g.categorySlug === slug)?.services.map((x) => x.serviceName) || [];
    if (!names.length) return undefined;
    const more = names.length - 3;
    return names.slice(0, 3).join(" · ") + (more > 0 ? ` +${more} more` : "");
  };

  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search");

  useEffect(() => {
    setLoading(true);
    fetchCategoryList({ search: searchValue || "" }).then(() => {
      setLoading(false);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchValue]);

  const list = CategoryList?.data?.list || [];

  return (
    <section className="ab-section ab-section--tight">
      <div className="ab-container">
        {/* Owner's live-site copy, word for word; inner-page title size (design standard). */}
        <div className="ab-pagehead">
          <span className="ab-eyebrow">{searchValue ? "Search results" : "See all Categories here"}</span>
          <h1 className="ab-page-title">
            {searchValue ? `Results for “${searchValue}”` : "Every home service you need, one platform."}
          </h1>
          {!searchValue && (
            <p className="ab-lead">
              Any-Buddy connects Massachusetts homeowners with vetted local pros for everything on your to-do list.
              Browse by category and book in minutes.
            </p>
          )}
        </div>
        {Loading ? (
          <div className="ab-catgrid" aria-busy="true" aria-label="Loading categories">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="ab-skeleton" style={{ aspectRatio: "4 / 3.9" }} />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="ab-catgrid">
            {list.map((item, i) => (
              <div
                key={i}
                className="ab-reveal"
                style={{ "--ab-delay": `${(i % 4) * 70}ms` }}
              >
                <ServicesBox item={item} subs={subsOf(item?.slug)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="ab-empty">
            <span className="ab-empty__icon">
              <Icon name="search" size={28} />
            </span>
            <h3>No Category Found</h3>
            <p>
              {searchValue
                ? `Nothing matches “${searchValue}” yet. Try a broader word like “cleaning” or “repair”.`
                : "Service categories will appear here as soon as they are published."}
            </p>
            {searchValue && (
              <Link href="/service" className="ab-btn ab-btn--ghost">
                Show all services
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AllServicePage() {
  return (
    <Suspense fallback={<Loader />}>
      <AllServiceContent />
    </Suspense>
  );
}
