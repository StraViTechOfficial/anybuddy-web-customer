"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "./search.css";

function Search(props) {
  const pathname = usePathname();

  const { push, refresh, replace } = useRouter();

  return (
    <>
      <div className="seachBox">
        <div className={`position-relative w-50`}>
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={""}
            onChange={(e) => {}}
          />
          <Image
            src={"/assets/images/search.png"}
            alt=""
            quality={100}
            priority
            fill
            className="searchIcon"
            onClick={() => {}}
            role="button"
          />
        </div>
        <span className="btn bgColor rounded-3 text-white">SEARCH</span>
      </div>
    </>
  );
}

export default Search;
