"use client";
import React from "react";
import Slider from "react-slick";
import "./slider.css";

function SliderCom(props) {
  return (
    <>
      <Slider {...props.setting} className={props.className}>
        {props.children}
      </Slider>
    </>
  );
}

export default SliderCom;
