"use server";
import { getSession } from "@/app/lib/sessions";
import HeaderClient from "./HeaderClient";
import { logger } from "@/utils/logger";

export default async function Header() {
    const session = await getSession();
    const isLoggedIn = !!session?.isAuthenticated;
    const roles = session?.roles ?? [];
    // logger.info(session, "session catch")

    return <HeaderClient isLoggedIn={isLoggedIn} email={session?.email} roles={roles} />;
}
