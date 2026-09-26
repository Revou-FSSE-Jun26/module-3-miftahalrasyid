export function handleContactForm(): void {
    const form = document.getElementById("contactForm") as HTMLFormElement | null;

    // Menembak kedua elemen kontainer luar di HTML Anda
    // const marqueeContainer = document.getElementById("marqueeContainer");
    const messageboxFooter = document.getElementById("messageboxFooter");

    // Menembak tempat penampung teks dalam
    const marqueeContent = document.getElementById("marqueeContent");
    const marqueeContentNew = document.getElementById("marqueeContentFooter");

    // Jika form utama atau tempat teks lama tidak ada, hentikan skrip agar tidak error
    if (!form || !marqueeContent) return;

    // --- 1. DATA DEFAULT FEEDS ---
    const defaultFeeds = [
        { name: "Andi", email: "andi@gmail.com", msg: "Kualitas sepatu adidas di RovoDevShop original parah, mantap!" },
        { name: "Bagus", email: "bagus@gmail.com", msg: "Pengiriman kilat banget, pensil Faber Castell aman sampai tujuan." },
        { name: "Andien", email: "andien@gmail.com", msg: "Body wash Curel-nya wangi banget dan ramah buat kulit sensitif." }
    ];

    // Fungsi pembantu pembuat elemen teks kustom
    const createFeedItem = (name: string, email: string, msg: string, isFooter: boolean) => {
        const span = document.createElement("span");
        span.className = isFooter
            ? "text-sm font-medium tracking-wide inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex-shrink-0 mr-4 shadow-sm"
            : "text-sm font-medium tracking-wide flex items-center gap-2 bg-indigo-950/50 px-3 py-1 rounded border border-indigo-800 text-indigo-200 flex-shrink-0 mr-4";
        span.innerHTML = `<strong>${name}</strong> <span class="text-xs ${isFooter ? 'text-gray-400 dark:text-gray-500' : 'text-indigo-400'} font-normal">(${email})</span>: "${msg}"`;
        return span;
    };

    // --- 2. RE-RENDER DATA GANDA ---
    const renderAllFeeds = () => {
        marqueeContent.innerHTML = "";
        if (marqueeContentNew) marqueeContentNew.innerHTML = "";

        // Kloning data ganda untuk manipulasi putaran tanpa batas
        const doubleFeeds = [...defaultFeeds, ...defaultFeeds];

        doubleFeeds.forEach(feed => {
            marqueeContent.appendChild(createFeedItem(feed.name, feed.email, feed.msg, false));
            if (marqueeContentNew) {
                marqueeContentNew.appendChild(createFeedItem(feed.name, feed.email, feed.msg, true));
            }
        });
    };

    renderAllFeeds();

    // MUNCULKAN KEDUA CONTAINER HTML (Menukar opacity-0 menjadi opacity-100)
    // if (marqueeContainer) {
    //     marqueeContainer.classList.remove("opacity-0", "invisible");
    //     marqueeContainer.classList.add("opacity-100", "visible");
    // }
    const closeLiveFooterBtn = document.getElementById("closeLiveFooterBtn");
    const openLiveFooterBtn = document.getElementById("openLiveFooterBtn");

    if (messageboxFooter && closeLiveFooterBtn && openLiveFooterBtn) {

        // Fungsi pembantu terpusat untuk melakukan re-toggle bolak-balik
        const toggleLiveFooterView = () => {
            // PROSES UTAMA RUBRIK: Menggunakan .toggle() murni tanpa .add() atau .remove()
            messageboxFooter.classList.toggle("!h-0");
            messageboxFooter.classList.toggle("!opacity-0");
            messageboxFooter.classList.toggle("pointer-events-none");

            // Lakukan re-toggle juga pada visibilitas tombol panah atas (Chevron)
            openLiveFooterBtn.classList.toggle("hidden");
        };

        // A. KETIKA TOMBOL SILANG "X" DIKLIK (MENUTUP FEED)
        closeLiveFooterBtn.addEventListener("click", () => {
            toggleLiveFooterView(); // Memicu penutupan otomatis lewat .toggle()
        });

        // B. KETIKA TOMBOL PANAH "▲" DIKLIK (MEMBUKA KEMBALI FEED)
        openLiveFooterBtn.addEventListener("click", () => {
            toggleLiveFooterView(); // Membuka kembali lewat fungsi .toggle() yang sama
        });
    }

    // --- 3. RUNTIME JAVASCRIPT ANIMATION LOOP (INFINITE SEJATI) ---
    let speed = 1;
    let currentX = 0;
    let isPaused = false;

    function animateMarquee() {
        if (!isPaused) {
            currentX -= speed;

            // Ambil patokan lebar setengah dari total elemen terduplikasi
            const halfWidth = marqueeContent!.scrollWidth / 2;

            // Jika barisan teks Set A sudah habis keluar layar, kembalikan posisi ke 0 secara instan
            if (Math.abs(currentX) >= halfWidth) {
                currentX = 0;
            }

            // Jalankan pergeseran piksel ke kedua komponen secara bersamaan
            marqueeContent!.style.transform = `translateX(${currentX}px)`;
            if (marqueeContentNew) {
                marqueeContentNew.style.transform = `translateX(${currentX}px)`;
            }
        }
        requestAnimationFrame(animateMarquee);
    }

    // Jalankan mesin animasi
    requestAnimationFrame(animateMarquee);

    // EFEEK PAUSE ON HOVER
    marqueeContent.addEventListener("mouseenter", () => isPaused = true);
    marqueeContent.addEventListener("mouseleave", () => isPaused = false);
    if (marqueeContentNew) {
        marqueeContentNew.addEventListener("mouseenter", () => isPaused = true);
        marqueeContentNew.addEventListener("mouseleave", () => isPaused = false);
    }

    // --- 4. FORM EVENT SUBMIT ---
    form.addEventListener("submit", (e: SubmitEvent) => {
        e.preventDefault();

        const fullnameInput = document.getElementById("fullname") as HTMLInputElement;
        const emailInput = document.getElementById("email") as HTMLInputElement;
        const messageInput = document.getElementById("message") as HTMLTextAreaElement;

        if (!fullnameInput || !emailInput || !messageInput) return;

        // 1. AMBIL NILAI ASLI & UBAH KE HURUF KECIL
        let rawEmail = emailInput.value.trim().toLowerCase();

        // 2. NORMALISASI KHUSUS GMAIL (ANTI-DUPLIKASI)
        if (rawEmail.endsWith("@gmail.com")) {
            const parts = rawEmail.split("@");

            // PERBAIKAN UTAMA: Tambahkan [0] untuk mengambil string sebelum tanda @
            let username = parts[0];

            // A. Potong teks dari tanda "+" ke kanan jika ada (mif.tah+diskon -> mif.tah)
            username = username!.split("+")[0];

            // B. Hilangkan semua tanda titik "." menggunakan Regex (mif.tah -> miftah)
            username = username!.replace(/\./g, "");

            // Satukan kembali menjadi alamat Gmail murni yang bersih
            rawEmail = `${username}@gmail.com`;
        }

        // 3. VALIDASI STANDARD REGEX (Format universal tanpa backslash pengganggu)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!fullnameInput.value || !emailInput.value || !messageInput.value) {
            alert("⚠️ Semua kolom wajib diisi!");
            return;
        }

        if (!emailRegex.test(emailInput.value.trim().toLowerCase())) {
            emailInput.classList.add("border-pink-500", "text-pink-600");
            alert("❌ Format email tidak valid!");
            return;
        } else {
            emailInput.classList.remove("border-pink-500", "text-pink-600");
        }

        // 4. CEK DUPLIKASI NYATA DI ANTARA DATA YANG SUDAH TERSEDIA
        const isDuplicate = defaultFeeds.some(feed => {
            let existingEmail = feed.email.trim().toLowerCase();
            if (existingEmail.endsWith("@gmail.com")) {
                const p = existingEmail.split("@");
                let u = p[0]!.split("+")[0]!.replace(/\./g, ""); // Pastikan menggunakan p[0]
                existingEmail = `${u}@gmail.com`;
            }
            return existingEmail === rawEmail;
        });

        if (isDuplicate) {
            alert("❌ Maaf, alamat Gmail ini sudah mengirim pesan sebelumnya!");
            return;
        }

        // 5. DORONG PESAN BARU KE ARRAY LOKAL (Gunakan versi yang sudah dinormalisasi)
        defaultFeeds.unshift({
            name: fullnameInput.value,
            email: rawEmail,
            msg: messageInput.value
        });

        renderAllFeeds();
        alert("Pesan Anda berhasil masuk antrean sistem Infinite Loop! 🚀");
        form.reset();
    });
}