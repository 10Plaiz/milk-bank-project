import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { supabase } from '../../../lib/supabase'
import { fromProgramLabel, formatDate, toProgramLabel } from '../../exportUtils'
import { motion, AnimatePresence } from 'motion/react'

type Donor = { id: string; dtn: string | null; full_name: string; primary_program: string }
type Collection = { id: string; ctn: string | null; program: string; volume_ml: number; collection_mode: string; collected_at: string; donors?: Donor | null }

export function MilkCollectionScreen() {
  const [rows, setRows] = useState<Collection[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load(): Promise<void> {
    const [{ data: collections }, { data: donorRows }] = await Promise.all([
      supabase.from('collections').select('id,ctn,program,volume_ml,collection_mode,collected_at,donors(id,dtn,full_name,primary_program)').order('collected_at', { ascending: false }),
      supabase.from('donors').select('id,dtn,full_name,primary_program').order('full_name'),
    ])
    setRows((collections ?? []) as Collection[])
    setDonors((donorRows ?? []) as Donor[])
  }
  useEffect(() => { void load() }, [])
  
  const filtered = useMemo(() => rows.filter((row) => [row.ctn, row.donors?.dtn, row.donors?.full_name].join(' ').toLowerCase().includes(search.toLowerCase())), [rows, search])

  async function save(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSaving(true)
    const form = new FormData(event.currentTarget)
    const donorId = String(form.get('donor_id') ?? '')
    const program = fromProgramLabel(form.get('program'))
    const volume = Number(form.get('volume_ml') ?? 0)
    const status = String(form.get('status') ?? 'raw')
    
    // Parse AOB (e.g. "6 weeks" -> 42 days)
    const aobInput = String(form.get('aob') ?? '').trim()
    let ageOfBabyDays = null
    if (aobInput) {
      const num = parseInt(aobInput)
      if (!isNaN(num)) {
        ageOfBabyDays = aobInput.toLowerCase().includes('month') ? num * 30 : aobInput.toLowerCase().includes('week') ? num * 7 : num
      }
    }
    
    const { data: collection } = await supabase.from('collections').insert({ 
      donor_id: donorId, 
      program, 
      volume_ml: volume, 
      collection_mode: String(form.get('collection_mode')), 
      collected_at: String(form.get('collected_at')) || new Date().toISOString(), 
      age_of_baby_days: ageOfBabyDays,
      cold_chain_verified: true 
      // Note: collected_by expects a UUID to profiles. Skipping free-text insert.
    }).select('id').single()
    
    const { data: batch } = await supabase.from('batches').insert({ 
      program, 
      status 
    }).select('id').single()
    
    if (collection && batch) {
      await supabase.from('batch_collections').insert({ 
        collection_id: collection.id, 
        batch_id: batch.id, 
        volume_ml: volume 
      })
      if (status === 'ready') {
        await supabase.from('bottles').insert({
          batch_id: batch.id,
          volume_ml: volume,
          remaining_volume_ml: volume,
          status: 'available',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }
    
    setSaving(false)
    setOpen(false)
    await load()
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        crumbs={[{ label: 'Milk Lifecycle' }]} 
        title="Milk Collection" 
        subtitle="Supabase-backed collection and batch creation" 
        actions={
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90 shadow-sm" style={{ background: '#f472b6' }}>
            <Plus className="w-4 h-4" />New Collection
          </button>
        } 
      />
      
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-zinc-50/50 border border-zinc-200 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all" 
            placeholder="Search collection..." 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-x-auto shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              {['CTN','Donor','Program','Volume','Mode','Date'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-pink-400">{row.ctn}</td>
                <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                  {row.donors?.full_name}
                  <div className="text-xs text-zinc-500 font-normal mt-0.5">{row.donors?.dtn}</div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600">{toProgramLabel(row.program)}</td>
                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{row.volume_ml} mL</td>
                <td className="px-6 py-4"><StatusBadge value={row.collection_mode} short /></td>
                <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(row.collected_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-400">No collections found</td></tr>
            )}
          </tbody>
        </table>
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
                  <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">New Collection</h2>
                  <button type="button" onClick={() => setOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Program Type <span className="text-pink-400">*</span></label>
                    <select name="program" required className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                      <option value="">Select program</option>
                      <option>Supsup Todo</option>
                      <option>Mom's Act</option>
                      <option>Milky Way</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">CTN <span className="text-zinc-400 font-normal">(auto-generated)</span></label>
                      <input disabled value="Auto-generated" className="w-full rounded-xl bg-pink-50/50 border border-pink-100 px-4 py-2.5 text-sm text-zinc-500 font-mono outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Batch Number <span className="text-zinc-400 font-normal">(auto-generated)</span></label>
                      <input disabled value="Auto-generated" className="w-full rounded-xl bg-pink-50/50 border border-pink-100 px-4 py-2.5 text-sm text-zinc-500 font-mono outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Donor <span className="text-pink-400">*</span></label>
                    <select name="donor_id" required className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                      <option value="">Search by DTN or name...</option>
                      {donors.map((d) => (
                        <option key={d.id} value={d.id}>{d.dtn} - {d.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Volume (mL) <span className="text-pink-400">*</span></label>
                      <input name="volume_ml" type="number" min="30" max="240" required placeholder="30 - 240" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm font-mono outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Collection Mode <span className="text-pink-400">*</span></label>
                      <select name="collection_mode" required className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                        <option value="field_collection">FC - Field Collection</option>
                        <option value="pickup">Pickup</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Collection Date</label>
                      <input name="collected_at" type="datetime-local" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Age of Baby (AOB)</label>
                      <input name="aob" placeholder="e.g., 6 weeks" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Collected By</label>
                    <input name="collected_by" placeholder="e.g., Maria Santos, R.N." className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Status <span className="text-pink-400">*</span></label>
                    <select name="status" required className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                      <option value="raw">Raw</option>
                      <option value="pre_testing">Pre-testing</option>
                      <option value="post_testing">Post-testing</option>
                      <option value="ready">Ready</option>
                      <option value="dispensed">Dispensed</option>
                      <option value="discarded">Discarded</option>
                    </select>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 items-center">
                  <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#eea4bb' }}>
                    {saving ? 'Saving...' : 'Log Collection'}
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