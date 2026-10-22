"use client";

import {
  createAddress,
  getMyAddresses,
  type Address,
  type AddressInput,
} from "@/app/actions/address.actions";
import { AddressCard } from "@/components/profile/AddressCard";
import { RegionSelect } from "@/components/profile/RegionSelect";
import { logger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

const EMPTY_FORM: AddressInput = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

/**
 * Address list + add-new form. When the user has no address, the form is shown
 * open by default so they can create one immediately; otherwise it's revealed
 * via the "Add address" button. Field errors from the backend render inline.
 */
export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasAddresses = addresses.length > 0;
  // logger.info(addresses, "fetch province");
  const [showForm, setShowForm] = useState(!hasAddresses);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await createAddress(form);
      if (result.success) {
        setForm(EMPTY_FORM);
        setShowForm(false);
        toast.success(result.message || "Address added.");
        router.refresh();
      } else {
        setError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Existing addresses */}
      {hasAddresses ? (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
        </ul>
      ) : (
        !showForm && (
          <p className="text-sm text-gray-500">
            You don&apos;t have any saved address yet.
          </p>
        )
      )}

      {/* Toggle */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-150"
        >
          Add address
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Label"
              placeholder="Home, Office…"
              value={form.label}
              onChange={(v) => update("label", v)}
              errors={fieldErrors.label}
            />
            <Field
              label="Recipient name"
              value={form.recipient_name}
              onChange={(v) => update("recipient_name", v)}
              errors={fieldErrors.recipient_name}
            />
            <Field
              label="Phone"
              placeholder="+6281234567890"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              errors={fieldErrors.phone}
            />
            <Field
              label="Postal code"
              value={form.postal_code}
              onChange={(v) => update("postal_code", v)}
              errors={fieldErrors.postal_code}
            />
          </div>

          {/* Province → City dependent selects (names submitted to the API). */}
          <RegionSelect
            province={form.province}
            city={form.city}
            onChange={({ province, city }) =>
              setForm((f) => ({ ...f, province, city }))
            }
            provinceError={fieldErrors.province}
            cityError={fieldErrors.city}
          />

          <Field
            label="Address line"
            value={form.address_line}
            onChange={(v) => update("address_line", v)}
            errors={fieldErrors.address_line}
          />

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_default ?? false}
              onChange={(e) => update("is_default", e.target.checked)}
              className="rounded border-gray-300"
            />
            Set as default address
          </label>

          {error && (
            <p
              role="alert"
              className="text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-150"
            >
              {pending ? "Saving…" : "Save address"}
            </button>
            {hasAddresses && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setFieldErrors({});
                }}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  errors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {errors?.length ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
