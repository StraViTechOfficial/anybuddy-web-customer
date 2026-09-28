"use client";
import React from "react";
import { Bars } from "react-loader-spinner";

function Loader(props) {
  return (
    <>
      <Bars
        height={props.height ? props.height : "30"}
        width={props.width ? props.width : "80"}
        color={props.color ? props.color : "#394B7B"}
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass="justify-content-center"
        visible={true}
      />
    </>
  );
}

export default Loader;
