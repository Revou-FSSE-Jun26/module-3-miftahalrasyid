"use client";

import { SellerProduct } from "@/app/actions/catalog.actions";
import { formatRupiah, formatTitle } from "@/utils/format";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface FeaturedShowcaseProps {
  products: SellerProduct[];
}

/**
 * Home carousel of the most popular (most-ordered) products.
 * Each card links to the product detail page — no cart logic.
 */
export function FeaturedShowcase({ products }: FeaturedShowcaseProps) {
  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No products to show yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mt-4 relative">
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={10}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          pagination={{ el: ".featured-pagination" }}
          navigation={{ nextEl: ".featured-next", prevEl: ".featured-prev" }}
          className="h-[400px]"
        >
          {products.map((p) => {
            const inStock = p.stock > 0;
            const image = p.images?.[0];
            return (
              <SwiperSlide key={p.id}>
                <a href={`/products/${p.id}`} className="block">
                  <article
                    className={`bg-white shadow-lg border border-gray-300 flex flex-col items-center w-full max-w-[280px] md:w-[300px] m-auto rounded-xl overflow-hidden cursor-pointer ${inStock ? "hover:shadow-xl transition" : "opacity-60 grayscale"
                      }`}
                  >
                    {image ? (
                      <img
                        className="w-full h-44 object-cover"
                        src={image}
                        alt={formatTitle(p.title || p.name)}
                      />
                    ) : (
                      // Gradient placeholder when the product has no image
                      <div
                        className="w-full h-44"
                        style={{
                          background:
                            "linear-gradient(160deg,#f6e7df 0%,#f6e7df 45%,#e4675a 46%,#d9534a 100%)",
                        }}
                      />
                    )}
                    <span
                      className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full ${inStock
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {inStock ? "In Stock" : "Sold Out"}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mt-2 truncate px-2 w-full text-center">
                      {formatTitle(p.title || p.name)}
                    </h2>
                    <p
                      className={`text-xl font-bold mt-1 mb-4 ${inStock ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                      {formatRupiah(p.price)}
                    </p>
                  </article>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="featured-pagination mt-4 flex justify-center" />
        <button
          aria-label="Previous"
          className="featured-prev absolute left-2 top-[45%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 z-10"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          aria-label="Next"
          className="featured-next absolute right-2 top-[45%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 z-10"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
