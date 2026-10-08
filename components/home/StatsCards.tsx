"use client";

import { Card } from "@/components/Card";
import { useEffect, useRef } from "react";

/**
 * Highlighted statistics (ported from checkpoint1 `siteStatistics`).
 * ApexCharts sparklines for active users + units sold. Data is the same
 * illustrative sample as checkpoint1 (there is no stats API endpoint).
 * ApexCharts is browser-only, so it's imported dynamically inside useEffect.
 */
export function StatsCards() {
  const usersRef = useRef<HTMLDivElement>(null);
  const salesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let userChart: { render: () => void; destroy: () => void } | null = null;
    let salesChart: { render: () => void; destroy: () => void } | null = null;

    // Clear any chart left in the containers by a previous (Strict Mode) mount
    // so sparklines never stack/duplicate.
    if (usersRef.current) usersRef.current.innerHTML = "";
    if (salesRef.current) salesRef.current.innerHTML = "";

    const monthlySalesReport = [
      { status: "sold", price: 2000000, totalQuantity: 200 },
      { status: "sold", price: 6000, totalQuantity: 3000 },
      { status: "sold", price: 32000000, totalQuantity: 12 },
      { status: "sold", price: 130000, totalQuantity: 12000 },
      { status: "active", price: 500000, totalQuantity: 1000 },
      { status: "sold", price: 500000, totalQuantity: 500 },
      { status: "sold", price: 53000, totalQuantity: 100 },
    ];
    const monthlyTrafficSummary = [
      65, 72, 58, 84, 110, 95, 60, 63, 68, 74, 90, 115, 102, 55, 70, 64, 71, 88,
      125, 130, 78, 66, 69, 73, 92, 105, 98, 61, 67, 75,
    ];

    const salesPoints = monthlySalesReport
      .filter((a) => a.status.toLowerCase() === "sold")
      .map((a) => a.totalQuantity);

    (async () => {
      const ApexCharts = (await import("apexcharts")).default;

      const common = {
        chart: {
          type: "area" as const,
          height: "100%",
          width: "100%",
          sparkline: { enabled: true },
          animations: { speed: 800 },
        },
        stroke: { curve: "smooth" as const, width: 2.5 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] },
        },
        tooltip: { enabled: false },
      };

      if (cancelled) return;

      if (usersRef.current) {
        userChart = new ApexCharts(usersRef.current, {
          ...common,
          stroke: { ...common.stroke, colors: ["#e15241"] },
          series: [{ data: monthlyTrafficSummary }],
        });
        userChart.render();
      }
      if (salesRef.current) {
        salesChart = new ApexCharts(salesRef.current, {
          ...common,
          stroke: { ...common.stroke, colors: ["#2962ff"] },
          series: [{ data: salesPoints }],
        });
        salesChart.render();
      }
    })();

    return () => {
      cancelled = true;
      userChart?.destroy();
      salesChart?.destroy();
    };
  }, []);

  const totalUsers = 2466; // sum of the sample traffic
  const formattedUsers = `${(totalUsers / 1000).toFixed(1)}k+`;
  const totalSold = 15812;
  const formattedSales = `${(totalSold / 1000).toFixed(1)}k+`;

  const kpiClass =
    "flex items-center justify-between !bg-white/80 backdrop-blur-sm !border-[#e6dfda] p-6 shadow-[0_8px_30px_rgba(225,213,201,0.3)]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-5 px-4 font-sans">
      <Card className={kpiClass}>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-[#8c7e74] uppercase tracking-wider">Aktif Bulan Ini</span>
          <h3 className="text-3xl font-extrabold tracking-tight text-[#2d2521] my-1.5">{formattedUsers}</h3>
          <span className="text-[11px] text-[#a6968a] font-medium">Pengunjung sedang melihat katalog</span>
        </div>
        <div ref={usersRef} className="w-[140px] h-[55px] -mr-2.5" />
      </Card>

      <Card className={kpiClass}>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-[#8c7e74] uppercase tracking-wider">Terjual Bulan Ini</span>
          <h3 className="text-3xl font-extrabold tracking-tight text-[#2d2521] my-1.5">{formattedSales}</h3>
          <span className="text-[11px] text-[#a6968a] font-medium">Produk berhasil dikirim ke pembeli</span>
        </div>
        <div ref={salesRef} className="w-[140px] h-[55px] -mr-2.5" />
      </Card>
    </div>
  );
}
