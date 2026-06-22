import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, AlertTriangle, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { LAB_TESTS } from '../../mockData'
import type { TestType } from '../../types'

function FailConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.50)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-sm bg-white rounded-xl p-6"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
          style={{ background: '#FEE2E2' }}
        >
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-base text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>
          Mark Batch as Discarded
        </h3>
        <p className="text-sm text-[#6B7280] mb-5">
          This will mark the batch as <strong className="text-red-600">DISCARDED</strong> and cannot be undone. The full volume will be removed from inventory permanently.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm text-[#6B7280] border rounded-lg hover:bg-[#F8F0F4] transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.10)' }}
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            Confirm Discard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LogResultModal({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState<'PASS' | 'FAIL' | ''>('')
  const [showConfirm, setShowConfirm] = useState(false)

  function handleSubmit() {
    if (result === 'FAIL') {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }

  return (
    <>
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
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.07)' }}
          >
            <h2 className="text-base text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>
              Log Lab Result
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F8F0F4] text-[#6B7280]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Batch Number <span className="text-[#eea4bb]">*</span>
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
              >
                <option value="" disabled>Select eligible batch</option>
                <option>BTN-2024-004 (Pre-Testing)</option>
                <option>BTN-2024-002 (Post-Testing)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">Test Type</label>
              <div className="flex gap-3">
                {[{ val: 'PRE', label: 'Pre-Pasteurization' }, { val: 'POST', label: 'Post-Pasteurization' }].map((t) => (
                  <label key={t.val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="testType" value={t.val} className="accent-[#eea4bb]" />
                    <span className="text-sm text-[#1A1A1A]">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#1A1A1A] mb-1.5">
                Result <span className="text-[#eea4bb]">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setResult('PASS')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    result === 'PASS'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-transparent bg-[#F5F6FA] text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                  style={{ borderColor: result === 'PASS' ? '#059669' : 'transparent' }}
                >
                  PASS
                </button>
                <button
                  onClick={() => setResult('FAIL')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    result === 'FAIL'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-transparent bg-[#F5F6FA] text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  FAIL
                </button>
              </div>
              {result === 'FAIL' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 mt-2 p-2.5 rounded-lg"
                  style={{ background: '#FEE2E2' }}
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700">
                    Logging FAIL will mark this batch as DISCARDED. This action cannot be undone.
                  </span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">Result Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                />
              </div>
              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">Tested By</label>
                <input
                  defaultValue="Juan Dela Cruz, M.T."
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
              onClick={handleSubmit}
              disabled={!result}
              className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
              style={result === 'FAIL' ? { background: '#C62828' } : { background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
            >
              Log Result
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showConfirm && (
          <FailConfirmModal
            onConfirm={() => { setShowConfirm(false); onClose() }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function TestTable({ tests }: { tests: typeof LAB_TESTS }) {
  const [page, setPage] = useState(1)
  const PER_PAGE = 5
  const totalPages = Math.ceil(tests.length / PER_PAGE)
  const paged = tests.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {['Batch Number', 'CTN', 'DTN', 'Sample (mL)', 'Date Sent', 'Expected', 'Days Elapsed', 'Result', 'Tested By'].map((h) => (
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
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#6B7280]">No records found.</td>
              </tr>
            ) : (
              paged.map((test, i) => (
                <tr
                  key={test.id}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {test.batchNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {test.ctn}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {test.dtn}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {test.sampleVolume}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{test.dateSent}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{test.expectedDate}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-sm font-medium ${test.daysElapsed > 14 ? 'text-amber-600' : 'text-[#1A1A1A]'}`}
                      style={{ fontFamily: 'var(--font-family-mono)' }}
                    >
                      {test.daysElapsed}d {test.daysElapsed > 14 && <span className="text-xs">(overdue)</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={test.result} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{test.testedBy}</td>
                </tr>
              ))
            )}
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
  )
}

export function LabTestingScreen() {
  const [activeTab, setActiveTab] = useState<TestType>('PRE')
  const [showModal, setShowModal] = useState(false)

  const pending = LAB_TESTS.filter((t) => t.result === 'Pending')
  const preTabs = LAB_TESTS.filter((t) => t.testType === 'PRE')
  const postTests = LAB_TESTS.filter((t) => t.testType === 'POST')

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Milk Lifecycle' }, { label: 'Lab Testing' }]}
        title="Laboratory Testing"
        subtitle="Track pre- and post-pasteurization microbiological tests via City Hall lab"
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
            Log Result
          </motion.button>
        }
      />

      {/* Pending banner */}
      {pending.length > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border mb-4"
          style={{ background: '#FFF8E8', borderColor: '#E6A817' }}
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-sm text-amber-800">
              {pending.length} batch{pending.length !== 1 ? 'es are' : ' is'} awaiting lab results from City Hall.
            </span>
            <span className="text-xs text-amber-600 ml-2">
              Standard turnaround: 2 weeks.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div
          className="flex border-b px-6"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          {([
            { key: 'PRE', label: 'Pre-Pasteurization Tests' },
            { key: 'POST', label: 'Post-Pasteurization Tests' },
          ] as { key: TestType; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 mr-6 text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#eea4bb] text-[#eea4bb]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TestTable tests={activeTab === 'PRE' ? preTabs : postTests} />
      </div>

      <AnimatePresence>
        {showModal && <LogResultModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
