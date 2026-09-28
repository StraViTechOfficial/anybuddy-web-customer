"use client";
import { mapApiKey } from "@/Until";
import { useEffect, useRef, useState } from "react";

let autoComplete;

const loadScript = (url, callback) => {
  let script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    //console.log("ready");
    script.onreadystatechange = function () {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = () => callback();
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};
function getLatLngFromAddress(place, updateLatLong, latLong) {
  var geocoder = new window.google.maps.Geocoder();

  console.log("Fetching LatLng for:", place); // Debug

  geocoder.geocode({ address: place }, function (results, status) {
    if (status === window.google.maps.GeocoderStatus.OK) {
      console.log("Geocode Success:", results[0].geometry.location); // Debugging ke liye

      updateLatLong({
        ...latLong,
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng(),
      });
    } else {
      console.error("Geocode Failed:", status);
    }
  });
}

function handleScriptLoad(
  updateQuery,
  autoCompleteRef,
  updateLatLong,
  latLong,
  updateAddressDetails
) {
  autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "in" },
    }
  );

  autoComplete.setFields(["address_components", "formatted_address"]);
  autoComplete.addListener("place_changed", () =>
    handlePlaceSelect(updateQuery, updateLatLong, latLong, updateAddressDetails)
  );
}

async function handlePlaceSelect(
  updateQuery,
  updateLatLong,
  latLong,
  updateAddressDetails
) {
  const addressObject = autoComplete.getPlace();
  const query = addressObject.formatted_address;
  // console.log(addressObject, "addressObject");

  let state = "";
  let city = "";
  let pincode = "";
  let country = "";

  if (addressObject.address_components) {
    addressObject.address_components.forEach((component) => {
      if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name; // State
      }
      if (component.types.includes("locality")) {
        city = component.long_name; // City
      }
      if (component.types.includes("postal_code")) {
        pincode = component.long_name; // Pincode
      }
      if (component.types.includes("country")) {
        country = component.long_name; // Pincode
      }
    });
  }

  updateAddressDetails({ state, city, pincode, country }); // Update parent state with new details
  getLatLngFromAddress(query, updateLatLong, latLong);
  updateQuery(query);
}

function SearchLocationInput(props) {
  const [query, setQuery] = useState("");
  const [latLong, setLatLong] = useState(props.latLong);
  const [addressDetails, setAddressDetails] = useState({
    state: "",
    city: "",
    pincode: "",
    country: "",
  });
  const autoCompleteRef = useRef(null);

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`,
      () =>
        handleScriptLoad(
          setQuery,
          autoCompleteRef,
          setLatLong,
          latLong,
          setAddressDetails
        )
    );
  }, []);

  useEffect(() => {
    props.onChange(query, latLong, addressDetails);
  }, [query, latLong, addressDetails]);

  return (
    <div>
      <input
        ref={autoCompleteRef}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={props.placeholder}
        value={props.value}
        className="form-control CurrentLocation"
        name={props.name}
        onBlur={props.onBlur}
      />
    </div>
  );
}

export default SearchLocationInput;
