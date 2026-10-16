"use client";
import { dummyImageImg } from "@/Until/ImageExport";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/Components/ui/Icon";
import { useDataStore } from "@/api/store/store";
import { fromPrice } from "@/Until";
import "./cards.css";

function CategoryBox(props) {
  const { push } = useRouter();
  // This sub-category list has no price, so we use the homepage entry with the same slug, as the iOS ServiceRow does.
  const { Homepage } = useDataStore();
  const price = fromPrice(props.item, Homepage?.services);
  // The card opens the service's page, with its details and the Buddies who offer it (the contract says to pick a
  // Buddy, then book). It used to open a pop-up whose "Book" skipped the Buddies, so the customer never saw who they
  // were booking.
  const servicePage = `/service/${props.item?.categorySlug || props.service}/${props.item?.slug}`;

  return (
    <>
      <div
        className="ab-svccard ab-spotlight"
        role="button"
        tabIndex={0}
        aria-label={`${props.item?.serviceName || "Service"}${price ? `, ${price}` : ""}: see pros`}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        onClick={() => push(servicePage)}
      >
        <span className="ab-svccard__media">
          <Image
            src={
              props.item?.icon?.includes("http")
                ? props.item?.icon
                : dummyImageImg
            }
            alt=""
            fill
            sizes="(max-width: 575px) 80vw, (max-width: 991px) 45vw, 25vw"
            priority={props.priority} // The first row is above the fold, so load it first (otherwise Next.js warns about LCP).
            className="ab-svccard__img"
          />
        </span>
        <span className="ab-svccard__body">
          <span className="ab-svccard__name">{props.item?.serviceName}</span>
          {price && <span className="ab-svccard__price ab-num">{price}</span>}
          <span className="ab-svccard__cta">
            See pros
            <Icon name="arrowRight" size={16} />
          </span>
        </span>
      </div>
    </>
  );
}

export default CategoryBox;
