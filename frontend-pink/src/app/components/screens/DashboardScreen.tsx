import { motion } from 'motion/react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  TrendingUp, ArrowUpRight, Droplets, Users, HeartHandshake,
  FlaskConical, CheckCircle2, ArrowRight, Clock
} from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { MONTHLY_COLLECTION, MILK_BATCHES, DONORS, INQUIRIES } from '../../mockData'
import type { Screen } from '../../types'

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void
}

const LIFECYCLE_STAGES = [
  { status: 'RAW',             label: 'Raw',          dotColor: '#bdbdbb' },
  { status: 'PRE_TESTING',     label: 'Pre-Test',     dotColor: '#F59E0B' },
  { status: 'PRE_TEST_PASSED', label: 'Test Passed',  dotColor: '#eea4bb' },
  { status: 'PASTEURIZED',     label: 'Pasteurized',  dotColor: '#3B82F6' },
  { status: 'POST_TESTING',    label: 'Post-Test',    dotColor: '#F59E0B' },
  { status: 'READY',           label: 'Ready',        dotColor: '#22C55E' },
  { status: 'DISPENSED',       label: 'Dispensed',    dotColor: '#14B8A6' },
]

const PROGRAM_BREAKDOWN = [
  { name: 'Supsup Todo', batches: 3, volume: 330, color: '#eea4bb' },
  { name: "Mom's Act",   batches: 2, volume: 440, color: '#636260' },
  { name: 'Milky Way',   batches: 3, volume: 450, color: '#bdbdbb' },
]

const ACTIVITY = [
  { time: '14:32', color: '#eea4bb', text: 'New donor registered: DTN-2024-008 (Remedios Villanueva)', icon: Users },
  { time: '13:45', color: '#22C55E', text: 'Batch BTN-2024-001 is now READY for dispensing', icon: CheckCircle2 },
  { time: '12:20', color: '#F59E0B', text: 'Lab result logged: BTN-2024-004 Pre-Test PASS', icon: FlaskConical },
  { time: '11:55', color: '#636260', text: '120 mL dispensed to Baby Girl Mendoza (Patricia Mendoza)', icon: Droplets },
  { time: '09:30', color: '#eea4bb', text: 'SMS sent to Corazon Navarro - milk now available', icon: HeartHandshake },
]

