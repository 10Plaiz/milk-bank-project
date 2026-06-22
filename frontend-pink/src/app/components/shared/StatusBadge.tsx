import type { BatchStatus, ScreeningStatus, InquiryStatus, SMSStatus, TestResult } from '../../types'

type BadgeVariant =
  | BatchStatus
  | ScreeningStatus
  | InquiryStatus
  | SMSStatus
  | TestResult
  | 'NICU'
  | 'Non-NICU'
  | 'FC'
  | 'PU'
  | 'PRE'
  | 'POST'

const MAP: Record<string, { bg: string; text: string; ring: string }> = {
  RAW:             { bg: '#F3F2F1', text: '#636260', ring: '#DDDCDB' },
  PRE_TESTING:     { bg: '#FFFBEB', text: '#B45309', ring: '#FDE68A' },
  POST_TESTING:    { bg: '#FFFBEB', text: '#B45309', ring: '#FDE68A' },
  PRE_TEST_PASSED: { bg: '#FDF0F5', text: '#c07090', ring: '#f0c0d0' },
  PASTEURIZED:     { bg: '#EFF6FF', text: '#1D4ED8', ring: '#BFDBFE' },
  READY:           { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' },
  DISPENSED:       { bg: '#F0FDFA', text: '#0F766E', ring: '#99F6E4' },
  PRE_TEST_FAILED: { bg: '#FEF2F2', text: '#B91C1C', ring: '#FECACA' },
  POST_TEST_FAILED:{ bg: '#FEF2F2', text: '#B91C1C', ring: '#FECACA' },
  DISCARDED:       { bg: '#FEF2F2', text: '#B91C1C', ring: '#FECACA' },
  Passed:          { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' },
  Failed:          { bg: '#FEF2F2', text: '#B91C1C', ring: '#FECACA' },
  Pending:         { bg: '#FFFBEB', text: '#B45309', ring: '#FDE68A' },
  WAITING:         { bg: '#FFF7ED', text: '#C2410C', ring: '#FDBA74' },
  NOTIFIED:        { bg: '#FDF0F5', text: '#c07090', ring: '#f0c0d0' },
  FULFILLED:       { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' },
  CANCELLED:       { bg: '#F3F2F1', text: '#636260', ring: '#DDDCDB' },
  Sent:            { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' },
  PASS:            { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' },
  FAIL:            { bg: '#FEF2F2', text: '#B91C1C', ring: '#FECACA' },
  NICU:            { bg: '#FDF0F5', text: '#c07090', ring: '#eea4bb' },
  'Non-NICU':      { bg: '#F3F2F1', text: '#636260', ring: '#DDDCDB' },
  FC:              { bg: '#EFF6FF', text: '#1D4ED8', ring: '#BFDBFE' },
  PU:              { bg: '#F5F3FF', text: '#6D28D9', ring: '#DDD6FE' },
  PRE:             { bg: '#FFFBEB', text: '#B45309', ring: '#FDE68A' },
  POST:            { bg: '#EFF6FF', text: '#1D4ED8', ring: '#BFDBFE' },
}

const LABEL_MAP: Record<string, string> = {
  PRE_TESTING: 'Pre-Testing',
  POST_TESTING: 'Post-Testing',
  PRE_TEST_PASSED: 'Pre-Test Passed',
  PRE_TEST_FAILED: 'Pre-Test Failed',
  POST_TEST_FAILED: 'Post-Test Failed',
  FC: 'Field Collection',
  PU: 'Pickup',
  PRE: 'Pre-Pasteurization',
  POST: 'Post-Pasteurization',
}

interface StatusBadgeProps {
  value: BadgeVariant | string
  short?: boolean
}

export function StatusBadge({ value, short = false }: StatusBadgeProps) {
  const s = MAP[value] ?? { bg: '#F3F2F1', text: '#636260', ring: '#DDDCDB' }
  const label = short ? value : (LABEL_MAP[value] ?? value)

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px]"
      style={{
        background: s.bg,
        color: s.text,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
        fontFamily: 'var(--font-family-mono)',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  )
}
