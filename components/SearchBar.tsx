"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, KeyboardEvent, KeyboardEventHandler, useState } from 'react'

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("search") || "");
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (query) {
            params.set("search", query); // Pasang ?search=keyword
        } else {
            params.delete("search"); // Hapus jika kosong
        }

        // 🚀 Pindahkan URL browser. Ini akan memicu Server Component untuk reload otomatis!
        router.push(`/products?${params.toString()}`);
    };
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.push(`/products?search=${encodeURIComponent(query)}`);
        }
    };
    return (
        <div className='flex justify-center mb-6 gap-2'>
            <input id="search-bar" className="w-full md:max-w-md border border-gray-300 bg-gray-50 rounded-lg text-gray-700 placeholder-gray-500 shadow px-4 " placeholder="Search products..." onKeyDown={(e) => onKeyDown(e)} value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <button
                onClick={handleSearch} // 💡 Aksi onClick di sisi Client
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >Search</button>
        </div>
    )
}

export default SearchBar;