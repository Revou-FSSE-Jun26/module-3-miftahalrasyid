"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { ListItemButton, ListItemIcon, Badge, ListItemText } from '@mui/material'
import { RoleSwitcher, type Area } from "./RoleSwitcher";
import { usePathname } from "next/navigation";

interface UserDropdownProps {
    userEmail?: string | null;
    roles: string[];
    types?: "spread" | "icon";
    currentArea: Area;
    onLogout: () => Promise<void> | void;
}

export default function UserDropdown({ userEmail = "user@example.com", roles, onLogout, currentArea, types = "icon" }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    // Close the popup automatically if clicking outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* User Avatar Button */}
            {types === "spread" ?
                <div
                    tabIndex={0} /* 1. Necessary so the parent can capture focus states */
                    className={`group flex align-middle gap-1 items-center outline-none cursor-pointer rounded-2xl transition   hover:bg-gray-300  bg-gray-200`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <button
                        type="button"
                        tabIndex={-1} /* 2. Prevents double-tabbing into the button since the div handles it */
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition hover:bg-blue-700 outline-none transition-all group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2 group-focus:ring-2 group-focus:ring-blue-500 group-focus:ring-offset-2"
                    >
                        {userEmail && userEmail[0].toUpperCase()}
                    </button>

                    {/* 3. Changed to an unstyled button so text clicks register focus perfectly */}
                    <button
                        type="button"
                        className="text-left text-gray-700 cursor-pointer px-3 py-2 group-hover:text-gray-900  outline-none w-full"
                    >
                        {userEmail}
                    </button>
                </div> :
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    type="button"
                    tabIndex={-1} /* 2. Prevents double-tabbing into the button since the div handles it */
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition hover:bg-blue-700 outline-none transition-all group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2 group-focus:ring-2 group-focus:ring-blue-500 group-focus:ring-offset-2"
                >
                    {userEmail && userEmail[0].toUpperCase()}
                </button>
            }


            {/* Popup Menu */}
            {
                isOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none dark:border-gray-800 dark:bg-gray-900 z-50">
                        {/* User Info Header */}
                        <div className="px-3 py-2 text-xs border-b border-gray-100 dark:border-gray-800 mb-1">
                            <p className="text-gray-400">Signed in as</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{userEmail}</p>
                        </div>
                        {roles.length > 1 && <div className="px-3 py-1.5 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <label className="block text-[11px] font-medium text-gray-400 mb-1">
                                Switch Layout View:
                            </label>
                            {/* Render the component exactly as you built it */}
                            <RoleSwitcher roles={roles} currentArea={currentArea} />
                        </div>}
                        {/* Navigation Links */}
                        {/* <div className="space-y-0.5"> */}
                        <Link
                            href="/my-account"
                            onClick={() => setIsOpen(false)}
                            /* 🚀 Changed to w-full and matched padding with the second link */
                            className="flex w-full items-center rounded-lg p-0 text-sm text-gray-700 transition dark:text-gray-300"
                        >
                            <ListItemButton
                                selected={pathname === "/my-account"}
                                aria-current={pathname === "/my-account" ? "page" : undefined}
                                className="w-full rounded-lg" /* Ensures the internal UI button fills the link space */
                            >
                                <ListItemIcon>
                                    <PersonRoundedIcon />
                                </ListItemIcon>
                                <ListItemText primary="My Account" />
                            </ListItemButton>
                        </Link>

                        <Link
                            href="/orders"
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center rounded-lg p-0 text-sm text-gray-700 transition dark:text-gray-300"
                        >
                            <ListItemButton
                                selected={pathname === "/orders"}
                                aria-current={pathname === "/orders" ? "page" : undefined}
                                className="w-full rounded-lg"
                            >
                                <ListItemIcon>
                                    <LocalShippingRoundedIcon />
                                </ListItemIcon>
                                <ListItemText primary="My Orders" />
                            </ListItemButton>
                        </Link>
                        {/* </div> */}

                        {/* Logout Action Button */}
                        <div className="mt-1 border-t border-gray-100 dark:border-gray-800 pt-1">
                            <ListItemButton
                                /* 1. Add your click handlers directly here */
                                onClick={() => {
                                    setIsOpen(false);
                                    onLogout();
                                }}
                                /* 2. Combine your structural classes and color styles */
                                className="w-full rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                            >
                                <ListItemIcon className="text-red-600 dark:text-red-400">
                                    <LogoutRoundedIcon color="error" />
                                </ListItemIcon>

                                {/* 3. Pass styling classes to style the text label directly if needed */}
                                <ListItemText
                                    primary="Logout"
                                    slotProps={{ primary: { className: "text-red-600 font-medium text-sm" } }}
                                />
                            </ListItemButton>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
