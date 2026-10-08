"use client";

import {
  createListing,
  type CreateListingInput,
} from "@/app/actions/seller.actions";
import type { Category } from "@/app/actions/categories.actions";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface FormState {
  brand: string;
  name: string;
  description: string;
  model: string;
  color: string;
  size: string;
  barcode: string;
  title: string;
  price: string;
  stock: string;
  sku: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  brand: "",
  name: "",
  description: "",
  model: "",
  color: "",
  size: "",
  barcode: "",
  title: "",
  price: "",
  stock: "",
  sku: "",
};

/**
 * Pure validation: returns an error message per invalid field.
 * Required: brand, name, title, price. price >= 0; stock (if given) whole >= 0.
 */
function validate(data: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!data.brand.trim()) errors.brand = "Brand is required.";
  if (!data.name.trim()) errors.name = "Product name is required.";
  if (!data.title.trim()) errors.title = "Listing title is required.";

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

export function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const update =
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleCategory = (id: number) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: CreateListingInput = {
      brand: form.brand.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      model: form.model.trim() || undefined,
      color: form.color.trim() || undefined,
      size: form.size.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      category_ids: selectedCategories.length ? selectedCategories : undefined,
      title: form.title.trim(),
      price: Number(form.price),
      stock: form.stock.trim() ? Number(form.stock) : 0,
      sku: form.sku.trim() || undefined,
    };

    setSubmitting(true);
    const result = await createListing(input);
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      if (result.fieldErrors) {
        // Map API array-errors onto single-string field errors.
        const mapped: FormErrors = {};
        for (const [k, v] of Object.entries(result.fieldErrors)) {
          if (k in EMPTY && v?.[0]) mapped[k as keyof FormState] = v[0];
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      return;
    }

    router.push(
      result.id ? `/seller/products/${result.id}/edit?created=1` : "/seller/products",
    );
  };

  const field = (
    label: string,
    key: keyof FormState,
    opts: { type?: string; required?: boolean; textarea?: boolean } = {},
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
        {label}
        {opts.required && <span className="text-rose-500"> *</span>}
      </label>
      {opts.textarea ? (
        <textarea
          value={form[key]}
          onChange={update(key)}
          rows={3}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      ) : (
        <input
          type={opts.type || "text"}
          value={form[key]}
          onChange={update(key)}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      )}
      {errors[key] && <p className="text-xs text-rose-600 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {serverError && (
        <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      {/* Catalog section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Catalog
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Brand", "brand", { required: true })}
          {field("Product name", "name", { required: true })}
          {field("Model", "model")}
          {field("Color", "color")}
          {field("Size", "size")}
          {field("Barcode", "barcode")}
        </div>
        {field("Description", "description", { textarea: true })}

        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => typeof c.id === "number")
                .map((c) => {
                  const id = c.id as number;
                  const on = selectedCategories.includes(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => toggleCategory(id)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors capitalize ${on
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                        }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* Listing section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Listing
        </h2>
        {field("Title", "title", { required: true })}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field("Price (IDR)", "price", { type: "number", required: true })}
          {field("Stock", "stock", { type: "number" })}
          {field("SKU", "sku")}
        </div>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create & add images"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/seller/products")}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-gray-500">
        New listings start as <strong>PENDING</strong> and await admin approval.
        Images are added on the next step.
      </p>
    </form>
  );
}
