import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Droplets, Eye, EyeOff, ChevronDown, Heart, Shield, Zap } from 'lucide-react'
import type { AppUser } from '../../types'

const DEMO_USERS: { label: string; role: string; user: AppUser }[] = [
  { label: 'Administrator', role: 'Full access', user: { name: 'Admin User', role: 'Administrator', initials: 'AU' } },
  { label: 'Dr. Roberto Reyes', role: 'Doctor', user: { name: 'Dr. Roberto Reyes', role: 'Doctor', initials: 'RR' } },
  { label: 'Maria Santos, R.N.', role: 'Nurse', user: { name: 'Maria Santos, R.N.', role: 'Nurse', initials: 'MS' } },
  { label: 'Carmen Cruz, R.M.', role: 'Midwife', user: { name: 'Carmen Cruz, R.M.', role: 'Midwife', initials: 'CC' } },
  { label: 'Juan Dela Cruz, M.T.', role: 'Medical Technologist', user: { name: 'Juan Dela Cruz, M.T.', role: 'Medical Technologist', initials: 'JD' } },
]

interface LoginScreenProps {
  onLogin: (user: AppUser) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('staff@mhmb.makati.gov.ph')
  const [password, setPassword] = useState('••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(DEMO_USERS[2])
  const [showDemoDropdown, setShowDemoDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onLogin(selectedDemo.user)
      setLoading(false)
    }, 700)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F7F5' }}>
      {/* Left - brand panel (solid dark brown) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0"
        style={{ background: '#322e2d' }}
      >
        <div className="px-10 pt-10">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#eea4bb' }}
            >
              <Droplets className="w-4.5 h-4.5" style={{ color: '#322e2d' }} />
            </div>
            <div>
              <div className="text-sm text-white leading-none" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Mother's Reach
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: '#7a7573', fontFamily: 'var(--font-family-mono)' }}>
                by Makati Human Milk Bank
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div
              className="text-3xl text-white mb-3 leading-tight"
              style={{ fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              Connecting Donors.
              <br />
              <span style={{ color: '#eea4bb' }}>Nourishing Lives.</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#7a7573' }}>
              A premium clinical operations platform for the Makati Human Milk Bank, serving the smallest and most vulnerable lives since 2013.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Shield, label: 'Medical-grade data security', color: '#eea4bb' },
              { icon: Zap, label: 'Real-time batch lifecycle tracking', color: '#bdbdbb' },
              { icon: Heart, label: 'NICU-priority dispensing workflows', color: '#eea4bb' },
            ].map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.label} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: feat.color }} />
                  </div>
                  <span className="text-sm" style={{ color: '#9a9694' }}>{feat.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-10 pb-8">
          <div
            className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { value: '47', label: 'Active Donors' },
              { value: '3,840', label: 'mL Ready' },
              { value: '12', label: 'On Waiting List' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-lg text-white leading-none"
                  style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: '#eea4bb' }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] mt-1" style={{ color: '#7a7573' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: '#5a5655' }}>
            RA 7600 compliant · Makati City Ordinance No. 2014-089 · DOH MOP 2014
          </p>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#eea4bb' }}
            >
              <Droplets className="w-4 h-4" style={{ color: '#322e2d' }} />
            </div>
            <div className="text-base text-[#322e2d]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Mother's Reach
            </div>
          </div>

          <div className="mb-8">
            <h2
              className="text-2xl text-[#322e2d] mb-1.5"
              style={{ fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              Welcome back
            </h2>
            <p className="text-sm text-[#636260]">
              Sign in to your Makati Human Milk Bank account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Demo role picker */}
            <div>
              <label
                className="block text-xs text-[#636260] mb-2"
                style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}
              >
                Demo Account
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all"
                  style={{
                    background: '#FFFFFF',
                    borderColor: showDemoDropdown ? '#eea4bb' : 'rgba(99,98,96,0.15)',
                    boxShadow: showDemoDropdown ? '0 0 0 3px rgba(238,164,187,0.15)' : 'none',
                    color: '#322e2d',
                  }}
                >
                  <div>
                    <div className="text-sm text-[#322e2d]" style={{ fontWeight: 600 }}>{selectedDemo.label}</div>
                    <div className="text-xs text-[#636260]">{selectedDemo.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#bdbdbb] shrink-0" />
                </button>
                <AnimatePresence>
                  {showDemoDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl border z-10 overflow-hidden"
                      style={{ background: '#FFFFFF', borderColor: 'rgba(99,98,96,0.12)', boxShadow: '0 16px 48px rgba(50,46,45,0.12)' }}
                    >
                      {DEMO_USERS.map((demo) => (
                        <button
                          key={demo.user.role}
                          type="button"
                          onClick={() => { setSelectedDemo(demo); setShowDemoDropdown(false) }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F8F0F4] transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div
                              className="text-sm text-[#322e2d] group-hover:text-[#c07090] transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              {demo.label}
                            </div>
                            <div className="text-xs text-[#636260]">{demo.role}</div>
                          </div>
                          {selectedDemo.user.role === demo.user.role && (
                            <div className="w-2 h-2 rounded-full" style={{ background: '#eea4bb' }} />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-xs text-[#636260] mb-2"
                style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  borderColor: focusedField === 'email' ? '#eea4bb' : 'rgba(99,98,96,0.15)',
                  color: '#322e2d',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(238,164,187,0.15)' : 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs text-[#636260] mb-2"
                style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: '#FFFFFF',
                    borderColor: focusedField === 'password' ? '#eea4bb' : 'rgba(99,98,96,0.15)',
                    color: '#322e2d',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(238,164,187,0.15)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-[#bdbdbb] hover:text-[#eea4bb]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full py-3 rounded-xl text-sm mt-2"
              style={{
                background: loading ? '#d4a0b5' : '#eea4bb',
                color: '#322e2d',
                fontWeight: 700,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(238,164,187,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-[#322e2d] border-t-transparent"
                  />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </motion.button>
          </form>

          <p className="text-center text-xs text-[#bdbdbb] mt-8">
            Contact your system Administrator to request access.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
