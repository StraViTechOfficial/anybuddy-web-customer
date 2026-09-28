"use client";
import { useDataStore } from "@/api/store/store";
import "@/app/(AfterLogin)/profile/profile.css";
import Icon from "@/Components/ui/Icon";
import { useEffect, useState } from "react";

// Shared body for the three CMS tabs (1 about, 2 terms, 3 privacy).
export function CmsContent({ type, name }) {
  const [loading, setloading] = useState(true);
  const data = useDataStore((store) => store.GetCMS);
  const { fetchGetCMS } = useDataStore();
  useEffect(() => {
    setloading(true);
    fetchGetCMS({ type }).then(() => {
      setloading(false);
    });
  }, [type]);

  if (loading) {
    return (
      <div className="ab-prose-skeleton" aria-busy="true">
        {["40%", "100%", "95%", "88%", "35%", "100%", "92%"].map((w, i) => (
          <span key={i} className="ab-skeleton" style={{ height: i % 4 === 0 ? 20 : 14, width: w }} />
        ))}
        <span className="visually-hidden">Loading</span>
      </div>
    );
  }
  if (!data?.content) {
    return (
      <div className="ab-empty">
        <span className="ab-empty__icon">
          <Icon name="fileCheck" size={28} />
        </span>
        <h3>{name} is being updated</h3>
        <p>
          The latest version will appear here shortly. For anything urgent, email{" "}
          <a className="ab-link" href="mailto:info@any-buddy.com">info@any-buddy.com</a>.
        </p>
      </div>
    );
  }
  // The page already has the one h1 ("Terms & Conditions"...): the text's own headings step down a level, and a
  // leading heading that just repeats the page name ("TERMS OF USE", "PRIVACY POLICY") is dropped.
  const html = data.content
    .replace(/^\s*<h1[^>]*>.*?(TERMS OF USE|PRIVACY POLICY).*?<\/h1>/i, "")
    .replace(/<(\/?)h2(\s|>)/gi, "<$1h3$2")
    .replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
  return <div className={`ab-prose ab-prose--cms-${type}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function AboutUsSec() {
  return <CmsContent type={1} name="About us" />;
}

export default AboutUsSec;
