import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Info, X } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { PASTEURIZATION_RECORDS } from '../../mockData'

function PasteurizationModal({ onClose }: { onClose: () => void }) {
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
            Log Pasteurization
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F8F0F4] text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Gate notice */}
          <div
            className="flex gap-3 p-3 rounded-lg border"
            style={{ background: '#EFF6FF', borderColor: '#3B72C4' }}
          >
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-xs text-blue-800">
              Only batches with status <strong>PRE_TEST_PASSED</strong> are eligible for pasteurization.
            </span>
          </div>

          <div>
            <label className="block text-sm text-[#1A1A1A] mb-1.5">
              Batch Number <span className="text-[#eea4bb]">*</span>
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
            >
              <option value="" disabled>Select PRE_TEST_PASSED batch</option>
              <option>BTN-2024-001 (180mL, DTN-2024-001)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#1A1A1A] mb-1.5">Operator</label>
            <select
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
            >
              <option>Juan Dela Cruz, M.T.</option>
              <option>Maria Santos, R.N.</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Temperature (°C) <span className="text-[#eea4bb]">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue="62.5"
                placeholder="62.5"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
              />
              <p className="text-xs text-[#6B7280] mt-1">Standard: 62.5°C</p>
            </div>
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Duration (min) <span className="text-[#eea4bb]">*</span>
              </label>
              <input
                type="number"
                defaultValue="30"
                placeholder="30"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
              />
              <p className="text-xs text-[#6B7280] mt-1">Standard: 30 min</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#1A1A1A] mb-1.5">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
            />
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
            Log Pasteurization
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function PasteurizationScreen() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Milk Lifecycle' }, { label: 'Pasteurization' }]}
        title="Pasteurization"
        subtitle="Record Holder pasteurization runs and advance batch status to PASTEURIZED"
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
            Log Pasteurization
          </motion.button>
        }
      />

      {/* Status gate info */}
      <div
        className="flex gap-3 p-4 rounded-xl border mb-4"
        style={{ background: '#EFF6FF', borderColor: 'rgba(59,114,196,0.30)' }}
      >
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span className="text-sm text-blue-800">
          Only batches that have passed pre-pasteurization testing (<StatusBadge value="PRE_TEST_PASSED" short />) are eligible and shown in the batch selector.
        </span>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Batch Number', 'Operator', 'Temperature (°C)', 'Duration (min)', 'Date', 'Post-Test Status'].map((h) => (
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
              {PASTEURIZATION_RECORDS.map((record, i) => (
                <tr
                  key={record.id}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < PASTEURIZATION_RECORDS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {record.batchNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{record.operator}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {record.temperature}°C
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {record.duration} min
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{record.date}</td>
                  <td className="px-4 py-3.5">
                    {record.postTestStatus === 'Pending' ? (
                      <StatusBadge value="Pending" />
                    ) : record.postTestStatus === 'PASS' ? (
                      <StatusBadge value="PASS" />
                    ) : (
                      <StatusBadge value="FAIL" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <PasteurizationModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
