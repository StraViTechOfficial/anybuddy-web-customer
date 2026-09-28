"use client";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useEffect, useState } from "react";

const WeeklyCalendar = (props) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [weekStartDate, setWeekStartDate] = useState(
    moment().startOf("week").add(1, "days")
  ); // Monday
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(moment(weekStartDate).add(i, "days"));
    }
    setWeekDates(dates);
  }, [weekStartDate]);

  const goToPreviousWeek = () => {
    setWeekStartDate((prev) => moment(prev).subtract(7, "days"));
  };

  const goToNextWeek = () => {
    setWeekStartDate((prev) => moment(prev).add(7, "days"));
  };

  const handleSelectDate = (date) => {
    if (date.isBefore(moment(), "day")) return; // Disable past dates
    setSelectedDate(date);
    props.formik.setFieldValue("date", date);
  };

  useEffect(() => {
    if (props.value) {
      setSelectedDate(props.value);
    } else {
      props.formik.setFieldValue("date", selectedDate);
    }
  }, [props.value]);

  return (
    <div className="">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">{selectedDate.format("dddd, MMMM D")}</h5>
        <div className="">
          <span onClick={goToPreviousWeek} role="button">
            <FontAwesomeIcon icon={faAngleLeft} fontSize={20} />
          </span>
          <span onClick={goToNextWeek} role="button">
            <FontAwesomeIcon icon={faAngleRight} fontSize={20} />
          </span>
        </div>
      </div>

      <div className="weekDateFlex">
        {weekDates.map((date) => {
          const isSelected = date.isSame(selectedDate, "day");
          const isPast = date.isBefore(moment(), "day");
          return (
            <div
              key={date.format("YYYY-MM-DD")}
              onClick={() => handleSelectDate(date)}
              className={`d-grid gap-2 align-items-center text-center px-3 py-2 rounded-3 ${
                isSelected
                  ? "bgColor text-white"
                  : isPast
                  ? "bg-secondary text-white opacity-50"
                  : "bg-light"
              }`}
              role={!isPast ? "button" : ""}
              style={{ width: "100px" }}
            >
              <span>{date.format("ddd")}</span>
              <span>{date.format("D")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
