import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { supabase } from '../../../lib/supabase'
import { toProgramLabel, toTitle } from '../../exportUtils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'motion/react'

type Batch = { id: string; status: string; program: string; total_volume_ml: number }
type Inquiry = { id: string; status: string; beneficiaries?: { guardian_name: string; baby_name: string } | null }
type CollectionReport = { collected_at: string; program: string; volume_ml: number }
type Waitlist = { inquiry_id: string; guardian_name: string; baby_name: string; requested_at: string }

export function DashboardScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [donorCount, setDonorCount] = useState(0)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [collectionReports, setCollectionReports] = useState<CollectionReport[]>([])
  const [waitlist, setWaitlist] = useState<Waitlist[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      const [b, d, i, r, w] = await Promise.allSettled([
        supabase.from('batches').select('id,status,program,total_volume_ml'),
        supabase.from('donors').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id,status,beneficiaries(guardian_name,baby_name)').neq('status', 'cancelled'),
        supabase.from('collections').select('collected_at,program,volume_ml'),
        supabase.from('inquiries')
          .select('id,requested_at,beneficiaries!inner(guardian_name,baby_name)')
          .eq('status', 'waiting')
          .order('requested_at', { ascending: true })
          .limit(5),
      ])

      if (b.status === 'fulfilled') {
        if (b.value.error) console.error('batches:', b.value.error)
        else setBatches((b.value.data ?? []) as Batch[])
      }
      if (d.status === 'fulfilled') {
        if (!d.value.error) setDonorCount(d.value.count ?? 0)
      }
      if (i.status === 'fulfilled') {
        if (!i.value.error) setInquiries((i.value.data ?? []) as Inquiry[])
      }
      if (r.status === 'fulfilled') {
        if (!r.value.error) setCollectionReports((r.value.data ?? []) as CollectionReport[])
      }
      if (w.status === 'fulfilled') {
        if (!w.value.error) {
          const wData = ((w.value.data ?? []) as Array<{
            id: string
            requested_at: string
            beneficiaries: { guardian_name: string; baby_name: string } | null
          }>).map(item => ({
            inquiry_id: item.id,
            guardian_name: item.beneficiaries?.guardian_name ?? '',
            baby_name: item.beneficiaries?.baby_name ?? '',
            requested_at: item.requested_at,
          }))
          setWaitlist(wData)
        }
      }
    }
    void fetchDashboard()
  }, [])

  const mlReady = batches
    .filter(b => b.status === 'ready')
    .reduce((s, b) => s + Number(b.total_volume_ml), 0)

  const pipelineStages = [
    { id: 'raw', label: 'Raw', hex: '#FADDE1' },
    { id: 'pre_testing', label: 'Pre-Test', hex: '#FFC4D6' },
    { id: 'pre_test_passed', label: 'Test Passed', hex: '#FFACC5' },
    { id: 'pasteurized', label: 'Pasteurized', hex: '#FF97B7' },
    { id: 'post_testing', label: 'Post-Test', hex: '#FFA6C1' },
    { id: 'ready', label: 'Ready', hex: '#FF87AB' },
    { id: 'dispensed', label: 'Dispensed', hex: '#FF5D8F' },
    { id: 'discarded', label: 'Discarded', hex: '#F08080' },
  ]

  const STAGE_NAV: Record<string, string> = {
    raw:             'collection',
    pre_testing:     'lab',
    pre_test_passed: 'pasteurization',
    pasteurized:     'pasteurization',
    post_testing:    'lab',
    ready:           'dispensing',
    dispensed:       'dispensing',
  }

  const pipelineData = pipelineStages.map(stage => {
    const stageBatches = batches.filter(b => b.status === stage.id || (b.status || '').toLowerCase() === stage.id)
    const volume = stageBatches.reduce((acc, b) => acc + Number(b.total_volume_ml), 0)
    return { ...stage, count: stageBatches.length, volume }
  })

  const PROGRAM_COLORS: Record<string, string> = {
    supsup_todo: '#f472b6',
    milky_way:   '#3f3f46',
    moms_act:    '#fb923c',
  }
  const PROGRAM_LABELS: Record<string, string> = {
    supsup_todo: 'Supsup Todo',
    milky_way:   'Milky Way',
    moms_act:    "Mom's Act",
  }

  type MonthEntry = Record<string, string | number>
  const monthlyRaw = new Map<string, { entry: MonthEntry; sortVal: number }>()
  collectionReports.forEach(c => {
    const key = c.collected_at?.slice(0, 7) ?? 'unknown'
    if (!monthlyRaw.has(key)) {
      const d = c.collected_at ? new Date(c.collected_at.slice(0, 7) + '-01T00:00:00') : new Date(0)
      monthlyRaw.set(key, {
        entry: { name: new Intl.DateTimeFormat('en-PH', { month: 'short' }).format(d) },
        sortVal: d.getTime(),
      })
    }
    const item = monthlyRaw.get(key)!
    item.entry[c.program] = (Number(item.entry[c.program] ?? 0)) + Number(c.volume_ml ?? 0)
  })
  const monthlyChartData = Array.from(monthlyRaw.values())
    .sort((a, b) => a.sortVal - b.sortVal)
    .map(item => item.entry)
  const activePrograms = Array.from(new Set(collectionReports.map(c => c.program)))

  const programDataMap = new Map<string, number>()
  collectionReports.forEach(c => {
    programDataMap.set(c.program, (programDataMap.get(c.program) || 0) + Number(c.volume_ml || 0))
  })
  const programChartData = Array.from(programDataMap.entries()).map(([name, value]) => ({ name: toProgramLabel(name) || name, value }))
  const programColors = ['#f472b6', '#3f3f46', '#a1a1aa', '#fb7185']

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: 'Overview' }]} title="Dashboard" subtitle="Live operational summary and metrics" />
      
      {/* Milk Lifecycle Pipeline */}
      <div className="bg-[#18181b] rounded-[32px] p-8 overflow-hidden relative shadow-xl border border-zinc-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-white font-semibold text-xl tracking-tight">Milk Lifecycle Pipeline</h3>
            <p className="text-zinc-500 text-sm mt-1">Real-time batch status across all stages</p>
            <div className="flex items-center gap-5 mt-4 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">{donorCount}</span>
                <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Donors</span>
              </div>
              <div className="w-px h-4 bg-zinc-700 shrink-0" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {new Intl.NumberFormat('en-PH').format(mlReady)}
                </span>
                <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">mL Ready</span>
              </div>
              <div className="w-px h-4 bg-zinc-700 shrink-0" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">{waitlist.length}</span>
                <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">On Waiting List</span>
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate('inventory')} className="text-pink-300 hover:text-pink-200 text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
            Full inventory <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {pipelineData.map((stage, idx) => {
            const navTarget = STAGE_NAV[stage.id]
            return (
              <motion.div
                key={stage.id}
                role={navTarget ? 'button' : undefined}
                tabIndex={navTarget ? 0 : undefined}
                aria-label={navTarget ? `Go to ${stage.label} screen` : undefined}
                onClick={navTarget ? () => onNavigate(navTarget) : undefined}
                onKeyDown={navTarget ? (e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(navTarget) } : undefined}
                className={`flex-shrink-0 bg-[#27272a] rounded-3xl p-5 w-40 snap-start border border-zinc-800 relative z-10 text-left${navTarget ? ' cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2' : ''}`}
                style={navTarget ? { outlineColor: stage.hex } : {}}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: idx * 0.06 }}
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                whileTap={navTarget ? { scale: 0.97 } : undefined}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.hex }} />
                  <span className="text-sm font-medium tracking-wide" style={{ color: stage.hex }}>{stage.label}</span>
                </div>
                <div className="text-4xl font-semibold text-white tracking-tight font-mono">{stage.volume}</div>
                <div className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-wider">mL &middot; {stage.count}b</div>
                {idx !== pipelineData.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-4 h-px bg-zinc-700 -z-10" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Volume */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-zinc-950 font-semibold text-xl tracking-tight">Monthly Collection Volume</h3>
              <p className="text-zinc-400 text-sm mt-1">mL collected per month, 2026</p>
            </div>
            <div className="bg-pink-50 text-pink-500 text-xs font-mono px-3 py-1.5 rounded-full border border-pink-100 tracking-wide uppercase">All Programs</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  cursor={{ stroke: '#fce7f3', strokeWidth: 2 }}
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat('en-PH').format(value) + ' mL',
                    PROGRAM_LABELS[name] ?? name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#71717a' }}>{PROGRAM_LABELS[value] ?? value}</span>}
                />
                {activePrograms.length > 0
                  ? activePrograms.map(prog => (
                      <Line key={prog} type="monotone" dataKey={prog} stroke={PROGRAM_COLORS[prog] ?? '#a1a1aa'} strokeWidth={2.5} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                    ))
                  : <Line type="monotone" dataKey="total" stroke="#f472b6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 3 }} />
                }
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Breakdown */}
        <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-zinc-950 font-semibold text-xl tracking-tight">Program Breakdown</h3>
            <p className="text-zinc-400 text-sm mt-1">Volume by collection program</p>
          </div>
          
          <div className="space-y-6 flex-grow">
            {programChartData.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-zinc-400 text-sm">No data available</div>
            ) : programChartData.map((item, index) => {
              const maxVal = Math.max(...programChartData.map(d => d.value)) || 1
              const total = programChartData.reduce((s, d) => s + d.value, 0) || 1
              const pct = Math.round((item.value / total) * 100)
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-2.5 items-baseline">
                    <span className="font-medium text-zinc-700">{item.name}</span>
                    <span className="text-zinc-400 font-mono text-xs">
                      {new Intl.NumberFormat('en-PH').format(item.value)}&nbsp;mL
                      <span className="text-zinc-300 ml-1.5">&middot; {pct}%</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / maxVal) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: programColors[index % programColors.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {programChartData.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-zinc-500 font-medium">Total</span>
                <span className="font-mono font-bold text-zinc-900">
                  {new Intl.NumberFormat('en-PH').format(programChartData.reduce((s, d) => s + d.value, 0))}&nbsp;mL
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NICU Waiting List */}
        <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-zinc-950 font-semibold text-xl tracking-tight">NICU Waiting List</h3>
            <button onClick={() => onNavigate('inquiry')} className="text-pink-500 hover:text-pink-600 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {waitlist.length === 0 ? (
              <div className="text-zinc-400 text-sm py-4">No patients currently waiting.</div>
            ) : (
              waitlist.slice(0, 5).map(item => {
                const daysWaiting = Math.floor((new Date().getTime() - new Date(item.requested_at).getTime()) / (1000 * 60 * 60 * 24))
                return (
                <div key={item.inquiry_id} className="flex items-center justify-between p-4 bg-[#fbfaf9] rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                      {item.guardian_name ? item.guardian_name[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">{item.guardian_name}</div>
                      <div className="text-sm text-zinc-500">{item.baby_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-pink-500 font-medium font-mono">{daysWaiting}d</div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wider">waiting</div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Keeping original active inquiries as fallback if they want it */}
        <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
           <h3 className="text-zinc-950 font-semibold text-xl tracking-tight mb-6">Active Inquiries</h3>
           <div className="space-y-2">
            {inquiries.length === 0 ? (
              <div className="text-zinc-400 text-sm py-4">No active inquiries.</div>
            ) : (
              inquiries.slice(0, 5).map(row => (
                <div key={row.id} className="flex justify-between items-center py-3 border-b border-zinc-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-zinc-800">{row.beneficiaries?.guardian_name ?? 'Unknown'}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{row.beneficiaries?.baby_name ?? '—'}</div>
                  </div>
                  <StatusBadge value={row.status.toUpperCase()} />
                </div>
              ))
            )}
           </div>
        </div>
      </div>
    </div>
  )
}