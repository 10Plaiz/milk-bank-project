import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Plus, Search, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, X } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { supabase } from '../../../lib/supabase'
import { formatDate, activeProgramToDb, toProgramLabel } from '../../exportUtils'
import { useProgramFilter } from '../../../lib/programContext'
import { usePagination } from '../../hooks/usePagination'
import { Pagination } from '../shared/Pagination'
import type { AppUser } from '../../types'
import { motion, AnimatePresence } from 'motion/react'

const FEE_PER_ML = 2.00

type Beneficiary = {
  id: string
  guardian_name: string
  baby_name: string
  hospital: string | null
  nicu_eligible: boolean
  age_of_baby_days: number | null
  contact_number: string | null
}

type Bottle = {
  id: string
  bottle_number: string | null
  remaining_volume_ml: number
  batches?: { batch_number: string | null; program: string } | null
}

type DispenseRow = {
  id: string
  volume_ml: number
  total_fee: number
  dispensed_at: string | null
  program: string | null
  beneficiaries?: { guardian_name: string; baby_name: string } | null
  profiles?: { full_name: string } | null
  dispensing_items?: Array<{
    bottles?: { bottle_number: string | null; batches?: { batch_number: string | null } | null } | null
  }> | null
}

type WizardSummary = {
  guardianName: string
  babyName: string
  bottleNumber: string | null
  batchNumber: string | null
  volume: string
  fee: number
  program: string | null
  dispensedBy: string
  dispensedRole: string
}

const PROGRAM_COLORS: Record<string, string> = {
  supsup_todo: 'bg-pink-100 text-pink-700',
  milky_way:   'bg-blue-100 text-blue-700',
  moms_act:    'bg-purple-100 text-purple-700',
  mixed:       'bg-zinc-100 text-zinc-600',
}

