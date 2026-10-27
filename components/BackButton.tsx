"use client"
import Link from 'next/link';
// import React from 'react'
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";
function BackButton() {
    const router = useRouter();
    return (
        <Link
            href="#"
            onClick={(e) => {
                e.preventDefault(); // 🌟 Mencegah browser melompat ke '#'
                router.back();      // 🌟 Menjalankan fungsi kembali ke halaman sebelumnya
            }}
            className="text-blue-500 hover:underline"
        >
            <ArrowBack className="text-gray-600" fontSize="small" />
        </Link>
    )
}

export default BackButton