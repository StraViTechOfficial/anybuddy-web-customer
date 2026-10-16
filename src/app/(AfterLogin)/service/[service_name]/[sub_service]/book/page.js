"use client";
import { useDataStore } from "@/api/store/store";
import ServiceBook from "@/Components/Forms/ServiceBook/ServiceBook";
import Icon from "@/Components/ui/Icon";
import {
  SelectAddressImg,
  SelectServiceImg,
  SelectSummaryImg,
  UnselectAddressImg,
  UnselectServiceImg,
  UnselectSummaryImg,
} from "@/Until/ImageExport";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { peekPro } from "@/Until/bookingTask";
import LeftMenuBooking from "./LeftMenuBooking";
import "@/Components/booking.css";

function BookService() {
  const { service_name, sub_service } = useParams();
  const [Type, setType] = useState(1);
  const [EditShow, setEditShow] = useState(false);
  const [Title, setTitle] = useState("Describe your service");
  const [LinksArr, setLinksArr] = useState([]);
  // Starts loading: the form used to render first with the previous service's details, then swap to the skeleton,
  // then render again - a visible jump, and the address box mounted and unmounted at once (Google's library then
  // logged "Input ref must be HTMLInputElement").
  const [Loading, setLoading] = useState(true);
  const { ServiceDetail, fetchServiceDetail } = useDataStore();
  // The pro chosen before the task step (list or profile): named here so the customer knows the choice is kept.
  const [chosenPro, setChosenPro] = useState(null);
  useEffect(() => setChosenPro(peekPro(sub_service)), [sub_service]);

  useEffect(() => {
    setLoading(true);
    fetchServiceDetail({ slug: sub_service }).then((res) => {
      if (res?.status === 1) {
        setLinksArr([
          {
            id: 1,
            name: "Your task location",
            img: UnselectAddressImg,
            select: SelectAddressImg,
            checked: res?.data?.serviceTaskArr?.taskLocation ?? true,
          },
          {
            id: 2,
            name: "Task options",
            img: UnselectServiceImg,
            select: SelectServiceImg,
            checked: res?.data?.serviceTaskArr?.yourTask ?? true,
          },

          {
            id: 3,
            name: "Describe your service",
            img: UnselectSummaryImg,
            select: SelectSummaryImg,
            checked: res?.data?.serviceTaskArr?.describe ?? true,
          },
        ]);
      }
      setLoading(false); // also on a failed request, so the page never stays on the skeleton
    });
  }, [sub_service]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    let name = LinksArr?.find((fd) => fd?.id === Type)?.name;
    setTitle(name);
  }, [Type, LinksArr]);

  const findName = (Type) => {
    let name = LinksArr?.find((fd) => fd?.id === Type)?.name;
    setTitle(name);
  };

  const steps = LinksArr?.filter((fd) => fd?.checked) || [];
  const stepNo = steps.findIndex((fd) => fd?.id === Type) + 1;

  return (
    <section className="ab-book">
      <div className="ab-container">
        {Loading ? (
          <div className="ab-book__grid" aria-busy="true">
            <div className="ab-book__aside">
              <div className="ab-skeleton" style={{ height: 220 }} />
            </div>
            <div className="ab-book__main">
              <div className="ab-skeleton" style={{ height: 22, width: 120 }} />
              <div className="ab-skeleton" style={{ height: 34, width: "60%", marginTop: 14 }} />
              <div className="ab-skeleton" style={{ height: 56, marginTop: 28 }} />
            </div>
          </div>
        ) : (
          <div className="ab-book__grid">
            <aside className="ab-book__aside">
              <LeftMenuBooking
                LinksArr={LinksArr}
                Type={Type}
                setType={setType}
                setTitle={setTitle}
                EditShow={EditShow}
              />
            </aside>
            <div className="ab-book__main">
              {stepNo > 0 && (
                <p className="ab-book__step">
                  Step <span className="ab-num">{stepNo}</span> of{" "}
                  <span className="ab-num">{steps.length}</span>
                </p>
              )}
              <h2 className="ab-book__title">{Title}</h2>
              <p className="ab-book__lead">
                {chosenPro?.name
                  ? `Tell us about your task, then pick one of ${chosenPro.name}'s open times.`
                  : "Tell us about your task. We use these details to show service providers in your area who fit your needs."}
              </p>
              <ServiceBook
                Type={Type}
                setType={setType}
                setEditShow={setEditShow}
                findName={findName}
                sub_service={sub_service}
                service_name={service_name}
                serviceTaskArr={ServiceDetail?.serviceTaskArr}
              />
            </div>
            <div className="ab-book__policy">
              <span className="ab-book__policyIcon" aria-hidden="true">
                <Icon name="shield" size={20} />
              </span>
              <div>
                <h3>Cancellation policy</h3>
                <p>
                  {/* The rule is 24 hours (same as the service page and the FAQ). */}
                  Free cancellation up to 24 hours before the service, or any time
                  before a pro accepts your booking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookService;
