"use client";
import { useDataStore } from "@/api/store/store";
import { convertName, formatNumber } from "@/Until";
import {
  CreateImg,
  dummyImageImg,
  employeImg,
  NoCategoryImg,
} from "@/Until/ImageExport";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

function LeftListdata(props) {
  const { id } = useParams();
  const RecentContentList = useDataStore((store) => store.RecentContentList);
  const categoryList = useDataStore((store) => store.CategoryList);
  const TrendingTags = useDataStore((store) => store.TrendingTags);
  const { fetchCategoryList, fetchTrendingTags, fetchRecentContentList } =
    useDataStore();

  const [Tages, setTages] = useState([]);
  const [CategoryId, setCategoryId] = useState("");
  // console.log(Tages, "Tages");
  useEffect(() => {
    if (id) {
      setTages([]);
      setCategoryId("");
    }
  }, [id]);

  useEffect(() => {
    fetchCategoryList({ status: true });
    fetchTrendingTags({
      content_type:
        props.page === "blog" ? 2 : props.page === "photography" ? 1 : 3,
    });
    setTages([]);
    setCategoryId("");
    fetchRecentContentList({
      type: props.page === "blog" ? 2 : props.page === "photography" ? 1 : 3,
    });
  }, [props.page]);

  return (
    <>
      <div className="bg-white rounded-4 p-3 mb-4">
        <h4 className="mb-3">Category</h4>
        {categoryList?.data?.length > 0
          ? categoryList?.data?.map((item, i) => (
              <Fragment key={`catehou-${i}`}>
                <div className="">
                  <Link
                    href={{
                      pathname: `/${props.page}`,
                      query: {
                        id: item?._id,
                        tages: Tages.join(","),
                      },
                    }}
                    className={`h6 mb-0 text-capitalize position-relative d-block ${
                      CategoryId === item?._id ? "textColor" : "text-dark"
                    }`}
                    onClick={() => {
                      if (props.isTabletOrMobile) {
                        props.handleShow();
                      }
                      setCategoryId(item?._id);
                    }}
                  >
                    <Image
                      src={
                        item?.image?.includes("http")
                          ? item?.image
                          : NoCategoryImg
                      }
                      alt=""
                      width={35}
                      height={35}
                      className="object-fit-contain"
                    />{" "}
                    {item?.name}
                    <div className="position-absolute top-0 end-0 bottom-0 m-auto h-fit">
                      <FontAwesomeIcon
                        icon={faArrowRightLong}
                        className="textColor"
                      />
                    </div>
                  </Link>
                </div>
                {i !== categoryList?.data?.length - 1 && <hr />}
              </Fragment>
            ))
          : "No Category Found"}
      </div>
      {props.page !== "forums" && (
        <div className="bg-white rounded-4 p-2 mb-4">
          <h4 className="mb-3">Tags</h4>
          {TrendingTags?.length > 0
            ? TrendingTags.map((item, i) => {
                const isSelected = Tages.includes(item?.tag_id);

                // Toggle logic: remove if already exists, add if not
                const updatedTags = isSelected
                  ? Tages.filter((id) => id !== item?.tag_id)
                  : [...Tages, item?.tag_id];

                const tagQuery = updatedTags.join(",");

                return (
                  <Link
                    href={{
                      pathname: `/${props.page}`,
                      query: {
                        id: CategoryId,
                        tages: tagQuery,
                      },
                    }}
                    key={`tages-${i}`}
                    scroll={false}
                    onClick={() => {
                      setTages(updatedTags); // toggle the tag
                      if (props.isTabletOrMobile) {
                        props.handleShow();
                      }
                    }}
                    className={`d-inline-block mt-2 me-1 p-2 rounded-3 small ${
                      isSelected ? "bgColor text-white" : "lightBg text-dark"
                    }`}
                  >
                    #{item?.name}
                  </Link>
                );
              })
            : "NO Tags Found"}
        </div>
      )}
      {props.page === "blog" && id && RecentContentList?.length > 0 && (
        <div className="bg-white rounded-4 p-2 mb-4">
          <h4 className="mb-3">Recent Posts</h4>
          {RecentContentList?.map((item, i) => (
            <div
              className="d-flex align-items-center gap-3 mb-3"
              key={`rrect-${i}`}
            >
              <Image
                src={
                  item?.image?.[0]?.url?.includes("http")
                    ? item?.image?.[0]?.url
                    : dummyImageImg
                }
                alt=""
                width={65}
                height={65}
                className="object-fit-cover rounded-4"
              />
              <div>
                <h6 className="mb-0">
                  <Link
                    href={`/blog/${convertName(item?.title)}/${item?._id}`}
                    className="text-dark small ellip-2"
                    onClick={() => {
                      if (props.isTabletOrMobile) {
                        props.handleShow();
                      }
                    }}
                  >
                    {item?.title}
                  </Link>
                </h6>
                <small className="textColor">
                  {formatNumber(item?.total_views)} Views
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
      {props.page === "photography" && id && RecentContentList?.length > 0 && (
        <div className="bg-white rounded-4 p-2 mb-4">
          <h4 className="mb-3">Recent Media</h4>
          {RecentContentList?.map((item, i) => (
            <div
              className="d-flex align-items-center gap-3 mb-3"
              key={`rrectMedis-${i}`}
            >
              <Image
                src={
                  item?.image?.[0]?.url?.includes("http")
                    ? item?.image?.[0]?.url
                    : dummyImageImg
                }
                alt=""
                width={65}
                height={65}
                className="object-fit-cover rounded-4"
              />
              <div>
                <div className="d-flex align-items-center gap-2 text-capitalize">
                  <Image
                    src={
                      item?.user_img?.includes("http")
                        ? item?.user_img
                        : employeImg
                    }
                    alt=""
                    width={30}
                    height={30}
                    className="object-fit-cover rounded-4"
                  />{" "}
                  {item?.first_name
                    ? `${item?.first_name} ${item?.last_name}`
                    : ""}
                </div>
                <h6 className="mb-0">
                  <Link
                    href={`/photography/${convertName(item?.title)}/${
                      item?._id
                    }`}
                    className="text-dark small ellip-2"
                    onClick={() => {
                      if (props.isTabletOrMobile) {
                        props.handleShow();
                      }
                    }}
                  >
                    {item?.title}
                  </Link>
                </h6>
              </div>
            </div>
          ))}
        </div>
      )}
      {!props.isTabletOrMobile && (
        <div className="bg-white rounded-4 p-3 mb-4">
          <h4 className="mb-3">Create {props.page}</h4>
          <div
            role="button"
            onClick={() => {
              props.setModalName("open modal");
              props.setModalType(props.page);
              props.handleShow();
            }}
            className="bg-black rounded-5 py-3 px-3 text-white"
          >
            <Image
              src={CreateImg}
              alt=""
              width={35}
              height={35}
              className="object-fit-contain"
            />{" "}
            Create {props.page}
          </div>
        </div>
      )}
    </>
  );
}

export default LeftListdata;
