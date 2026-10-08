"use client";

import { SellerProduct } from "@/app/actions/catalog.actions";
import { formatRupiah, formatTitle } from "@/utils/format";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HomeSwiperProps {
  products: SellerProduct[];
}

/**
 * Home carousel of the most-ordered listings (API-driven, replaces the
 * checkpoint1 hardcoded product array). Mirrors the original card markup and
 * responsive breakpoints (1 / 2 / 3 slides).
 */
export function HomeSwiper({ products }: HomeSwiperProps) {
  if (!products.length) {
    return (
      <div className="mt-10 text-center text-gray-500">
        No popular products yet — check back soon.
      </div>
    );
  }

  return (
    <div className="mt-10 md:mx-8 relative">
      <Swiper
        modules={[Navigation, Pagination]}
        direction="horizontal"
        loop={false}
        slidesPerView={1}
        spaceBetween={10}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        pagination={{ el: ".home-swiper-pagination" }}
        navigation={{ nextEl: ".home-swiper-next", prevEl: ".home-swiper-prev" }}
        className="h-[400px]"
      >
        {products.map((p) => {
          const inStock = p.stock > 0;
          const image = p.images?.[0];
          return (
            <SwiperSlide key={p.id}>
              <a href={`/products/${p.id}`} className="block">
                <article
                  className={`bg-gray-100 shadow-lg border border-gray-400 flex flex-col items-center w-full max-w-[280px] md:w-[300px] h-fit m-auto rounded-xl bg-white p-0 transition ${inStock ? "hover:shadow-xl" : "opacity-60 grayscale"
                    }`}
                >
                  <img
                    className="w-full h-44 object-cover rounded-t-xl"
                    src={
                      image ||
                      "https://cdn-icons-png.flaticon.com/512/3792/3792702.png"
                    }
                    alt={formatTitle(p.title || p.name)}
                  />
                  <span
                    className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full ${inStock
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                      }`}
                  >
                    {inStock ? "In Stock" : "Sold Out"}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-2 truncate px-2 w-full text-center">
                    {formatTitle(p.title || p.name)}
                  </h2>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {formatRupiah(p.price)}
                  </p>
                  <span className="mt-3 mb-4 inline-block rounded-md bg-indigo-500 px-4 py-2 text-white">
                    View details
                  </span>
                </article>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="home-swiper-pagination mt-4 flex justify-center" />
      <button
        aria-label="Previous"
        className="home-swiper-prev absolute left-2 top-[45%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 disabled:opacity-30 z-10"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        aria-label="Next"
        className="home-swiper-next absolute right-2 top-[45%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 disabled:opacity-30 z-10"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
