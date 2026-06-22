import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { AUDIT_LOGS } from '../../mockData'

const ACTION_COLORS: Record<string, string> = {
  INSERT: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

export function AuditLogScreen() {
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('All')
  const [filterModule, setFilterModule] = useState('All')

  const users = [...new Set(AUDIT_LOGS.map((l) => l.user))]
  const modules = [...new Set(AUDIT_LOGS.map((l) => l.module))]

  const filtered = AUDIT_LOGS.filter((log) => {
    const matchSearch =
      log.summary.toLowerCase().includes(search.toLowerCase()) ||
      log.recordId.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
    const matchUser = filterUser === 'All' || log.user === filterUser
    const matchModule = filterModule === 'All' || log.module === filterModule
    return matchSearch && matchUser && matchModule
  })

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Admin' }, { label: 'Audit Log' }]}
        title="Audit Log"
        subtitle="Read-only system event log. All batch status transitions and record changes are captured here."
      />

      <div
        className="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, record, or user..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
            style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
          />
        </div>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Users</option>
          {users.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: '#F5F6FA', borderColor: 'rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        >
          <option value="All">All Modules</option>
          {modules.map((m) => <option key={m}>{m}</option>)}
        </select>
        <span className="text-xs text-[#6B7280]">{filtered.length} events</span>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Timestamp', 'User', 'Role', 'Action', 'Module', 'Record ID', 'Change Summary'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#6B7280]">
                    No audit events match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F8F8FC] transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {log.timestamp}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{log.user}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] ?? 'bg-stone-100 text-stone-600'}`}
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#eea4bb]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                        {log.recordId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] max-w-xs">
                      <p className="truncate">{log.summary}</p>
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
