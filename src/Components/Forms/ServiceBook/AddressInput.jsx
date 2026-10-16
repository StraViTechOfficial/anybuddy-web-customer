"use client";
// An address box that shows Google suggestions (Places (New)) while the customer types, as a WAI-ARIA combobox with
// the list under the box. Typing reports the text through onType. Picking a suggestion reports
// { address, lat, lng } through onPick. If Google is blocked, the box still works as a plain text field.
import { placeDetails, suggest } from "@/Until/googleMaps";
import { useEffect, useRef, useState } from "react";

export default function AddressInput({ id, value, onType, onPick, ...rest }) {
  const [hits, setHits] = useState([]);
  const [active, setActive] = useState(-1);
  const typed = useRef(false);
  const asked = useRef("");

  useEffect(() => {
    const text = (value || "").trim();
    // Only ask Google about text the customer typed, not about the address pre-filled from their profile.
    if (!typed.current || text.length < 3) return setHits([]);
    const t = setTimeout(() => {
      asked.current = text;
      suggest(text).then(
        (h) => asked.current === text && (setHits(h), setActive(-1)),
        () => setHits([]),
      );
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  const pick = async (h) => {
    setHits([]);
    typed.current = false;
    const found = await placeDetails(h.place).catch(() => null);
    if (found) onPick(found);
  };

  const onKeyDown = (e) => {
    if (!hits.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(hits[active]);
    } else if (e.key === "Escape") setHits([]);
  };

  return (
    <>
      <input
        {...rest}
        id={id}
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={hits.length > 0}
        aria-controls={`${id}-list`}
        aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        onKeyDown={onKeyDown}
        onBlur={() => setHits([])}
        onChange={(e) => {
          typed.current = true;
          onType(e.target.value);
        }}
      />
      {hits.length > 0 && (
        <ul id={`${id}-list`} role="listbox" aria-label="Suggested addresses" className="ab-suggest">
          {hits.map((h, i) => (
            <li
              key={h.label}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(h)}
            >
              {h.label}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
