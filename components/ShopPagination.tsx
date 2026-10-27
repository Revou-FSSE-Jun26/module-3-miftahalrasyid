"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Pagination as MuiPagination, Box } from "@mui/material";

interface PaginationProps {
    page: number;
    perPage: number;
    total: number;
    basePath: string;
    query?: Record<string, string | undefined>;
}

export function Pagination({
    page,
    perPage,
    total,
    basePath,
    query = {},
}: PaginationProps) {
    const router = useRouter();

    // 1. Calculate total pages dynamically based on your props
    const calculatedPages = Math.max(1, Math.ceil(total / perPage));
    const totalPages = Math.min(calculatedPages, 99);
    if (totalPages <= 1) return null;
    // 2. Build the destination URL strings safely
    const createTargetUrl = (targetPage: number) => {
        // Standarisasi basePath: hapus trailing slash jika ada di ujung path
        const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

        // Inisialisasi search params dari URL
        const searchParams = new URLSearchParams();

        // Masukkan nomor halaman baru sebagai query parameter (?page=X)
        searchParams.set("page", String(targetPage));

        // Satukan dengan query string tambahan lainnya (seperti search, sort, dll) jika dikirim via props
        Object.entries(query).forEach(([key, value]) => {
            // Hindari duplikasi key 'page' dari objek query eksternal
            if (key !== "page" && value !== undefined && value !== null && value !== "") {
                searchParams.append(key, value);
            }
            if (key !== "category" && value !== undefined && value !== null && value !== "") {
                searchParams.append(key, value);
            }
        });

        // Hasil akhir: /products?page=2 (atau /products?page=2&search=sepatu)
        return `${cleanBasePath}?${searchParams.toString()}`;
    };


    // 3. Fire Next.js router on click mutation
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        const targetUrl = createTargetUrl(value);
        router.push(targetUrl);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <MuiPagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                // variant="outlined"
                // shape="rounded"
                showFirstButton
                showLastButton
                sx={{
                    "& .MuiPaginationItem-root": {
                        transition: "all 0.2s ease-in-out",
                        "&:active": {
                            transform: "scale(0.95)", // Tactile app-like micro-interaction
                        },
                    },
                    "& .Mui-selected": {
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)", // Premium ambient drop shadow glow
                    },
                }}
            />
        </Box>
    );
}
