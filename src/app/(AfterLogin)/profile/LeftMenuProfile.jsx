"use client";
import Icon from "@/Components/ui/Icon";
import { useRouter } from "next/navigation";
import Cookies from "@/Until/cookies";
import { logOut } from "@/Components/CommonParts/logout";
import "./profile.css";

const GROUP_LABEL = { Account: "Account", Support: "Support & legal" };

function LeftMenuProfile(props) {
  const { push } = useRouter();
  const groups = [...new Set(props.LinksArr?.map((l) => l.group))];

  const select = (item) => {
    if (item?.logout) return logOut();
    if (item?.path) {
      push(item?.path);
    } else {
      props.setType(item?.id);
      props.setTitle(item?.name);
    }

    if (props.isTabletOrMobile) {
      props.handleShow();
    }
    Cookies.remove("tabShow");
  };

  return (
    <nav className="ab-pmenu">
      {groups.map((g) => (
        <div className={`ab-pmenu__group ${g === "end" ? "ab-pmenu__group--end" : ""}`} key={g || "all"}>
          {GROUP_LABEL[g] && <p className="ab-pmenu__label">{GROUP_LABEL[g]}</p>}
          {props.LinksArr?.filter((l) => l.group === g).map((item) => (
            <button
              type="button"
              key={`nevLijl-${item.id}`}
              className={`ab-pmenu__item ${item.id === 10 ? "ab-pmenu__item--out" : ""}`}
              aria-current={item?.id === props.Type ? "page" : undefined}
              onClick={() => select(item)}
            >
              {item.icon && <Icon name={item.icon} size={20} />}
              <span>{item?.name}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default LeftMenuProfile;
