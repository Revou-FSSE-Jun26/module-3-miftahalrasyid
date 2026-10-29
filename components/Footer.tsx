"use client";

import Link from "next/link";
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import DuoRoundedIcon from '@mui/icons-material/DuoRounded';
import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import { Typography } from "@mui/material";
interface FooterProps {
    type?: "SHOP" | "DASHBOARD"
}

export default function Footer({ type = "SHOP" }: FooterProps) {

    return (
        <footer className="bg-gray-100 border-t border-gray-100 mt-auto shadow-[0px_10px_15px_var(--tw-shadow-color)] shadow-blue-700">

            {type === "SHOP" && <div className="flex flex-wrap  gap-x-4 gap-y-4 px-7 sm:px-9 py-10 sm:justify-between">
                <div className="flex-shrink-0 flex flex-col w-full lg:w-auto items-left  mb-6">
                    <a href="#" className="text-xl font-bold text-gray-900 tracking-tight mb-2">
                        ⚡ Rovo<span className="text-indigo-600">Dev</span>Shop
                    </a>
                    <div className="md:text-left flex flex-col max-w-xl ">
                        <p className="text-gray-500 text-left md:text-left">
                            Get your favorite things here and get the best deal
                        </p>
                        <p className="text-gray-500 text-left md:text-left">
                            Win win solution for your online shopping experience
                        </p>
                    </div>
                </div>
                <div className="flex flex-col space-x-8  w-full sm:w-auto mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                        Shop
                    </h3>
                    <ul className="mt-1 space-y-1">
                        <li>
                            <Link href="/products" className="text-sm text-gray-500 hover:text-indigo-600">
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link href="/categories" className="text-sm text-gray-500 hover:text-indigo-600">
                                Categories
                            </Link>
                        </li>
                        <li>
                            <Link href="/cart" className="text-sm text-gray-500 hover:text-indigo-600">
                                My Cart
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col space-x-8  w-full sm:w-auto mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                        Account
                    </h3>
                    <ul className="mt-1 space-y-1">
                        <li>
                            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-indigo-600">
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link href="/auth/register" className="text-sm text-gray-500 hover:text-indigo-600">
                                Register
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="text-sm text-gray-500 hover:text-indigo-600">
                                My Order
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col space-x-8  w-full sm:w-auto">
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                        Contact
                    </h3>
                    <address>
                        <ul className="mt-1 space-y-2">
                            <li>
                                <Link href="https://mail.google.com/mail/u/?authuser=rasyidmiftah67@gmail.com" target="_BLANK" className="!text-sm text-gray-500 hover:text-indigo-600">
                                    <MailRoundedIcon fontSize="small" className="mr-2" />Email
                                </Link>
                            </li>
                            <li>
                                <Typography className="!text-sm text-gray-500 hover:text-indigo-600 ">
                                    <DuoRoundedIcon className="mr-1" />
                                    +62 877-2208-3048
                                </Typography>
                            </li>
                            <li>
                                <Typography className="!text-sm text-gray-500 hover:text-indigo-600 ">
                                    <AccountBoxRoundedIcon className="mr-1" />
                                    <Link href="https://www.linkedin.com/in/muhammad-miftah-al-rasyid-skom-mm-38a743b7/" className="text-sm text-gray-500 hover:text-indigo-600">
                                        LinkedIn
                                    </Link>
                                </Typography>
                            </li>
                        </ul>
                    </address>
                </div>
            </div>}

            <div className="flex flex-col max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">

                <div
                    className={`pt-8 flex flex-col sm:flex-row items-center ${type === "SHOP" ? "justify-between border-t border-gray-200" : "justify-end gap-3"} space-y-4 sm:space-y-0 `}>
                    <p className="text-xs text-gray-400">
                        &copy; 2026 RovoDevShop. All rights reserved.
                    </p>

                    <div className="flex space-x-6">
                        <a href="https://github.com/miftahalrasyid" className="text-gray-400 hover:text-indigo-600 transition">
                            <span className="sr-only">GitHub</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    clipRule="evenodd" />
                            </svg>
                        </a>

                    </div>
                </div>

            </div>
        </footer>
    )
}