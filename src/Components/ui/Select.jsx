"use client";
import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
import "./select.css";

// Our own dropdown, so every picker looks the same in Chrome, Safari and Windows (the browser's <select> menu can't
// be styled). ARIA "select-only combobox": arrows / Home / End move, Enter or Space picks, Esc closes, typing a letter
// jumps. Long lists (states, cities) get a filter box at the top. Same list look as the header search (search.css).
const FILTER_FROM = 12;

export default function Select({ id, name, value, onChange, onBlur, options = [], placeholder = "Select", disabled }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [q, setQ] = useState("");
  const [up, setUp] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);
  const list = useRef(null);
  const typed = useRef({ s: "", t: 0 });
  const listId = useId();

  const filterable = options.length >= FILTER_FROM;
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;
  const current = options.find((o) => String(o.value) === String(value));

  const openList = () => {
    if (disabled) return;
    const r = btn.current.getBoundingClientRect();
    setUp(window.innerHeight - r.bottom < 300 && r.top > window.innerHeight - r.bottom); // flip up near the bottom
    setQ("");
    setHi(Math.max(0, options.findIndex((o) => String(o.value) === String(value))));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };
  const pick = (o) => {
    onChange?.(o.value);
    close();
  };

  // close on a click outside; tell Formik the field was left
  useEffect(() => {
    if (!open) return;
    const off = (e) => {
      if (!wrap.current?.contains(e.target)) {
        setOpen(false);
        onBlur?.({ target: { name } });
      }
    };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open, name, onBlur]);

  // keep the highlighted row in view
  useEffect(() => {
    if (open && hi >= 0) list.current?.children[hi]?.scrollIntoView({ block: "nearest" });
  }, [open, hi]);

  const onKey = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      } else if (e.key.length === 1 && !filterable) {
        jump(e.key, true);
      }
      return;
    }
    const last = shown.length - 1;
    if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(last, h + 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(0, h - 1)));
    else if (e.key === "Home") (e.preventDefault(), setHi(0));
    else if (e.key === "End") (e.preventDefault(), setHi(last));
    else if (e.key === "Enter" || (e.key === " " && !filterable)) {
      e.preventDefault();
      if (shown[hi]) pick(shown[hi]);
    } else if (e.key === "Escape") (e.preventDefault(), close());
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1 && !filterable) jump(e.key);
  };

  // type-ahead: "m" jumps to the first option starting with m; "ma" narrows it
  const jump = (k, choose) => {
    const t = typed.current;
    t.s = Date.now() - t.t < 600 ? t.s + k.toLowerCase() : k.toLowerCase();
    t.t = Date.now();
    const i = options.findIndex((o) => o.label.toLowerCase().startsWith(t.s));
    if (i < 0) return;
    if (choose) onChange?.(options[i].value);
    else setHi(i);
  };

  return (
    <div className={`ab-select${open ? " is-open" : ""}`} ref={wrap} onKeyDown={onKey}>
      <button
        ref={btn}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && !filterable && hi >= 0 ? `${listId}-${hi}` : undefined}
        className="form-control ab-select__btn"
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onBlur={(e) => !wrap.current?.contains(e.relatedTarget) && !open && onBlur?.({ target: { name } })}
      >
        <span className={current ? "" : "ab-select__ph"}>{current ? current.label : placeholder}</span>
        <Icon name="chevronDown" size={18} className="ab-select__chev" />
      </button>

      {open && (
        <div className={`ab-select__pop${up ? " is-up" : ""}`}>
          {filterable && (
            <input
              className="ab-select__filter"
              autoFocus
              autoComplete="off"
              placeholder="Type to filter"
              aria-label="Filter the list"
              aria-controls={listId}
              aria-activedescendant={hi >= 0 ? `${listId}-${hi}` : undefined}
              value={q}
              onChange={(e) => (setQ(e.target.value), setHi(0))}
            />
          )}
          <ul ref={list} id={listId} role="listbox" className="ab-select__list" tabIndex={-1}>
            {shown.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={String(o.value) === String(value)}
                className={`ab-select__opt${i === hi ? " is-hi" : ""}`}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
              >
                {o.label}
                {String(o.value) === String(value) && <Icon name="check" size={16} />}
              </li>
            ))}
            {!shown.length && <li className="ab-select__none">No match. Check the spelling.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
