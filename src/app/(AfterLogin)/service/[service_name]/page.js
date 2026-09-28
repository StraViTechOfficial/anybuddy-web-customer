"use client";
import { useDataStore } from "@/api/store/store";
import CategoryBox from "@/Components/CommonParts/CategoryBox";
import Loader from "@/Components/Loader/Loader";
import Paginations from "@/Components/Paginations/Pagination";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";
import "@/Components/CommonParts/cards.css";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SubServicesList() {
  const { service_name, sub_service } = useParams();
  const [page, setpage] = useState(1);
  const handlePage = (val) => {
    setpage(val);
  };
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search");

  const [Loading, setLoading] = useState(false);
  const { SubCateList, fetchSubCateList } = useDataStore();

  const params = {
    slug: service_name,
    page: page,
    limit: 10,
    search: searchValue || "",
  };

  useEffect(() => {
    setLoading(true);
    if (service_name)
      fetchSubCateList(params).then(() => {
        setLoading(false);
      });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [service_name, page, searchValue]);

  const list = SubCateList?.data || [];
  const box = (item, i) => (
    <div
      className="ab-reveal"
      style={{ "--ab-delay": `${(i % 4) * 70}ms` }}
      key={`servic-${i}`}
    >
      <CategoryBox item={item} service={service_name} priority={i < 4} />
    </div>
  );

  return (
    <>
      <section className="ab-section ab-section--tight">
        <div className="ab-container">
          <div className="ab-pagehead">
            <div>
              <h1 className="ab-page-title">
                {searchValue
                  ? `Results for “${searchValue}”`
                  : `Choose a ${service_name?.replaceAll("-", " ")} service`}
              </h1>
              <p className="ab-lead">
                Pick a service to see its details, then compare the pros who
                offer it.
              </p>
            </div>
          </div>
          {Loading ? (
            <div className="ab-catgrid" aria-busy="true" aria-label="Loading services">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="ab-skeleton" style={{ aspectRatio: "4 / 4.6" }} />
              ))}
            </div>
          ) : list.length > 0 ? (
            <div className="ab-catgrid">{list.map(box)}</div>
          ) : (
            <div className="ab-empty">
              <span className="ab-empty__icon">
                <Icon name="search" size={28} />
              </span>
              <h3>No Service Found</h3>
              <p>
                {searchValue
                  ? `Nothing in this category matches “${searchValue}”.`
                  : "Services in this category will appear here once pros start offering them."}
              </p>
              <Link href="/service" className="ab-btn ab-btn--ghost">
                Browse all categories
              </Link>
            </div>
          )}
          {SubCateList?.count > params.limit && (
            <div className="mt-4">
              <Paginations
                page={page}
                total={SubCateList?.count}
                handlePage={handlePage}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function AllSubServicesList() {
  return (
    <Suspense fallback={<Loader />}>
      <SubServicesList />
    </Suspense>
  );
}
