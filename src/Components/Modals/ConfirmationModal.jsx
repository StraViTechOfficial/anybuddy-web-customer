"use client";
import React from "react";
import { Button, Modal } from "react-bootstrap";

function ConfirmationModal(props) {
  // console.log(props.isActive, "sdjbgdyv");
  return (
    <Modal show={props.show} onHide={props.handleShow} centered>
      <Modal.Header>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Are you sure you want to{" "}
          {props.modalName === "delete modal"
            ? props.deleteText === "Delete"
              ? "delete"
              : ""
            : props.isActive === "0"
            ? "inactive"
            : props.isActive === "1"
            ? "active"
            : props.isActive === ""
            ? "Solved"
            : ""}{" "}
          this {props.page}?
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleShow}>
          Cancel
        </Button>
        {props.modalName === "delete modal" ? (
          <Button
            variant="danger"
            onClick={() => {
              props.confirmDelete({ [props.keyName]: props.itemId });
              props.handleShow();
            }}
          >
            {props.deleteText}
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={() => {
              props.UpdateStatus({
                [props.keyName]: props.itemId,
                // [props.keyisActive]: props.isActive,
              });
              props.handleShow();
            }}
          >
            {props.isActive === "0"
              ? "Inactive"
              : props.isActive === "1"
              ? "Active"
              : props.isActive === ""
              ? "Solved"
              : ""}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;
