"use client";
import { getUploadLinkApi } from "@/api/setting";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { uid } from "uid";
import "./inputStyle.css";

const MAX_BYTES = 10 * 1024 * 1024;

function ImageUploadInput(props) {
  const [isActive1, setIsActive1] = useState(false);
  const [time1, setTime1] = useState(0);

  // The backend picks the file path and signs a 5-minute link; the browser never sees storage keys.
  // Browsers often leave HEIC (iPhone photos) without a type; the server needs one to sign the upload.
  const typeOf = (file) =>
    file.type || { heic: "image/heic", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", pdf: "application/pdf" }[file.name.split(".").pop().toLowerCase()] || "";
  const uploadFile = async (file) => {
    // size: the server signs it into the link, so S3 refuses a file bigger than declared (and >10 MB outright).
    const link = await getUploadLinkApi({ folder: props.folderName, contentType: typeOf(file), size: file.size });
    if (link?.status !== 1) throw new Error(link?.message || "We couldn't upload that file. Try again.");
    const put = await fetch(link.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": typeOf(file) },
      body: file,
    });
    if (!put.ok) throw new Error("The upload didn't finish. Check your connection and try again.");
    return link.data.fileUrl;
  };

  const fileUpload = async (files) => {
    setIsActive1(true);
    const uploadedData = [];
    let successCount = 0;

    const accept = (props.accept || "image/*").toLowerCase();
    const allowedExtensions = [];

    if (accept.includes("image/*"))
      allowedExtensions.push("jpg", "jpeg", "png", "webp", "heic"); // what the server accepts for photos
    if (accept.includes("video/*"))
      allowedExtensions.push("mp4", "mov", "avi", "webm", "mkv");
    if (accept.includes("application/pdf")) allowedExtensions.push("pdf");
    if (
      accept.includes("application/vnd.ms-excel") ||
      accept.includes("spreadsheetml.sheet")
    ) {
      allowedExtensions.push("xls", "xlsx");
    }
    if (
      accept.includes("application/msword") ||
      accept.includes("wordprocessingml.document")
    ) {
      allowedExtensions.push("doc", "docx");
    }
    if (accept.includes("csv")) allowedExtensions.push("csv");

    for (let i = 0; i < files.length; i++) {
      const val = files[i];
      const fileExtension = val.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(accept.includes("image/*") && !accept.includes("pdf") ? "Use a JPG, PNG or WebP photo." : `${val.name} isn't a file type we accept.`);
        continue;
      }
      // Same limit as the server (10 MB), checked before uploading so a big file fails fast and clearly.
      if (val.size > MAX_BYTES) {
        toast.error(`This file is ${(val.size / 1048576).toFixed(1)} MB. Use a file up to 10 MB.`);
        continue;
      }

      const originalFileName = val.name.replace(/\.[^/.]+$/, "");
      const newFileName = `${
        props.ImgName || "Zemba"
      }_${originalFileName}_${uid()}.${fileExtension}`;

      const isImage = ["jpg", "jpeg", "png", "webp", "heic"].includes(
        fileExtension,
      );
      const isVideo = ["mp4", "mov", "avi", "webm", "mkv"].includes(
        fileExtension,
      );
      const type = isImage ? 1 : isVideo ? 2 : 3;

      try {
        const fileUrl = await uploadFile(val, newFileName);
        uploadedData.push({ url: fileUrl, type });
        successCount++;
        setTime1(Math.round((successCount / files.length) * 100));
      } catch (err) {
        toast.error(err?.message || "We couldn't upload that file. Try again.");
        console.error("Upload error:", err);
      }
    }

    if (props.isMultiple) {
      const existingData = props.formik.values[props.inputKey] || [];
      props.formik.setFieldValue(props.inputKey, [
        ...existingData,
        ...uploadedData,
      ]);
    } else if (uploadedData[0]) {
      // Only replace the current photo when the new one actually uploaded (a failed upload kept wiping it).
      props.formik.setFieldValue(props.inputKey, uploadedData[0]);
    }

    setTimeout(() => {
      setTime1(0);
      setIsActive1(false);
    }, 3000);
  };

  useEffect(() => {
    let interval;
    if (isActive1 && time1 < 100) {
      interval = setInterval(() => {
        setTime1((seconds) => (seconds < 99 ? seconds + 1 : seconds));
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isActive1, time1]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const sanitizedFiles = Array.from(files).map((file) => {
      const sanitizedName = file.name.replaceAll(" ", "_");
      return new File([file], sanitizedName, { type: file.type });
    });

    fileUpload(sanitizedFiles);

    props.SizeKey &&
      props.formik.setFieldValue(
        props.SizeKey,
        formatFileSize(event.target.files[0].size),
      );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  return (
    <>
      <div className={props.mainClass}>
        <span className="btn">
          <Image
            src={
              props.mainClass?.includes("files")
                ? props.defaultImg
                : props.imageURL?.url?.includes("http") && !props.isMultiple
                  ? props.imageURL?.url
                  : props.defaultImg
            }
            alt=""
            fill={true}
            quality={100}
            priority
          />
        </span>
        <div
          className={
            props.showText === "yes"
              ? "textColor1 text-center text-decoration-underline"
              : "d-none"
          }
        >
          {props.imageURL?.url?.includes("http") ? null : (
            <h6 className="mb-0 text-white">{props.Text}</h6>
          )}
        </div>
        <input
          type="file"
          accept={props.accept || "image/*"}
          multiple={props.isMultiple}
          name={props.inputKey}
          onChange={handleFileChange}
          disabled={props.disabled && "disabled"}
        />
      </div>

      {time1 > 0 && isActive1 && (
        <progress
          value={time1}
          max="100"
          style={{ width: "100%", height: "8px", borderRadius: "4px" }}
        />
      )}

      {props.isMultiple && props.imageURL?.length > 0 && (
        <div>
          {props.imageURL?.map((item, i) => (
            <div
              className="position-relative p-3 rounded-4 d-inline-flex mt-3"
              key={`imgInp-${i}`}
            >
              {item?.type === 1 ? (
                <Image
                  src={item?.url}
                  alt=""
                  width={props.prevImg?.width || 100}
                  height={props.prevImg?.height || 100}
                  className="object-fit-contain"
                />
              ) : item?.type === 2 ? (
                <video
                  width={100}
                  height={100}
                  className="object-fit-cover"
                  controls
                >
                  <source src={item?.url} type="video/mp4" />
                </video>
              ) : (
                <Link href={item?.url} target="_blank">
                  {item?.url}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ImageUploadInput;
