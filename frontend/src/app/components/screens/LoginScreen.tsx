import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Droplets, Eye, EyeOff } from 'lucide-react'
import type { CreateAccessAccountInput } from '../../types'

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>
  onRegisterRequest: (account: CreateAccessAccountInput) => Promise<boolean>
  notice?: string
  error?: string
  prefillEmail?: string
}

const PILLARS = [
  { label: 'Full traceability', desc: 'Every mL logged from donor to NICU bedside' },
  { label: '14-day lab cycle', desc: 'City Hall testing with automatic batch tracking' },
  { label: 'NICU-first dispensing', desc: 'Priority queue for admitted infants' },
] as const

export function LoginScreen({ onLogin, onRegisterRequest, notice, error, prefillEmail }: LoginScreenProps) {
  const shouldReduceMotion = useReducedMotion()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState(prefillEmail ?? '')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | undefined>(undefined)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail)
  }, [prefillEmail])

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current)
    }
  }, [])

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    setPassword('')
    setLocalError(undefined)
  }

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLocalError(undefined)
    setLoading(true)
    await onLogin({ email, password })
    setLoading(false)
  }

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLocalError(undefined)

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const success = await onRegisterRequest({ fullName, email, password })
    setLoading(false)

    if (success) {
      setFullName('')
      setPassword('')
      setMode('login')
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    background: '#FFFFFF',
    borderColor: focusedField === field ? '#eea4bb' : 'rgba(99,98,96,0.15)',
    color: '#322e2d',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(238,164,187,0.15)' : 'none',
  })

  const labelClass = 'block text-xs text-[#636260] mb-2 font-semibold uppercase tracking-[0.05em] font-mono'
  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eea4bb]/30'

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F7F5' }}>

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-[440px] shrink-0"
        style={{ background: '#322e2d' }}
      >
        {/* Logo */}
        <div className="px-12 pt-12">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#eea4bb' }}
            >
              <Droplets className="w-5 h-5" style={{ color: '#322e2d' }} aria-hidden="true" />
            </div>
            <div>
              <div className="text-[15px] text-white leading-none tracking-tight font-bold">
                Mother's Reach
              </div>
              <div className="text-[11px] mt-1 font-mono" style={{ color: '#7a7573' }}>
                by Makati Human Milk Bank
              </div>
            </div>
          </div>
        </div>

        {/* Headline + pillars */}
        <div className="flex-1 flex flex-col justify-center px-12 py-12">
          <h1 className="text-[40px] text-white leading-[1.05] font-bold tracking-tight mb-5 text-pretty">
            Makati's chain<br />
            <span style={{ color: '#eea4bb' }}>of care.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-[290px]" style={{ color: '#7a7573' }}>
            Since 2013, every milliliter of donated milk is logged, tested, and traced to the NICU baby who needs it.
          </p>

          <div className="space-y-6">
            {PILLARS.map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                  style={{ background: '#eea4bb' }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.12em] font-mono mb-0.5"
                    style={{ color: '#eea4bb' }}
                  >
                    {label}
                  </div>
                  <div className="text-[13px] leading-snug" style={{ color: '#4a4645' }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal footer */}
        <div className="px-12 pb-10">
          <p className="text-[11px] text-center" style={{ color: '#3a3736' }}>
            RA 7600 compliant · Makati City Ordinance No. 2014-089 · DOH MOP 2014
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="w-full max-w-[520px]"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#eea4bb' }}
            >
              <Droplets className="w-4 h-4" style={{ color: '#322e2d' }} aria-hidden="true" />
            </div>
            <div className="text-base font-bold" style={{ color: '#322e2d', letterSpacing: '-0.02em' }}>
              Mother's Reach
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2
              className="text-2xl mb-1.5 text-pretty"
              style={{ color: '#322e2d', fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: '#636260' }}>
              {mode === 'login'
                ? 'Sign in with your approved staff account.'
                : 'Register a staff account. Confirm your email before signing in.'}
            </p>
          </div>

          {/* Mode switcher */}
          <div
            role="group"
            aria-label="Authentication mode"
            className="mb-7 inline-flex rounded-2xl border p-1"
            style={{ background: '#FFFFFF', borderColor: 'rgba(99,98,96,0.12)' }}
          >
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => switchMode(m)}
                className="px-5 py-2 text-sm rounded-xl transition-colors font-bold"
                style={{
                  background: mode === m ? '#eea4bb' : 'transparent',
                  color: '#322e2d',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Alert / notice */}
          <div aria-live="polite" aria-atomic="true">
            <AnimatePresence>
              {(localError || error || notice) && (
                <motion.div
                  key={localError ?? error ?? notice}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed"
                  role={(localError || error) ? 'alert' : 'status'}
                  style={{
                    background: (localError || error) ? '#FFF0F2' : '#F0F7F4',
                    borderColor: (localError || error)
                      ? 'rgba(192,64,64,0.22)'
                      : 'rgba(52,168,83,0.22)',
                    color: '#322e2d',
                  }}
                >
                  {localError ?? error ?? notice}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form */}
          <form
            onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-5"
            noValidate
          >
            {mode === 'register' && (
              <div>
                <label htmlFor="register-name" className={labelClass}>Full name</label>
                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Maria Santos…"
                  maxLength={100}
                  className={inputClass}
                  style={inputStyle('fullName')}
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className={labelClass}>Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                spellCheck={false}
                placeholder="name@mhmb.makati.gov.ph"
                maxLength={254}
                className={inputClass}
                style={inputStyle('email')}
              />
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={mode === 'login' ? 'Enter your password…' : 'At least 6 characters…'}
                  minLength={mode === 'register' ? 6 : undefined}
                  maxLength={128}
                  className={`${inputClass} pr-11`}
                  style={inputStyle('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eea4bb]/30"
                  style={{ color: '#bdbdbb' }}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full py-3 rounded-xl text-sm mt-1 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eea4bb]/30 font-bold"
              style={{
                background: loading ? '#d4a0b5' : '#eea4bb',
                color: '#322e2d',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(238,164,187,0.35)',
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={shouldReduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-[#322e2d] border-t-transparent"
                    aria-hidden="true"
                  />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center leading-relaxed" style={{ color: '#636260' }}>
            {mode === 'login'
              ? 'New staff accounts are created with staff access after email confirmation.'
              : 'Already have an account? Use the Sign In tab above.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
