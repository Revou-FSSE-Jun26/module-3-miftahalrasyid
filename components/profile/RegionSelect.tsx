"use client";

// import { logger } from "@/utils/logger";
import { useEffect, useState } from "react";

/**
 * Dependent province → city selects backed by the emsifa static region API
 * (public, no key, CORS-open). Selection is by region id, but the backend
 * stores province/city as names, so onChange reports the chosen NAMES.
 *
 * Uses native fetch (not the app's axios `api`, which targets our Flask
 * backend) since these are third-party endpoints.
 */

const BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

interface Region {
  id: string;
  name: string;
}

export function RegionSelect({
  province,
  city,
  onChange,
  provinceError,
  cityError,
}: {
  /** Currently selected province name (from form state). */
  province: string;
  /** Currently selected city name (from form state). */
  city: string;
  /** Reports the selected names back to the parent form. */
  onChange: (next: { province: string; city: string }) => void;
  provinceError?: string[];
  cityError?: string[];
}) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [provinceId, setProvinceId] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);


  // Load provinces once.
  useEffect(() => {
    let active = true;
    fetch(`${BASE}/provinces.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Region[]) => {
        // logger.info(data, "try fetch data provinces.json")
        if (active) setProvinces(data || []);
      })
      .catch(() => {
        if (active) setProvinces([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load cities whenever the province id changes.
  useEffect(() => {
    if (!province || provinces.length === 0) return;


    // Find the loaded province object that matches the parent string name
    const foundProvince = provinces.find(
      (p) => p.name.toLowerCase() === province.toLowerCase()
    );

    if (foundProvince) {
      setProvinceId(foundProvince.id); // This will now correctly trigger your city fetcher!
    }
  }, [province, provinces]);
  useEffect(() => {
    if (!provinceId) return;
    let active = true;
    fetch(`${BASE}/regencies/${provinceId}.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Region[]) => {
        if (active) setCities(data || []);
      })
      .catch(() => {
        if (active) setCities([]);
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [provinceId])
  function handleProvince(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setProvinceId(id);
    const name = provinces.find((p) => p.id === id)?.name ?? "";
    // Province changed → reset city.
    onChange({ province: name, city: "" });
    if (!id) {
      setCities([]);
    }
  }

  function handleCity(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const name = cities.find((c) => c.id === id)?.name ?? "";
    onChange({ province, city: name });
  }

  const selectCls =
    "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed";

  // Resolve the current id from the stored name so the selects reflect form state
  // (e.g. after a validation error re-render).
  const currentProvinceId =
    provinceId || provinces.find((p) => p.name === province)?.id || "";
  const currentCityId = cities.find((c) => c.name === city)?.id || "";
  // logger.info({ city, id: currentCityId, cities, length: cities.length }, "try fetch city")
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Province
        </label>
        <select
          value={currentProvinceId}
          onChange={handleProvince}
          className={selectCls}
        >
          <option value="">Select province</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {provinceError?.length ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {provinceError.join(" ")}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          City / Regency
        </label>
        <select
          value={currentCityId}
          onChange={handleCity}
          disabled={!currentProvinceId || loadingCities}
          className={selectCls}
        >
          <option value="">
            {loadingCities ? "Loading…" : "Select city / regency"}
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {cityError?.length ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {cityError.join(" ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
