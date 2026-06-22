import { useState } from 'react'
import { motion } from 'motion/react'
import { FileDown, FileSpreadsheet, BarChart3 } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts'
import { PageHeader } from '../shared/PageHeader'
import { MONTHLY_COLLECTION } from '../../mockData'

type ReportType = 'Daily' | 'Weekly' | 'Monthly' | 'Annual'

const LEDGER_DATA = [
  { program: 'In-House', raw: 60, qaFailure: 0, netToPasteurization: 60, carryover: 0 },
  { program: "Mom's Act", raw: 440, qaFailure: 0, netToPasteurization: 440, carryover: 0 },
  { program: 'Milky Way', raw: 450, qaFailure: 150, netToPasteurization: 300, carryover: 180 },
  { program: 'Supsup Todo', raw: 330, qaFailure: 0, netToPasteurization: 330, carryover: 90 },
]

const STATUS_DISTRIBUTION = [
  { name: 'Ready', value: 420, color: '#22C55E' },
  { name: 'In Testing', value: 210, color: '#7C5CFC' },
  { name: 'Pasteurized', value: 180, color: '#3B82F6' },
  { name: 'Raw', value: 60, color: '#9CA3AF' },
  { name: 'Dispensed', value: 200, color: '#14B8A6' },
  { name: 'Discarded', value: 150, color: '#EF4444' },
]

const SUMMARY_STATS = [
  { label: 'Collections', value: 8, unit: 'batches', color: '#7C5CFC' },
  { label: 'Volume Collected', value: '1,220', unit: 'mL', color: '#7C5CFC' },
  { label: 'Volume Pasteurized', value: 560, unit: 'mL', color: '#3B82F6' },
  { label: 'Volume Dispensed', value: 320, unit: 'mL', color: '#14B8A6' },
  { label: 'Volume Discarded', value: 150, unit: 'mL', color: '#EF4444' },
  { label: 'Donors Registered', value: 8, unit: 'donors', color: '#F59E0B' },
  { label: 'Recipients Served', value: 4, unit: 'recipients', color: '#F6CFCF' },
  { label: 'Discard Rate', value: '12.3%', unit: '', color: '#EF4444' },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{ background: '#0D0B1A', border: '1px solid rgba(124,92,252,0.2)', color: '#C8C0F0', fontFamily: 'var(--font-family-mono)' }}
    >
      <div style={{ color: payload[0].payload.color }}>{payload[0].name}</div>
      <div className="text-white">{payload[0].value} mL</div>
    </div>
  )
}

export function ReportsScreen() {
  const [reportType, setReportType] = useState<ReportType>('Monthly')
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState('2024-06-30')

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Reports' }]}
        title="Reports"
        subtitle="Auto-generated operational reports with export to PDF and Excel"
      />

      {/* Controls */}
      <div
        className="bg-white rounded-2xl p-5 mb-5"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-2" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}>
              Report Type
            </label>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              {(['Daily', 'Weekly', 'Monthly', 'Annual'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className="px-4 py-2.5 text-sm transition-colors"
                  style={{
                    background: reportType === type ? '#7C5CFC' : 'white',
                    color: reportType === type ? 'white' : '#6B7280',
                    fontWeight: reportType === type ? 600 : 400,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-2" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}>
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ background: '#FAFAFC', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
            />
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-2" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}>
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ background: '#FAFAFC', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="px-5 py-2.5 text-sm text-white rounded-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #A88DFF)', boxShadow: '0 4px 16px rgba(124,92,252,0.3)', fontWeight: 600 }}
          >
            <BarChart3 className="w-4 h-4" />
            Generate
          </motion.button>
          <div className="flex gap-2 ml-auto">
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-colors hover:bg-[#F0EBFF] hover:border-[#7C5CFC] hover:text-[#7C5CFC]"
              style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#6B7280', background: 'white' }}
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-colors hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
              style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#6B7280', background: 'white' }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {SUMMARY_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl px-4 py-4"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
          >
            <div className="text-xl text-[#1A1A1A] leading-none mb-1" style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#1A1A1A]" style={{ fontWeight: 600 }}>{stat.label}</div>
            {stat.unit && <div className="text-[10px] text-[#9CA3AF]" style={{ fontFamily: 'var(--font-family-mono)' }}>{stat.unit}</div>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Trend area chart */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm text-[#1A1A1A]" style={{ fontWeight: 700 }}>Collection Trends</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Monthly volume collected, 2024</p>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full text-[#7C5CFC]"
              style={{ background: '#F0EBFF', fontFamily: 'var(--font-family-mono)' }}
            >
              {reportType}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_COLLECTION} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-family-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-family-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0D0B1A', border: '1px solid rgba(124,92,252,0.2)', borderRadius: 12, color: '#C8C0F0', fontSize: 12, fontFamily: 'var(--font-family-mono)' }}
                formatter={(v: number) => [`${v} mL`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#7C5CFC" strokeWidth={2.5} fill="url(#reportGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="mb-4">
            <h3 className="text-sm text-[#1A1A1A]" style={{ fontWeight: 700 }}>Inventory by Status</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Volume distribution (mL)</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={STATUS_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {STATUS_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {STATUS_DISTRIBUTION.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-[#6B7280]">{s.name}</span>
                </div>
                <span className="text-xs text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>
                  {s.value} mL
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Unit Ledger */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm text-[#1A1A1A]" style={{ fontWeight: 700 }}>Collection Unit Ledger</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Breakdown by program with QA failure adjustments and carryover balances</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Program', 'Raw Volume (mL)', 'QA Failure Adj. (mL)', 'Net to Pasteurization (mL)', 'Carryover Balance (mL)'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-[#9CA3AF] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEDGER_DATA.map((row, i) => (
                <tr
                  key={row.program}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < LEDGER_DATA.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  <td className="px-5 py-4 text-sm text-[#1A1A1A]" style={{ fontWeight: 500 }}>{row.program}</td>
                  <td className="px-5 py-4 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>{row.raw}</td>
                  <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-family-mono)', color: row.qaFailure > 0 ? '#E53935' : '#9CA3AF' }}>
                    {row.qaFailure > 0 ? `-${row.qaFailure}` : '0'}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>{row.netToPasteurization}</td>
                  <td className="px-5 py-4 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>{row.carryover}</td>
                </tr>
              ))}
              <tr style={{ background: '#F0EBFF', borderTop: '2px solid rgba(124,92,252,0.15)' }}>
                <td className="px-5 py-3.5 text-sm text-[#7C5CFC]" style={{ fontWeight: 700 }}>Total</td>
                {[
                  LEDGER_DATA.reduce((s, r) => s + r.raw, 0),
                  LEDGER_DATA.reduce((s, r) => s + r.qaFailure, 0),
                  LEDGER_DATA.reduce((s, r) => s + r.netToPasteurization, 0),
                  LEDGER_DATA.reduce((s, r) => s + r.carryover, 0),
                ].map((total, i) => (
                  <td key={i} className="px-5 py-3.5 text-sm text-[#7C5CFC]" style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                    {i === 1 && total > 0 ? `-${total}` : total}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
