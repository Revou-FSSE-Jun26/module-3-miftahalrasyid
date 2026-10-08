import { getSession } from "@/app/lib/sessions";
import { CartView } from "@/components/CartView";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cart",
  description: "Review your cart and check out.",
};

export default async function CartPage() {
  // Auth-only: send guests to login, preserving where they wanted to go.
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/cart");
  }

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Your Cart
      </h1>
      <p className="text-gray-500 mb-8">Review items and proceed to checkout.</p>

      <CartView />
    </div>
  );
}
