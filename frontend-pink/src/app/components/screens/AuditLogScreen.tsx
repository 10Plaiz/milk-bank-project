import { useEffect, useState, useMemo } from 'react'
import { PageHeader } from '../shared/PageHeader'
import { supabase } from '../../../lib/supabase'
import { Search } from 'lucide-react'

type Profile = { full_name: string; role: string }
type Audit = { 
  id: string; 
  table_name: string; 
  action: string; 
  record_id: string | null; 
  changed_at: string;
  old_row: any;
  new_row: any;
  profiles: Profile | null;
}

export function AuditLogScreen() {
  const [rows, setRows] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState('All Users')
  const [selectedModule, setSelectedModule] = useState('All Modules')

  useEffect(() => { 
    void supabase
      .from('audit_logs')
      .select(`id, table_name, action, record_id, changed_at, old_row, new_row, profiles:changed_by (full_name, role)`)
      .order('changed_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows((data ?? []) as Audit[])
        setLoading(false)
      }) 
  }, [])

  function formatTime(isoString: string) {
    const d = new Date(isoString)
    const date = d.toISOString().split('T')[0]
    const time = d.toTimeString().split(' ')[0].substring(0, 5)
    return { date, time }
  }

  function getChangeSummary(row: Audit) {
    if (row.action === 'delete') return `Record deleted`
    
    const isInsert = row.action === 'insert'
    const payload = isInsert ? row.new_row : row.new_row
    
    switch (row.table_name) {
      case 'donors':
        if (isInsert) return `New donor registered: ${payload.full_name}`
        if (row.old_row?.screening_status !== row.new_row?.screening_status) {
          return `Screening status: ${row.old_row?.screening_status || 'none'} → ${row.new_row?.screening_status}`
        }
        return `Donor details updated for ${payload.full_name}`
        
      case 'batches':
        if (row.old_row?.status !== row.new_row?.status) {
          return `status: ${(row.old_row?.status || 'RAW').toUpperCase()} → ${(row.new_row?.status || '').toUpperCase()}`
        }
        if (isInsert) return `New batch created: ${payload.batch_number}`
        return `Batch updated`
        
      case 'lab_results':
        if (isInsert) return `${payload.stage} test logged`
        if (row.old_row?.result !== row.new_row?.result) {
          return `${payload.stage} result: ${row.new_row?.result}`
        }
        return `Lab result updated`
        
      case 'dispensing_records':
        if (isInsert) return `${payload.volume_ml || 0}mL dispensed`
        if (row.old_row?.status !== row.new_row?.status) {
          return `Dispensing status: ${row.old_row?.status} → ${row.new_row?.status}`
        }
        return `Dispensing record updated`
        
      case 'email_notifications':
        return `Email sent regarding ${payload.trigger_event}`
        
      default:
        return isInsert ? `New record created in ${row.table_name}` : `Record updated in ${row.table_name}`
    }
  }

  const users = useMemo(() => {
    const uniqueUsers = new Set(rows.map(r => r.profiles?.full_name).filter(Boolean))
    return ['All Users', 'System', ...Array.from(uniqueUsers)]
  }, [rows])

  const modules = useMemo(() => {
    const uniqueModules = new Set(rows.map(r => r.table_name))
    return ['All Modules', ...Array.from(uniqueModules)]
  }, [rows])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const userName = r.profiles?.full_name || 'System'
      const matchUser = selectedUser === 'All Users' || userName === selectedUser
      const matchModule = selectedModule === 'All Modules' || r.table_name === selectedModule
      
      const q = searchQuery.toLowerCase()
      const matchSearch = q === '' || 
                          userName.toLowerCase().includes(q) || 
                          r.action.toLowerCase().includes(q) || 
                          r.table_name.toLowerCase().includes(q) ||
                          (r.record_id && r.record_id.toLowerCase().includes(q)) ||
                          getChangeSummary(r).toLowerCase().includes(q)
                          
      return matchUser && matchModule && matchSearch
    })
  }, [rows, searchQuery, selectedUser, selectedModule])

  return (
    <div className="space-y-6">
      <PageHeader 
        crumbs={[{ label: 'Admin' }, { label: 'Audit Log' }]} 
        title="Audit Log" 
        subtitle="Read-only system event log. All batch status transitions and record changes are captured here." 
      />

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by action, record, or user..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
          />
        </div>
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-pink-300 transition-all"
        >
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select 
          value={selectedModule} 
          onChange={(e) => setSelectedModule(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-pink-300 transition-all"
        >
          {modules.map(m => <option key={m} value={m}>{m === 'All Modules' ? m : m}</option>)}
        </select>
        <div className="text-sm text-zinc-500 whitespace-nowrap px-2">
          {filteredRows.length} events
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                {['Timestamp', 'User', 'Role', 'Action', 'Module', 'Record ID', 'Change Summary'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-mono font-semibold text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-400">Loading audit log...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">No audit events match the current filters.</td></tr>
              ) : (
                filteredRows.map((row) => {
                  const { date, time } = formatTime(row.changed_at)
                  const summary = getChangeSummary(row)
                  const actionColor = row.action === 'insert' ? 'bg-emerald-100 text-emerald-700' : row.action === 'delete' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  
                  return (
                    <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-600 whitespace-nowrap">
                        <div className="text-zinc-800">{date}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{time}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 font-medium whitespace-nowrap">{row.profiles?.full_name || 'System'}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500 capitalize whitespace-nowrap">{row.profiles?.role || 'Administrator'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md ${actionColor}`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-600 whitespace-nowrap">{row.table_name}</td>
                      <td className="px-6 py-4 text-xs font-mono text-pink-400 whitespace-nowrap">{row.record_id ? (row.record_id.length > 13 ? row.record_id.substring(0, 13) + '...' : row.record_id) : '-'}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700 max-w-md truncate">{summary}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}