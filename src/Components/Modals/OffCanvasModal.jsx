"use client";
import LeftMenuProfile from "@/app/(AfterLogin)/profile/LeftMenuProfile";
import LeftMenuBooking from "@/app/(AfterLogin)/service/[service_name]/[sub_service]/book/LeftMenuBooking";
import { Offcanvas } from "react-bootstrap";
import "../booking.css";

function OffCanvasModal(props) {
  return (
    <>
      <Offcanvas
        show={props.show}
        onHide={props.handleShow}
        className="ab-offcanvas"
        placement="end"
      >
        <Offcanvas.Header closeButton className="ab-offcanvas__head">
          <Offcanvas.Title as="h2" className="ab-modal__title">
            {props.page === "profileLinks"
              ? "Settings"
              : props.page === "BookingLinks"
              ? "Booking steps"
              : "Filter"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="ab-offcanvas__body">
          {props.page === "profileLinks" ? (
            <LeftMenuProfile
              LinksArr={props.LinksArr}
              Type={props.Type}
              setType={props.setType}
              setTitle={props.setTitle}
              handleShow={props.handleShow}
              isTabletOrMobile={props.isTabletOrMobile}
            />
          ) : props.page === "BookingLinks" ? (
            <LeftMenuBooking
              LinksArr={props.LinksArr}
              Type={props.Type}
              setType={props.setType}
              setTitle={props.setTitle}
              handleShow={props.handleShow}
              isTabletOrMobile={props.isTabletOrMobile}
              EditShow={props.EditShow}
            />
          ) : (
            ""
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default OffCanvasModal;