const KPI_DEFS = [
  {
    label: 'Total Milk Collected', unit: 'mL', sub: 'all batches on record',
    iconColor: '#eea4bb', iconBg: '#F8F0F4', icon: Droplets, trend: '+8.2%', screen: 'inventory' as Screen,
    getValue: (batches: typeof MILK_BATCHES) => batches.reduce((s, b) => s + b.volume, 0),
  },
  {
    label: 'Ready for Dispensing', unit: 'mL', sub: 'cleared for release',
    iconColor: '#4CAF50', iconBg: '#F0FDF4', icon: CheckCircle2, trend: '+12%', screen: 'inventory' as Screen,
    getValue: (batches: typeof MILK_BATCHES) => batches.filter((b) => b.status === 'READY').reduce((s, b) => s + b.volume, 0),
  },
  {
    label: 'Active Donors', unit: '', sub: 'screening passed',
    iconColor: '#F9A825', iconBg: '#FFFBEB', icon: Users, trend: '+2', screen: 'donors' as Screen,
    getValue: (_: typeof MILK_BATCHES, donors: typeof DONORS) => donors.filter((d) => d.screeningStatus === 'Passed').length,
  },
  {
    label: 'Active Recipients', unit: '', sub: 'on file',
    iconColor: '#eea4bb', iconBg: '#F8F0F4', icon: HeartHandshake, trend: undefined, screen: 'recipients' as Screen,
    getValue: () => INQUIRIES.filter((i) => i.status !== 'CANCELLED').length,
  },
  {
    label: 'Pending Lab Tests', unit: '', sub: 'batches in testing',
    iconColor: '#636260', iconBg: '#F3F2F1', icon: FlaskConical, trend: undefined, screen: 'lab' as Screen,
    getValue: (batches: typeof MILK_BATCHES) => batches.filter((b) => b.status === 'PRE_TESTING' || b.status === 'POST_TESTING').length,
  },
  {
    label: 'Dispensed This Month', unit: 'mL', sub: 'June 2024',
    iconColor: '#423e3d', iconBg: '#F2EFED', icon: TrendingUp, trend: undefined, screen: 'dispensing' as Screen,
    getValue: (batches: typeof MILK_BATCHES) => batches.filter((b) => b.status === 'DISPENSED').reduce((s, b) => s + b.volume, 0),
  },
]

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Overview' }]}
        title="Dashboard"
        subtitle="Live operations overview for Makati Human Milk Bank"
      />

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {KPI_DEFS.map((kpi) => {
          const Icon = kpi.icon
          const value = kpi.getValue(MILK_BATCHES, DONORS)
          return (
            <motion.div
              key={kpi.label}
              whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(50,46,45,0.08)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={() => onNavigate(kpi.screen)}
              className="bg-white rounded-2xl p-5 cursor-pointer"
              style={{ border: '1px solid rgba(99,98,96,0.08)', boxShadow: '0 2px 8px rgba(50,46,45,0.04)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                </div>
                {kpi.trend && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#4CAF50' }}>
                    <ArrowUpRight className="w-3 h-3" />
                    <span style={{ fontFamily: 'var(--font-family-mono)' }}>{kpi.trend}</span>
                  </div>
                )}
              </div>
              <div
                className="text-[28px] text-[#322e2d] leading-none mb-1"
                style={{ fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-family-mono)' }}
              >
                {value}
                {kpi.unit && (
                  <span className="text-base text-[#bdbdbb] ml-1" style={{ fontWeight: 400 }}>{kpi.unit}</span>
                )}
              </div>
              <div className="text-sm text-[#322e2d]" style={{ fontWeight: 600 }}>{kpi.label}</div>
              {kpi.sub && <div className="text-xs text-[#bdbdbb] mt-0.5">{kpi.sub}</div>}
            </motion.div>
          )
        })}
      </div>

      {/* Milk Lifecycle Hero */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: '#322e2d', boxShadow: '0 4px 24px rgba(50,46,45,0.15)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base text-white" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Milk Lifecycle Pipeline
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#7a7573' }}>
              Real-time batch status across all stages
            </p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: '#eea4bb', fontFamily: 'var(--font-family-mono)' }}
          >
            Full inventory <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-start gap-1 overflow-x-auto pb-2">
          {LIFECYCLE_STAGES.map((stage, i) => {
            const batches = MILK_BATCHES.filter((b) => b.status === stage.status)
            const vol = batches.reduce((s, b) => s + b.volume, 0)
            const isLast = i === LIFECYCLE_STAGES.length - 1

            return (
              <div key={stage.status} className="flex items-center gap-1 shrink-0">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="rounded-xl px-3 py-3 min-w-[92px] cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: stage.dotColor }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: stage.dotColor, fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <div
                    className="text-xl text-white leading-none"
                    style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)' }}
                  >
                    {vol}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#7a7573' }}>
                    mL · {batches.length}b
                  </div>
                </motion.div>
                {!isLast && <ArrowRight className="w-3 h-3 shrink-0" style={{ color: '#5a5655' }} />}
              </div>
            )
          })}

          {/* Discard branch */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-[#5a5655] text-xs px-1">|</span>
            {(() => {
              const batches = MILK_BATCHES.filter((b) =>
                b.status === 'DISCARDED' || b.status === 'PRE_TEST_FAILED' || b.status === 'POST_TEST_FAILED'
              )
              const vol = batches.reduce((s, b) => s + b.volume, 0)
              return (
                <div
                  className="rounded-xl px-3 py-3 min-w-[92px]"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-red-400" style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>
                      Discarded
                    </span>
                  </div>
                  <div className="text-xl text-red-300 leading-none" style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)' }}>
                    {vol}
                  </div>
                  <div className="text-[10px] text-red-500 mt-0.5">{batches.length} batch</div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Area chart */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(99,98,96,0.08)', boxShadow: '0 2px 8px rgba(50,46,45,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm text-[#322e2d]" style={{ fontWeight: 700 }}>Monthly Collection Volume</h3>
              <p className="text-xs text-[#bdbdbb] mt-0.5">mL collected per month, 2024</p>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full text-[#c07090]"
              style={{ background: '#F8F0F4', fontFamily: 'var(--font-family-mono)' }}
            >
              All Programs
            </span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={MONTHLY_COLLECTION} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eea4bb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#eea4bb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,98,96,0.06)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#bdbdbb', fontFamily: 'var(--font-family-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#bdbdbb', fontFamily: 'var(--font-family-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#322e2d',
                  border: '1px solid rgba(238,164,187,0.2)',
                  borderRadius: 12,
                  color: '#eea4bb',
                  fontSize: 12,
                  fontFamily: 'var(--font-family-mono)',
                }}
                labelStyle={{ color: '#bdbdbb', fontSize: 11, marginBottom: 4 }}
                formatter={(v: number) => [`${v} mL`, 'Volume']}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#eea4bb"
                strokeWidth={2.5}
                fill="url(#pinkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Program breakdown */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(99,98,96,0.08)', boxShadow: '0 2px 8px rgba(50,46,45,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm text-[#322e2d]" style={{ fontWeight: 700 }}>Program Breakdown</h3>
            <p className="text-xs text-[#bdbdbb] mt-0.5">Volume by collection program</p>
          </div>
          <div className="space-y-3 mb-4">
            {PROGRAM_BREAKDOWN.map((p) => {
              const pct = Math.round((p.volume / 1220) * 100)
              return (
                <div key={p.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-[#322e2d]" style={{ fontWeight: 500 }}>{p.name}</span>
                    <span className="text-xs text-[#bdbdbb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {p.volume} mL
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F2EFED' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={PROGRAM_BREAKDOWN} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={20}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: '#bdbdbb', fontFamily: 'var(--font-family-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#322e2d', border: 'none', borderRadius: 8, color: '#eea4bb', fontSize: 11, fontFamily: 'var(--font-family-mono)' }}
                formatter={(v: number) => [`${v} mL`, 'Volume']}
              />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]} fill="#eea4bb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity + Waiting list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(99,98,96,0.08)', boxShadow: '0 2px 8px rgba(50,46,45,0.04)' }}
        >
          <h3 className="text-sm text-[#322e2d] mb-5" style={{ fontWeight: 700 }}>Recent Activity</h3>
          <div className="space-y-3">
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}18` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    {i < ACTIVITY.length - 1 && (
                      <div className="w-px flex-1 mt-1.5" style={{ background: '#F2EFED' }} />
                    )}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-xs text-[#322e2d] leading-relaxed" style={{ fontWeight: 500 }}>
                      {item.text}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-[#bdbdbb]" />
                      <span className="text-[10px] text-[#bdbdbb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        Today {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(99,98,96,0.08)', boxShadow: '0 2px 8px rgba(50,46,45,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm text-[#322e2d]" style={{ fontWeight: 700 }}>NICU Waiting List</h3>
            <button
              onClick={() => onNavigate('inquiry')}
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: '#eea4bb' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {INQUIRIES.filter((i) => i.status === 'WAITING' && i.nicuStatus).map((inq) => (
              <div
                key={inq.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#F8F7F5', border: '1px solid rgba(99,98,96,0.07)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs"
                  style={{ background: '#eea4bb', color: '#322e2d', fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}
                >
                  {inq.recipientName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#322e2d] truncate" style={{ fontWeight: 500 }}>{inq.recipientName}</div>
                  <div className="text-xs text-[#636260]">{inq.babyName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm" style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600, color: '#eea4bb' }}>
                    {inq.daysWaiting}d
                  </div>
                  <div className="text-[10px] text-[#bdbdbb]">waiting</div>
                </div>
              </div>
            ))}
            {INQUIRIES.filter((i) => i.status === 'WAITING' && i.nicuStatus).length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-[#bdbdbb]">No recipients currently waiting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
