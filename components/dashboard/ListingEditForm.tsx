"use client";

import { SellerProduct } from "@/app/actions/catalog.actions";
import {
  updateListing,
  type UpdateListingInput,
} from "@/app/actions/seller.actions";
import { formatTitle } from "@/utils/format";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface FormState {
  title: string;
  price: string;
  stock: string;
  sku: string;
  status: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(data: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = "Title is required.";
  if (!data.price.trim()) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = "Price must be a number of 0 or more.";
  }
  if (data.stock.trim()) {
    const n = Number(data.stock);
    if (!Number.isInteger(n) || n < 0) {
      errors.stock = "Stock must be a whole number of 0 or more.";
    }
  }
  return errors;
}

export function ListingEditForm({ listing }: { listing: SellerProduct }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: listing.title || "",
    price: String(listing.price ?? ""),
    stock: String(listing.stock ?? ""),
    sku: listing.sku || "",
    status: listing.status,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Seller may only toggle ACTIVE<->INACTIVE. Other statuses are shown but
  // not selectable (admin-controlled).
  const sellerToggleable =
    listing.status === "ACTIVE" || listing.status === "INACTIVE";

  const update =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setNotice(null);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: UpdateListingInput = {
      title: form.title.trim(),
      price: Number(form.price),
      stock: form.stock.trim() ? Number(form.stock) : 0,
      sku: form.sku.trim() || undefined,
    };
    // Only send status when the seller legitimately toggled it.
    if (
      sellerToggleable &&
      (form.status === "ACTIVE" || form.status === "INACTIVE") &&
      form.status !== listing.status
    ) {
      input.status = form.status;
    }

    setSaving(true);
    const result = await updateListing(listing.id, input);
    setSaving(false);

    if (!result.success) {
      setServerError(result.message);
      if (result.fieldErrors) {
        const mapped: FormErrors = {};
        for (const [k, v] of Object.entries(result.fieldErrors)) {
          if (k in form && v?.[0]) mapped[k as keyof FormState] = v[0];
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      return;
    }
    setNotice("Saved.");
    router.refresh();
  };

  const field = (
    label: string,
    key: keyof FormState,
    opts: { type?: string; required?: boolean } = {},
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
        {label}
        {opts.required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={opts.type || "text"}
        value={form[key]}
        onChange={update(key)}
        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {errors[key] && <p className="text-xs text-rose-600 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {serverError && (
        <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
          {serverError}
        </div>
      )}
      {notice && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      {/* Read-only catalog context (seller can't edit shared catalog fields) */}
      {(listing.brand || listing.name) && (
        <div className="rounded-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatTitle(listing.name || "")}
          </span>
          {listing.brand && <> · {listing.brand}</>}
          <span className="block text-xs mt-1">
            Catalog details are managed by admins and can&apos;t be edited here.
          </span>
        </div>
      )}

      {field("Title", "title", { required: true })}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {field("Price (IDR)", "price", { type: "number", required: true })}
        {field("Stock", "stock", { type: "number" })}
        {field("SKU", "sku")}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
          Status
        </label>
        {sellerToggleable ? (
          <select
            value={form.status}
            onChange={update("status")}
            className="block w-full sm:w-48 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        ) : (
          <div className="text-sm">
            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {listing.status}
            </span>
            <span className="block text-xs text-gray-500 mt-1">
              {listing.status === "PENDING"
                ? "Awaiting admin approval — you can't change this yet."
                : "This status is admin-controlled."}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
