import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Download, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { DONORS } from '../../mockData'
import type { Donor } from '../../types'

type ModalTab = 'personal' | 'health'

function DonorModal({ donor, onClose }: { donor: Donor | null; onClose: () => void }) {
  const [tab, setTab] = useState<ModalTab>('personal')
  const isNew = !donor

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
        className="w-full max-w-lg h-full bg-white flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <div>
            <h2
              className="text-lg text-[#1A1A1A]"
              style={{ fontFamily: 'var(--font-family-display)', fontWeight: 600 }}
            >
              {isNew ? 'Add Donor' : donor?.name}
            </h2>
            {!isNew && (
              <span
                className="text-xs text-[#6B7280]"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {donor?.dtn}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F8F0F4] transition-colors text-[#6B7280] hover:text-[#1A1A1A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b px-6"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          {(['personal', 'health'] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-1 mr-6 text-sm border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-[#eea4bb] text-[#eea4bb]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {t === 'personal' ? 'Personal Info' : 'Health Screening'}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'personal' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    DTN <span className="text-[#6B7280] text-xs">(auto-generated)</span>
                  </label>
                  <input
                    readOnly
                    value={donor?.dtn ?? 'DTN-2024-009'}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-[#F8F0F4] cursor-default"
                    style={{
                      borderColor: 'rgba(0,0,0,0.07)',
                      fontFamily: 'var(--font-family-mono)',
                      color: '#6B7280',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">
                    Program Type <span className="text-[#eea4bb]">*</span>
                  </label>
                  <select
                    defaultValue={donor?.program ?? ''}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  >
                    <option value="" disabled>Select program</option>
                    <option>Supsup Todo</option>
                    <option>Mom&apos;s Act</option>
                    <option>Milky Way</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">
                  Full Name <span className="text-[#eea4bb]">*</span>
                </label>
                <input
                  defaultValue={donor?.name ?? ''}
                  placeholder="First Middle Last"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                />
              </div>

              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">
                  Home Address <span className="text-[#eea4bb]">*</span>
                </label>
                <input
                  defaultValue={donor?.address ?? ''}
                  placeholder="House No., Street, Barangay, City"
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
                    defaultValue={donor?.contact ?? ''}
                    placeholder="09XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A', fontFamily: 'var(--font-family-mono)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    defaultValue={donor?.dateOfBirth ?? ''}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Occupation</label>
                  <input
                    defaultValue={donor?.occupation ?? ''}
                    placeholder="e.g., Homemaker"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Civil Status</label>
                  <select
                    defaultValue={donor?.civilStatus ?? ''}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  >
                    <option value="" disabled>Select</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Separated</option>
                    <option>Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Classification</label>
                  <select
                    defaultValue={donor?.classification ?? ''}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  >
                    <option value="" disabled>Select</option>
                    <option>Community</option>
                    <option>Private</option>
                    <option>Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Prenatal Health Center</label>
                  <input
                    defaultValue={donor?.prenatalCenter ?? ''}
                    placeholder="Health center name"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-[#1A1A1A] mb-1.5">Last Delivery Date</label>
                <input
                  type="date"
                  defaultValue={donor?.lastDeliveryDate ?? ''}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                />
              </div>

              <div>
                <div className="text-sm text-[#1A1A1A] mb-3">Clinical Health Checklist</div>
                <div
                  className="rounded-lg border divide-y"
                  style={{ borderColor: 'rgba(0,0,0,0.07)' }}
                >
                  {[
                    'History of Tuberculosis (TB)',
                    'History of Hepatitis B',
                    'History of Mastitis',
                    'History of Syphilis',
                    'History of Herpes / STDs',
                    'Blood transfusion in past 12 months',
                    'Organ transplant history',
                    'Alcohol use in past 24 hours',
                    'Active smoker',
                    'Illegal drug use',
                    'Current medications (vitamins, herbal, hormonal)',
                    'International travel in past 5 years',
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                    >
                      <input type="checkbox" className="w-4 h-4 accent-[#eea4bb]" />
                      <span className="text-sm text-[#1A1A1A]">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Screened By</label>
                  <input
                    placeholder="Staff name"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A1A1A] mb-1.5">Date Screened</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.10)', color: '#1A1A1A' }}
                  />
                </div>
              </div>

              <div
                className="rounded-lg border p-4"
                style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#FAFAFC' }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#eea4bb] mt-0.5 shrink-0" />
                  <span className="text-xs text-[#6B7280] leading-relaxed">
                    Consent signed: "I hereby voluntarily donate my breastmilk without financial compensation under the supervision of the Makati Human Milk Bank. I consent to blood testing for Hepatitis B and sputum tests for Tuberculosis clearance before donation."
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="px-5 py-2 text-sm text-white rounded-lg"
            style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
          >
            {isNew ? 'Register Donor' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function DonorManagementScreen() {
  const [search, setSearch] = useState('')
  const [filterProgram, setFilterProgram] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modalDonor, setModalDonor] = useState<Donor | null | undefined>(undefined)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const filtered = DONORS.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.dtn.toLowerCase().includes(search.toLowerCase()) ||
      d.contact.includes(search)
    const matchProgram = filterProgram === 'All' || d.program === filterProgram
    const matchStatus = filterStatus === 'All' || d.screeningStatus === filterStatus
    return matchSearch && matchProgram && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Donors' }, { label: 'Donor Management' }]}
        title="Donor Management"
        subtitle="Register and manage milk donor profiles and health screenings"
        actions={
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] border rounded-lg hover:border-[#eea4bb] hover:text-[#eea4bb] transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.10)', background: 'white' }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => setModalDonor(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
              style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Donor
            </motion.button>
          </>
        }
      />

      {/* Filters */}
      <div
        className="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, DTN, or contact..."
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
          <option>Passed</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
        <span className="text-xs text-[#6B7280]">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['DTN', 'Full Name', 'Program', 'Classification', 'Contact', 'Screening Status', 'Actions'].map((h) => (
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
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    No donors match the current filters.
                  </td>
                </tr>
              ) : (
                paged.map((donor, i) => (
                  <tr
                    key={donor.dtn}
                    className="transition-colors hover:bg-[#F8F8FC] cursor-pointer"
                    style={{ borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                    onClick={() => setModalDonor(donor)}
                  >
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs text-[#eea4bb]"
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {donor.dtn}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{donor.name}</td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{donor.program}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs text-[#6B7280]"
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {donor.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs text-[#1A1A1A]"
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {donor.contact}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={donor.screeningStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalDonor(donor) }}
                        className="text-xs text-[#eea4bb] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'rgba(0,0,0,0.07)' }}
          >
            <span
              className="text-xs text-[#6B7280]"
              style={{ fontFamily: 'var(--font-family-mono)' }}
            >
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-[#F8F0F4] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalDonor !== undefined && (
          <DonorModal donor={modalDonor} onClose={() => setModalDonor(undefined)} />
        )}
      </AnimatePresence>
    </div>
  )
}
