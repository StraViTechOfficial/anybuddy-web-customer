"use client";
import { showError } from "@/Until/ValidationError";
import { useDataStore } from "@/api/store/store";
import GooglePolygon from "@/Components/GoogleMap/GooglePolygon";
import GooglePlace from "@/Components/GooglePlace";
import Loader from "@/Components/Loader/Loader";
import MobileInput from "@/Components/MobileInput/MobileInput";
import { useFormik } from "formik";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import * as Yup from "yup";
import "../FormStyle.css";

function AddEditAddress(props) {
  const [loading, setLoading] = useState(false);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 991.9px)" });
  const detail = useDataStore((store) => store?.getDetail);
  const [latLong, setLatLong] = useState({ lat: 0, lng: 0 });

  const detailAddr = useDataStore((store) => store?.AddressDetail);
  const { fetchAddressDetail } = useDataStore();

  useEffect(() => {
    if (props.addsId) {
      fetchAddressDetail({ id: props.addsId });
    }
  }, [props.addsId]);

  useEffect(() => {
    if (detailAddr?.lat) {
      setLatLong({ lat: detailAddr?.lat, lng: detailAddr?.long });
    }
  }, [detailAddr?.lat]);

  const splitMobile = detailAddr?.receiver_number
    ? detailAddr?.receiver_number.split(" ")
    : "";

  // console.log(splitMobile, "splitMobile");

  const initialValues = {
    fullAddress: props.addsId ? detailAddr?.full_address : "",
    lat: props.addsId ? detailAddr?.lat : "",
    lng: props.addsId ? detailAddr?.long : "",
    houseNo: props.addsId ? detailAddr?.house_no : "",
    road: props.addsId ? detailAddr?.tower : "",
    reach: props.addsId ? detailAddr?.locality : "",
    saveAs: props.addsId ? detailAddr?.address_type : "",
    countryCode: props.addsId
      ? splitMobile[0]?.length > 3
        ? "+1"
        : splitMobile[0]
      : detail?.country_code
      ? detail?.country_code
      : "",
    mobile: props.addsId
      ? splitMobile[0]?.length > 3
        ? splitMobile[0]
        : splitMobile[1]
      : detail?.mobile
      ? detail?.mobile
      : "",
    fullName: props.addsId
      ? detailAddr?.receiver_name
      : detail?.full_name
      ? detail?.full_name
      : "",
    email: props.addsId
      ? detailAddr?.receiver_email
      : detail?.email
      ? detail?.email
      : "",
    state: props.addsId ? detailAddr?.state : "",
    city: props.addsId ? detailAddr?.city : "",
    region: props.addsId ? detailAddr?.region_id : "",
    area: props.addsId ? detailAddr?.area_id : "",
    subArea: props.addsId ? detailAddr?.sub_area_id : "",
    pincode: props.addsId ? detailAddr?.pincode : "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      fullAddress: Yup.string().required("Required"),
      // email: Yup.string()
      //   .email("Invalid email format")
      //   .matches(
      //     /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      //     "Please enter a valid email address"
      //   )
      //   .required("Required"),
      houseNo: Yup.string().required("Required"),
      saveAs: Yup.string().required("Required"),
      fullName: Yup.string().required("Required"),
      mobile: Yup.string().required("Required"),
      state: Yup.string().required("Required"),
      city: Yup.string().required("Required"),
      pincode: Yup.string().required("Required"),
      // area: Yup.string().required("Required"),
      // subArea: Yup.string().required("Required"),
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setLoading(true);
      const payload = {
        house_no: values.houseNo,
        full_address: values.fullAddress,
        tower: values.road,
        locality: values.reach,
        lat: values.lat,
        long: values.lng,
        state: values.state,
        city: values.city,
        pincode: parseInt(values.pincode),
        address_type: values.saveAs,
        receiver_name: values.fullName,
        receiver_email: values.email,
        receiver_number: `${values.countryCode} ${values.mobile}`,
      };

      const update = {
        ...payload,
        id: props.addsId,
      };

      // if (props.addsId) {
      //   addEditCustomerAddrApi(update).then((res) => {
      //     setLoading(false);
      //     if (res?.status_code === 1) {
      //       toast.success(res.message);
      //       fetchGetAllCustomerAddr();
      //       props.scrollToTop && props.scrollToTop();
      //       props.handleShow();
      //     } else {
      //       setLoading(false);
      //       toast.error(res.message);
      //     }
      //   });
      // } else {
      //   addEditCustomerAddrApi(payload).then((res) => {
      //     setLoading(false);
      //     if (res?.status_code === 1) {
      //       toast.success(res.message);
      //       fetchGetAllCustomerAddr();
      //       props.scrollToTop && props.scrollToTop();
      //       if (props.page !== "profile") {
      //         props.SelectAddress(res?.data?.id);
      //       }
      //       props.handleShow();
      //     } else {
      //       setLoading(false);
      //       toast.error(res.message);
      //     }
      //   });
      // }
    },
  });

  return (
    <>
      <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-6">
          <GooglePolygon
            height={isTabletOrMobile ? "390px" : "100%"}
            keyName="fullAddress"
            formik={formik}
            setLatLong={setLatLong}
            latLong={latLong}
            addressId={props.addsId}
          />
          {/* <GoogleMapCom
            height={isTabletOrMobile ? "390px" : "100%"}
            keyName="fullAddress"
            formik={formik}
            setLatLong={setLatLong}
            latLong={latLong}
            addressId={props.addsId}
          /> */}
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6">
          <form className="formStyle pe-4 mt-3" onSubmit={formik.handleSubmit} noValidate>
            <div className="mb-4">
              <div className="position-relative">
                <GooglePlace
                  name="fullAddress"
                  value={formik.values.fullAddress}
                  placeholder="My Restaurant"
                  latLong={{
                    lat: formik.values.lat,
                    lng: formik.values.lng,
                  }}
                  //onBlur={handleBlur}
                  onChange={(val, latLong, addressDetails) => {
                    console.log(latLong, "latLong");
                    if (val) {
                      formik.setFieldValue("fullAddress", val);
                      formik.setFieldValue("lat", latLong?.lat);
                      formik.setFieldValue("lng", latLong?.lng);
                      formik.setFieldValue("state", addressDetails?.state);
                      formik.setFieldValue("city", addressDetails?.city);
                      formik.setFieldValue("pincode", addressDetails?.pincode);
                      setLatLong({ lat: latLong?.lat, lng: latLong?.lng });
                    } else {
                      formik.setFieldValue("fullAddress", "");
                      formik.setFieldValue("lat", "");
                      formik.setFieldValue("lng", "");
                    }
                  }}
                />

                {/* <Autocomplete
                  apiKey={mapApiKey}
                  name="fullAddress"
                  value={formik.values.fullAddress}
                  ref={autocompleteRef}
                  className="form-control"
                  placeholder="Full Address"
                  onChange={() => {
                    if (autocompleteRef.current) {
                      formik.setFieldValue(
                        "fullAddress",
                        autocompleteRef.current.value
                      );
                      formik.setFieldValue("lat", "");
                      formik.setFieldValue("lng", "");
                    }
                  }}
                  onPlaceSelected={(place, inputRef, autocompleteRef) => {
                    if (place) {
                      let lat = place.geometry.location.lat();
                      let lng = place.geometry.location.lng();
                      let address = place.formatted_address;

                      // Initialize empty values
                      let city = "";
                      let state = "";
                      let country = "";

                      // Extract city, state, and country from address_components
                      place.address_components.forEach((component) => {
                        if (component.types.includes("locality")) {
                          city = component.long_name;
                        }
                        if (
                          component.types.includes(
                            "administrative_area_level_1"
                          )
                        ) {
                          state = component.long_name;
                        }
                        if (component.types.includes("country")) {
                          country = component.long_name;
                        }
                      });

                      // Set values in formik
                      formik.setFieldValue("fullAddress", address);
                      formik.setFieldValue("lat", lat);
                      formik.setFieldValue("lng", lng);
                      formik.setFieldValue("city", city);
                      formik.setFieldValue("state", state);
                      formik.setFieldValue("country", country);

                      // Set location in state if needed
                      setLatLong({ lat: lat, lng: lng });

                      // console.log("City:", city, "State:", state, "Country:", country);
                    }
                  }}
                  options={{
                    types: ["geocode", "establishment"],
                    componentRestrictions: { country: "in" },
                  }}
                /> */}

                <Image
                  src={"/assets/images/AddRess.png"}
                  alt=""
                  priority
                  quality={100}
                  fill
                  className="InputImg"
                />
              </div>
              {showError(formik, "fullAddress") && (
                <div className="text-danger"> {formik.errors.fullAddress}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Store Number"
                  {...formik.getFieldProps("houseNo")}
                />
              </div>
              {showError(formik, "houseNo") && (
                <div className="text-danger"> {formik.errors.houseNo}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Store Address"
                  {...formik.getFieldProps("road")}
                />
              </div>
              {showError(formik, "road") && (
                <div className="text-danger"> {formik.errors.road}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Directions to Reach"
                  {...formik.getFieldProps("reach")}
                />
              </div>
              {showError(formik, "reach") && (
                <div className="text-danger"> {formik.errors.reach}</div>
              )}
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-6 col-lg-6 mb-4">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="State"
                    {...formik.getFieldProps("state")}
                    readOnly
                    disabled
                  />
                </div>
                {showError(formik, "state") && (
                  <div className="text-danger"> {formik.errors.state}</div>
                )}
              </div>
              <div className="col-sm-12 col-md-6 col-lg-6 mb-4">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City"
                    {...formik.getFieldProps("city")}
                    readOnly
                    disabled
                  />
                </div>
                {showError(formik, "city") && (
                  <div className="text-danger"> {formik.errors.city}</div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pincode"
                  value={formik.values.pincode}
                  onChange={(e) => {
                    formik.setFieldValue(
                      "pincode",
                      e.target.value.replace(/\D/g, "")
                    );
                  }}
                  // {...formik.getFieldProps("pincode")}
                />
              </div>
              {showError(formik, "pincode") && (
                <div className="text-danger"> {formik.errors.pincode}</div>
              )}
            </div>
            {/* <div className="mb-4">
              {SaveAsArr?.map((item, i) => (
                <span
                  className={`rounded-5 py-2 text-capitalize m-1 small px-3 d-inline-flex align-items-center gap-2 ${
                    formik.values.saveAs === item?.id
                      ? "themeBg text-white"
                      : "bg-white"
                  }`}
                  key={i}
                  role="button"
                  onClick={() => {
                    formik.setFieldValue("saveAs", item?.id);
                  }}
                >
                  <Image
                    src={`/assets/images/${
                      formik.values.saveAs === item?.id
                        ? item?.imgSelect
                        : item?.img
                    }.png`}
                    alt=""
                    priority
                    quality={100}
                    width={18}
                    height={18}
                    className="object-fit-contain"
                  />{" "}
                  {item?.name}
                </span>
              ))}
              {showError(formik, "saveAs") && (
                <div className="text-danger"> {formik.errors.saveAs}</div>
              )}
            </div> */}
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                  {...formik.getFieldProps("fullName")}
                />
                <Image
                  src={"/assets/images/user.png"}
                  alt=""
                  priority
                  quality={100}
                  fill
                  className="InputImg"
                />
              </div>
              {showError(formik, "fullName") && (
                <div className="text-danger"> {formik.errors.fullName}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  {...formik.getFieldProps("email")}
                />
                <Image
                  src={"/assets/images/user.png"}
                  alt=""
                  priority
                  quality={100}
                  fill
                  className="InputImg"
                />
              </div>
              {showError(formik, "email") && (
                <div className="text-danger"> {formik.errors.email}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="position-relative">
                <MobileInput
                  mobile="mobile"
                  countryCode="countryCode"
                  formik={formik}
                  inputClass="form-control"
                />
                <Image
                  src={"/assets/images/mobile.png"}
                  alt=""
                  priority
                  quality={100}
                  fill
                  className="InputImg"
                />
              </div>
              {showError(formik, "mobile") && (
                <div className="text-danger"> {formik.errors.mobile}</div>
              )}
            </div>
            <div className="mb-4">
              <button className="SubmitBtn btn w-100" type="submit">
                {loading ? <Loader /> : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddEditAddress;
