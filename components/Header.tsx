"use server";
import { getSession } from "@/app/lib/sessions";
import HeaderClient from "./HeaderClient";

export default async function Header() {
    const session = await getSession();
    const isLoggedIn = !!session?.isAuthenticated;
    const roles = session?.roles ?? [];

    return <HeaderClient isLoggedIn={isLoggedIn} roles={roles} />;
}
