"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDataStore } from "@/api/store/store";
import { mapApiKey } from "@/Until";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMediaQuery } from "react-responsive";

function GoogleMapCom(props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapApiKey,
  });

  const latLong = useDataStore((s) => s.latLong);
  const { fetchLatLong } = useDataStore();

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 991.9px)" });
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);

  // Keep store -> form sync
  useEffect(() => {
    if (latLong) {
      props.setLatLong(latLong);
      props.formik.setFieldValue("lat", latLong?.lat);
      props.formik.setFieldValue("lng", latLong?.lng);
    }
  }, [latLong]);

  useEffect(() => {
    setLoading(false);
  }, []);

  // helper: reverse geocode with google.maps.Geocoder
  const reverseGeocode = useCallback(
    (lat, lng) =>
      new Promise((resolve, reject) => {
        if (!maps) return reject(new Error("maps not ready"));
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0];
            let city = "",
              state = "",
              country = "",
              postal_code = "";

            address.address_components.forEach((component) => {
              component.types.forEach((type) => {
                switch (type) {
                  case "locality":
                    city = component.long_name;
                    break;
                  case "administrative_area_level_1":
                    state = component.long_name;
                    break;
                  case "country":
                    country = component.long_name;
                    break;
                  case "postal_code":
                    postal_code = component.long_name;
                    break;
                  default:
                    break;
                }
              });
            });

            // set form fields
            props.formik.setFieldValue(
              props.keyName,
              address?.formatted_address || ""
            );
            props.formik.setFieldValue("pincode", postal_code || "");
            props.formik.setFieldValue("state", state || "");
            props.formik.setFieldValue("city", city || "");
            props.formik.setFieldValue("lat", lat);
            props.formik.setFieldValue("lng", lng);

            resolve(address);
          } else {
            reject(new Error("Geocoder failed: " + status));
          }
        });
      }),
    [maps, props.formik, props.keyName]
  );

  // whenever props.latLong changes (and maps is ready) center + reverse geocode
  useEffect(() => {
    if (maps && map && props.latLong?.lat && props.latLong?.lng) {
      const center = { lat: props.latLong.lat, lng: props.latLong.lng };
      try {
        map.panTo(center);
      } catch (e) {
        // ignore
      }
      reverseGeocode(props.latLong.lat, props.latLong.lng).catch(() => {});
    }
  }, [props.latLong, maps, map, reverseGeocode]);

  const handleMarkerDragEnd = (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    props.setLatLong({ lat: newLat, lng: newLng });
    props.formik.setFieldValue("lat", newLat);
    props.formik.setFieldValue("lng", newLng);
    fetchLatLong({ lat: newLat, lng: newLng });

    if (maps) reverseGeocode(newLat, newLng).catch(() => {});
  };

  const handleClickLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        props.setLatLong({ lat: latitude, lng: longitude });
        props.formik.setFieldValue("lat", latitude);
        props.formik.setFieldValue("lng", longitude);

        try {
          await reverseGeocode(latitude, longitude);
        } catch (err) {
          console.error("Error reverse geocoding:", err);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // onLoad for GoogleMap - store map instance and maps (google.maps) namespace
  const onMapLoad = useCallback((m) => {
    setMap(m);
    // global google maps namespace
    setMaps(
      typeof window !== "undefined" && window.google && window.google.maps
        ? window.google.maps
        : null
    );
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      {loading ? (
        "Loading Map"
      ) : (
        <div
          style={{ height: props.height, width: "100%", position: "relative" }}
        >
          <GoogleMap
            id="map-canvas"
            mapContainerStyle={{ width: "100%", height: props.height }}
            zoom={14}
            center={{
              lat: props.latLong?.lat || 0,
              lng: props.latLong?.lng || 0,
            }}
            onLoad={onMapLoad}
          >
            {props.latLong?.lat && props.latLong?.lng && (
              <Marker
                position={{ lat: props.latLong.lat, lng: props.latLong.lng }}
                title="Marker"
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </GoogleMap>

          <div
            style={{
              position: "absolute",
              top: `${isTabletOrMobile ? "unset" : "10px"}`,
              bottom: `${isTabletOrMobile ? "10px" : "unset"}`,
              left: `${isTabletOrMobile ? "10px" : "75px"}`,
              right: `${isTabletOrMobile ? "unset" : "0"}`,
              margin: `${isTabletOrMobile ? "unset" : "auto"}`,
              width: "fit-content",
              backgroundColor: "#ec6221",
              color: "#fff",
              padding: "6px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
            onClick={handleClickLocation}
          >
            Use Current Location
          </div>
        </div>
      )}
    </>
  );
}

export default GoogleMapCom;
