import { useState } from 'react'
import { motion } from 'motion/react'
import { RefreshCw, Save } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { SMS_LOGS, SMS_TEMPLATES } from '../../mockData'
import type { AppUser } from '../../types'

interface SMSScreenProps {
  user: AppUser
}

export function SMSNotificationsScreen({ user }: SMSScreenProps) {
  const [templates, setTemplates] = useState(SMS_TEMPLATES)
  const isAdmin = user.role === 'Administrator'

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'SMS Notifications' }]}
        title="SMS Notifications"
        subtitle="Automated text alerts for milk availability, dispensing, and status updates via Semaphore API"
      />

      {/* SMS Log */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-6" style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div>
            <h3 className="text-sm text-[#1A1A1A]">SMS Log</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">All sent, pending, and failed messages</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Recipient', 'Contact', 'Message Preview', 'Trigger Event', 'Date Sent', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SMS_LOGS.map((log, i) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#F8F8FC] transition-colors"
                  style={{ borderBottom: i < SMS_LOGS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <td className="px-4 py-3.5 text-sm text-[#1A1A1A] whitespace-nowrap">{log.recipient}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {log.contact}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="text-xs text-[#6B7280] truncate">{log.message}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-family-mono)' }}>
                      {log.trigger}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {log.dateSent}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={log.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    {log.status === 'Failed' && (
                      <button className="flex items-center gap-1 text-xs text-[#eea4bb] hover:underline">
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message templates - Admin only */}
      <div
        className={`bg-white rounded-2xl border overflow-hidden ${!isAdmin ? 'opacity-60' : ''}`}
        style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div>
            <h3 className="text-sm text-[#1A1A1A]">
              Message Template Editor
              {!isAdmin && (
                <span
                  className="ml-2 px-1.5 py-0.5 text-[10px] rounded"
                  style={{ background: '#F8F0F4', color: '#6B7280', fontFamily: 'var(--font-family-mono)' }}
                >
                  Admin Only
                </span>
              )}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {isAdmin
                ? 'Edit SMS templates sent via Semaphore API. Use [PLACEHOLDERS] for dynamic fields.'
                : 'Contact an Administrator to edit message templates.'}
            </p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
              style={{ background: '#eea4bb', boxShadow: '0 4px 14px rgba(238,164,187,0.3)' }}
            >
              <Save className="w-4 h-4" />
              Save Templates
            </motion.button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {[
            {
              key: 'milkAvailable' as keyof typeof templates,
              label: 'Milk Available',
              hint: 'Sent when a recipient is notified that milk is ready. Variables: [BABY_NAME]',
            },
            {
              key: 'dispensingConfirmation' as keyof typeof templates,
              label: 'Dispensing Confirmation',
              hint: 'Sent after milk is dispensed. Variables: [BABY_NAME], [VOLUME], [TOTAL_FEE]',
            },
            {
              key: 'statusUpdate' as keyof typeof templates,
              label: 'Status Update',
              hint: 'General status update message. Variables: [STATUS]',
            },
          ].map((tmpl) => (
            <div key={tmpl.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-[#1A1A1A]">{tmpl.label}</label>
                <span className="text-xs text-[#6B7280]">{templates[tmpl.key].length} chars</span>
              </div>
              <textarea
                rows={4}
                value={templates[tmpl.key]}
                onChange={(e) => setTemplates((prev) => ({ ...prev, [tmpl.key]: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{
                  background: isAdmin ? '#F5F6FA' : '#F8F0F4',
                  borderColor: 'rgba(0,0,0,0.10)',
                  color: '#1A1A1A',
                  cursor: isAdmin ? 'text' : 'not-allowed',
                }}
              />
              <p className="text-xs text-[#6B7280] mt-1">{tmpl.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
