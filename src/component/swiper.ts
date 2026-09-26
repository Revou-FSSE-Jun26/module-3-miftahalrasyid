/// <reference types="vite/client" />
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Feature {
  name: string;
  description: string
}
export function siteStatistics(): void {
  const container = document.getElementById("apexCard");
  if (!container) {
    console.error("Elemen #apexCard tidak ditemukan di index.html");
    return;
  }

  // --- DATA KODE ANDA ---
  const monthlySalesReport = [
    { date: "Fri Sep 25 2026", product_id: 3, product_name: "adidas shoes", status: "sold", price: 2000000, totalQuantity: 200 },
    { date: "Fri Sep 27 2026", product_id: 4, product_name: "Faber Castell pencil", status: "sold", price: 6000, totalQuantity: 3000 },
    { date: "Fri Sep 21 2026", product_id: 5, product_name: "Apple Macbook 14 inch", status: "sold", price: 32000000, totalQuantity: 12 },
    { date: "Fri Sep 29 2026", product_id: 7, product_name: "Curel sensitive body wash", status: "sold", price: 130000, totalQuantity: 12000 },
    { date: "Fri Sep 30 2026", product_id: 9, product_name: "Lenovo Tactile Keyboard", status: "active", price: 500000, totalQuantity: 1000 },
    { date: "Fri Sep 15 2026", product_id: 9, product_name: "Lenovo Tactile Keyboard", status: "sold", price: 500000, totalQuantity: 500 },
    { date: "Fri Sep 12 2026", product_id: 2, product_name: "Novel gagasan Narasi dan Karya", status: "sold", price: 53000, totalQuantity: 100 },
  ];

  const monthlyTrafficSummary = [
    { date: "Tue Sep 01 2026", activeUsers: 65 }, { date: "Wed Sep 02 2026", activeUsers: 72 },
    { date: "Thu Sep 03 2026", activeUsers: 58 }, { date: "Fri Sep 04 2026", activeUsers: 84 },
    { date: "Sat Sep 05 2026", activeUsers: 110 }, { date: "Sun Sep 06 2026", activeUsers: 95 },
    { date: "Mon Sep 07 2026", activeUsers: 60 }, { date: "Tue Sep 08 2026", activeUsers: 63 },
    { date: "Wed Sep 09 2026", activeUsers: 68 }, { date: "Thu Sep 10 2026", activeUsers: 74 },
    { date: "Fri Sep 11 2026", activeUsers: 90 }, { date: "Sat Sep 12 2026", activeUsers: 115 },
    { date: "Sun Sep 13 2026", activeUsers: 102 }, { date: "Mon Sep 14 2026", activeUsers: 55 },
    { date: "Tue Sep 15 2026", activeUsers: 70 }, { date: "Wed Sep 16 2026", activeUsers: 64 },
    { date: "Thu Sep 17 2026", activeUsers: 71 }, { date: "Fri Sep 18 2026", activeUsers: 88 },
    { date: "Sat Sep 19 2026", activeUsers: 125 }, { date: "Sun Sep 20 2026", activeUsers: 130 },
    { date: "Mon Sep 21 2026", activeUsers: 78 }, { date: "Tue Sep 22 2026", activeUsers: 66 },
    { date: "Wed Sep 23 2026", activeUsers: 69 }, { date: "Thu Sep 24 2026", activeUsers: 73 },
    { date: "Fri Sep 25 2026", activeUsers: 92 }, { date: "Sat Sep 26 2026", activeUsers: 105 },
    { date: "Sun Sep 27 2026", activeUsers: 98 }, { date: "Mon Sep 28 2026", activeUsers: 61 },
    { date: "Tue Sep 29 2026", activeUsers: 67 }, { date: "Wed Sep 30 2026", activeUsers: 75 }
  ];

  // --- 1. KALKULASI DATA ---
  // Kalkulasi Users
  const totalUsers = monthlyTrafficSummary.reduce((sum, day) => sum + day.activeUsers, 0);
  const formattedUsers = totalUsers >= 1000 ? `${(totalUsers / 1000).toFixed(1)}k+`.replace('.0', '') : totalUsers.toString();
  const trafficPoints = monthlyTrafficSummary.map(day => day.activeUsers);

  // Kalkulasi Sales (Sesuai Logika Kode Anda)
  const grossRevenueSold = monthlySalesReport.filter(a => a.status.toLocaleLowerCase() === "sold").map(a => ({ ...a, grossRevenue: a.price * a.totalQuantity }));
  const totalMonthlyProductSold = grossRevenueSold.reduce((sum, day) => sum + day.totalQuantity, 0);
  const salesPoints = grossRevenueSold.map(item => item.totalQuantity); // Titik grafik untuk sales

  // Format angka sales (Misal: 15812 menjadi "15.8k+")
  const formattedSales = totalMonthlyProductSold >= 1000 ? `${(totalMonthlyProductSold / 1000).toFixed(1)}k+`.replace('.0', '') : totalMonthlyProductSold.toString();

  // --- 2. STRUKTUR COMPONENT (Ubah Menjadi Grid 2 Kolom) ---
  const htmlComponent = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-5 px-4 font-sans">
      
      <!-- KARTU 1: USERS TRAFFIC (LIGHT MODE) -->
      <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-[#e6dfda] rounded-2xl p-6 shadow-[0_8px_30px_rgba(225,213,201,0.3)]">
        <div class="flex flex-col">
          <span class="text-[13px] font-bold text-[#8c7e74] uppercase tracking-wider">Aktif Bulan Ini</span>
          <h3 id="hp-txt-users" class="text-3xl font-extrabold tracking-tight text-[#2d2521] my-1.5">${formattedUsers}</h3>
          <span class="text-[11px] text-[#a6968a] font-medium">Pengunjung sedang melihat katalog</span>
        </div>
        <div id="hp-chart-users" class="w-[140px] h-[55px] -mr-2.5"></div>
      </div>

      <!-- KARTU 2: TOTAL PRODUCT SOLD (LIGHT MODE) -->
      <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-[#e6dfda] rounded-2xl p-6 shadow-[0_8px_30px_rgba(225,213,201,0.3)]">
        <div class="flex flex-col">
          <span class="text-[13px] font-bold text-[#8c7e74] uppercase tracking-wider">Terjual Bulan Ini</span>
          <h3 id="hp-txt-sales" class="text-3xl font-extrabold tracking-tight text-[#2d2521] my-1.5">${formattedSales}</h3>
          <span class="text-[11px] text-[#a6968a] font-medium">Produk berhasil dikirim ke pembeli</span>
        </div>
        <div id="hp-chart-sales" class="w-[140px] h-[55px] -mr-2.5"></div>
      </div>

    </div>
  `;

  // Masukkan komponen baru ke dalam file HTML
  container.innerHTML = htmlComponent;
  const themeColor = '#e15241';
  // --- 3. KONFIGURASI GRAFIK APEXCHARTS ---
  const commonChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: '100%',
      width: '100%',
      sparkline: { enabled: true },
      animations: { speed: 800 }
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      colors: [themeColor]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
      }
    },
    tooltip: { enabled: false }
  };

  const chartsToRender = [
    { selector: "#hp-chart-users", data: trafficPoints, color: "#e15241" },
    { selector: "#hp-chart-sales", data: salesPoints, color: "#2962ff" }
  ];

  chartsToRender.forEach((item) => {
    const element: HTMLElement | null = document.querySelector(item.selector);
    if (element) {
      new ApexCharts(element, {
        ...commonChartOptions,
        stroke: { curve: 'smooth', width: 2.5, colors: [item.color] },
        series: [{ data: item.data }]
      }).render(); // <--- Ini adalah side-effect (menggambar ke layar)
    }
  });
}

export function initSwiperComponent() {
  const appDiv = document.querySelector<HTMLDivElement>('#mySwiper');

  if (!appDiv) {
    console.error("Elemen #mySwiper tidak ditemukan di DOM!");
    return;
  }

  interface Product {
    id: number,
    name: string,
    price: number,
    category: string,
    inStock: boolean
  }
  interface CartItem extends Product {
    quantity: number; // Properti tambahan khusus untuk keranjang belanja
  }

  // --- 1) DATA LAYER: at least 6 products (Product[]) ---
  const products: Product[] = [
    { id: 1, name: "Wireless Mouse", price: 250000, category: "Accessories", inStock: true },
    { id: 2, name: "Mechanical Keyboard", price: 500000, category: "Accessories", inStock: false },
    { id: 3, name: "Laptop Pro 14", price: 15000000, category: "Computers", inStock: true },
    { id: 4, name: "USB-C Hub", price: 150000, category: "Accessories", inStock: true },
    { id: 5, name: "Monitor", price: 2500000, category: "Accessories", inStock: true },
    { id: 6, name: "Webcam", price: 200000, category: "Accessories", inStock: true },
    // TODO: add 3+ more products (USB-C Hub, Monitor, Webcam, ...)
  ];
  let cartItems: CartItem[] = [];  // CartItem[]
  type BadgeVariant = "success" | "warning" | "error";
  function getBadgeClasses(variant: BadgeVariant) {
    const base = "text-xs font-semibold px-2 py-1 rounded-full";
    const variants: Record<BadgeVariant, string> = {
      // TODO: success -> green, warning -> yellow, error -> red
      success: "bg-green-100 text-green-500",
      warning: "bg-yellow-100 text-yellow-500",
      error: "bg-red-100 text-red-500",
    };
    console.log(base + " " + variants[variant])
    return base + " " + variants[variant];
  }

  function getCardClasses(inStock: Boolean) {
    const base = "bg-white rounded-xl shadow-md p-4 transition";
    // TODO: return base + " hover:shadow-xl" when inStock,
    //       otherwise base + " opacity-60 grayscale"
    console.log("base", base)
    return inStock ? base + " hover:shadow-xl" : base + " opacity-60 grayscale";
  }

  function formatRupiah(n: number) {
    return "Rp " + n.toLocaleString("id-ID");
  }
  function renderProducts(list: Product[]) {
    return list.map((p) => `
      <div class="swiper-slide">
        <article id="card-instock"  class="bg-gray-100 shadow-lg border border-gray-400 flex flex-col content-center items-center w-full max-w-[280px] md:w-[300px] h-fit m-auto rounded-xl ${getCardClasses(p.inStock)}">
          <img class="w-full h-44 object-none rounded-t-xl" src="https://cdn-icons-png.flaticon.com/512/3792/3792702.png"
                        alt="Laptop" />
          <span id="card-instock-badge" class="${getBadgeClasses(p.inStock ? "success" : "error")}">${p.inStock ? "In Stock" : "Sold Out"}</span>
          <h2 class="text-lg font-bold text-gray-900 mt-2 truncate">${p.name}</h2>
          <p class="text-xl font-bold text-blue-600 mt-1">${formatRupiah(p.price)}</p>
          <span class="text-xs"></span>
          <button data-id="${p.id}" class="add-btn bg-indigo-500 rounded-md text-white p-4 py-2 w-full mt-3">Add to cart</button>
        </article>
      </div>
    `).join("")
    // Each card: status badge (getBadgeClasses), truncated name, formatRupiah(price),
    // category, and a button with class "add-btn" and data-id="${p.id}".
  }

  let slides: Feature[] = [{
    name: "Feature 1",
    description: "feature 1 description"
  },
  {
    name: "Feature 2",
    description: "feature 2 description"
  },
  {
    name: "Feature 3",
    description: "feature 3 description"
  },
  {
    name: "Feature 4",
    description: "feature 4 description"
  },
  {
    name: "Feature 5",
    description: "feature 5 description"
  },
  ]

  let slidesHTML = slides.map(item => {
    return `
      <div class="swiper-slide">
      <div class="bg-gray-100 shadow-lg border border-gray-400 flex flex-col content-center items-center w-full max-w-[280px] md:w-[300px] h-[300px] m-auto rounded-xl">
            <img class="w-full h-44 object-none rounded-t-xl" src="https://cdn-icons-png.flaticon.com/512/3792/3792702.png"
                        alt="Laptop" />
            <p class="text-md font-bold text-black mt-1"> ${item.name}</p>
            <p class=" text-black mt-1"> ${item.description}</p>
            <button class="p-2  rounded-lg bg-gray-300 text-md text-black mt-3"> Learn More</button>
          </div>
      </div>
    `
  })

  // 1. Parse the Swiper structure straight into the app div
  appDiv.innerHTML = `
    <div class="my-slider h-[400px] md:mx-8">
      <!-- The slider container -->
      <div class="swiper-wrapper">
        <!-- The slides 
        <div class="swiper-slide">
          <div class="flex flex-col justify-center items-center w-full max-w-[280px] md:w-[300px] h-[300px] m-auto rounded-xl p-4 text-center">
            <h2 class="text-3xl font-bold text-center md:text-left pb-2"> Highlighted Features</h2>
            <p class=" text-black mt-1"> This is your what you get out of the box</p>
            <button class="p-2 invisible  rounded-lg bg-gray-300 text-md text-black mt-3"> Learn More</button>
            <button class="p-2 invisible  rounded-lg bg-gray-300 text-md text-black mt-3"> Learn More</button>
          </div>
        </div>-->
        ${renderProducts(products)}
        
      </div>
      
      <!-- Optional layout pieces (arrows and dots) -->
      <div class="swiper-pagination !top-96"></div>
      <button class="custom-prev absolute left-2 top-[55%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 disabled:opacity-30 z-10">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-4 w-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button class="custom-next absolute right-2 top-[55%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 disabled:opacity-30 z-10">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-4 w-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
  </div>
  `;
  // <div class="swiper-button-prev"></div>
  // <div class="swiper-button-next"></div>


  const sliderElement = appDiv.querySelector<HTMLDivElement>('.my-slider');
  const searchInput = document.querySelector<HTMLInputElement>("#search")

  if (!sliderElement) {
    console.error("Elemen .my-slider gagal di-inject ke dalam DOM!");
    return;
  }

  const swiper = new Swiper(sliderElement, {
    modules: [Navigation, Pagination],
    direction: 'horizontal',
    loop: false,
    // Konfigurasi Default (Berlaku untuk Mobile / layar terkecil)
    slidesPerView: 1,       // Menampilkan 1 slide di mobile
    spaceBetween: 10,       // Jarak antar slide 10px di mobile

    // Pengaturan Responsif berdasarkan lebar layar (Responsive Breakpoints)
    breakpoints: {
      // Ketika lebar layar >= 768px (Tablet / Desktop Kecil)
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      // Ketika lebar layar >= 1024px (Desktop Utama)
      1024: {
        slidesPerView: 3,   // Menampilkan 3 slide di desktop
        spaceBetween: 30,   // Jarak antar slide 30px agar rapi
      }
    },

    pagination: {
      el: '.swiper-pagination',
    },

    navigation: {
      nextEl: '.custom-next',
      prevEl: '.custom-prev',
      // nextEl: '.swiper-button-next',
      // prevEl: '.swiper-button-prev',
    },
  });
  function renderCart() {
    // TODO: derive totalItems and totalPrice from cartItems with reduce,
    //       then update #cart-count and #cart-total textContent.
    let cartCount = document.querySelector<HTMLElement>("#cart-count");
    let cartTotal = document.querySelector<HTMLElement>("#cart-total");
    if (cartCount) {
      cartCount.textContent = cartItems.reduce((count, cartItem) => count + cartItem.quantity, 0).toString()
    }
    if (cartTotal) {
      cartTotal.textContent = formatRupiah(cartItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0))
    }
  }

  // --- 5) ADD TO CART ---
  function addToCart(id: number) {
    // TODO: find product by id; ignore if missing or !inStock.
    //       if already in cartItems, quantity += 1; else push { product, quantity: 1 }.
    //       then renderCart().
    // const cart: Product[]
    const selectedProduct = products.find(a => a.id === id);
    if (!selectedProduct || !selectedProduct.inStock) return;
    if (selectedProduct) {
      let selectedProductExist = cartItems.find(a => a.id === id)
      if (selectedProductExist) {
        selectedProductExist.quantity++
      }
      else {
        cartItems.push({
          ...selectedProduct,
          quantity: 1
        });
      }
      console.log("cartitems", cartItems)
    }
    renderCart()
  }
  appDiv.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element) {
      const buttonElm = target.closest('.add-btn') as HTMLButtonElement | null;
      if (buttonElm && buttonElm.dataset.id) {

        // 4. Jalankan fungsi addToCart dengan mengonversi ID string menjadi Number
        addToCart(Number(buttonElm.dataset.id));

        // Opsional: Log untuk memastikan tombol yang diklik sudah benar
        console.log("Berhasil menambahkan produk dengan ID:", buttonElm.dataset.id);
      }

    }
  })
  function updateSwiperData(newProducts: Product[]) {
    // 1. Targetkan HANYA elemen pembungkus slide di dalam slider Anda
    const wrapper = document.querySelector<HTMLDivElement>('.my-slider .swiper-wrapper');

    if (!wrapper || !swiper) {
      console.error("Swiper belum diinisialisasi atau .swiper-wrapper tidak ditemukan!");
      return;
    }

    // 2. Ganti isinya saja menggunakan fungsi renderProducts bawaan Anda
    wrapper.innerHTML = renderProducts(newProducts);

    // 3. Panggil fungsi update bawaan Swiper JS
    // Ini akan menghitung ulang jumlah slide baru tanpa merusak tombol panah custom Anda
    swiper.update();
  }

  if (searchInput)
    searchInput.addEventListener("input", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        console.log(target.value)
        updateSwiperData(products.filter(p => p.name.toLowerCase().includes(target.value.toLowerCase())))
        // renderProducts(products.filter(p => p.name.toLowerCase().includes(target.value.toLowerCase())));
      }
    })

  return swiper
}

