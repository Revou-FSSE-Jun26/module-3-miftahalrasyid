"use client"
import React from 'react'
import { Breadcrumbs, Typography } from "@mui/material";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
function Crumbs() {
    const pathname = usePathname(); // Mengambil URL mentah, misal: "/orders/detail"

    // 1. Memecah URL berdasarkan tanda "/" dan membuang elemen kosong
    // Hasil untuk "/orders/detail" -> ["orders", "detail"]
    const pathSegments = pathname.split('/').filter((segment) => segment !== '');

    return (
        <Breadcrumbs aria-label="breadcrumb">
            {/* Link default yang selalu ada di awal */}
            {/* <Link className="relative z-10 pointer-events-auto hover:underline text-gray-600" href="/products"> */}
            <Typography >
                Home
            </Typography>
            {/* </Link> */}

            {/* 2. Looping segmen URL secara otomatis */}
            {pathSegments.map((segment, index) => {
                // Membuat URL tujuan secara bertahap (misal: /orders, lalu /orders/detail)
                const href = '/' + pathSegments.slice(0, index + 1).join('/');

                // Cek apakah ini segmen terakhir di URL
                const isLast = index === pathSegments.length - 1;

                // Format teks: Mengubah huruf pertama menjadi Kapital (orders -> Orders)
                const formattedText = segment.charAt(0).toUpperCase() + segment.slice(1);

                return isLast ? (
                    // Halaman aktif saat ini ditampilkan sebagai teks biasa (tidak bisa diklik)
                    <Typography key={href} className='w-40 whitespace-nowrap text-ellipsis !overflow-hidden' sx={{ color: 'text.primary' }}>
                        {formattedText.replaceAll("-", " ")}
                    </Typography>
                ) : (
                    // Halaman sebelumnya ditampilkan sebagai Link yang bisa diklik kembali
                    <Link key={href} className='hover:text-blue-700' color="inherit" href={href}>
                        {formattedText}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
}

export default Crumbs