function ProgramBadge({ program }: { program: string | null }) {
  if (!program) return <span className="text-zinc-400">—</span>
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${PROGRAM_COLORS[program] ?? 'bg-zinc-100 text-zinc-600'}`}>
      {toProgramLabel(program)}
    </span>
  )
}

const STEPS = [
  { num: 1, label: 'Recipient' },
  { num: 2, label: 'Requirements' },
  { num: 3, label: 'Batch' },
  { num: 4, label: 'Fee' },
  { num: 5, label: 'Confirm' },
]

export function DispensingScreen({ user }: { user: AppUser }) {
  const activeProgram = useProgramFilter()
  const { page, pageSize, total, totalPages, from, to, setPage, setTotal, resetPage, handlePageSizeChange } = usePagination()

  const [rows, setRows] = useState<DispenseRow[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [bottles, setBottles] = useState<Bottle[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const isFirstRender = useRef(true)

  // Wizard state
  const [step, setStep] = useState(1)
  const [dispensed, setDispensed] = useState(false)
  const [summary, setSummary] = useState<WizardSummary | null>(null)
  const [searchRec, setSearchRec] = useState('')
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null)
  const [reqId, setReqId] = useState(false)
  const [reqReferral, setReqReferral] = useState(false)
  const [reqBalance, setReqBalance] = useState(false)
  const [reqDeposit, setReqDeposit] = useState(false)
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null)
  const [dispenseVolume, setDispenseVolume] = useState('')

  const selectedRecipient = useMemo(
    () => beneficiaries.find(b => b.id === selectedRecipientId),
    [beneficiaries, selectedRecipientId]
  )
  const selectedBottle = useMemo(
    () => bottles.find(b => b.id === selectedBottleId),
    [bottles, selectedBottleId]
  )
  const requirementsMet =
    reqId && reqReferral && reqBalance && reqDeposit && (selectedRecipient?.nicu_eligible ?? false)
  const totalFee = Number(dispenseVolume || 0) * FEE_PER_ML

  const filteredWizardRecipients = useMemo(
    () => beneficiaries.filter(r =>
      [r.guardian_name, r.baby_name].join(' ').toLowerCase().includes(searchRec.toLowerCase())
    ),
    [beneficiaries, searchRec]
  )

  // Client-side search on the current page of rows
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      (r.beneficiaries?.guardian_name ?? '').toLowerCase().includes(q) ||
      (r.beneficiaries?.baby_name ?? '').toLowerCase().includes(q) ||
      (r.profiles?.full_name ?? '').toLowerCase().includes(q)
    )
  }, [rows, search])

  // Reset page when program filter changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    resetPage()
  }, [activeProgram])

  const load = useCallback(async () => {
    const dbProgram = activeProgramToDb(activeProgram)

    let recordsQuery = supabase
      .from('dispensing_records')
      .select(
        'id,volume_ml,total_fee,dispensed_at,program,' +
        'beneficiaries(guardian_name,baby_name),' +
        'profiles(full_name),' +
        'dispensing_items(bottles(bottle_number,batches(batch_number)))',
        { count: 'exact' }
      )
      .order('dispensed_at', { ascending: false, nullsFirst: false })
      .range(from, to)

    if (dbProgram) recordsQuery = recordsQuery.eq('program', dbProgram)

    const [{ data: disp, count }, { data: bens }, { data: bots }] = await Promise.all([
      recordsQuery,
      supabase
        .from('beneficiaries')
        .select('id,guardian_name,baby_name,hospital,nicu_eligible,age_of_baby_days,contact_number')
        .eq('nicu_eligible', true)
        .order('guardian_name'),
      supabase
        .from('bottles')
        .select('id,bottle_number,remaining_volume_ml,batches(batch_number,program)')
        .eq('status', 'available')
        .gt('remaining_volume_ml', 0)
        .order('created_at'),
    ])

    // Filter available bottles by active program client-side
    // (PostgREST doesn't support filtering on nested FK fields directly)
    const filteredBottles = dbProgram
      ? (bots ?? []).filter(b => (b.batches as { program?: string } | null)?.program === dbProgram)
      : (bots ?? [])

    setRows((disp ?? []) as DispenseRow[])
    setTotal(count ?? 0)
    setBeneficiaries((bens ?? []) as Beneficiary[])
    setBottles(filteredBottles as Bottle[])
  }, [from, to, activeProgram])

  useEffect(() => { void load() }, [load])

  function resetWizard() {
    setStep(1); setDispensed(false); setSummary(null)
    setSelectedRecipientId(null); setSearchRec('')
    setReqId(false); setReqReferral(false); setReqBalance(false); setReqDeposit(false)
    setSelectedBottleId(null); setDispenseVolume('')
  }

  async function handleDispense(): Promise<void> {
    if (!selectedRecipient || !selectedBottle || !dispenseVolume) return
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    const volume = Number(dispenseVolume)
    const batchProgram = (selectedBottle.batches as { program?: string } | null)?.program ?? null

    const { data, error } = await supabase
      .from('dispensing_records')
      .insert({
        beneficiary_id: selectedRecipient.id,
        status: 'confirmed',
        volume_ml: volume,
        fee_per_ml: FEE_PER_ML,
        bottle_deposit_amount: 0,
        deposit_paid: reqDeposit,
        clinical_abstract_verified: reqReferral,
        prescription_verified: true,
        cooler_with_ice_verified: true,
        dispensed_by: session?.user?.id ?? null,
        dispensed_at: new Date().toISOString(),
        program: batchProgram,
      })
      .select('id')
      .single()

    if (error || !data) { setSaving(false); return }

    await Promise.all([
      supabase.from('dispensing_items').insert({
        dispensing_record_id: data.id,
        bottle_id: selectedBottle.id,
        volume_ml: volume,
      }),
      supabase.from('bottles').update({
        remaining_volume_ml: Math.max(0, selectedBottle.remaining_volume_ml - volume),
        status: selectedBottle.remaining_volume_ml - volume <= 0 ? 'dispensed' : 'available',
      }).eq('id', selectedBottle.id),
    ])

    setSaving(false)
    setSummary({
      guardianName: selectedRecipient.guardian_name,
      babyName: selectedRecipient.baby_name,
      bottleNumber: selectedBottle.bottle_number,
      batchNumber: selectedBottle.batches?.batch_number ?? null,
      volume: dispenseVolume,
      fee: totalFee,
      program: batchProgram,
      dispensedBy: user.name,
      dispensedRole: user.role,
    })
    setDispensed(true)
    await load()
  }

  function formatAob(days: number | null) {
    if (!days) return 'N/A'
    return `${Math.floor(days / 7)}w ${days % 7}d`
  }

  function getBottleFromRow(row: DispenseRow) {
    return row.dispensing_items?.[0]?.bottles ?? null
  }

  function StepBar() {
    return (
      <div className="flex items-center w-full relative mb-8 pt-2">
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-zinc-100 -z-10" />
        <div
          className="absolute top-4 left-6 h-[2px] bg-[#eea4bb] -z-10 transition-all duration-300"
          style={{ width: `calc(${(step - 1) * 25}% - 12px)` }}
        />
        {STEPS.map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2 flex-1 relative bg-white px-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step === s.num ? 'text-white shadow-sm' :
              step > s.num  ? 'bg-emerald-500 text-white' :
              'bg-zinc-100 text-zinc-400'
            }`} style={step === s.num ? { background: '#eea4bb', color: '#322e2d' } : {}}>
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${step >= s.num ? 'text-zinc-700' : 'text-zinc-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Dispensing' }]}
        title="Dispensing"
        subtitle="Process milk release to NICU-priority recipients"
        actions={
          <button
            onClick={() => { resetWizard(); setOpen(true) }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all hover:opacity-90"
            style={{ background: '#eea4bb', color: '#322e2d' }}
          >
            <Plus className="w-4 h-4" />
            New Dispensing
          </button>
        }
      />

      {/* Dispensing Log */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-900">Dispensing Log</h3>
            <p className="text-sm text-zinc-500">
              {activeProgram !== 'All' ? toProgramLabel(activeProgramToDb(activeProgram)) : 'All programs'}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search guardian, baby, or staff..."
              className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-xl outline-none focus:border-[#eea4bb] focus:ring-2 focus:ring-pink-100 transition-all w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50">
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Guardian</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Baby</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Program</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bottle / Batch</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Volume</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Fee</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dispensed By</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filteredRows.map(row => {
                const bottle = getBottleFromRow(row)
                return (
                  <tr key={row.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-zinc-900">{row.beneficiaries?.guardian_name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-zinc-600">{row.beneficiaries?.baby_name ?? '—'}</td>
                    <td className="px-5 py-4"><ProgramBadge program={row.program} /></td>
                    <td className="px-5 py-4 text-sm font-mono text-zinc-700">
                      {bottle
                        ? <><span>{bottle.bottle_number ?? '—'}</span><span className="text-zinc-300 mx-1">/</span><span className="text-zinc-500">{bottle.batches?.batch_number ?? '—'}</span></>
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-zinc-900">
                      {row.volume_ml} <span className="text-zinc-400 font-normal text-xs">mL</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-zinc-900">
                      ₱{row.total_fee?.toFixed(2) ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-600">{row.profiles?.full_name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-zinc-500 font-mono">{formatDate(row.dispensed_at) || '—'}</td>
                  </tr>
                )
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-zinc-400">
                    No dispensing records{activeProgram !== 'All' ? ` for ${activeProgram}` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="border-b border-zinc-100 px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">New Dispensing</h2>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: '#7a7573' }}>
                    Logged as: <span className="text-zinc-700 font-semibold">{user.name}</span>
                    <span className="mx-1.5 text-zinc-300">·</span>
                    <span>{user.role}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!dispensed && (
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
                      Step {step} of 5
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setOpen(false); if (dispensed) resetWizard() }}
                    className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ background: '#F8F7F5' }}>
                {!dispensed && <StepBar />}

                <div className="min-h-[300px]">

                  {/* Step 1 — Find Recipient */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl mx-auto">
                      <p className="text-sm text-zinc-500 text-center">Search for the NICU-eligible recipient.</p>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          value={searchRec}
                          onChange={e => setSearchRec(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-[#eea4bb] focus:ring-2 focus:ring-pink-100 transition-all shadow-sm"
                          placeholder="Search by guardian or baby name..."
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        {filteredWizardRecipients.map(rec => (
                          <div
                            key={rec.id}
                            onClick={() => setSelectedRecipientId(rec.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-sm ${
                              selectedRecipientId === rec.id
                                ? 'border-[#eea4bb] ring-2 ring-pink-100'
                                : 'border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm text-zinc-900">{rec.guardian_name}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{rec.baby_name} · {rec.hospital ?? 'No hospital'}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700 font-mono">NICU</span>
                            </div>
                            <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                              <span>AOB: {formatAob(rec.age_of_baby_days)}</span>
                              <span>{rec.contact_number ?? 'No contact'}</span>
                            </div>
                          </div>
                        ))}
                        {filteredWizardRecipients.length === 0 && (
                          <div className="text-center py-8 text-sm text-zinc-400 bg-white rounded-xl border border-zinc-200">
                            {searchRec ? 'No recipients match.' : 'No NICU-eligible recipients registered.'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 — Verify Requirements */}
                  {step === 2 && selectedRecipient && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl mx-auto">
                      <p className="text-sm text-zinc-500 text-center">
                        Verify requirements for <strong className="text-zinc-800">{selectedRecipient.guardian_name}</strong>.
                      </p>
                      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white divide-y divide-zinc-100 shadow-sm">
                        {[
                          {
                            label: 'NICU admission verified',
                            checked: selectedRecipient.nicu_eligible,
                            locked: true,
                          },
                          { label: 'Guardian ID presented', checked: reqId, toggle: () => setReqId(!reqId) },
                          { label: 'Referral letter from attending physician', checked: reqReferral, toggle: () => setReqReferral(!reqReferral) },
                          { label: 'Previous balance cleared', checked: reqBalance, toggle: () => setReqBalance(!reqBalance) },
                          { label: 'Deposit ready', checked: reqDeposit, toggle: () => setReqDeposit(!reqDeposit) },
                        ].map(({ label, checked, toggle, locked }) => (
                          <div
                            key={label}
                            onClick={toggle}
                            className={`p-4 flex items-center justify-between transition-colors ${!locked ? 'cursor-pointer hover:bg-zinc-50' : ''} ${checked ? 'bg-emerald-50/30' : 'bg-red-50/20'}`}
                          >
                            <div className="flex items-center gap-3">
                              {checked
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                              }
                              <span className="text-sm font-medium text-zinc-800">{label}</span>
                            </div>
                            {!checked && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-600">
                                {locked ? 'Not eligible' : 'Required'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {!requirementsMet && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          All requirements must be met to proceed.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3 — Select Bottle */}
                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl mx-auto">
                      <p className="text-sm text-zinc-500 text-center">
                        Select an available bottle{activeProgram !== 'All' ? ` from ${activeProgram}` : ''}.
                      </p>
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {bottles.map(bot => (
                          <div
                            key={bot.id}
                            onClick={() => { setSelectedBottleId(bot.id); setDispenseVolume('') }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center bg-white shadow-sm ${
                              selectedBottleId === bot.id
                                ? 'border-[#eea4bb] ring-2 ring-pink-100'
                                : 'border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm font-mono text-zinc-900">{bot.bottle_number}</span>
                                <ProgramBadge program={(bot.batches as { program?: string } | null)?.program ?? null} />
                              </div>
                              <p className="text-xs text-zinc-500 mt-1 font-mono">Batch: {bot.batches?.batch_number ?? '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-zinc-900 font-mono">
                                {bot.remaining_volume_ml}
                                <span className="text-xs font-normal text-zinc-400 ml-1">mL</span>
                              </p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">remaining</p>
                            </div>
                          </div>
                        ))}
                        {bottles.length === 0 && (
                          <div className="text-center py-8 text-sm text-zinc-400 bg-white rounded-xl border border-zinc-200">
                            No bottles available{activeProgram !== 'All' ? ` for ${activeProgram}` : ''}.
                          </div>
                        )}
                      </div>
                      {selectedBottle && (
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                            Dispensing Volume (mL)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={selectedBottle.remaining_volume_ml}
                            value={dispenseVolume}
                            onChange={e => setDispenseVolume(e.target.value)}
                            className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-mono text-lg outline-none focus:border-[#eea4bb] focus:ring-2 focus:ring-pink-100 transition-all"
                            placeholder={`1 – ${selectedBottle.remaining_volume_ml}`}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4 — Fee Summary */}
                  {step === 4 && selectedBottle && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto space-y-4">
                      <p className="text-sm text-zinc-500 text-center">Review the dispensing fee.</p>
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                          <span className="text-sm text-zinc-500">Volume</span>
                          <span className="font-bold font-mono text-zinc-900">{dispenseVolume} mL</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                          <span className="text-sm text-zinc-500">Rate</span>
                          <span className="font-bold font-mono text-zinc-900">₱{FEE_PER_ML.toFixed(2)} / mL</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl border" style={{ background: '#FFF5F8', borderColor: '#eea4bb' }}>
                          <span className="font-semibold text-zinc-800">Total Fee</span>
                          <span className="text-2xl font-bold font-mono" style={{ color: '#c4547a' }}>₱{totalFee.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-center">Collect payment before dispensing.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5 — Final Confirm */}
                  {!dispensed && step === 5 && selectedRecipient && selectedBottle && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-5">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#FFF5F8' }}>
                          <CheckCircle2 className="w-7 h-7" style={{ color: '#eea4bb' }} />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900">Ready to Dispense</h3>
                        <p className="text-sm text-zinc-500">Review and confirm.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Guardian', value: selectedRecipient.guardian_name },
                          { label: 'Baby', value: selectedRecipient.baby_name },
                          { label: 'Bottle', value: selectedBottle.bottle_number ?? '—', mono: true },
                          { label: 'Batch', value: selectedBottle.batches?.batch_number ?? '—', mono: true },
                          { label: 'Volume', value: `${dispenseVolume} mL`, mono: true },
                          { label: 'Dispensed By', value: `${user.name}` },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`text-sm font-semibold text-zinc-900 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
                            {label === 'Dispensed By' && (
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{user.role}</p>
                            )}
                          </div>
                        ))}
                        <div className="col-span-2 p-4 rounded-xl border flex justify-between items-center" style={{ background: '#FFF5F8', borderColor: '#eea4bb' }}>
                          <span className="text-sm font-semibold text-zinc-800">Total Fee</span>
                          <span className="text-2xl font-bold font-mono" style={{ color: '#c4547a' }}>₱{totalFee.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Success */}
                  {dispensed && summary && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto space-y-5">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900">Dispensing Complete</h3>
                        <p className="text-sm text-zinc-500">Record saved successfully.</p>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-0 shadow-sm divide-y divide-zinc-100">
                        {[
                          { label: 'Guardian', value: summary.guardianName },
                          { label: 'Baby', value: summary.babyName },
                          { label: 'Bottle', value: summary.bottleNumber ?? '—', mono: true },
                          { label: 'Batch', value: summary.batchNumber ?? '—', mono: true },
                          { label: 'Volume', value: `${summary.volume} mL`, mono: true },
                          { label: 'Dispensed By', value: `${summary.dispensedBy} · ${summary.dispensedRole}` },
                          { label: 'Program', value: summary.program ? toProgramLabel(summary.program) : '—' },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                            <span className="text-xs text-zinc-500">{label}</span>
                            <span className={`text-sm font-semibold text-zinc-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3">
                          <span className="text-xs text-zinc-500">Total Fee</span>
                          <span className="text-base font-bold font-mono" style={{ color: '#c4547a' }}>₱{summary.fee.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>

              {/* Modal footer */}
              <div className="border-t border-zinc-100 px-6 py-4 bg-white shrink-0">
                <div className="flex justify-between items-center">
                  {dispensed ? (
                    <>
                      <button
                        onClick={() => { setOpen(false); resetWizard() }}
                        className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={resetWizard}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
                        style={{ background: '#eea4bb', color: '#322e2d' }}
                      >
                        <Plus className="w-4 h-4" /> New Dispensing
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => step === 1 ? setOpen(false) : setStep(step - 1)}
                        className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors flex items-center gap-2"
                      >
                        {step === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
                      </button>
                      {step < 5 ? (
                        <button
                          disabled={
                            (step === 1 && !selectedRecipientId) ||
                            (step === 2 && !requirementsMet) ||
                            (step === 3 && (
                              !selectedBottleId ||
                              !dispenseVolume ||
                              Number(dispenseVolume) <= 0 ||
                              Number(dispenseVolume) > (selectedBottle?.remaining_volume_ml ?? 0)
                            ))
                          }
                          onClick={() => setStep(step + 1)}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: '#eea4bb', color: '#322e2d' }}
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled={saving}
                          onClick={() => void handleDispense()}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: '#eea4bb', color: '#322e2d' }}
                        >
                          {saving ? 'Saving...' : 'Confirm & Dispense'} <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
