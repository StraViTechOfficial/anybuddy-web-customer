"use client";
import { AddCommentApi, LikeCommentApi } from "@/api/setting";
import { DateDisplay } from "@/Until";
import {
  CommentWriteImg,
  employeImg,
  hartImg,
  heartLineImg,
  ThumbdownImg,
  ThumbupImg,
} from "@/Until/ImageExport";
import Image from "next/image";
import { useRef, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "react-toastify";
import ReplyComment from "./ReplyComment";

function CommentSec(props) {
  const [loading, setloading] = useState(false);
  const [Reply, setReply] = useState("");
  const [ReplyShow, setReplyShow] = useState("");
  const [ReplyShowComment, setReplyShowComment] = useState(false);
  const [CommentId, setCommentId] = useState("");
  const replyRef = useRef(null);

  const AddComment = (parent_id) => {
    // AddCommentApi({
    //   content_id: props.content_id,
    //   parent_id: parent_id,
    //   message: Reply,
    // }).then((res) => {
    //   if (res?.status_code === 1) {
    //     toast.success(res?.message);
    //     props.api(props.page);
    //     setReply("");
    //     if (replyRef.current) {
    //       replyRef.current.refreshReplies();
    //     }
    //   } else {
    //     toast.error(res?.message);
    //   }
    // });
  };

  const LikeComment = (id, lkie) => {
    props.onLikeUpdate(id, lkie);
    LikeCommentApi({ id: id, is_like: lkie }).then((res) => {
      if (res?.status_code !== 1) {
        toast.error(res?.message);
      }
    });
  };

  return (
    <>
      <div className="d-flex align-items-start gap-4 mb-3 justify-content-between">
        <div className="d-flex align-items-start gap-2">
          <Image
            src={
              props.item?.image?.includes("http")
                ? props.item?.image
                : employeImg
            }
            alt=""
            width={55}
            height={55}
            className="object-fit-contain rounded-circle"
          />
          <div>
            <h6 className="mb-0 fw-bold text-capitalize">
              {props.item?.first_name
                ? `${props.item?.first_name} ${props.item?.last_name}`
                : ""}
            </h6>
            <p className="mb-0">{props.item?.message}</p>
            {props.item?.createdAt && (
              <small>{DateDisplay(props.item?.createdAt)}</small>
            )}

            {props.item?.total_replies > 0 &&
              (loading ? (
                <ThreeDots
                  visible={true}
                  height="25"
                  width="25"
                  color="#f78106"
                  radius="9"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              ) : (
                <>
                  <br />
                  <small
                    className="fs-12"
                    role="button"
                    onClick={() => {
                      if (!ReplyShowComment) {
                        setCommentId(props.item?._id);
                        setloading(true);
                      } else {
                        setCommentId("");
                        setloading(false);
                      }
                      setReplyShowComment(!ReplyShowComment);
                    }}
                  >
                    <i>-{ReplyShowComment ? "Hide" : "View"} Reply</i>
                  </small>
                </>
              ))}
          </div>
        </div>
        <div>
          <Image
            src={
              props.page === "forums"
                ? ThumbupImg
                : props.item?.is_like === 0
                ? heartLineImg
                : hartImg
            }
            alt=""
            width={25}
            height={25}
            className="object-fit-contain me-3"
            onClick={() => {
              LikeComment(props.item?._id, props.item?.is_like === 0 ? 1 : 0);
            }}
          />
          {props.page === "forums" && (
            <Image
              src={ThumbdownImg}
              alt=""
              width={25}
              height={25}
              className="object-fit-contain me-3"
            />
          )}
          <Image
            src={CommentWriteImg}
            alt=""
            width={25}
            height={25}
            className="object-fit-contain"
            role="button"
            onClick={() => {
              setReplyShow(!ReplyShow);
            }}
          />
        </div>
      </div>
      {ReplyShow && (
        <div className="d-flex align-items-center gap-3">
          <input
            type="text"
            className="form-control"
            placeholder="Reply..."
            value={Reply}
            onChange={(e) => {
              setReply(e.target.value);
            }}
          />
          <span
            className="bg-dark px-4 py-2 rounded-5 text-white"
            role="button"
            onClick={() => {
              setReplyShow(!ReplyShow);
              AddComment(props.item?._id);
            }}
          >
            Send
          </span>
        </div>
      )}
      {ReplyShowComment && CommentId === props.item?._id ? (
        <ReplyComment
          ref={replyRef}
          CommentId={CommentId}
          content_id={props.content_id}
          loading={loading}
          setloading={setloading}
        />
      ) : null}
    </>
  );
}

export default CommentSec;
