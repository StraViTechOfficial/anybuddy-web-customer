"use client";
import { useEffect, useState } from "react";
import Pagination from "react-js-pagination";
import "./style.css";

function Paginations({ handlePage, page, total }) {
  const [counter, setCounter] = useState();

  useEffect(() => {
    setCounter(page);
  }, [page]);

  const onChangeHandler = (value) => {
    setCounter(value);
    handlePage(value);
  };
  return (
    <>
      <nav className="ab-pager" aria-label="Pagination">
        <Pagination
          itemClass="page-item"
          linkClass="page-link"
          itemsCountPerPage={10}
          activePage={Number(counter)}
          totalItemsCount={Number(total)}
          pageRangeDisplayed={5}
          onChange={onChangeHandler}
          prevPageText={<span aria-label="Previous page">‹</span>}
          nextPageText={<span aria-label="Next page">›</span>}
          hideFirstLastPages
          itemClassPrev="ab-pager__step"
          itemClassNext="ab-pager__step"
        />
      </nav>
    </>
  );
}

export default Paginations;
