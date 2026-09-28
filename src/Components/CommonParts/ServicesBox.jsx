import Icon from "@/Components/ui/Icon";
import { dummyImageImg } from "@/Until/ImageExport";
import Image from "next/image";
import Link from "next/link";
import "./cards.css";

function ServicesBox(props) {
  return (
    <>
      <Link
        href={`/service/${props.item?.slug}`}
        className="ab-catcard ab-spotlight"
      >
        <span className="ab-catcard__media">
          <Image
            src={
              props.item?.icon?.includes("http")
                ? props.item?.icon
                : dummyImageImg
            }
            alt=""
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
            className="ab-catcard__img"
          />
        </span>
        <span className="ab-catcard__body">
          <span className="ab-catcard__name">
            {props.item?.categoryName} <Icon name="arrowRight" size={16} />
          </span>
          {/* The category's real services when known (props.subs); otherwise its description. */}
          {(props.subs || props.item?.description) && (
            <span className="ab-catcard__desc">{props.subs || props.item?.description}</span>
          )}
        </span>
      </Link>
    </>
  );
}

export default ServicesBox;
