"use client";

import { useMemo } from "react";

// ═══════════════════════════════════════════════════
// FAKE DATASET: 2 years of FIR data (Jan 2023 - Dec 2024)
// ═══════════════════════════════════════════════════

const AREAS = [
  "Banjara Hills", "Kukatpally", "Miyapur", "Secunderabad",
  "Madhapur", "Jubilee Hills", "Charminar", "Begumpet",
  "Ameerpet", "LB Nagar", "Dilsukhnagar", "Gachibowli",
  "Uppal", "Nacharam", "Tarnaka",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface FIRRecord {
  month: number;
  year: number;
  monthName: string;
  area: string;
  count: number;
}

function generateFakeData(): FIRRecord[] {
  const records: FIRRecord[] = [];
  let seed = 42;
  const random = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let monthIdx = 0; monthIdx < 24; monthIdx++) {
    const year = monthIdx < 12 ? 2023 : 2024;
    const monthInYear = monthIdx % 12;

    for (const area of AREAS) {
      let base = 5;
      if (["Kukatpally", "Madhapur", "Secunderabad", "Charminar"].includes(area)) base = 12;
      else if (["Banjara Hills", "Jubilee Hills", "Gachibowli"].includes(area)) base = 8;
      else if (["Dilsukhnagar", "LB Nagar", "Ameerpet"].includes(area)) base = 10;

      let seasonMultiplier = 1;
      if (monthInYear >= 9 && monthInYear <= 11) seasonMultiplier = 1.5;
      else if (monthInYear >= 3 && monthInYear <= 5) seasonMultiplier = 1.3;
      else if (monthInYear >= 0 && monthInYear <= 1) seasonMultiplier = 0.8;

      const count = Math.max(1, Math.round(base * seasonMultiplier + (random() * 8 - 4)));

      records.push({
        month: monthIdx,
        year,
        monthName: MONTHS[monthInYear],
        area,
        count,
      });
    }
  }
  return records;
}

