/// <reference types="vite/client" />
import { formatPrice, logger } from "./utils.js";
import { initSwiperComponent, siteStatistics } from "./component/swiper.js"
import { handleContactForm } from './component/contactform.js';
// ============================================================
// Your first TypeScript file (src/app.ts)
// On your machine you would compile this with:  tsc
// Here, Run Code shows the SAME output the generated .js produces.
// ============================================================
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG_MODE === 'true';

logger.debug("Connected to API:", apiUrl);

if (isDebug) {
    logger.debug("Executing in local debug mode!");
}

export { };
// A typed greeting — note the : string annotations
const courseName: string = "Full Stack Software Engineering";
const weekNumber: number = 2;
const isTypeScriptWeek: boolean = true;


function describeCourse(name: string, week: number): string {
    return `${name} — Week ${week}`;

}

logger.info(describeCourse(courseName, weekNumber));
logger.info("Is this the TypeScript week?", isTypeScriptWeek);

// TODO: add a constant studentCount of type number and log it
// TODO: call describeCourse again with week + 1 and log the result

// ============================================================
// Rewrite Day-3's three functions WITH TypeScript types.
// Add parameter types and a return type to each one.
// On your machine: run `tsc` and fix every error before submitting.
// ============================================================

// TODO 1: formatPrice — takes a number, returns a STRING


// TODO 2: calculateDiscount — two numbers in, a NUMBER out
const calculateDiscount = (price: number, percent: number): number => {
    return price * (percent / 100);
};

// TODO 3: isAffordable — two numbers in, a BOOLEAN out
const isAffordable = (price: number, budget: number): boolean => {
    return price <= budget;
};

// TODO 4: logResult — returns nothing → annotate the return type as void
function logResult(label: string, value: string): void {
    logger.debug(label + ": " + value);
}

// --- Test your typed functions ---
const price: number = 15000000;
logger.debug("Formatted:", formatPrice(price));                 // "Rp 15.000.000"
logger.debug("Discount (20%):", calculateDiscount(price, 20));  // 3000000
logger.debug("Affordable on 10M?", isAffordable(price, 10000000)); // false

// Prove the RETURN TYPES with typeof
logger.debug("Types →",
    typeof formatPrice(price),            // "string"
    typeof calculateDiscount(price, 20),  // "number"
    typeof isAffordable(price, 10000000)  // "boolean"
);

// TODO 5 (local editor): calculateDiscount("laptop", 20) → run tsc → read & fix the error

// const menuBtn: HTMLElement | null = document.getElementById('menu-btn');
// const mobileMenu: HTMLElement | null = document.getElementById('mobile-menu');
// logger.debug("clicked")
// logger.debug(document.getElementById("mobile-menu"))
// menuBtn && menuBtn.addEventListener('click', () => {
//     console.log("clicked")
//     // toggle class 'hidden' untuk memunculkan/menyembunyikan menu
//     mobileMenu && mobileMenu.classList.toggle('hidden');
// });

handleContactForm();
initSwiperComponent();
siteStatistics();
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement | null;
    const closeBtn = document.getElementById('close-btn') as HTMLButtonElement | null;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement | null;

    if (menuBtn && closeBtn && mobileMenu) {
        // Fungsi membuka menu (menghapus class transisi geser kiri)
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full');
            document.body.classList.add('overflow-hidden'); // Kunci scroll halaman belakang
        });

        // Fungsi menutup menu (mengembalikan class transisi geser kiri)
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.add('-translate-x-full');
            document.body.classList.remove('overflow-hidden'); // Lepas kunci scroll
        });
    }
});