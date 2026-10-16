"use client";
import { useDataStore } from "@/api/store/store";
import { TOKEN_NAME } from "@/Until";
import EmailReminder from "./EmailReminder";
import Icon from "@/Components/ui/Icon";
import { logoImg } from "@/Until/ImageExport";
import Cookies from "@/Until/cookies";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./header.css";
import PageNameSec from "./PageName";
import SearchForm from "./SearchForm";
import dynamic from "next/dynamic";
import { logOut } from "../CommonParts/logout";
import { setOverlayOpen } from "../home/motion";
import { getSavedLocation, LOCATION_EVENT, locateZip, OPEN_SEARCH_EVENT, saveLocation } from "@/Until/searchLocation";

// Loaded on the first "Log in" click only, so the login form is not in every page's first download.
const LoginModal = dynamic(() => import("../(Auth)/LoginModal"), { ssr: false });

// Header: a floating white card; on Home it sits over the full-width hero, elsewhere a spacer keeps content below it. On Home it shows page links
// in the middle until the hero's search scrolls out of view, then a small search pill (location · service)
// rises into its place. Other pages always show the pill. The pill opens the full search under the bar.
// Account menu for a logged-in customer. Profile sections open via the profile page's tab cookie.
const ACCOUNT = [
  { label: "My bookings", icon: "calendar", href: "/booking" },
  { label: "Notifications", icon: "bell", href: "/notification" },
  { label: "Profile", icon: "user", tab: 1 },
  { label: "Saved Buddies", icon: "heart", tab: 2 },
  { label: "Help & support", icon: "chat", tab: 6 },
  // Signed in, the Buddy invite moves from the bar into this menu (Airbnb keeps "Become a host" one click away too).
  { label: "Become a Buddy", icon: "briefcase", href: "/become-buddy" },
  { label: "Log out", icon: "logout", logout: true },
];

