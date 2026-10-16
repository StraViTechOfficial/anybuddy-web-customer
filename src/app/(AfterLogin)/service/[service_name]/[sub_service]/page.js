"use client";
import { useDataStore } from "@/api/store/store";
import CommanModal from "@/Components/Modals/CommanModal";
import ServicesDetail from "@/Components/CommonParts/ServicesDetail";
import SaveBuddy, { useSavedBuddies } from "@/Components/CommonParts/SaveBuddy";
import { SubCateListApi } from "@/api/setting";
import SearchForm from "@/Components/Header/SearchForm";
import Icon from "@/Components/ui/Icon";
import { getSavedLocation, LOCATION_EVENT } from "@/Until/searchLocation";
import { bookWith, taskDoneFor, takePro } from "@/Until/bookingTask";
import { TOKEN_NAME } from "@/Until";
import Cookies from "@/Until/cookies";
import { ShowPrice, buddyArea } from "@/Until";
import { employeImg } from "@/Until/ImageExport";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./providers.css";

// Presentation helpers (display only; no data is changed)
const fullName = (item) =>
  item?.vendorFirstName
    ? `${item?.vendorFirstName} ${item?.vendorLastName || ""}`.trim()
    : "";
const initials = (item) =>
  `${item?.vendorFirstName?.[0] || ""}${item?.vendorLastName?.[0] || ""}`.toUpperCase() || "AB";
const miles = (km) => (Number(km) * 0.621371).toFixed(1);

