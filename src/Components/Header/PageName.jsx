"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useDataStore } from "@/api/store/store";
import { Suspense, useEffect } from "react";
import Loader from "../Loader/Loader";
import "./pagename.css";

// Page title band: breadcrumb + page name. No search here: the header's search is the one search
// on every page (standard: one message once).
function PageNameSec(props) {
  const pathname = usePathname();
  const { service_name, sub_service, slug } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const pretty = (v) => v?.replaceAll("-", " ");
  // Real names ("IKEA Assembly"), not the web address ("ikea assembly"); the slug is only a fallback while loading.
  const { Homepage, fetchHomepage } = useDataStore();
  useEffect(() => {
    if (service_name && !Homepage?.services) fetchHomepage({ limit: 50 });
  }, [service_name]);
  const group = Homepage?.services?.find((g) => g.categorySlug === service_name);
  const catName = group?.categoryName || pretty(service_name);
  const svcName = group?.services?.find((x) => x.slug === sub_service)?.serviceName || pretty(sub_service);
  // Breadcrumb trail built only from the URL the visitor is on.
  const crumbs = [{ href: "/", label: "Home" }];
  if (pathname?.startsWith("/service")) {
    crumbs.push({ href: "/service", label: "Services" });
    if (service_name)
      crumbs.push({ href: `/service/${service_name}`, label: catName });
    if (sub_service)
      crumbs.push({
        href: `/service/${service_name}/${sub_service}`,
        label: svcName,
      });
  }
  const isBook = pathname?.includes(`/service/${service_name}/${sub_service}/book`);
  // Account and content pages: Home › page (› item). Booking detail writes its own title (the service).
  const PAGES = {
    "/booking": "My Bookings",
    "/profile": "Account Information",
    "/notification": "Notifications",
    "/become-buddy": "Become a Buddy",
    "/trust-safety": "Trust & Safety",
    "/career": "Careers",
    "/faq": "FAQ",
    "/about_us": "About Us",
    "/terms-conditions": "Terms & Conditions",
    "/privacy-policy": "Privacy Policy",
    "/support": "Help & Support",
  };
  const base = Object.keys(PAGES).find((p) => pathname === p || pathname?.startsWith(p + "/"));
  if (base) crumbs.push({ href: base, label: PAGES[base] });
  const isDetail = base === "/booking" && slug;

  const title =
    pathname === "/service"
      ? "All Services"
      : sub_service
        ? svcName
        : service_name
          ? catName
          : pathname?.includes("/profile")
            ? "Account Information"
            : isDetail
              ? "Booking"
              : PAGES[base] || "";
  // Pages with their own heading (e.g. a pro's profile) get no empty band.
  if (!title) return null;
  // Listing pages write their own title (h1) under the breadcrumb, so only the breadcrumb shows here.
  // Content pages carry their own title in the hero (one title per page).
  const CONTENT = ["/become-buddy", "/trust-safety", "/career", "/faq", "/about_us", "/terms-conditions", "/privacy-policy", "/support"];
  const ownTitle = pathname === "/service" || (service_name && !sub_service) || isDetail || CONTENT.includes(pathname);

  return (
    <>
      <section className="ab-pagehero">
        <div className="ab-pagehero__glow" aria-hidden="true" />
        <div className={`ab-container ab-pagehero__inner${["/faq", "/support", "/terms-conditions", "/privacy-policy"].includes(pathname) ? " ab-pagehero__inner--center" : ""}`}>
          {crumbs.length > 1 && (
            <nav aria-label="Breadcrumb" className="ab-crumbs">
              <ol>
                {crumbs.map((c, i) => (
                  <li key={c.href}>
                    {i < crumbs.length - 1 || isBook || isDetail ? (
                      <Link href={c.href}>{c.label}</Link>
                    ) : (
                      <span aria-current="page">{c.label}</span>
                    )}
                  </li>
                ))}
                {(isBook || isDetail) && (
                  <li>
                    <span aria-current="page">{isBook ? "Book" : "Booking"}</span>
                  </li>
                )}
              </ol>
            </nav>
          )}
          {!ownTitle && <h1 className="ab-pagehero__title">{title}</h1>}
        </div>
      </section>
    </>
  );
}

export default function AllPageNameSec(props) {
  return (
    <Suspense fallback={<Loader />}>
      <PageNameSec
        isTabletOrMobile={props.isTabletOrMobile}
        isMobile={props.isMobile}
      />
    </Suspense>
  );
}
