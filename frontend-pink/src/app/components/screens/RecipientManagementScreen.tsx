import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { supabase } from '../../../lib/supabase'
import { motion, AnimatePresence } from 'motion/react'

type Recipient = { id: string; guardian_name: string; baby_name: string; hospital: string | null; nicu_eligible: boolean; contact_number: string | null; contact_email: string | null; age_of_baby_days: number | null }

export function RecipientManagementScreen() {
  const [rows, setRows] = useState<Recipient[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'nicu' | 'non-nicu'>('all')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isNicu, setIsNicu] = useState(true)

  async function load(): Promise<void> { 
    const { data } = await supabase.from('beneficiaries').select('*').order('created_at', { ascending: false })
    setRows((data ?? []) as Recipient[]) 
  }
  
  useEffect(() => { void load() }, [])
  
  const filtered = useMemo(() => rows.filter((r) => {
    const matchesSearch = [r.guardian_name, r.baby_name, r.hospital].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : filter === 'nicu' ? r.nicu_eligible : !r.nicu_eligible
    return matchesSearch && matchesFilter
  }), [rows, search, filter])

  async function save(event: React.FormEvent<HTMLFormElement>): Promise<void> { 
    event.preventDefault()
    setSaving(true)
    const form = new FormData(event.currentTarget)
    
    // Parse AOB
    const aobStr = String(form.get('aob_text') ?? '')
    const match = aobStr.match(/(\d+)/)
    const weeks = match ? parseInt(match[1], 10) : 0
    const ageOfBabyDays = weeks > 0 ? weeks * 7 : 0

    await supabase.from('beneficiaries').insert({ 
      guardian_name: String(form.get('guardian_name')), 
      baby_name: String(form.get('baby_name')), 
      hospital: String(form.get('hospital')), 
      contact_number: String(form.get('contact_number')), 
      contact_email: null, 
      nicu_eligible: isNicu, 
      age_of_baby_days: ageOfBabyDays > 0 ? ageOfBabyDays : null
    })
    
    setSaving(false)
    setOpen(false)
    setIsNicu(true)
    await load() 
  }

  function formatAob(days: number | null) {
    if (!days) return 'N/A'
    const weeks = Math.floor(days / 7)
    return `${weeks} weeks`
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        crumbs={[{ label: 'Recipients' }, { label: 'Recipient Management' }]} 
        title="Recipient Management" 
        subtitle="Register and manage milk beneficiaries. NICU babies receive dispensing priority." 
        actions={
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all hover:opacity-90" style={{ background: '#f472b6' }}>
            <Plus className="w-4 h-4" />Add Recipient
          </button>
        } 
      />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex items-center gap-4 bg-zinc-50/50">
          <div className="relative flex-1 max-w-3xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" 
              placeholder="Search guardian, baby, hospital..." 
            />
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 min-w-[160px]"
          >
            <option value="all">All Recipients</option>
            <option value="nicu">NICU Only</option>
            <option value="non-nicu">Non-NICU Only</option>
          </select>
          
          <div className="text-sm text-zinc-500 font-medium ml-2 shrink-0">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50">
              <tr className="border-b border-zinc-100">
                {['Guardian Name','Baby Name','Hospital','NICU Status','Contact','AOB','Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-900 font-medium">{r.guardian_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900">{r.baby_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{r.hospital || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge value={r.nicu_eligible ? 'NICU' : 'Non-NICU'} />
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-600">{r.contact_number || r.contact_email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{formatAob(r.age_of_baby_days)}</td>
                  <td className="px-6 py-4">
                    <button className="text-pink-400 text-sm font-medium hover:text-pink-500 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-400">No recipients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl border-l border-zinc-100"
            >
              <form onSubmit={save} className="flex flex-col h-full">
                <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Add Recipient</h2>
                  <button type="button" onClick={() => setOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar space-y-6">
                  
                  {/* NICU Toggle Banner */}
                  <div className="bg-pink-50/30 border border-pink-200/50 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">NICU Status</h3>
                      <p className="text-sm text-zinc-500 mt-0.5">NICU babies receive dispensing priority</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isNicu ? 'bg-pink-100 text-pink-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        {isNicu ? 'NICU' : 'Non-NICU'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIsNicu(!isNicu)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${isNicu ? 'bg-pink-300' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isNicu ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Guardian Name <span className="text-pink-400">*</span></label>
                      <input name="guardian_name" required placeholder="Full name" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Baby Name <span className="text-pink-400">*</span></label>
                      <input name="baby_name" required placeholder="Baby's name" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Hospital <span className="text-pink-400">*</span></label>
                    <input name="hospital" required placeholder="Hospital name" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Contact Number <span className="text-pink-400">*</span></label>
                      <input name="contact_number" required placeholder="09XXXXXXXXX" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm font-mono outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Age of Baby (AOB)</label>
                      <input name="aob_text" placeholder="e.g., 28 weeks" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                  </div>

                </div>

                <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 items-center">
                  <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#f472b6' }}>
                    {saving ? 'Saving...' : 'Add Recipient'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}