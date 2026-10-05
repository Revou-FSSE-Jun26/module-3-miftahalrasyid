import React from "react";
import dynamic from "next/dynamic";
const customRequire = require as __WebpackModuleApi.RequireFunction;
const context = customRequire.context(".", false, /\.(js|jsx|ts|tsx)$/);

export interface TabRoute {
  name: string;
  Component: React.ComponentType;
}

export const dynamicTabs: TabRoute[] = context
  .keys()
  .filter((key: string) => !key.includes("registry"))
  .map((key: string) => {
    const componentName = key
      .replace("./", "")
      .replace(/\.(js|jsx|ts|tsx)$/, "");
    const formattedName = componentName
      .replace(/_z-/g, " ")
      .replace(/_/g, " ") // Mengubah semua _ menjadi spasi
      .split(" ") // Memecah berdasarkan spasi menjadi array kata
      .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1)) // Mengubah huruf pertama tiap kata jadi kapital
      .join(" ");
    return {
      name: formattedName,
      Component: dynamic(() => import(`./${componentName}.tsx`), {
        ssr: false,
        loading: () =>
          React.createElement(
            "p",
            { className: "text-gray-500" },
            `Loading ${componentName}`,
          ),
      }),
    };
  });
