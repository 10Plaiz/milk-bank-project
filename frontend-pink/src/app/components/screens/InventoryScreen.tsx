import { useState } from 'react'
import { Info, Search } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { MILK_BATCHES } from '../../mockData'

const STATUS_STAGES = [
  { status: 'RAW', label: 'Raw', color: '#A8A09A', bg: '#F5F6FA' },
  { status: 'PRE_TESTING', label: 'In Pre-Testing', color: '#B45309', bg: '#FEF3C7' },
  { status: 'PRE_TEST_PASSED', label: 'Pre-Test Passed', color: '#1D4ED8', bg: '#EFF6FF' },
  { status: 'PASTEURIZED', label: 'Pasteurized', color: '#1D4ED8', bg: '#EFF6FF' },
  { status: 'POST_TESTING', label: 'In Post-Testing', color: '#B45309', bg: '#FEF3C7' },
  { status: 'READY', label: 'Ready', color: '#065F46', bg: '#ECFDF5' },
  { status: 'DISPENSED', label: 'Dispensed', color: '#0F766E', bg: '#F0FDFA' },
  { status: 'DISCARDED', label: 'Discarded', color: '#991B1B', bg: '#FEF2F2' },
]

export function InventoryScreen() {
  const [search, setSearch] = useState('')
  const [filterProgram, setFilterProgram] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const getByStatus = (status: string) =>
    MILK_BATCHES.filter((b) => b.status === status || (status === 'DISCARDED' && (b.status === 'DISCARDED' || b.status === 'PRE_TEST_FAILED' || b.status === 'POST_TEST_FAILED')))

  const filtered = MILK_BATCHES.filter((b) => {
    const matchSearch =
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.dtn.toLowerCase().includes(search.toLowerCase()) ||
      b.donorName.toLowerCase().includes(search.toLowerCase())
    const matchProgram = filterProgram === 'All' || b.program === filterProgram
    const matchStatus = filterStatus === 'All' || b.status === filterStatus
    return matchSearch && matchProgram && matchStatus
  })

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Milk Lifecycle' }, { label: 'Inventory' }]}
        title="Inventory"
        subtitle="Real-time milk batch status board. All updates are driven by batch status transitions."
      />

      {/* Read-only notice */}
      <div
        className="flex gap-3 p-4 rounded-xl border mb-6"
        style={{ background: '#FAFAFC', borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <Info className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
        <span className="text-sm text-[#6B7280]">
          Inventory is automatically updated by batch status transitions. No direct edits are allowed here.
        </span>
      </div>

      {/* Status board */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_STAGES.map((stage) => {
          const batches = getByStatus(stage.status)
          const totalVol = batches.reduce((sum, b) => sum + b.volume, 0)

          return (
            <div
              key={stage.status}
              className="rounded-xl border p-4"
              style={{ background: stage.bg, borderColor: `${stage.color}30` }}
            >
              <div className="mb-2">
                <StatusBadge value={stage.status as any} short />
              </div>
              <div
                className="text-2xl text-[#1A1A1A] mb-0.5"
                style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}
              >
                {totalVol}
              </div>
              <div className="text-xs" style={{ color: stage.color }}>
                mL across {batches.length} batch{batches.length !== 1 ? 'es' : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch, DTN, donor..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
            style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
          />
        </div>
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
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
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Statuses</option>
          {STATUS_STAGES.map((s) => (
            <option key={s.status} value={s.status}>{s.label}</option>
          ))}
        </select>
        <span className="text-xs text-[#6B7280]">{filtered.length} records</span>
      </div>

      {/* Full batch list */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Batch Number', 'CTN', 'DTN', 'Donor', 'Program', 'Volume (mL)', 'Collection Date', 'Mode', 'AOB', 'Status'].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-[#6B7280]">
                    No batches match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((batch, i) => (
                  <tr
                    key={batch.ctn}
                    className="hover:bg-[#F8F8FC] transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {batch.ctn}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {batch.dtn}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{batch.donorName}</td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{batch.program}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ fontFamily: 'var(--font-family-mono)', color: '#1A1A1A' }}>
                      {batch.volume}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{batch.collectionDate}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={batch.mode} short />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{batch.aob}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={batch.status} short />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
