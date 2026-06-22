import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, AlertTriangle, Info, ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { MILK_BATCHES } from '../../mockData'

function LabelPreview({ volume, program }: { volume: string; program: string }) {
  const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const expiry = new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'rgba(0,0,0,0.08)', background: '#FAFAFC' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#6B7280]">Label Preview</span>
        <button className="flex items-center gap-1 text-xs text-[#eea4bb] hover:underline">
          <Printer className="w-3 h-3" />
          Print
        </button>
      </div>
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center"
        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
      >
        <div
          className="text-sm mb-1 text-[#1A1A1A]"
          style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700 }}
        >
          MAKATI HUMAN MILK BANK
        </div>
        <div className="text-xs text-[#6B7280] mb-3">Unpasteurized Human Breast Milk</div>
        <div className="text-left space-y-1.5">
          {[
            ['DTN', 'DTN-2024-NEW'],
            ['Volume', volume ? `${volume} mL` : '--- mL'],
            ['AOB', '--- weeks'],
            ['Mode', 'FC'],
            ['DoC', today],
            ['Collected by', 'Maria Santos, R.N.'],
            ['DoEx', expiry],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-4">
              <span
                className="text-[11px] text-[#6B7280]"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {label}:
              </span>
              <span
                className="text-[11px] text-[#1A1A1A] text-right"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CollectionModal({ onClose }: { onClose: () => void }) {
  const [program, setProgram] = useState('')
  const [volume, setVolume] = useState('')
  const vol = parseFloat(volume)
  const volWarning = volume && (vol < 30 || vol > 240)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.40)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-2xl h-full bg-white flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <h2
            className="text-lg text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}
          >
            New Collection
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F8F0F4] transition-colors text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-6 p-6">
            {/* Left: form */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">
                  Program Type <span className="text-[#eea4bb]">*</span>
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                >
                  <option value="" disabled>Select program</option>
                  <option>Supsup Todo</option>
                  <option>Mom&apos;s Act</option>
                  <option>Milky Way</option>
                </select>
              </div>

              {program === 'Supsup Todo' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 p-3 rounded-lg border"
                  style={{ background: '#FFF8E8', borderColor: '#E6A817' }}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-amber-800">Screening gate active</div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      Confirm that the donor's preliminary screening and consent signing are fully complete before proceeding with Supsup Todo collection.
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    CTN <span className="text-[#6B7280] text-xs">(auto-generated)</span>
                  </label>
                  <input
                    readOnly
                    value="CTN-2024-009"
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-[#F8F0F4]"
                    style={{ borderColor: 'rgba(0,0,0,0.07)', fontFamily: 'var(--font-family-mono)', color: '#6B7280' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Batch Number <span className="text-[#6B7280] text-xs">(auto-generated)</span>
                  </label>
                  <input
                    readOnly
                    value="BTN-2024-009"
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-[#F8F0F4]"
                    style={{ borderColor: 'rgba(0,0,0,0.07)', fontFamily: 'var(--font-family-mono)', color: '#6B7280' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">
                  Donor <span className="text-[#eea4bb]">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    placeholder="Search by DTN or name..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Volume (mL) <span className="text-[#eea4bb]">*</span>
                  </label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="30 - 240"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{
                      background: '#F5F6FA',
                      borderColor: volWarning ? '#C62828' : 'rgba(0,0,0,0.10)',
                      color: '#1A1A1A',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  />
                  {volWarning && (
                    <p className="text-xs text-red-600 mt-1">
                      Volume must be between 30 and 240 mL per session.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Collection Mode <span className="text-[#eea4bb]">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  >
                    <option value="" disabled>Select mode</option>
                    <option value="FC">FC - Field Collection</option>
                    <option value="PU">PU - Pickup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Collection Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Age of Baby (AOB)</label>
                  <input
                    placeholder="e.g., 6 weeks"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">Collected By</label>
                <input
                  defaultValue="Maria Santos, R.N."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                />
              </div>
            </div>

            {/* Right: label preview */}
            <div className="w-52 shrink-0">
              <LabelPreview volume={volume} program={program} />
              <div className="mt-3 flex items-start gap-2 text-xs text-[#6B7280]">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Label is auto-populated with entered values for printing.</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="px-5 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            Log Collection
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function MilkCollectionScreen() {
  const [search, setSearch] = useState('')
  const [filterProgram, setFilterProgram] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const filtered = MILK_BATCHES.filter((b) => {
    const matchSearch =
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.ctn.toLowerCase().includes(search.toLowerCase()) ||
      b.donorName.toLowerCase().includes(search.toLowerCase()) ||
      b.dtn.toLowerCase().includes(search.toLowerCase())
    const matchProgram = filterProgram === 'All' || b.program === filterProgram
    const matchStatus = filterStatus === 'All' || b.status === filterStatus
    return matchSearch && matchProgram && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Milk Lifecycle' }, { label: 'Collection' }]}
        title="Milk Collection"
        subtitle="Log and track breast milk donations by batch and program"
        actions={
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            <Plus className="w-4 h-4" />
            New Collection
          </motion.button>
        }
      />

      <div
        className="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search batch, CTN, donor..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
            style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
          />
        </div>
        <select
          value={filterProgram}
          onChange={(e) => { setFilterProgram(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Programs</option>
          <option>Supsup Todo</option>
          <option>Mom&apos;s Act</option>
          <option>Milky Way</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Statuses</option>
          <option value="RAW">RAW</option>
          <option value="PRE_TESTING">PRE_TESTING</option>
          <option value="READY">READY</option>
          <option value="DISPENSED">DISPENSED</option>
          <option value="DISCARDED">DISCARDED</option>
        </select>
        <span className="text-xs text-[#6B7280]">{filtered.length} records</span>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['CTN', 'Batch Number', 'Donor', 'Program', 'Volume (mL)', 'Date', 'Mode', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-family-mono)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((batch, i) => (
                <tr
                  key={batch.ctn}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {batch.ctn}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {batch.batchNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm text-[#1A1A1A] whitespace-nowrap">{batch.donorName}</div>
                    <div className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {batch.dtn}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{batch.program}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-family-mono)', color: '#1A1A1A' }}>
                      {batch.volume}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{batch.collectionDate}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={batch.mode} short />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={batch.status} short />
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-xs text-[#eea4bb] hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <CollectionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
