import { useEffect, useMemo, useState } from 'react'
import { Download, Plus, Search, X } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { supabase } from '../../../lib/supabase'
import { exportCsv, exportExcel, fromProgramLabel, toProgramLabel, toTitle, type ExportRow } from '../../exportUtils'
import { motion, AnimatePresence } from 'motion/react'

type DonorRow = {
  id: string
  dtn: string | null
  full_name: string
  primary_program: string
  classification: string
  contact_number: string | null
  address: string
  screening_status: string
  created_at: string
}

const CHECKLIST_ITEMS = [
  { id: 'tb', label: 'History of Tuberculosis (TB)' },
  { id: 'hepb', label: 'History of Hepatitis B' },
  { id: 'mastitis', label: 'History of Mastitis' },
  { id: 'syphilis', label: 'History of Syphilis' },
  { id: 'herpes', label: 'History of Herpes / STDs' },
  { id: 'blood', label: 'Blood transfusion in past 12 months' },
  { id: 'organ', label: 'Organ transplant history' },
  { id: 'alcohol', label: 'Alcohol use in past 24 hours' },
  { id: 'smoker', label: 'Active smoker' },
  { id: 'drugs', label: 'Illegal drug use' }
]

export function DonorManagementScreen() {
  const [rows, setRows] = useState<DonorRow[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'screening'>('personal')

  async function load(): Promise<void> {
    const { data } = await supabase.from('donors').select('id,dtn,full_name,primary_program,classification,contact_number,address,screening_status,created_at').order('created_at', { ascending: false })
    setRows((data ?? []) as DonorRow[])
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => rows.filter((row) => [row.dtn, row.full_name, row.contact_number].join(' ').toLowerCase().includes(search.toLowerCase())), [rows, search])
  const exportRows: ExportRow[] = filtered.map((row) => ({ DTN: row.dtn, Name: row.full_name, Program: toProgramLabel(row.primary_program), Classification: toTitle(row.classification), Contact: row.contact_number, Status: toTitle(row.screening_status) }))

  async function saveDonor(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSaving(true)
    const form = new FormData(event.currentTarget)
    const program = fromProgramLabel(form.get('program'))
    
    const { data: newDonor } = await supabase.from('donors').insert({
      full_name: String(form.get('full_name') ?? ''),
      address: String(form.get('address') ?? ''),
      contact_number: String(form.get('contact_number') ?? ''),
      date_of_birth: form.get('date_of_birth') || null,
      occupation: form.get('occupation') ? String(form.get('occupation')) : null,
      civil_status: form.get('civil_status') ? String(form.get('civil_status')) : null,
      primary_program: program,
      classification: String(form.get('classification') || 'community'),
      screening_status: 'pending'
    }).select('id').single()

    if (newDonor) {
      await supabase.from('donor_screenings').insert({
        donor_id: newDonor.id,
        program: program,
        screening_result: 'pending',
        tuberculosis_history: form.get('tb') === 'on',
        hepatitis_b_history: form.get('hepb') === 'on',
        mastitis_history: form.get('mastitis') === 'on',
        syphilis_history: form.get('syphilis') === 'on',
        herpes_or_std_history: form.get('herpes') === 'on',
        blood_transfusion_last_12_months: form.get('blood') === 'on',
        organ_transplant_history: form.get('organ') === 'on',
        alcohol_last_24_hours: form.get('alcohol') === 'on',
        smoking_history: form.get('smoker') === 'on',
        illegal_drug_use: form.get('drugs') === 'on',
        last_delivery_date: form.get('last_delivery_date') || null
      })
    }

    setSaving(false)
    setOpen(false)
    await load()
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        crumbs={[{ label: 'Donors' }]} 
        title="Donor Management" 
        subtitle="Register and manage milk donor profiles and health screenings" 
        actions={
          <div className="flex gap-2">
            <button onClick={() => exportCsv('donors', exportRows)} className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Download className="w-4 h-4" />Export
            </button>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90 shadow-sm" style={{ background: '#f472b6' }}>
              <Plus className="w-4 h-4" />Add Donor
            </button>
          </div>
        } 
      />

      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-zinc-50/50 border border-zinc-200 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all" 
            placeholder="Search by name, DTN, or contact..." 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-x-auto shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              {['DTN','Full Name','Program','Classification','Contact','Screening Status','Actions'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-pink-400">{row.dtn}</td>
                <td className="px-6 py-4 text-sm text-zinc-900 font-medium">{row.full_name}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{toProgramLabel(row.primary_program)}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{toTitle(row.classification)}</td>
                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{row.contact_number}</td>
                <td className="px-6 py-4"><StatusBadge value={toTitle(row.screening_status)} /></td>
                <td className="px-6 py-4 text-sm text-pink-400 hover:text-pink-500 cursor-pointer font-medium">Edit</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-400">No donors found</td></tr>
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white z-50 flex flex-col shadow-2xl border-l border-zinc-100"
            >
              <form onSubmit={saveDonor} className="flex flex-col h-full">
                <div className="px-8 py-6 border-b border-zinc-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Add Donor</h2>
                    <button type="button" onClick={() => setOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-6 border-b border-zinc-100">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('personal')}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'personal' ? 'border-[#eea4bb] text-[#eea4bb]' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Personal Info
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('screening')}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'screening' ? 'border-[#eea4bb] text-[#eea4bb]' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Health Screening
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar">
                  {activeTab === 'personal' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">DTN <span className="text-zinc-400 font-normal">(auto-generated)</span></label>
                          <input disabled value="Auto-generated by system" className="w-full rounded-xl bg-pink-50/50 border border-pink-100 px-4 py-2.5 text-sm text-zinc-500 font-mono outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Program Type <span className="text-pink-400">*</span></label>
                          <select name="program" required className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                            <option value="">Select program</option>
                            <option>Supsup Todo</option>
                            <option>Mom's Act</option>
                            <option>Milky Way</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700">Full Name <span className="text-pink-400">*</span></label>
                        <input name="full_name" required placeholder="First Middle Last" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700">Home Address <span className="text-pink-400">*</span></label>
                        <input name="address" required placeholder="House No., Street, Barangay, City" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Contact Number <span className="text-pink-400">*</span></label>
                          <input name="contact_number" required placeholder="09XXXXXXXXX" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm font-mono outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Date of Birth</label>
                          <input type="date" name="date_of_birth" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Occupation</label>
                          <input name="occupation" placeholder="e.g., Homemaker" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Civil Status</label>
                          <select name="civil_status" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                            <option value="">Select</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="separated">Separated</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Classification</label>
                          <select name="classification" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-700 appearance-none">
                            <option value="">Select</option>
                            <option value="community">Community</option>
                            <option value="private">Private</option>
                            <option value="institutional">Institutional</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700">Prenatal Health Center</label>
                          <input name="health_center" placeholder="Health center name" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700">Last Delivery Date</label>
                        <input type="date" name="last_delivery_date" className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-zinc-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-700">Clinical Health Checklist</label>
                        <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden divide-y divide-zinc-100 shadow-sm">
                          {CHECKLIST_ITEMS.map((item) => (
                            <label key={item.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/50 cursor-pointer transition-colors group">
                              <div className="relative flex items-center justify-center">
                                <input type="checkbox" name={item.id} className="peer sr-only" />
                                <div className="w-5 h-5 border-2 border-zinc-300 rounded bg-white peer-checked:bg-zinc-800 peer-checked:border-zinc-800 transition-colors" />
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 items-center">
                  <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#eea4bb' }}>
                    {saving ? 'Saving...' : 'Register Donor'}
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