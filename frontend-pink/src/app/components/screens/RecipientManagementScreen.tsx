import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { RECIPIENTS } from '../../mockData'
import type { Recipient } from '../../types'

function RecipientModal({ recipient, onClose }: { recipient: Recipient | null; onClose: () => void }) {
  const [nicuStatus, setNicuStatus] = useState(recipient?.nicuStatus ?? false)

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
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-md h-full bg-white flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <h2 className="text-lg text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>
            {recipient ? recipient.guardianName : 'Add Recipient'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F8F0F4] text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* NICU status - prominent */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              nicuStatus
                ? 'bg-[#F8F0F4] border-[#eea4bb]'
                : 'bg-[#F5F6FA] border-[rgba(0,0,0,0.08)]'
            }`}
          >
            <div>
              <div className="text-sm text-[#1A1A1A]">NICU Status</div>
              <div className="text-xs text-[#6B7280] mt-0.5">
                NICU babies receive dispensing priority
              </div>
            </div>
            <div className="flex items-center gap-3">
              {nicuStatus && <StatusBadge value="NICU" />}
              <button
                onClick={() => setNicuStatus(!nicuStatus)}
                className={`relative w-11 h-6 rounded-full transition-colors ${nicuStatus ? 'bg-[#eea4bb]' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${nicuStatus ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Guardian Name <span className="text-[#eea4bb]">*</span>
              </label>
              <input
                defaultValue={recipient?.guardianName ?? ''}
                placeholder="Full name"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Baby Name <span className="text-[#eea4bb]">*</span>
              </label>
              <input
                defaultValue={recipient?.babyName ?? ''}
                placeholder="Baby's name"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#1A1A1A] mb-1.5">
              Hospital <span className="text-[#eea4bb]">*</span>
            </label>
            <input
              defaultValue={recipient?.hospital ?? ''}
              placeholder="Hospital name"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Contact Number <span className="text-[#eea4bb]">*</span>
              </label>
              <input
                defaultValue={recipient?.contact ?? ''}
                placeholder="09XXXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
              />
            </div>
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">Age of Baby (AOB)</label>
              <input
                defaultValue={recipient?.aob ?? ''}
                placeholder="e.g., 28 weeks"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A]">Cancel</button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="px-5 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            {recipient ? 'Save Changes' : 'Add Recipient'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function RecipientManagementScreen() {
  const [search, setSearch] = useState('')
  const [filterNicu, setFilterNicu] = useState('All')
  const [modal, setModal] = useState<Recipient | null | undefined>(undefined)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const filtered = RECIPIENTS.filter((r) => {
    const matchSearch =
      r.guardianName.toLowerCase().includes(search.toLowerCase()) ||
      r.babyName.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital.toLowerCase().includes(search.toLowerCase())
    const matchNicu =
      filterNicu === 'All' ||
      (filterNicu === 'NICU' && r.nicuStatus) ||
      (filterNicu === 'Non-NICU' && !r.nicuStatus)
    return matchSearch && matchNicu
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Recipients' }, { label: 'Recipient Management' }]}
        title="Recipient Management"
        subtitle="Register and manage milk beneficiaries. NICU babies receive dispensing priority."
        actions={
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setModal(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            <Plus className="w-4 h-4" />
            Add Recipient
          </motion.button>
        }
      />

      <div className="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search guardian, baby, hospital..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
            style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
          />
        </div>
        <select
          value={filterNicu}
          onChange={(e) => { setFilterNicu(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Recipients</option>
          <option value="NICU">NICU Only</option>
          <option value="Non-NICU">Non-NICU Only</option>
        </select>
        <span className="text-xs text-[#6B7280]">{filtered.length} records</span>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Guardian Name', 'Baby Name', 'Hospital', 'NICU Status', 'Contact', 'AOB', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr
                  key={r.id}
                  className={`hover:bg-[#F8F8FC] transition-colors cursor-pointer ${r.nicuStatus ? 'bg-[#F8F0F4]/30' : ''}`}
                  style={{ borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  onClick={() => setModal(r)}
                >
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{r.guardianName}</td>
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{r.babyName}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{r.hospital}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={r.nicuStatus ? 'NICU' : 'Non-NICU'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {r.contact}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280]">{r.aob}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={(e) => { e.stopPropagation(); setModal(r) }} className="text-xs text-[#eea4bb] hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30">
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== undefined && <RecipientModal recipient={modal} onClose={() => setModal(undefined)} />}
      </AnimatePresence>
    </div>
  )
}