export default function FIRAnalytics() {
  const data = useMemo(() => generateFakeData(), []);

  const monthlyTotals = useMemo(() => {
    const totals: { label: string; year: number; monthIdx: number; total: number }[] = [];
    for (let m = 0; m < 24; m++) {
      const year = m < 12 ? 2023 : 2024;
      const monthInYear = m % 12;
      const total = data.filter((r) => r.month === m).reduce((sum, r) => sum + r.count, 0);
      totals.push({ label: `${MONTHS[monthInYear]} ${year}`, year, monthIdx: m, total });
    }
    return totals;
  }, [data]);

  const areaTotals = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((r) => {
      map[r.area] = (map[r.area] || 0) + r.count;
    });
    return Object.entries(map)
      .map(([area, total]) => ({ area, total }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const maxMonthly = Math.max(...monthlyTotals.map((m) => m.total));
  const maxArea = areaTotals[0]?.total || 1;
  const totalFIRs = monthlyTotals.reduce((s, m) => s + m.total, 0);
  const peakMonth = monthlyTotals.reduce((max, m) => (m.total > max.total ? m : max), monthlyTotals[0]);
  const peakArea = areaTotals[0];

  const year2023Total = monthlyTotals.filter((m) => m.year === 2023).reduce((s, m) => s + m.total, 0);
  const year2024Total = monthlyTotals.filter((m) => m.year === 2024).reduce((s, m) => s + m.total, 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total FIRs (2 Years)", value: totalFIRs.toLocaleString(), emoji: "\uD83D\uDCCB" },
          { label: "Peak Month", value: peakMonth.label, emoji: "\uD83D\uDCC8" },
          { label: "Highest Area", value: peakArea.area, emoji: "\uD83D\uDCCD" },
          { label: "YoY Change", value: `${year2024Total > year2023Total ? "+" : ""}${(((year2024Total - year2023Total) / year2023Total) * 100).toFixed(1)}%`, emoji: "\uD83D\uDCCA" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-2xl glass-card card-shadow border border-blue-100 hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.emoji}</span>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-xl font-serif font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Year Comparison */}
      <div className="glass-card card-shadow rounded-3xl p-6 border border-blue-100">
        <h3 className="text-sm font-serif font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">{"\uD83D\uDCCA"}</span>
          Year-wise Comparison
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">2023 Total</p>
            <p className="text-2xl font-bold text-blue-600">{year2023Total.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">2024 Total</p>
            <p className="text-2xl font-bold text-blue-600">{year2024Total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Monthly FIR Chart */}
      <div className="glass-card card-shadow rounded-3xl p-6 border border-blue-100">
        <h3 className="text-sm font-serif font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">{"\uD83D\uDCC8"}</span>
          Monthly FIR Trends (Jan 2023 - Dec 2024)
        </h3>
        <p className="text-xs text-muted-foreground mb-5 ml-10">Which month had the most FIRs filed across the entire 2-year period</p>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2">
          {monthlyTotals.map((m) => {
            const pct = (m.total / maxMonthly) * 100;
            const isPeak = m.monthIdx === peakMonth.monthIdx;
            return (
              <div key={m.monthIdx} className="flex items-center gap-3 group">
                <span className={`text-xs font-mono w-20 shrink-0 text-right ${isPeak ? "text-blue-600 font-bold" : "text-muted-foreground"}`}>
                  {m.label}
                </span>
                <div className="flex-1 h-7 rounded-lg overflow-hidden bg-blue-50 relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${
                      isPeak
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : m.year === 2023
                        ? "bg-gradient-to-r from-blue-300 to-blue-400"
                        : "bg-gradient-to-r from-blue-400 to-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  {isPeak && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">
                      PEAK
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold w-10 ${isPeak ? "text-blue-600" : "text-foreground"}`}>
                  {m.total}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-blue-100 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-gradient-to-r from-blue-300 to-blue-400"></span> 2023</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-gradient-to-r from-blue-400 to-blue-500"></span> 2024</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-gradient-to-r from-blue-500 to-blue-600"></span> Peak Month</span>
        </div>
      </div>

      {/* Area-wise FIR Chart */}
      <div className="glass-card card-shadow rounded-3xl p-6 border border-blue-100">
        <h3 className="text-sm font-serif font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">{"\uD83D\uDCCD"}</span>
          Area-wise FIR Distribution
        </h3>
        <p className="text-xs text-muted-foreground mb-5 ml-10">Which area had the maximum FIRs filed across the 2-year dataset</p>

        <div className="space-y-2">
          {areaTotals.map((a, idx) => {
            const pct = (a.total / maxArea) * 100;
            const isTop = idx === 0;
            return (
              <div key={a.area} className="flex items-center gap-3 group">
                <span className={`text-xs w-28 shrink-0 text-right truncate ${isTop ? "text-blue-600 font-bold" : "text-muted-foreground"}`}>
                  {a.area}
                </span>
                <div className="flex-1 h-8 rounded-lg overflow-hidden bg-blue-50 relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${
                      isTop
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : idx < 3
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : idx < 7
                        ? "bg-gradient-to-r from-blue-300 to-blue-400"
                        : "bg-gradient-to-r from-blue-200 to-blue-300"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  {isTop && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">
                      #1 AREA
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold w-10 ${isTop ? "text-blue-600" : "text-foreground"}`}>
                  {a.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Table */}
      <div className="glass-card card-shadow rounded-3xl p-6 border border-blue-100">
        <h3 className="text-sm font-serif font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">{"\uD83C\uDFC6"}</span>
          Top 5 Areas by FIR Count
        </h3>
        <div className="overflow-hidden rounded-xl border border-blue-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-left">
                <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Area</th>
                <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider text-right">Total FIRs</th>
                <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {areaTotals.slice(0, 5).map((a, idx) => (
                <tr key={a.area} className={`border-t border-blue-50 ${idx === 0 ? "bg-blue-50/30" : "hover:bg-blue-50/20"} transition-colors`}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${idx === 0 ? "text-blue-600 font-bold" : "text-foreground"}`}>{a.area}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{a.total}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{((a.total / totalFIRs) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Data shown is simulated for demonstration purposes (Jan 2023 - Dec 2024)
        </p>
      </div>
    </div>
  );
}