function ServiceProviderList() {
  const { push } = useRouter();
  const { service_name, sub_service } = useParams();
  const [ProviderObj, setProviderObj] = useState("");
  const [DateSlot, setDateSlot] = useState("");
  const [ModalName, setModalName] = useState("");
  const [ModalType, setModalType] = useState("");
  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(!show);
  };

  const [Loading, setLoading] = useState(false);
  const { ServiceList, fetchServiceList } = useDataStore();
  const buddies = useSavedBuddies();

  // Pros are listed by distance from the customer's search location (set in the search bar).
  const [where, setWhere] = useState(undefined);
  useEffect(() => {
    const read = () => setWhere(getSavedLocation());
    read();
    window.addEventListener(LOCATION_EVENT, read);
    return () => window.removeEventListener(LOCATION_EVENT, read);
  }, []);

  useEffect(() => {
    if (sub_service && where) {
      setLoading(true);
      fetchServiceList({ slug: sub_service, lat: where.lat, long: where.long }).then(() => {
        setLoading(false);
      });
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [sub_service, where]);

  // Booking needs a login and the task step first; browsing pros does not (C13).
  // Open the chosen pro's open times (the booking pop-up).
  const openPro = (pro) => {
    setModalName("open modal");
    setModalType("select provider");
    setProviderObj(pro);
    setShow(true);
  };
  const selectProvider = (item) => {
    const pro = {
      id: item?.vendorId,
      serviceSlug: item?.slug,
      venderSlug: item?.serviceSlug,
      name: `${item?.vendorFirstName} ${item?.vendorLastName}`,
      img: item?.vendorLogoUrl?.includes("http") ? item?.vendorLogoUrl : employeImg,
    };
    if (Cookies.get(TOKEN_NAME) && taskDoneFor(sub_service)) return openPro(pro);
    bookWith(push, service_name, sub_service, pro); // log-in / task step first; the pro is remembered
  };
  // Back from the task step (or from "Book" on a pro's profile): open the remembered pro's times straight away.
  useEffect(() => {
    if (!Cookies.get(TOKEN_NAME) || !taskDoneFor(sub_service)) return;
    const pro = takePro(sub_service);
    if (pro) openPro(pro);
  }, [sub_service]);

  const count = ServiceList?.data?.length || 0;
  // Real service name ("IKEA Assembly"); the web address is only a fallback while names load.
  const Homepage = useDataStore((s) => s.Homepage);
  const serviceLabel =
    Homepage?.services?.flatMap((g) => g.services).find((x) => x.slug === sub_service)?.serviceName ||
    sub_service?.replaceAll("-", " ");

  // The service's photo and description (same data as the category page's pop-up). Reuse the category
  // list already in the store when the customer came from there; other routes load it once.
  const SubCateList = useDataStore((s) => s.SubCateList);
  const [serviceItem, setServiceItem] = useState(null);
  useEffect(() => {
    const find = (res) => res?.data?.find((x) => x.slug === sub_service);
    const hit = find(SubCateList);
    if (hit) return setServiceItem(hit);
    SubCateListApi({ slug: service_name, page: 1, limit: 50 }).then((res) => setServiceItem(find(res) || null));
  }, [service_name, sub_service]);

  const card = (item, i) => {
    const rated = Number(item?.totalRating) > 0;
    const hasDistance = Number(item?.distanceInKm) > 0;
    return (
      <article
        className="ab-pro ab-spotlight ab-reveal"
        style={{ "--ab-delay": `${(i % 3) * 80}ms` }}
        key={`boking-${i}`}
      >
        <div className="ab-pro__head">
          <span className="ab-avatar ab-pro__avatar">
            {item?.vendorLogoUrl?.includes("http") ? (
              <Image src={item.vendorLogoUrl} alt="" width={64} height={64} />
            ) : (
              <span aria-hidden="true">{initials(item)}</span>
            )}
          </span>
          <div className="ab-pro__who">
            <h2 className="ab-pro__name">{fullName(item) || "--"}</h2>
            <div className="ab-pro__meta">
              {rated ? (
                <span className="ab-pro__rating">
                  <Icon name="star" size={15} className="ab-pro__star" />
                  <b className="ab-num">{Number(item?.averageRating).toFixed(1)}</b>
                  <span>
                    ({item?.totalRating} {item?.totalRating === 1 ? "review" : "reviews"})
                  </span>
                </span>
              ) : (
                <span className="ab-chip ab-chip--amber ab-pro__new">
                  <Icon name="sparkle" size={13} />
                  New on Any-Buddy
                </span>
              )}
              {hasDistance && (
                <span className="ab-pro__dist">
                  <Icon name="pin" size={15} />
                  <span className="ab-num">{miles(item?.distanceInKm)}</span> mi away
                </span>
              )}
              <span className="ab-pro__dist">{buddyArea(item?.vendorCity, item?.travelMiles)}</span>
            </div>
          </div>
          <SaveBuddy
            saved={buddies.isSaved(item?.vendorId)}
            onClick={() => buddies.toggle(item?.vendorId)}
            name={fullName(item)}
          />
        </div>

        {item?.description && <p className="ab-pro__desc">{item.description}</p>}

        <div className="ab-pro__foot">
          <div className="ab-pro__price">
            {item?.duration === 1 ? (
              <>
                <span className="ab-pro__priceLabel">Hourly rate</span>
                <span>
                  <b className="ab-num">{ShowPrice(item?.price)}</b>
                  <small>/hr</small>
                </span>
              </>
            ) : (
              <>
                <span className="ab-pro__priceLabel">Booking</span>
                <b>Full Day</b>
              </>
            )}
          </div>
          <div className="ab-pro__actions">
            <Link
              href={`/provider/${item?.vendorSlug}`}
              className="ab-btn ab-btn--ghost ab-btn--sm"
            >
              View Profile
            </Link>
            <button
              type="button"
              className="ab-btn ab-btn--primary ab-btn--sm"
              onClick={() => selectProvider(item)}
            >
              Select & Continue
              <Icon name="arrowRight" size={16} className="ab-arrow" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      <section className="ab-section ab-section--tight ab-pros">
        <div className="ab-container">
          <div className="ab-pros__layout">
            {serviceItem && <ServicesDetail inline Item={serviceItem} className="ab-sd--side" />}
            <div className="ab-pros__main">
              <div className="ab-pros__bar">
                {!Loading && count > 0 && (
                  <p className="ab-pros__count" aria-live="polite">
                    <b className="ab-num">{count}</b>{" "}
                    {count === 1 ? "pro" : "pros"} available for{" "}
                    <span className="text-capitalize">{serviceLabel}</span> near {where?.label}
                  </p>
                )}
              </div>

              {!Loading && count > 0 && (
                <div className="ab-pros__note">
                  <span className="ab-pros__noteIcon">
                    <Icon name="shield" size={20} />
                  </span>
                  <p>
                    {/* Owner-approved wording (28 Sep): what we actually check - ID and certificates reviewed by an admin
                        before a pro is listed. No background-check claim (not done; ToU s.32). */}
                    <b>Reviewed before listing.</b> Each pro sent us their government ID and
                    certificates, and our team approved them before they could take bookings.
                  </p>
                </div>
              )}

              {where === null ? (
                <div className="ab-empty">
                  <span className="ab-empty__icon">
                    <Icon name="pin" size={28} />
                  </span>
                  <h3>Add your location</h3>
                  <p>Enter your ZIP code to see pros who serve your area.</p>
                  <SearchForm />
                </div>
              ) : Loading || where === undefined ? (
                <div className="ab-pros__grid" aria-busy="true" aria-label="Loading pros">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="ab-pro ab-pro--skeleton">
                      <div className="ab-pro__head">
                        <span className="ab-skeleton" style={{ width: 64, height: 64, borderRadius: "50%" }} />
                        <div style={{ flex: 1, display: "grid", gap: 8 }}>
                          <span className="ab-skeleton" style={{ height: 16, width: "60%" }} />
                          <span className="ab-skeleton" style={{ height: 12, width: "40%" }} />
                        </div>
                      </div>
                      <span className="ab-skeleton" style={{ height: 12, width: "90%" }} />
                      <span className="ab-skeleton" style={{ height: 44, width: "100%" }} />
                    </div>
                  ))}
                </div>
              ) : count > 0 ? (
                <div className="ab-pros__grid">
                  {/* Phones (owner 28 Sep): the service details sit under the first pro, so that pro's
                      "Select & Continue" is on the first screen. Laptops keep them in the side column. */}
                  {ServiceList?.data?.map((item, i) =>
                    i === 0 && serviceItem
                      ? [card(item, i), <ServicesDetail key="ab-sd-phone" inline Item={serviceItem} className="ab-sd--phone" />]
                      : card(item, i)
                  )}
                </div>
              ) : (
                <div className="ab-empty">
                  <span className="ab-empty__icon">
                    <Icon name="user" size={28} />
                  </span>
                  <h3>No Service Provider Found</h3>
                  <p>
                    No pros are offering{" "}
                    <span className="text-capitalize">{serviceLabel}</span> near
                    your address yet. Try another service in this category, or
                    check back soon as new pros join.
                  </p>
                  <Link href={`/service/${service_name}`} className="ab-btn ab-btn--ghost">
                    <Icon name="arrowLeft" size={18} />
                    <span className="text-capitalize">
                      {`Other services in ${service_name?.replaceAll("-", " ")}`}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {show && ModalName === "open modal" && (
        <CommanModal
          show={show}
          handleShow={handleShow}
          ModalType={ModalType}
          setModalType={setModalType}
          ProviderObj={ProviderObj}
          setDateSlot={setDateSlot}
          DateSlot={DateSlot}
        />
      )}
    </>
  );
}

export default ServiceProviderList;
