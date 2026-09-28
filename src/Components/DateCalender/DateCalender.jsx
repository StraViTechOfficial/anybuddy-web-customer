"use client";
import React, { forwardRef } from "react";
import { Calendar } from "react-multi-date-picker";
import moment from "moment";
import "./style.css";

const DateCalender = forwardRef((props, ref) => {
  return (
    <>
      <Calendar
        ref={ref}
        multiple={props.multi}
        value={props.value}
        dateSeparator=","
        onChange={(val) => {
          if (props.formik) {
            props.formik.setFieldValue(props.name, val.toString());
          } else {
            props.setDate(moment(val.toString()).format("DD-MM-YYYY"));
          }
        }}
        format="YYYY-MM-DD"
        minDate={props.formik ? new Date() : false}
        mapDays={({ date }) => {
          const formatted = date.format("YYYY-MM-DD");

          if (props.dateOff.includes(formatted)) {
            return {
              disabled: true, // 👈 date disable kar diya
              style: { color: "#ccc", textDecoration: "line-through" }, // optional styling
            };
          }
        }}
      />
    </>
  );
});

export default DateCalender;
