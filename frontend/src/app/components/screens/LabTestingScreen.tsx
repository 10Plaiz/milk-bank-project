import { useEffect, useRef, useState, useCallback } from 'react'
import { Plus, X, FlaskConical } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { supabase } from '../../../lib/supabase'
import { formatDate, toTitle, activeProgramToDb } from '../../exportUtils'
import { useProgramFilter } from '../../../lib/programContext'
import { usePagination } from '../../hooks/usePagination'
import { Pagination } from '../shared/Pagination'
import { motion, AnimatePresence } from 'motion/react'

type BatchCollection = { collections: { ctn: string; donors: { dtn: string } | null } }
type Batch = {
  id: string
  batch_number: string | null
  status: string
  program?: string
  batch_collections?: BatchCollection[]
}
type Lab = {
  id: string
  stage: string
  result: string
  sample_volume_ml: number
  sent_to_lab_at: string
  expected_result_at: string
  result_received_at: string | null
  recorded_by_name: string | null
  batches?: Batch | null
}

export function LabTestingScreen() {
  const [rows, setRows]       = useState<Lab[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [activeTab, setActiveTab] = useState<'pre_pasteurization' | 'post_pasteurization'>('pre_pasteurization')

  // Send-to-Lab drawer
  const [sendOpen, setSendOpen]   = useState(false)
  const [sendBatchId, setSendBatchId] = useState('')
  const [sendNotes, setSendNotes]   = useState('')
  const [sending, setSending]       = useState(false)

  // Enter-Result drawer
  const [resolving, setResolving]       = useState<Lab | null>(null)
  const [resolveResult, setResolveResult] = useState<'passed' | 'failed' | null>(null)
  const [resolveSaving, setResolveSaving] = useState(false)

  const activeProgram = useProgramFilter()
  const { page, pageSize, total, totalPages, from, to, setPage, setTotal, resetPage, handlePageSizeChange } = usePagination()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    resetPage()
  }, [activeProgram, activeTab])

  const load = useCallback(async () => {
    const dbProgram = activeProgramToDb(activeProgram)

    // Dropdown only shows batches that are eligible to be sent for this stage:
    // Pre-pasteurization  → raw only (haven't been tested yet)
    // Post-pasteurization → pasteurized only (pasteurization complete, not yet post-tested)
    const eligibleStatus = activeTab === 'pre_pasteurization' ? ['raw'] : ['pasteurized']

    let batchesQuery = supabase
      .from('batches')
      .select('id,batch_number,status,program')
      .in('status', eligibleStatus)
      .order('created_at', { ascending: false })
    if (dbProgram) batchesQuery = batchesQuery.eq('program', dbProgram)

    let labsQuery = supabase
      .from('lab_results')
      .select(
        'id,stage,result,sample_volume_ml,sent_to_lab_at,expected_result_at,' +
        'result_received_at,recorded_by_name,' +
        'batches!inner(id,batch_number,status,program,batch_collections(collections(ctn,donors(dtn))))',
        { count: 'exact' }
      )
      .eq('stage', activeTab)
      .order('sent_to_lab_at', { ascending: false })
      .range(from, to)
    if (dbProgram) labsQuery = labsQuery.eq('batches.program', dbProgram)

    const [{ data: labs, count }, { data: batchRows }] = await Promise.all([labsQuery, batchesQuery])
    setRows((labs ?? []) as Lab[])
    setTotal(count ?? 0)
    setBatches((batchRows ?? []) as Batch[])
  }, [from, to, activeProgram, activeTab])

  useEffect(() => { void load() }, [load])

  // ── Send to Lab ───────────────────────────────────────────────────────────
  async function handleSendToLab(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!sendBatchId) return
    setSending(true)

    const { error } = await supabase.from('lab_results').insert({
      batch_id:          sendBatchId,
      stage:             activeTab,
      result:            'pending',          // trigger sets batch → pre_testing / post_testing
      sample_volume_ml:  5,
      sent_to_lab_at:    new Date().toISOString(),
      expected_result_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes:             sendNotes.trim() || null,
    })

    if (error) { console.error('Send to lab:', error); setSending(false); return }

    // DB trigger apply_lab_result_to_batch handles batch status update automatically.
    setSending(false)
    setSendOpen(false)
    setSendBatchId('')
    setSendNotes('')
    await load()
  }

  // ── Enter Result ─────────────────────────────────────────────────────────
  async function handleEnterResult(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!resolving || !resolveResult) return
    setResolveSaving(true)

    const form = new FormData(e.currentTarget)
    const rawDate      = String(form.get('result_received_at') || '')
    const receivedAt   = rawDate
      ? new Date(rawDate + 'T12:00:00').toISOString()
      : new Date().toISOString()
    const testerName = String(form.get('recorded_by_name') || '').trim()

    const { error } = await supabase
      .from('lab_results')
      .update({
        result:             resolveResult,
        result_received_at: receivedAt,
        recorded_by_name:   testerName || null,
      })
      .eq('id', resolving.id)

    if (error) { console.error('Enter result:', error); setResolveSaving(false); return }

    // DB trigger handles batch status update automatically.
    // Create bottle only when post-pasteurization passes (no DB trigger for this yet).
    if (activeTab === 'post_pasteurization' && resolveResult === 'passed' && resolving.batches?.id) {
      const batchId = resolving.batches.id
      const [{ data: batchData }, { data: existing }] = await Promise.all([
        supabase.from('batches').select('total_volume_ml').eq('id', batchId).single(),
        supabase.from('bottles').select('id').eq('batch_id', batchId),
      ])
      if (!existing || existing.length === 0) {
        await supabase.from('bottles').insert({
          batch_id:            batchId,
          volume_ml:           batchData?.total_volume_ml ?? 0,
          remaining_volume_ml: batchData?.total_volume_ml ?? 0,
          status:              'available',
          expires_at:          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
    }

    setResolveSaving(false)
    setResolving(null)
    setResolveResult(null)
    await load()
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function daysElapsed(sentAt: string) {
    const d = Math.floor((Date.now() - new Date(sentAt).getTime()) / 86_400_000)
    return `${Math.max(0, d)}d`
  }

  function allCtns(b?: Batch | null) {
    if (!b?.batch_collections?.length) return '—'
    return b.batch_collections.map(bc => bc.collections?.ctn).filter(Boolean).join(', ')
  }

  function allDtns(b?: Batch | null) {
    if (!b?.batch_collections?.length) return '—'
    return Array.from(new Set(b.batch_collections.map(bc => bc.collections?.donors?.dtn).filter(Boolean))).join(', ')
  }

  const tabLabel     = activeTab === 'pre_pasteurization' ? 'Pre-Pasteurization' : 'Post-Pasteurization'
  const eligibleLabel = activeTab === 'pre_pasteurization' ? 'Raw' : 'Pasteurized'
  const expectedDate  = formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: 'Milk Lifecycle' }]}
        title="Laboratory Testing"
        subtitle="Send samples to City Hall lab and log results to advance batch status"
        actions={
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all hover:opacity-90"
            style={{ background: '#eea4bb', color: '#322e2d' }}
            aria-label="Send sample to lab"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Send to Lab
          </button>
        }
      />

      {/* Results table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex px-6 pt-4 border-b border-zinc-100 gap-8">
          {(['pre_pasteurization', 'post_pasteurization'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#eea4bb] text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {tab === 'pre_pasteurization' ? 'Pre-Pasteurization' : 'Post-Pasteurization'} Tests
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50">
              <tr className="border-b border-zinc-100">
                {['Batch', 'CTN', 'DTN', 'Sample', 'Sent', 'Expected', 'Elapsed', 'Result', 'Tested By', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map(row => (
                <tr
                  key={row.id}
                  className={`transition-colors ${row.result === 'pending' ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-zinc-50/30'}`}
                >
                  <td className="px-5 py-4 text-sm font-semibold font-mono" style={{ color: '#c4547a' }}>
                    {row.batches?.batch_number ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-zinc-500 max-w-[120px] truncate" title={allCtns(row.batches)}>
                    {allCtns(row.batches)}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-zinc-500 max-w-[120px] truncate" title={allDtns(row.batches)}>
                    {allDtns(row.batches)}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-900 tabular-nums">{row.sample_volume_ml} mL</td>
                  <td className="px-5 py-4 text-sm text-zinc-600 font-mono whitespace-nowrap">{formatDate(row.sent_to_lab_at)}</td>
                  <td className="px-5 py-4 text-sm text-zinc-600 font-mono whitespace-nowrap">{formatDate(row.expected_result_at)}</td>
                  <td className="px-5 py-4 text-sm font-semibold tabular-nums text-zinc-700">{daysElapsed(row.sent_to_lab_at)}</td>
                  <td className="px-5 py-4">
                    {row.result === 'pending' ? (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    ) : (
                      <StatusBadge value={toTitle(row.result)} />
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-500">{row.recorded_by_name ?? '—'}</td>
                  <td className="px-5 py-4">
                    {row.result === 'pending' && (
                      <button
                        onClick={() => { setResolving(row); setResolveResult(null) }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors hover:opacity-80"
                        style={{ background: '#FFF5F8', color: '#c4547a', border: '1px solid #eea4bb' }}
                        aria-label={`Enter result for batch ${row.batches?.batch_number ?? ''}`}
                      >
                        Enter Result
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-sm text-zinc-400">
                    No {activeTab === 'pre_pasteurization' ? 'pre' : 'post'}-pasteurization records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={handlePageSizeChange} />
        </div>
      </div>

      {/* ── Send to Lab drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sendOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSendOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl border-l border-zinc-100"
              role="dialog"
              aria-modal="true"
              aria-labelledby="send-drawer-title"
            >
              <form onSubmit={handleSendToLab} className="flex flex-col h-full">
                <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
                  <div>
                    <h2 id="send-drawer-title" className="text-xl font-semibold text-zinc-900 tracking-tight">Send to Lab</h2>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">{tabLabel} · ~14-day City Hall turnaround</p>
                  </div>
                  <button type="button" onClick={() => setSendOpen(false)} aria-label="Close" className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                  <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-zinc-600" style={{ background: '#F8F7F5', border: '1px solid #e5e7eb' }}>
                    <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" style={{ color: '#eea4bb' }} />
                    <span>
                      Submitting will insert a <strong className="text-zinc-800">pending</strong> lab record and advance the batch to{' '}
                      <strong className="text-zinc-800">{activeTab === 'pre_pasteurization' ? 'Pre-Testing' : 'Post-Testing'}</strong>.
                      Log the result when City Hall returns it.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="send-batch" className="text-sm font-medium text-zinc-700">
                      {eligibleLabel} Batch <span aria-hidden="true" className="text-pink-400">*</span>
                    </label>
                    <select
                      id="send-batch"
                      value={sendBatchId}
                      onChange={e => setSendBatchId(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm outline-none focus-visible:border-[#eea4bb] focus-visible:ring-2 focus-visible:ring-pink-100 transition-all text-zinc-700 appearance-none"
                    >
                      <option value="">Select {eligibleLabel.toLowerCase()} batch…</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.batch_number} ({toTitle(b.status)})</option>
                      ))}
                    </select>
                    {batches.length === 0 && (
                      <p className="text-xs text-zinc-400 mt-1">No {eligibleLabel.toLowerCase()} batches available.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="send-notes" className="text-sm font-medium text-zinc-700">Notes</label>
                    <textarea
                      id="send-notes"
                      value={sendNotes}
                      onChange={e => setSendNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Optional notes about the sample…"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm outline-none focus-visible:border-[#eea4bb] focus-visible:ring-2 focus-visible:ring-pink-100 transition-all resize-none placeholder:text-zinc-400"
                    />
                  </div>

                  <dl className="rounded-xl p-4 space-y-2 text-xs" style={{ background: '#F8F7F5' }}>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Sample volume</dt>
                      <dd className="font-mono text-zinc-700">5 mL (fixed)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Sent</dt>
                      <dd className="font-mono text-zinc-700">Today</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Expected result</dt>
                      <dd className="font-mono font-semibold text-zinc-800">{expectedDate}</dd>
                    </div>
                  </dl>
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setSendOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={sending || !sendBatchId}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#eea4bb', color: '#322e2d' }}
                  >
                    {sending ? 'Sending…' : 'Send to Lab'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Enter Result drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {resolving && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setResolving(null); setResolveResult(null) }}
              className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl border-l border-zinc-100"
              role="dialog"
              aria-modal="true"
              aria-labelledby="result-drawer-title"
            >
              <form onSubmit={handleEnterResult} className="flex flex-col h-full">
                <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
                  <div>
                    <h2 id="result-drawer-title" className="text-xl font-semibold text-zinc-900 tracking-tight">Enter Result</h2>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#7a7573' }}>
                      {resolving.batches?.batch_number ?? '—'} · {tabLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setResolving(null); setResolveResult(null) }}
                    aria-label="Close"
                    className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                  {/* Summary read-only */}
                  <dl className="rounded-xl p-4 space-y-2.5 text-xs" style={{ background: '#F8F7F5', border: '1px solid #e5e7eb' }}>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Batch</dt>
                      <dd className="font-mono font-semibold text-zinc-800">{resolving.batches?.batch_number ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Sent to lab</dt>
                      <dd className="font-mono text-zinc-700">{formatDate(resolving.sent_to_lab_at)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Days elapsed</dt>
                      <dd className="font-mono font-semibold text-zinc-800">{daysElapsed(resolving.sent_to_lab_at)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500 font-medium">Expected by</dt>
                      <dd className="font-mono text-zinc-700">{formatDate(resolving.expected_result_at)}</dd>
                    </div>
                  </dl>

                  {/* Result toggle */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium text-zinc-700">
                      Result <span aria-hidden="true" className="text-pink-400">*</span>
                    </legend>
                    <div className="flex gap-4">
                      {(['passed', 'failed'] as const).map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setResolveResult(val)}
                          aria-pressed={resolveResult === val}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all border ${
                            resolveResult === val ? 'text-white shadow-md' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                          }`}
                          style={resolveResult === val
                            ? val === 'passed'
                              ? { background: '#4a7c66', borderColor: '#4a7c66', boxShadow: '0 4px 12px #4a7c6633' }
                              : { background: '#b8526f', borderColor: '#b8526f', boxShadow: '0 4px 12px #b8526f33' }
                            : {}}
                        >
                          {val === 'passed' ? 'PASS' : 'FAIL'}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {resolveResult === 'failed' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
                          role="alert"
                        >
                          Batch will be marked <strong>Discarded</strong> automatically.
                        </motion.p>
                      )}
                      {resolveResult === 'passed' && activeTab === 'pre_pasteurization' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5"
                          role="status"
                        >
                          Batch will be marked <strong>Pre-Test Passed</strong> and is eligible for pasteurization.
                        </motion.p>
                      )}
                      {resolveResult === 'passed' && activeTab === 'post_pasteurization' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5"
                          role="status"
                        >
                          Batch will be marked <strong>Ready</strong> and a dispensing bottle will be created.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </fieldset>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="resolve-date" className="text-sm font-medium text-zinc-700">
                        Result Received Date <span aria-hidden="true" className="text-pink-400">*</span>
                      </label>
                      <input
                        id="resolve-date"
                        name="result_received_at"
                        type="date"
                        required
                        className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm outline-none focus-visible:border-[#eea4bb] focus-visible:ring-2 focus-visible:ring-pink-100 transition-all text-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="resolve-tester" className="text-sm font-medium text-zinc-700">Tested By</label>
                      <input
                        id="resolve-tester"
                        name="recorded_by_name"
                        type="text"
                        placeholder="e.g., Juan Dela Cruz, M.T."
                        maxLength={100}
                        spellCheck={false}
                        className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm outline-none focus-visible:border-[#eea4bb] focus-visible:ring-2 focus-visible:ring-pink-100 transition-all placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setResolving(null); setResolveResult(null) }}
                    className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={resolveSaving || !resolveResult}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#eea4bb', color: '#322e2d' }}
                  >
                    {resolveSaving ? 'Saving…' : 'Log Result'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
