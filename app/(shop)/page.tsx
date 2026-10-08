import {
  getCatalogues,
  getPopularCatalogues,
} from "@/app/actions/catalog.actions";
import { FeaturedShowcase } from "@/components/home/FeaturedShowcase";
import { StatsCards } from "@/components/home/StatsCards";
import { AboutFeedback } from "@/components/home/AboutFeedback";

export const metadata = {
  title: "RovoDevShop — Get your favorite things, best deal",
  description:
    "A trusted marketplace where sellers and buyers meet. Browse the most popular products and start shopping.",
};

// Full-bleed helper: break a section out of the centered container to span the
// whole viewport width (matches the checkpoint1 -mx-[50vw] w-screen trick).
const fullBleed =
  "relative left-1/2 right-1/2 -mx-[50vw] w-screen";

export default async function Home() {
  const [popular, allProducts] = await Promise.all([
    getPopularCatalogues(5),
    getCatalogues(),
  ]);
  // Swiper holds exactly 5 (3 visible on desktop, swipe for the rest).
  // Fall back to the general catalog if the popular list is empty.
  const showcase = (popular.length ? popular : allProducts).slice(0, 5);

  return (
    <div className="flex flex-col font-sans text-gray-900">
      {/* HERO */}
      <section
        id="Home"
        className={`${fullBleed} grid grid-cols-1 md:grid-cols-2 items-center p-6 md:px-12 gap-8`}
      >
        <div className="text-center md:text-left flex flex-col justify-center max-w-xl mx-auto md:mx-0 md:pl-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left pb-2">
            Get your favorite things here and get the best deal
          </h1>
          <p className="text-gray-500 text-center md:text-left mb-8">
            Win win solution for your online shopping experience
          </p>
        </div>
        <div className="flex justify-center items-center w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/static/web-illustration.png"
            alt="Product carousel illustration"
            className="w-full max-w-md md:max-w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* STATS + POPULAR PRODUCTS SWIPER (full-bleed sand band) */}
      <section id="features" className={`${fullBleed} bg-[#E5E1DA] py-16 md:py-20`}>
        <h2 className="text-3xl font-bold text-center text-gray-900 pt-2">
          Highlighted Statistics
        </h2>
        <p className="text-gray-500 text-center mb-10">
          how many active users and products sold this month
        </p>

        <StatsCards />

        <h2 className="text-3xl font-bold text-center text-gray-900 pt-10">
          Popular sold products
        </h2>
        <p className="text-gray-500 text-center mb-10">our best-selling listings right now</p>

        <FeaturedShowcase products={showcase} />
      </section>

      {/* ABOUT ME + FEEDBACK FORM + LIVE FEEDBACK BAR */}
      <AboutFeedback />
    </div>
  );
}
