"use client"
import { useState } from "react";
import { logger } from "@/utils/logger";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { logout as logoutAction } from "@/app/actions/auth.actions"

function HeaderClient({ isLoggedIn }: HeaderClientProps) {
    const pathname = usePathname();
    const navMenus = [
        { path: "/", file: 'app/page.tsx', name: "Home" },
        { path: "/products", file: 'app/products/page.tsx', name: "Products" },
        { path: "/categories", file: 'app/categories/page.tsx', name: "Categories" },
        { path: "/orders", file: 'app/orders/page.tsx', name: "Orders" },
        { path: "/cart", name: "Cart" },
        { path: "/about", name: "About" },
    ]
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const openMenu = () => {
        setIsMenuOpen(true);
    }
    const closeMenu = () => {
        setIsMenuOpen(false);
    }
    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <div className="flex-shrink-0 flex items-center">
                        <a href="#" className="text-xl font-bold text-gray-900 tracking-tight">
                            ⚡ Rovo<span className="text-indigo-600">Dev</span>Shop
                        </a>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        <ul className="flex gap-7">
                            {navMenus.map((menu, index) => {
                                const active = pathname === menu.path;
                                return <li key={index} ><NavMenus href={menu.path} active={active}>{menu.name}</NavMenus></li>
                            })}
                        </ul>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <form action={logoutAction} className="hidden md:block">
                                <button type="submit" className="px-4 py-1 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md text-sm text-red-500 hover:text-red-600 font-medium transition">
                                    Logout
                                </button>
                            </form>
                        ) : (
                            <Link href="/auth/login" className="hidden md:block px-4 py-1 bg-indigo-500 hover:bg-indigo-600 rounded-md text-sm text-white font-medium transition">
                                Sign in
                            </Link>
                        )}

                        <button id="menu-btn" onClick={openMenu} className="md:hidden p-2 text-gray-500 hover:text-gray-900 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>

            <div id="mobile-menu"
                className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}>

                <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900">⚡ Menu</span>
                    <button id="close-btn" onClick={closeMenu} className="p-2 text-gray-500 hover:text-gray-900 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
                    {navMenus.map((menu, index) => {
                        const active = pathname === menu.path;
                        return <NavMenus key={index} href={menu.path} active={active} mobile>{menu.name}</NavMenus>
                    })}
                    <div className="pt-6 border-t border-gray-100">
                        {isLoggedIn ? (
                            <button
                                onClick={() => { logoutAction(); closeMenu(); }}
                                className="block text-center w-full py-3 bg-red-500 hover:bg-red-600 rounded-md text-white font-medium transition"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/auth/login" onClick={closeMenu} className="block text-center w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white font-medium transition">
                                Sign in
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}
interface HeaderClientProps {
    isLoggedIn: boolean;
}
interface HeaderNavProps {
    href: string,
    children: string,
    active?: boolean,
    mobile?: boolean
}

function NavMenus(props: HeaderNavProps) {
    let base = "text-sm font-medium transition "
    if (props.mobile) {
        base = "block text-2xl font-semibold transition "
    }
    logger.debug("NavMenus active")
    if (!props.active) {
        return <Link href={props.href} className={base + "text-gray-500  hover:text-indigo-600"}>{props.children}</Link>
    }
    return <Link href={props.href} className={base + "text-gray-900"}>{props.children}</Link>
}

export default HeaderClient
