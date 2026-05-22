"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

type ChartRow = { tgl: string; label: string; verified: number; draft: number }

const chartConfig: ChartConfig = {
  verified: { label: "Terverifikasi", color: "oklch(0.696 0.17 162.48)" },
  draft:    { label: "Draft",         color: "oklch(0.828 0.189 84.429)" },
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

export function DashboardChart({ data }: { data: ChartRow[] }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="border-b border-white/10 px-5 py-3.5">
        <p className="text-sm font-medium text-white/60">Penerimaan 7 Hari Terakhir</p>
      </div>
      <div className="p-5">
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <BarChart data={data} barGap={2} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
                return String(v)
              }}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<ChartTooltipContent formatter={(v) => rupiah(Number(v))} />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="verified" fill="var(--color-verified)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="draft"    fill="var(--color-draft)"    radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-3 flex gap-4">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: cfg.color as string }} />
              <span className="text-xs text-white/40">{cfg.label as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
