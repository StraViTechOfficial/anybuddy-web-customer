"use client";
import { SiteSearchApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import Icon from "@/Components/ui/Icon";
import { buddyArea, fromPrice } from "@/Until";
import { getSavedLocation, LOCATION_EVENT, locateMe, locateZip, saveLocation } from "@/Until/searchLocation";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import "./search.css";

// The one search on the site. The Home hero and the header both render this.
// Location comes first, because Buddies are listed by distance, and then the service.
// An exact service name opens that service, and anything else is a text search. Picking a category or a Buddy opens
// its page. A focus of "location" or "service" puts the cursor in that field, which the header uses when it opens
// the search.
export default function SearchForm({ className = "", onDone, id, focus }) {
  const Homepage = useDataStore((store) => store.Homepage);
  const { push } = useRouter();
  const listId = useId();
  const [service, setService] = useState("");
  const [place, setPlace] = useState(""); // The text typed in the Location field.
  const [loc, setLoc] = useState(null); // The resolved location.
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locOpen, setLocOpen] = useState(false); // In the phone hero, the location field is folded into a chip until it is opened.
  const openLocation = () => {
    setLocOpen(true);
    requestAnimationFrame(() => fields.location.current?.focus());
  };
  const fields = { location: useRef(null), service: useRef(null) };

  useEffect(() => {
    // Wait a frame, because the header's search row is inert until it opens.
    const t = focus && requestAnimationFrame(() => {
      fields[focus]?.current?.focus();
      fields[focus]?.current?.select();
    });
    return () => cancelAnimationFrame(t);
  }, [focus]);

  // Follow the saved location, also when the other search on the page (hero / header) changes or clears it.
  useEffect(() => {
    const read = () => {
      const saved = getSavedLocation();
      setLoc(saved);
      setPlace(saved?.label || "");
    };
    read();
    window.addEventListener(LOCATION_EVENT, read);
    return () => window.removeEventListener(LOCATION_EVENT, read);
  }, []);

  const clearLocation = () => {
    setError("");
    saveLocation(null);
    fields.location.current?.focus();
  };
  const clearService = () => {
    setService("");
    fields.service.current?.focus();
  };

  const subServices = (Homepage?.services || []).flatMap((g) =>
    g.services.map((x) => ({ ...x, categorySlug: g.categorySlug, categoryName: g.categoryName })),
  );

  // Service suggestions use our own list, because the browser's datalist can't be styled. It follows the combobox
  // pattern: the arrow keys move, Enter picks, Escape closes, and typing filters by service or category name.
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const q = service.trim().toLowerCase();
  // An empty field shows the service list. Typing runs the server search, which tolerates typos and returns
  // categories, services, then Buddies.
  const [found, setFound] = useState(null);
  useEffect(() => {
    if (q.length < 2) return setFound(null);
    const t = setTimeout(() => SiteSearchApi(q).then((r) => setFound(r?.status === 1 ? r.data : null)).catch(() => setFound(null)), 200);
    return () => clearTimeout(t);
  }, [q]);
  const local = (q ? subServices.filter((x) => `${x.serviceName} ${x.categoryName}`.toLowerCase().includes(q)) : subServices).slice(0, 7);
  const matches = found
    ? [
        ...found.categories.map((c) => ({ href: `/service/${c.slug}`, slug: c.slug, serviceName: c.categoryName, categoryName: "Category" })),
        ...found.services,
        ...found.providers.map((p) => ({ href: `/provider/${p.vendorSlug}`, slug: p.vendorSlug, serviceName: `${p.firstName} ${p.lastName || ""}`.trim(), area: buddyArea(p.city, p.travelMiles), categoryName: "Pro" })),
      ]
    : local;
  const showList = open && matches.length > 0;

  // Keep the whole list on screen, because a combobox popup should never run off the viewport. The list shrinks to the
  // room below the field (at least about 4 rows). If even that doesn't fit, the page scrolls up just enough.
  // The header search sits in a fixed bar, so there it only shrinks.
  const listRef = useRef(null);
  useEffect(() => {
    const el = listRef.current;
    if (!showList || !el) return;
    const MIN = 220, MAX = 340;
    let room = window.innerHeight - el.getBoundingClientRect().top - 16;
    if (room < MIN && !el.closest(".ab-hd")) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: MIN - room, behavior: reduce ? "auto" : "smooth" });
      room = MIN;
    }
    el.style.maxHeight = `${Math.max(MIN, Math.min(MAX, room))}px`;
  }, [showList]);
  const pick = (x) => {
    if (x.href) {
      setOpen(false);
      onDone?.();
      return push(x.href);
    }
    setService(x.serviceName);
    setOpen(false);
    setHi(-1);
  };
  const onServiceKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const n = matches.length;
      if (n) setHi((h) => (e.key === "ArrowDown" ? (h + 1) % n : (h - 1 + n) % n));
    } else if (e.key === "Enter" && showList && hi >= 0) {
      e.preventDefault();
      pick(matches[hi]);
    } else if (e.key === "Escape") setOpen(false);
  };

  const useMyLocation = async () => {
    setError("");
    setBusy(true);
    try {
      const found = await locateMe();
      setLoc(found);
      setPlace(found.label);
    } catch (err) {
      setLocOpen(true);
      setError(
        err.message === "outside"
          ? "Your location is outside the US. Any-Buddy serves Massachusetts — type a US ZIP code."
          : "Location is off in your browser. Type your ZIP code instead.",
      );
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    // Location is optional here. Services and categories show without it, and the Buddy list asks for a ZIP itself.
    let where = loc && place === loc.label ? loc : null;
    if (!where && place.trim()) {
      const zip = place.trim();
      if (!/^\d{5}$/.test(zip)) return setLocOpen(true), setError("Enter a 5-digit ZIP code so we can show pros near you.");
      setBusy(true);
      where = await locateZip(zip).catch(() => null);
      setBusy(false);
      if (!where) return setLocOpen(true), setError("That ZIP code was not found. Check it and try again.");
    }
    if (where) saveLocation(where);
    onDone?.();
    const q = service.trim();
    const exact = subServices.find((x) => x.serviceName.toLowerCase() === q.toLowerCase());
    // No exact name: go to the search's best match (category first, then service), like a search engine would.
    const cat = found?.categories[0];
    const svc = exact || found?.services[0];
    if (exact) push(`/service/${exact.categorySlug}/${exact.slug}`);
    else if (cat) push(`/service/${cat.slug}`);
    else if (svc) push(`/service/${svc.categorySlug}/${svc.slug}`);
    else push(q ? `/service?search=${encodeURIComponent(q)}` : "/service");
  };

  return (
    <div className={`ab-sb-wrap ${className}${locOpen ? " is-loc-open" : ""}`}>
      {/* On phones, and on Home only (home.css), the location shows as a chip above a one-line search. It is hidden elsewhere. */}
      <button type="button" className="ab-sb__chip" onClick={openLocation} aria-label={loc ? `Location ${loc.label}. Change` : "Add your ZIP code"}>
        <Icon name="pin" size={15} />
        {loc ? (
          <>
            {loc.label} <span className="ab-sb__chip-change">Change</span>
          </>
        ) : (
          "Add your ZIP code"
        )}
      </button>
      <form id={id} className="ab-sb" role="search" onSubmit={submit} noValidate>
        <label className="ab-sb__field">
          <span className="ab-sb__label">Location</span>
          <span className="ab-sb__row">
            <input
              ref={fields.location}
              value={place}
              onChange={(e) => {
                setPlace(e.target.value);
                setError(""); // Clear the message as soon as they start fixing it.
              }}
              placeholder="ZIP code"
              autoComplete="off" // We handle ZIPs and locations ourselves, and Chrome's saved entries popup would cover the list.
              aria-describedby={error ? `${listId}-err` : undefined}
            />
            {place && (
              <button type="button" className="ab-sb__clear" onClick={clearLocation} aria-label="Clear location">
                <Icon name="x" size={14} stroke={2.2} />
              </button>
            )}
            <button type="button" className="ab-sb__locate" onClick={useMyLocation} disabled={busy} aria-label="Use my location" title="Use my location">
              <Icon name="pin" size={16} />
            </button>
          </span>
        </label>
        <span className="ab-sb__divider" aria-hidden="true" />
        <div className="ab-sb__field ab-sb__field--svc" onClick={() => fields.service.current?.focus()}>
          <label className="ab-sb__label" htmlFor={`${listId}-svc`}>Service</label>
          <input
            id={`${listId}-svc`}
            ref={fields.service}
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setOpen(true);
              setHi(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onServiceKey}
            placeholder="A service or a pro's name"
            autoComplete="off"
            role="combobox"
            aria-expanded={showList}
            aria-controls={`${listId}-list`}
            aria-activedescendant={showList && hi >= 0 ? `${listId}-opt-${hi}` : undefined}
          />
          {service && (
            <button type="button" className="ab-sb__clear ab-sb__clear--svc" onMouseDown={(e) => e.preventDefault()} onClick={clearService} aria-label="Clear service">
              <Icon name="x" size={14} stroke={2.2} />
            </button>
          )}
          {showList && (
            <ul ref={listRef} id={`${listId}-list`} className="ab-sb__list" role="listbox" aria-label="Services and pros">
              {matches.map((x, i) => (
                <li
                  key={`${x.categoryName}-${x.slug}`}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={i === hi}
                  className="ab-sb__opt"
                  onMouseDown={(e) => e.preventDefault()} // Keep focus in the input.
                  onClick={() => pick(x)}
                  onMouseEnter={() => setHi(i)}
                >
                  <span>
                    {x.serviceName}
                    {fromPrice(x, Homepage?.services) && <span className="ab-sb__opt-price ab-num">{fromPrice(x, Homepage?.services)}</span>}
                    {x.area && <span className="ab-sb__opt-price">{x.area}</span>}
                  </span>
                  <span className="ab-sb__opt-cat">{x.categoryName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="ab-sb__go" disabled={busy} aria-label={busy ? "Finding…" : "Search"}>
          <Icon name="search" size={18} stroke={2.4} />
          <span>{busy ? "Finding…" : "Search"}</span>
        </button>
      </form>
      {error && (
        <p id={`${listId}-err`} className="ab-sb__error" role="alert">
          <Icon name="alert" size={16} /> {error}
          <button type="button" className="ab-sb__error-x" onClick={() => setError("")} aria-label="Dismiss message">
            <Icon name="x" size={14} stroke={2.2} />
          </button>
        </p>
      )}
    </div>
  );
}
