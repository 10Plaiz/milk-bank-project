import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, Circle, Search, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { DISPENSING_RECORDS, RECIPIENTS, MILK_BATCHES } from '../../mockData'
import type { AppUser } from '../../types'

const STEPS = [
  'Find Recipient',
  'Verify Requirements',
  'Select Batch',
  'Fee Summary',
  'Confirm & Dispense',
]

const REQUIREMENTS = [
  { label: 'NICU admission verified', passed: true },
  { label: 'Guardian ID presented', passed: true },
  { label: 'Referral letter from attending physician', passed: true },
  { label: 'Previous balance cleared', passed: false },
  { label: 'Deposit ready', passed: true },
]

interface DispensingWizardProps {
  user: AppUser
  onClose: () => void
}

function DispensingWizard({ user, onClose }: DispensingWizardProps) {
  const [step, setStep] = useState(0)
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0])
  const [selectedBatch, setSelectedBatch] = useState(MILK_BATCHES.find((b) => b.status === 'READY'))
  const [volume, setVolume] = useState('120')
  const [deposit, setDeposit] = useState('')

  const feePerMl = 2
  const totalFee = parseFloat(volume || '0') * feePerMl

  function canProceed() {
    if (step === 1) return REQUIREMENTS.every((r) => r.passed)
    return true
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      {/* Progress bar */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>
            New Dispensing
          </h3>
          <span
            className="text-xs text-[#6B7280]"
            style={{ fontFamily: 'var(--font-family-mono)' }}
          >
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                      ? 'text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
                style={{ background: i === step ? '#eea4bb' : undefined, fontFamily: 'var(--font-family-mono)' }}
              >
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1 transition-colors"
                  style={{ background: i < step ? '#10B981' : '#F3F4F6' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`text-[10px] ${i === step ? 'text-[#c07090]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'var(--font-family-mono)', width: `${100 / STEPS.length}%`, textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="px-6 py-5"
        >
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Search for the recipient to dispense milk to.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  placeholder="Search by guardian name or baby name..."
                  defaultValue="Margarita Ramos"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                />
              </div>
              <div
                className="p-4 rounded-xl border"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#1A1A1A]">{selectedRecipient.guardianName}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">{selectedRecipient.babyName} · {selectedRecipient.hospital}</div>
                  </div>
                  <StatusBadge value={selectedRecipient.nicuStatus ? 'NICU' : 'Non-NICU'} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#6B7280]">
                  <span>AOB: {selectedRecipient.aob}</span>
                  <span style={{ fontFamily: 'var(--font-family-mono)' }}>{selectedRecipient.contact}</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Verify that all dispensing requirements have been met for <strong className="text-[#1A1A1A]">{selectedRecipient.guardianName}</strong>.</p>
              <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                {REQUIREMENTS.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-3 px-4 py-3 ${req.passed ? '' : 'bg-red-50'}`}
                  >
                    {req.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className={`text-sm ${req.passed ? 'text-[#1A1A1A]' : 'text-red-700'}`}>
                      {req.label}
                    </span>
                    {!req.passed && (
                      <span className="ml-auto text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        Not met
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {!canProceed() && (
                <div
                  className="flex gap-3 p-3 rounded-lg border"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA' }}
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">
                    All requirements must be met before dispensing can proceed. Resolve outstanding items first.
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Select a READY batch with sufficient volume.</p>
              {MILK_BATCHES.filter((b) => b.status === 'READY').map((batch) => (
                <div
                  key={batch.batchNumber}
                  onClick={() => setSelectedBatch(batch)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedBatch?.batchNumber === batch.batchNumber
                      ? 'border-[#eea4bb] bg-[#FDF5F3]'
                      : 'border-[rgba(0,0,0,0.08)] hover:border-[#eea4bb]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {batch.batchNumber}
                      </span>
                      <span className="mx-2 text-[#F3F4F6]">·</span>
                      <span className="text-sm text-[#6B7280]">{batch.donorName}</span>
                    </div>
                    <StatusBadge value="READY" />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[#6B7280]">
                    <span style={{ fontFamily: 'var(--font-family-mono)' }}>{batch.volume} mL available</span>
                    <span>DTN: {batch.dtn}</span>
                    <span>{batch.program}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Enter volume to dispense and confirm fee details.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Volume (mL) <span className="text-[#eea4bb]">*</span>
                  </label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Fee per mL <span className="text-[#6B7280] text-xs">(fixed)</span>
                  </label>
                  <input
                    readOnly
                    value="₱2.00"
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-[#F8F0F4] cursor-default"
                    style={{ borderColor: 'rgba(0,0,0,0.07)', fontFamily: 'var(--font-family-mono)', color: '#6B7280' }}
                  />
                </div>
              </div>
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)' }}
              >
                {[
                  ['Volume', `${volume || 0} mL`],
                  ['Fee per mL', '₱2.00'],
                  ['Total Fee', `₱${totalFee.toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-[#6B7280]">{label}</span>
                    <span className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>{val}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  <div>
                    <label className="block text-sm text-[#1A1A1A] mb-1">Deposit Paid</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ background: 'white', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Review all details before confirming the dispensing record.</p>
              <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                {[
                  ['Recipient', selectedRecipient.guardianName],
                  ['Baby', selectedRecipient.babyName],
                  ['Hospital', selectedRecipient.hospital],
                  ['Batch', selectedBatch?.batchNumber ?? '-'],
                  ['DTN', selectedBatch?.dtn ?? '-'],
                  ['Volume', `${volume} mL`],
                  ['Total Fee', `₱${totalFee.toFixed(2)}`],
                  ['Dispensed By', user.name],
                  ['Date', new Date().toLocaleDateString('en-PH')],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-[#6B7280]">{label}</span>
                    <span
                      className="text-sm text-[#1A1A1A]"
                      style={label === 'Batch' || label === 'DTN' || label === 'Volume' || label === 'Total Fee' ? { fontFamily: 'var(--font-family-mono)' } : {}}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ borderColor: 'rgba(0,0,0,0.07)' }}
      >
        <button
          onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => {
            if (step < STEPS.length - 1) setStep((s) => s + 1)
            else onClose()
          }}
          disabled={step === 1 && !canProceed()}
          className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
          style={step === STEPS.length - 1 ? { background: '#059669' } : { background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
        >
          {step === STEPS.length - 1 ? 'Confirm & Dispense' : 'Next'}
          {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  )
}

interface DispensingScreenProps {
  user: AppUser
}

export function DispensingScreen({ user }: DispensingScreenProps) {
  const [showWizard, setShowWizard] = useState(false)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Dispensing' }]}
        title="Dispensing"
        subtitle="Process milk release to NICU-priority recipients with full eligibility verification"
        actions={
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            New Dispensing
          </motion.button>
        }
      />

      {showWizard && (
        <div className="mb-6">
          <DispensingWizard user={user} onClose={() => setShowWizard(false)} />
        </div>
      )}

      {/* Dispensing log */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <h3 className="text-sm text-[#1A1A1A]">Dispensing Log</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Complete history of milk disbursements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Recipient', 'Baby Name', 'Batch Number', 'DTN', 'Volume (mL)', 'Total Fee', 'Dispensed By', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISPENSING_RECORDS.map((rec, i) => (
                <tr
                  key={rec.id}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < DISPENSING_RECORDS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{rec.recipient}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{rec.babyName}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>{rec.batchNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>{rec.dtn}</td>
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>{rec.volume}</td>
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-family-mono)' }}>₱{rec.totalFee.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{rec.dispensedBy}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{rec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
