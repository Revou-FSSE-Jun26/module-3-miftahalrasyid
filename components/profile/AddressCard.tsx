"use client";

import {
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type AddressInput,
} from "@/app/actions/address.actions";
import { RegionSelect } from "@/components/profile/RegionSelect";
// import { logger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * A single saved address with its own actions: set-default, edit (inline form),
 * and delete. Each action is a server call; the row owns its pending/error UI so
 * the parent list stays simple.
 */
export function AddressCard({ address }: { address: Address }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  // logger.info(address, "fetch province");
  const [form, setForm] = useState<AddressInput>({
    label: address.label,
    recipient_name: address.recipient_name,
    phone: address.phone,
    address_line: address.address_line,
    city: address.city,
    province: address.province,
    postal_code: address.postal_code,
    is_default: address.is_default,
  });

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function runSetDefault() {
    setError(null);
    startTransition(async () => {
      const r = await setDefaultAddress(address.id);
      if (r.success) router.refresh();
      else setError(r.message);
    });
  }

  function runDelete() {
    if (!window.confirm(`Delete address "${address.label}"?`)) return;
    setError(null);
    startTransition(async () => {
      const r = await deleteAddress(address.id);
      if (r.success) router.refresh();
      else setError(r.message);
    });
  }

  function runSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const r = await updateAddress(address.id, form);
      if (r.success) {
        setEditing(false);
        router.refresh();
      } else {
        setError(r.message);
        setFieldErrors(r.fieldErrors ?? {});
      }
    });
  }

  if (editing) {
    return (
      <li className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <form onSubmit={runSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" value={form.label} onChange={(v) => set("label", v)} errors={fieldErrors.label} />
            <Field label="Recipient name" value={form.recipient_name} onChange={(v) => set("recipient_name", v)} errors={fieldErrors.recipient_name} />
            <Field label="Phone" placeholder="+6281234567890" value={form.phone} onChange={(v) => set("phone", v)} errors={fieldErrors.phone} />
            <Field label="Postal code" value={form.postal_code} onChange={(v) => set("postal_code", v)} errors={fieldErrors.postal_code} />
          </div>

          <RegionSelect
            province={form.province}
            city={form.city}
            onChange={({ province, city }) => setForm((f) => ({ ...f, province, city }))}
            provinceError={fieldErrors.province}
            cityError={fieldErrors.city}
          />

          <Field label="Address line" value={form.address_line} onChange={(v) => set("address_line", v)} errors={fieldErrors.address_line} />

          {error && (
            <p role="alert" className="text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors duration-150">
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(null); setFieldErrors({}); }} disabled={pending} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150">
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {address.label}
            </span>
            {address.is_default && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {address.recipient_name} · {address.phone}
          </p>
          <p className="text-sm text-gray-500">
            {address.address_line}, {address.city}, {address.province}{" "}
            {address.postal_code}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!address.is_default && (
            <button
              type="button"
              onClick={runSetDefault}
              disabled={pending}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors duration-150"
            >
              Set default
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={pending}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors duration-150"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={runDelete}
            disabled={pending}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-colors duration-150"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </li>
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
