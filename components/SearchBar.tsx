"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, KeyboardEvent, KeyboardEventHandler, useState } from 'react'

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (query) {
            params.set("q", query); // Pasang ?q=keyword
        } else {
            params.delete("q"); // Hapus jika kosong
        }

        // 🚀 Pindahkan URL browser. Ini akan memicu Server Component untuk reload otomatis!
        router.push(`/products?${params.toString()}`);
    };
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // TODO Step 2: push to /products?search=<query>
            router.push(`/products?q=${encodeURIComponent(query)}`);
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