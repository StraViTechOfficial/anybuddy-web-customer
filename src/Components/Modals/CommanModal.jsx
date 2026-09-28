import { Modal } from "react-bootstrap";
import SuccessModal from "../CommonParts/SuccessModal";
import ProviderSelect from "../Forms/ProviderSelect/ProviderSelect";
import { useState } from "react";
import BookingCencel from "../Forms/BookingCencel/BookingCencel";
import WriteReview from "../Forms/WriteReview/WriteReview";
import ServicesDetail from "../CommonParts/ServicesDetail";
import "../booking.css";

const TITLES = {
  "select provider": "Choose a date and time",
  "cancel Booking": "Cancel booking",
  "Rating Review": "Write a review",
  "service detail": "Service details",
};

function CommanModal(props) {
  const [HideTitle, setHideTitle] = useState(false);
  const title = !HideTitle && TITLES[props.ModalType];

  return (
    <>
      <Modal
        show={props.show}
        onHide={props.handleShow}
        centered
        size={props.ModalType === "logout" ? "md" : "lg"}
        backdrop={props.ModalType === "Success" ? "static" : true}
        keyboard={props.ModalType === "Success" ? false : true}
        dialogClassName="ab-modal"
        aria-labelledby={title ? "ab-modal-title" : undefined}
      >
        <Modal.Header
          closeButton
          className="ab-modal__head"
        >
          {title && (
            <h2 className="ab-modal__title" id="ab-modal-title">
              {title}
            </h2>
          )}
        </Modal.Header>
        <Modal.Body className="ab-modal__body">
          {props.ModalType === "Success" && (
            <SuccessModal
              handleShow={props.handleShow}
              ModalType={props.ModalType}
              setModalType={props.setModalType}
              DateSlot={props.DateSlot}
            />
          )}
          {props.ModalType === "select provider" && (
            <ProviderSelect
              handleShow={props.handleShow}
              ModalType={props.ModalType}
              setModalType={props.setModalType}
              ProviderObj={props.ProviderObj}
              setHideTitle={setHideTitle}
              setDateSlot={props.setDateSlot}
            />
          )}
          {props.ModalType === "cancel Booking" && (
            <BookingCencel
              handleShow={props.handleShow}
              ModalType={props.ModalType}
              setModalType={props.setModalType}
              cencelBooking={props.cencelBooking}
            />
          )}
          {props.ModalType === "Rating Review" && (
            <WriteReview
              handleShow={props.handleShow}
              ModalType={props.ModalType}
              setModalType={props.setModalType}
              ServiceId={props.ServiceId}
              VenderId={props.VenderId}
              BookingId={props.BookingId}
              params={props.params}
              apiCall={props.apiCall}
            />
          )}
          {props.ModalType === "service detail" && (
            <ServicesDetail
              handleShow={props.handleShow}
              ModalType={props.ModalType}
              setModalType={props.setModalType}
              Item={props.Item}
              service={props.service}
              pathname={props.pathname}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CommanModal;
