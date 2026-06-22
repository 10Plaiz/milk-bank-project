import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, AlertTriangle, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { INQUIRIES } from '../../mockData'
import type { InquiryStatus } from '../../types'

function InquiryModal({ onClose }: { onClose: () => void }) {
  const [nicuConfirmed, setNicuConfirmed] = useState(false)
  const [showGate, setShowGate] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nicuConfirmed) {
      setShowGate(true)
    } else {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.40)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-md bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.10)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <h2 className="text-base text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>
            Log Inquiry
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F8F0F4] text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Inquiry Type <span className="text-[#eea4bb]">*</span>
              </label>
              <div className="flex gap-3">
                {['Walk-in', 'Hotline Call'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="inquiryType" value={type} className="accent-[#eea4bb]" />
                    <span className="text-sm text-[#1A1A1A]">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Recipient <span className="text-[#eea4bb]">*</span>
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              >
                <option value="" disabled>Search or select recipient</option>
                <option>Margarita Ramos - Baby Boy Ramos (NICU)</option>
                <option>Corazon Navarro - Baby Girl Navarro (NICU)</option>
                <option>Patricia Mendoza - Baby Girl Mendoza (NICU)</option>
              </select>
            </div>

            {/* NICU confirmation gate */}
            <div
              className={`p-4 rounded-xl border ${
                nicuConfirmed
                  ? 'bg-[#F8F0F4] border-[#eea4bb]'
                  : showGate
                    ? 'bg-red-50 border-red-400'
                    : 'bg-[#FAFAFC] border-[rgba(0,0,0,0.08)]'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nicuConfirmed}
                  onChange={(e) => { setNicuConfirmed(e.target.checked); setShowGate(false) }}
                  className="w-4 h-4 accent-[#eea4bb] mt-0.5 shrink-0"
                />
                <div>
                  <span className="text-sm text-[#1A1A1A]">
                    I confirm this baby is currently admitted to the <strong>NICU</strong>.
                  </span>
                  <span className="text-xs text-[#6B7280] block mt-0.5">Required — only NICU babies are eligible for milk from this bank.</span>
                </div>
              </label>
              {showGate && !nicuConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 mt-3 p-2.5 rounded-lg bg-red-100"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs text-red-700">
                    Only NICU babies are eligible for milk from this bank. Confirm NICU status to proceed.
                  </span>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">Notes</label>
              <textarea
                rows={3}
                placeholder="Additional notes about the inquiry..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A]">Cancel</button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              type="submit"
              className="px-5 py-2 text-sm text-white rounded-lg"
              style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
            >
              Log Inquiry
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

type WaitingListTab = 'inquiries' | 'waiting'

const ACTION_LABELS: Record<InquiryStatus, string> = {
  WAITING: 'Mark Notified',
  NOTIFIED: 'Mark Fulfilled',
  FULFILLED: '',
  CANCELLED: '',
}

export function InquiryWaitingListScreen() {
  const [activeTab, setActiveTab] = useState<WaitingListTab>('inquiries')
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  const waitingList = INQUIRIES.filter((i) => i.nicuStatus && i.status !== 'CANCELLED')
  const allInquiries = INQUIRIES

  const currentList = activeTab === 'waiting' ? waitingList : allInquiries
  const totalPages = Math.ceil(currentList.length / PER_PAGE)
  const paged = currentList.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Recipients' }, { label: 'Inquiry & Waiting List' }]}
        title="Inquiry & Waiting List"
        subtitle="Log availability inquiries and manage the NICU priority waiting list"
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
            Log Inquiry
          </motion.button>
        }
      />

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex border-b px-6" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          {([
            { key: 'inquiries', label: 'Active Inquiries' },
            { key: 'waiting', label: 'Waiting List' },
          ] as { key: WaitingListTab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`py-4 px-1 mr-6 text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#eea4bb] text-[#eea4bb]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
              {tab.key === 'waiting' && (
                <span
                  className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full"
                  style={{ background: '#eea4bb', color: 'white', fontFamily: 'var(--font-family-mono)' }}
                >
                  {waitingList.filter((i) => i.status === 'WAITING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Recipient', 'Baby Name', 'NICU', 'Type', 'Date', 'Days Waiting', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((inq, i) => (
                <tr
                  key={inq.id}
                  className={`hover:bg-[#F8F8FC] transition-colors ${
                    inq.nicuStatus && inq.status === 'WAITING' ? 'bg-[#F8F0F4]/20' : ''
                  }`}
                  style={{ borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{inq.recipientName}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{inq.babyName}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={inq.nicuStatus ? 'NICU' : 'Non-NICU'} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280]">{inq.inquiryType}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{inq.date}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#6B7280]" />
                      <span
                        className={`text-sm ${inq.daysWaiting > 14 ? 'text-amber-600' : 'text-[#1A1A1A]'}`}
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {inq.daysWaiting}d
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={inq.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    {ACTION_LABELS[inq.status] ? (
                      <button className="text-xs text-[#eea4bb] hover:underline whitespace-nowrap">
                        {ACTION_LABELS[inq.status]}
                      </button>
                    ) : inq.status === 'WAITING' || inq.status === 'NOTIFIED' ? (
                      <button className="text-xs text-[#6B7280] hover:underline">Cancel</button>
                    ) : null}
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
        {showModal && <InquiryModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
