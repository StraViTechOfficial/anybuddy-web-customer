import Provider from "@/Components/Provider/Provider";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";

// Any unknown address: say so plainly and offer the two ways on (services, home). Same header and footer as the site.
export default function NotFound() {
  return (
    <Provider>
      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-empty" style={{ maxWidth: 560, marginInline: "auto" }}>
            <span className="ab-empty__icon">
              <Icon name="search" size={28} />
            </span>
            <h1 className="ab-page-title">Page not found</h1>
            <p>This page doesn&apos;t exist or has moved. Browse services or head back home.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              <Link href="/service" className="ab-btn ab-btn--primary">
                Browse services
                <Icon name="arrowRight" size={18} className="ab-arrow" />
              </Link>
              <Link href="/" className="ab-btn ab-btn--ghost">
                Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Provider>
  );
}
