import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AppUser, Screen } from './types'
import { Layout } from './components/Layout'
import { LoginScreen } from './components/screens/LoginScreen'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { DonorManagementScreen } from './components/screens/DonorManagementScreen'
import { MilkCollectionScreen } from './components/screens/MilkCollectionScreen'
import { LabTestingScreen } from './components/screens/LabTestingScreen'
import { PasteurizationScreen } from './components/screens/PasteurizationScreen'
import { InventoryScreen } from './components/screens/InventoryScreen'
import { RecipientManagementScreen } from './components/screens/RecipientManagementScreen'
import { InquiryWaitingListScreen } from './components/screens/InquiryWaitingListScreen'
import { SMSNotificationsScreen } from './components/screens/SMSNotificationsScreen'
import { DispensingScreen } from './components/screens/DispensingScreen'
import { ReportsScreen } from './components/screens/ReportsScreen'
import { AuditLogScreen } from './components/screens/AuditLogScreen'

function ScreenContent({
  screen,
  user,
  onNavigate,
}: {
  screen: Screen
  user: AppUser
  onNavigate: (s: Screen) => void
}) {
  switch (screen) {
    case 'dashboard':
      return <DashboardScreen onNavigate={onNavigate} />
    case 'donors':
      return <DonorManagementScreen />
    case 'collection':
      return <MilkCollectionScreen />
    case 'lab':
      return <LabTestingScreen />
    case 'pasteurization':
      return <PasteurizationScreen />
    case 'inventory':
      return <InventoryScreen />
    case 'recipients':
      return <RecipientManagementScreen />
    case 'inquiry':
      return <InquiryWaitingListScreen />
    case 'sms':
      return <SMSNotificationsScreen user={user} />
    case 'dispensing':
      return <DispensingScreen user={user} />
    case 'reports':
      return <ReportsScreen />
    case 'audit':
      return <AuditLogScreen />
    default:
      return <DashboardScreen onNavigate={onNavigate} />
  }
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [screen, setScreen] = useState<Screen>('dashboard')

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />
  }

  return (
    <Layout
      user={user}
      currentScreen={screen}
      onNavigate={(s) => setScreen(s)}
      onLogout={() => { setUser(null); setScreen('dashboard') }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <ScreenContent screen={screen} user={user} onNavigate={setScreen} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