const NAV = [
  { href: "/service", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/trust-safety", label: "Trust & safety" },
  { href: "/faq", label: "FAQ" },
];

// Pages a customer can open before finishing sign-up step 2 (see the step-2 check in Header).
const STEP2_EXEMPT = ["/set-profile", "/login", "/signup", "/otp-verify", "/forgot-password", "/reset-password", "/complete-signup", "/verify-email", "/privacy-policy", "/terms-conditions", "/support", "/about_us"];

function Header() {
  const getProfile = useDataStore((store) => store.getProfile);
  const notiCount = useDataStore((store) => store.NotificationCont);
  const { fetchgetProfile, fetchNotificationCont, Homepage, fetchHomepage } = useDataStore();
  const pathname = usePathname();
  const { push, replace } = useRouter();
  const menuRef = useRef(null);
  const home = pathname === "/";

  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // false | "location" | "service": which field to put the cursor in
  const [pastSearch, setPastSearch] = useState(false);
  const [place, setPlace] = useState("");
  const showPill = !home || pastSearch;

  useEffect(() => {
    setToken(Cookies.get(TOKEN_NAME));
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastSearch((document.getElementById("hero-search")?.getBoundingClientRect().bottom ?? 0) < 96);
      setSearchOpen(false);
    };
    const onPlace = () => setPlace(getSavedLocation()?.label || "");
    onScroll();
    onPlace();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(LOCATION_EVENT, onPlace);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(LOCATION_EVENT, onPlace);
    };
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setLoginOpen(false);
  }, [pathname]);

  // Close the account menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  // Home loads this data itself; other pages load it the first time the search opens.
  useEffect(() => {
    if (searchOpen && !Homepage?.listCategories) fetchHomepage({ limit: 50 });
  }, [searchOpen]);

  useEffect(() => {
    if (token === undefined) Cookies.remove(TOKEN_NAME);
    else if (token) {
      fetchgetProfile();
      fetchNotificationCont();
    }
  }, [token]);

  // Sign-up step 2 is required: a signed-in customer with no home address saved goes to
  // /set-profile from any page, however they got in (left step 2, phone / email / pop-up / Google log-in, days later).
  // One check here covers every route. Auth screens, step 2 itself and the legal/help pages stay reachable.
  useEffect(() => {
    if (!token || !getProfile?._id) return;
    const hasAddress = getProfile.address?.street?.trim() && getProfile.postalCode?.trim();
    if (!hasAddress && !STEP2_EXEMPT.some((p) => pathname === p || pathname.startsWith(`${p}/`))) replace("/set-profile");
  }, [token, getProfile?._id, getProfile?.address?.street, getProfile?.postalCode, pathname]);

  // Signed in with no location chosen in this browser yet: start from the ZIP on the profile, as Urban Company fills
  // in your saved address. A location the customer picked themselves is never replaced.
  useEffect(() => {
    const zip = getProfile?.postalCode?.trim();
    if (!token || !/^\d{5}$/.test(zip || "") || getSavedLocation()) return;
    locateZip(zip).then((found) => found && !getSavedLocation() && saveLocation(found)).catch(() => {});
  }, [token, getProfile?.postalCode]);

  const openSearch = (field) => setSearchOpen(field);
  // The search panel is a pop-up too: freeze the page's moving parts while it is open.
  useEffect(() => {
    if (!searchOpen) return;
    setOverlayOpen(true);
    return () => setOverlayOpen(false);
  }, [!!searchOpen]);
  useEffect(() => {
    const onOpen = (e) => setSearchOpen(e.detail || "service");
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
  }, []);
  const goAccount = (item) => {
    setMenuOpen(false);
    if (item.logout) return logOut();
    if (item.tab) Cookies.set("tabShow", item.tab);
    push(item.href || "/profile");
  };
  const rememberPage = () => Cookies.set("path", pathname); // login returns here
  // Laptops and tablets: log in in a pop-up over this page. Phones (and ctrl/cmd-click) keep the /login page.
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = (e) => {
    rememberPage();
    if (e.metaKey || e.ctrlKey || e.shiftKey || !window.matchMedia("(min-width: 768px)").matches) return;
    e.preventDefault();
    setLoginOpen(true);
  };

  const initials = `${getProfile?.firstName?.[0] || ""}${getProfile?.lastName?.[0] || ""}`.toUpperCase();
  const hasPhoto = getProfile?.logoUrl?.includes("http");

  return (
    <>
      {!home && <div className="ab-hd-space" aria-hidden="true" />}
      {token && getProfile?.emailVerified === 0 && <EmailReminder email={getProfile.email} />}
      <header
        className={`ab-hd${showPill ? " has-pill" : ""}${scrolled ? " is-scrolled" : ""}${searchOpen ? " is-open" : ""}`}
      >
        <div className="ab-hd__card">
        {/* Compact bar: a click anywhere that is not a link or button opens the search. */}
        <div
          className="ab-hd__row"
          onClick={(e) => showPill && !searchOpen && !e.target.closest("a, button") && openSearch("location")}
        >
          <Link href="/" className="ab-hd__brand" aria-label="Any-Buddy home">
            <Image src={logoImg} alt="" width={56} height={50} priority />
            <span>Any-Buddy</span>
          </Link>

          {/* Page links: shown in the middle at the top of Home and whenever the search is open. */}
          <nav className="ab-hd__nav" aria-label="Main" inert={showPill && !searchOpen}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="ab-hd__nav-link" onClick={() => setSearchOpen(false)}>{n.label}</Link>
            ))}
            {/* Signed in, "Become a Buddy" lives in the account menu only (not twice in the bar). */}
            {!token && (
              <Link href="/become-buddy" className="ab-hd__nav-link ab-hd__nav-link--open" onClick={() => setSearchOpen(false)}>Become a Buddy</Link>
            )}
          </nav>

          {/* Each part opens the search in this bar with the cursor already in that field: one click, not two. */}
          <div className="ab-hd__pill" inert={!showPill || searchOpen}>
            <button type="button" className="ab-hd__pill-part" onClick={() => openSearch("location")}>
              <Icon name="search" size={16} className="ab-hd__pill-icon" />
              <span className="ab-hd__pill-text">{place || "Add location"}</span>
            </button>
            <button type="button" className="ab-hd__pill-part ab-hd__pill-part--cat" onClick={() => openSearch("service")}>
              Any service
            </button>
            <button type="button" className="ab-hd__go ab-hd__go--sm" onClick={() => openSearch("service")} aria-label="Search">
              <Icon name="search" size={14} stroke={2.6} />
            </button>
          </div>

          <nav className="ab-hd__right" aria-label="Account">
            {!token && <Link href="/become-buddy" className="ab-hd__link">Become a Buddy</Link>}
            {token && (
              <Link
                href="/notification"
                className="ab-hd__icon"
                aria-label={`Notifications${notiCount > 0 ? `, ${notiCount} unread` : ""}`}
              >
                <Icon name="bell" size={19} />
                {notiCount > 0 && <span className="ab-hd__dot">{notiCount > 9 ? "9+" : notiCount}</span>}
              </Link>
            )}
            {!token && (
              <Link href="/login" className="ab-hd__auth ab-hd__login" onClick={openLogin}>Log in</Link>
            )}
            {/* Logged in: account menu. Logged out: only on small screens, where it also holds the page links. */}
            <div className={`ab-hd__menu-wrap${token ? "" : " ab-hd__menu-wrap--small"}`} ref={menuRef}>
              <button
                type="button"
                className="ab-hd__account"
                aria-label={token ? "Account menu" : "Menu"}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <Icon name="menu" size={17} />
                <span className="ab-hd__avatar" aria-hidden="true">
                  {token && hasPhoto ? (
                    <Image src={getProfile.logoUrl} alt="" width={30} height={30} />
                  ) : token && initials ? (
                    initials
                  ) : (
                    <Icon name="user" size={16} />
                  )}
                </span>
              </button>
              {menuOpen && (
                <div className="ab-hd__menu" role="menu">
                  <div className="ab-hd__menu-nav">
                    {NAV.map((n) => (
                      <Link key={n.href} href={n.href} role="menuitem" className="ab-hd__menu-item" onClick={() => setMenuOpen(false)}>
                        {n.label}
                      </Link>
                    ))}
                    {!token && (
                      <Link href="/become-buddy" role="menuitem" className="ab-hd__menu-item" onClick={() => setMenuOpen(false)}>
                        Become a Buddy
                      </Link>
                    )}
                  </div>
                  {token ? (
                    <>
                      {getProfile?.firstName && <p className="ab-hd__menu-hi">Hi, {getProfile.firstName}</p>}
                      {ACCOUNT.map((item) => (
                        <button key={item.label} type="button" role="menuitem" className="ab-hd__menu-item" onClick={() => goAccount(item)}>
                          <Icon name={item.icon} size={17} /> {item.label}
                        </button>
                      ))}
                    </>
                  ) : (
                    <Link href="/login" role="menuitem" className="ab-hd__menu-item ab-hd__menu-item--strong" onClick={rememberPage}>Log in</Link>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        </div>

        {/* Opens below the bar (the bar never changes size): the search, with the cursor in the field that was clicked. */}
        <div className="ab-hd__panel" inert={!searchOpen}>
          <div className="ab-hd__panel-in">
            <div className="ab-hd__drop">
              <SearchForm focus={searchOpen} onDone={() => setSearchOpen(false)} />
            </div>
          </div>
        </div>
      </header>
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {searchOpen && <div className="ab-hd-scrim" onClick={() => setSearchOpen(false)} aria-hidden="true" />}

      {pathname !== "/" && <PageNameSec />}
    </>
  );
}

export default Header;
