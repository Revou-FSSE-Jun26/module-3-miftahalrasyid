"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

interface Feed {
  name: string;
  email: string;
  msg: string;
}

const DEFAULT_FEEDS: Feed[] = [
  { name: "Andi", email: "andi@gmail.com", msg: "Kualitas sepatu adidas di RovoDevShop original parah, mantap!" },
  { name: "Bagus", email: "bagus@gmail.com", msg: "Pengiriman kilat banget, pensil Faber Castell aman sampai tujuan." },
  { name: "Andien", email: "andien@gmail.com", msg: "Body wash Curel-nya wangi banget dan ramah buat kulit sensitif." },
];

function normalizeGmail(raw: string): string {
  let email = raw.trim().toLowerCase();
  if (email.endsWith("@gmail.com")) {
    let username = email.split("@")[0] ?? "";
    username = username.split("+")[0] ?? "";
    username = username.replace(/\./g, "");
    email = `${username}@gmail.com`;
  }
  return email;
}

/**
 * About-me section + feedback form (on the 3D gray underlayer) and the
 * full-width Live Feedback marquee bar at the bottom. Markup/classes mirror
 * checkpoint1's index.html so the output matches. Submitting the form pushes a
 * new message into the scrolling marquee.
 */
export function AboutFeedback() {
  const [feeds, setFeeds] = useState<Feed[]>(DEFAULT_FEEDS);
  const [footerOpen, setFooterOpen] = useState(true);
  const footerContentRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const doubled = [...feeds, ...feeds];

  // Infinite marquee loop (ported from checkpoint1 contactform.ts).
  useEffect(() => {
    let x = 0;
    let raf = 0;
    const speed = 1;
    const step = () => {
      const el = footerContentRef.current;
      if (!pausedRef.current && el) {
        x -= speed;
        const half = el.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        el.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [feeds]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fullname = String(data.get("fullname") || "").trim();
    const rawEmail = String(data.get("email") || "");
    const message = String(data.get("message") || "").trim();

    if (!fullname || !rawEmail || !message) {
      alert("⚠️ Semua kolom wajib diisi!");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rawEmail.trim().toLowerCase())) {
      alert("❌ Format email tidak valid!");
      return;
    }
    const normalized = normalizeGmail(rawEmail);
    if (feeds.some((f) => normalizeGmail(f.email) === normalized)) {
      alert("❌ Maaf, alamat Gmail ini sudah mengirim pesan sebelumnya!");
      return;
    }
    setFeeds((prev) => [{ name: fullname, email: normalized, msg: message }, ...prev]);
    form.reset();
    alert("Pesan Anda berhasil masuk antrean sistem Infinite Loop! 🚀");
  };

  const pause = () => (pausedRef.current = true);
  const resume = () => (pausedRef.current = false);

  return (
    <>
      {/* ABOUT ME + FEEDBACK FORM (checkpoint1 classes) */}
      <section
        id="about-me"
        className="grid grid-cols-1 md:grid-cols-2 items-center p-6 md:p-9 md:py-64 gap-8 relative left-1/2 right-1/2 -mx-[50vw] w-screen min-h-[700px] md:overflow-hidden"
      >
        <div className="text-center md:text-left flex flex-col justify-center max-w-xl mx-auto md:mx-0">
          <p className="text-indigo-600 font-bold text-center md:text-left mb-2">
            Hi, I am Miftah
          </p>
          <h2 className="text-3xl font-bold text-gray-900 text-center md:text-left pb-2">
            I am a Creative Engineer
          </h2>
          <p className="text-center md:text-left mb-2 text-gray-700">
            {/* TODO: personal bio goes here */}
            Short bio coming soon.
          </p>
        </div>

        <div className="perspective-[1000px] transform-3d relative md:static [@media(max-width:767px)]:left-1/2 [@media(max-width:767px)]:-translate-x-1/2 [@media(max-width:767px)]:w-screen">
          {/* Gray diagonal underlayer */}
          <div className="absolute w-screen h-full bg-[#d5dde0] md:[transform:rotateY(-53deg)_translate(-19vw,0px)_scale(calc(19vw/11vh))]" />

          <p className="text-lg font-medium text-center md:text-left text-black mx-6 my-3 translate-z-2">
            Any feedback? Drop your thoughts in the box.
          </p>
          <form onSubmit={handleSubmit} className="translate-z-2 m-6 max-w-xl">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-800">Fullname</label>
              <div className="mt-1">
                <input id="fullname" name="fullname" type="text"
                  className="block w-full rounded-md border border-gray-700 px-3 py-2 placeholder-gray-400 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 sm:text-sm text-gray-900" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label>
              <div className="mt-1">
                <input id="email" name="email" type="email"
                  className="block w-full rounded-md border border-gray-700 px-3 py-2 placeholder-gray-400 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 sm:text-sm text-gray-900" />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-800">Message</label>
              <div className="mt-1">
                <textarea id="message" name="message"
                  className="block w-full rounded-md border border-gray-700 px-3 py-2 placeholder-gray-400 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 sm:text-sm text-gray-900" />
              </div>
            </div>
            <button type="submit" className="bg-indigo-500 mt-3 px-6 py-2 rounded-lg text-white hover:bg-indigo-600 transition">
              Submit
            </button>
          </form>
        </div>
      </section>

      {/* FULL-WIDTH LIVE FEEDBACK BAR (checkpoint1 messageboxFooter) */}
      <section
        className={`w-full bg-gray-100 dark:bg-[#141519] border-y border-gray-200 dark:border-[#22252a] text-gray-800 dark:text-white font-sans overflow-hidden flex items-center transition-all duration-500 ease-in-out relative left-1/2 right-1/2 -mx-[50vw] w-screen ${
          footerOpen ? "h-24" : "h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative flex items-center justify-between">
          <div className="flex flex-col items-center space-y-3 w-full text-center pr-12">
            <span className="flex items-center bg-gray-800 dark:bg-gray-700 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded text-white flex-shrink-0 animate-pulse">
              💬 Live Feedback
            </span>
            <div
              ref={footerContentRef}
              onMouseEnter={pause}
              onMouseLeave={resume}
              className="flex items-center whitespace-nowrap space-x-12 w-full"
            >
              {doubled.map((f, i) => (
                <span
                  key={`feed-${i}`}
                  className="text-sm font-medium tracking-wide inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex-shrink-0 mr-4 shadow-sm"
                >
                  <strong>{f.name}</strong>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">({f.email})</span>
                  : &quot;{f.msg}&quot;
                </span>
              ))}
            </div>
          </div>

          {/* Close X */}
          <div className="absolute right-4 sm:right-6 lg:right-8 -translate-y-[1.5rem] z-30">
            <button
              onClick={() => setFooterOpen(false)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center shadow-sm"
              title="Tutup Live Feed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Re-open button when closed */}
      {!footerOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <button
            onClick={() => setFooterOpen(true)}
            className="absolute right-4 sm:right-6 lg:right-8 -top-5 z-40 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center animate-bounce"
            title="Buka Kembali Live Feed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
