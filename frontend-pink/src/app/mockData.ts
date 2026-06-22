import type {
  Donor, MilkBatch, LabTest, PasteurizationRecord,
  Recipient, Inquiry, SMSLog, DispensingRecord, AuditLog
} from './types'

export const DONORS: Donor[] = [
  {
    dtn: 'DTN-2024-001', name: 'Maria Concepcion Santos', firstName: 'Maria Concepcion', lastName: 'Santos',
    program: 'Supsup Todo', screeningStatus: 'Passed', contact: '09171234567',
    address: '14 Kalayaan Ave., Brgy. Bangkal, Makati City', dateOfBirth: '1992-03-15',
    occupation: 'Homemaker', civilStatus: 'Married', classification: 'Community',
    prenatalCenter: 'Bangkal Health Center', lastDeliveryDate: '2024-01-10',
  },
  {
    dtn: 'DTN-2024-002', name: 'Ana Luisa Reyes', firstName: 'Ana Luisa', lastName: 'Reyes',
    program: 'Milky Way', screeningStatus: 'Passed', contact: '09182345678',
    address: '7 Malugay St., Brgy. Pio del Pilar, Makati City', dateOfBirth: '1989-07-22',
    occupation: 'Teacher', civilStatus: 'Married', classification: 'Institutional',
    prenatalCenter: 'Makati Medical Center', lastDeliveryDate: '2024-02-18',
  },
  {
    dtn: 'DTN-2024-003', name: 'Josefina Cruz', firstName: 'Josefina', lastName: 'Cruz',
    program: "Mom's Act", screeningStatus: 'Passed', contact: '09193456789',
    address: '22 Pasong Tamo Ext., Brgy. Carmona, Makati City', dateOfBirth: '1991-11-08',
    occupation: 'Accountant', civilStatus: 'Married', classification: 'Private',
    prenatalCenter: 'Ospital ng Makati', lastDeliveryDate: '2024-03-05',
  },
  {
    dtn: 'DTN-2024-004', name: 'Rosario Dela Cruz', firstName: 'Rosario', lastName: 'Dela Cruz',
    program: 'Supsup Todo', screeningStatus: 'Pending', contact: '09204567890',
    address: '5 Buendia Ave., Brgy. Poblacion, Makati City', dateOfBirth: '1995-05-30',
    occupation: 'Nurse', civilStatus: 'Single', classification: 'Community',
    prenatalCenter: 'Poblacion Health Center', lastDeliveryDate: '2024-05-12',
  },
  {
    dtn: 'DTN-2024-005', name: 'Carmelita Flores', firstName: 'Carmelita', lastName: 'Flores',
    program: 'Milky Way', screeningStatus: 'Failed', contact: '09215678901',
    address: '33 Jupiter St., Brgy. Bel-Air, Makati City', dateOfBirth: '1988-01-17',
    occupation: 'Engineer', civilStatus: 'Married', classification: 'Institutional',
    prenatalCenter: 'Makati Medical Center', lastDeliveryDate: '2024-01-28',
  },
  {
    dtn: 'DTN-2024-006', name: 'Lourdes Bautista', firstName: 'Lourdes', lastName: 'Bautista',
    program: "Mom's Act", screeningStatus: 'Passed', contact: '09226789012',
    address: '8 Zobel Roxas St., Brgy. San Antonio, Makati City', dateOfBirth: '1993-09-14',
    occupation: 'Marketing Officer', civilStatus: 'Married', classification: 'Private',
    prenatalCenter: 'Ospital ng Makati', lastDeliveryDate: '2024-04-02',
  },
  {
    dtn: 'DTN-2024-007', name: 'Teresita Gonzales', firstName: 'Teresita', lastName: 'Gonzales',
    program: 'Supsup Todo', screeningStatus: 'Pending', contact: '09237890123',
    address: '19 Ayala Ave., Brgy. Legazpi Village, Makati City', dateOfBirth: '1996-12-03',
    occupation: 'Homemaker', civilStatus: 'Married', classification: 'Community',
    prenatalCenter: 'Legazpi Village Health Center', lastDeliveryDate: '2024-06-01',
  },
  {
    dtn: 'DTN-2024-008', name: 'Remedios Villanueva', firstName: 'Remedios', lastName: 'Villanueva',
    program: 'Milky Way', screeningStatus: 'Passed', contact: '09248901234',
    address: '61 Rockwell Dr., Brgy. Rockwell, Makati City', dateOfBirth: '1990-04-25',
    occupation: 'Lawyer', civilStatus: 'Married', classification: 'Private',
    prenatalCenter: 'Makati Medical Center', lastDeliveryDate: '2024-05-28',
  },
]

export const MILK_BATCHES: MilkBatch[] = [
  {
    batchNumber: 'BTN-2024-001', ctn: 'CTN-2024-001', dtn: 'DTN-2024-001',
    donorName: 'Maria Concepcion Santos', program: 'Supsup Todo', volume: 180,
    collectionDate: '2024-01-15', mode: 'FC', status: 'READY', aob: '2 months', collectedBy: 'Carmen Cruz, R.M.',
  },
  {
    batchNumber: 'BTN-2024-002', ctn: 'CTN-2024-002', dtn: 'DTN-2024-002',
    donorName: 'Ana Luisa Reyes', program: 'Milky Way', volume: 120,
    collectionDate: '2024-02-20', mode: 'FC', status: 'POST_TESTING', aob: '1 month', collectedBy: 'Maria Santos, R.N.',
  },
  {
    batchNumber: 'BTN-2024-003', ctn: 'CTN-2024-003', dtn: 'DTN-2024-003',
    donorName: 'Josefina Cruz', program: "Mom's Act", volume: 200,
    collectionDate: '2024-03-10', mode: 'PU', status: 'DISPENSED', aob: '3 months', collectedBy: 'Carmen Cruz, R.M.',
  },
  {
    batchNumber: 'BTN-2024-004', ctn: 'CTN-2024-004', dtn: 'DTN-2024-004',
    donorName: 'Rosario Dela Cruz', program: 'Supsup Todo', volume: 90,
    collectionDate: '2024-05-14', mode: 'FC', status: 'PRE_TESTING', aob: '6 weeks', collectedBy: 'Maria Santos, R.N.',
  },
  {
    batchNumber: 'BTN-2024-005', ctn: 'CTN-2024-005', dtn: 'DTN-2024-005',
    donorName: 'Carmelita Flores', program: 'Milky Way', volume: 150,
    collectionDate: '2024-02-01', mode: 'FC', status: 'DISCARDED', aob: '5 weeks', collectedBy: 'Maria Santos, R.N.',
  },
  {
    batchNumber: 'BTN-2024-006', ctn: 'CTN-2024-006', dtn: 'DTN-2024-006',
    donorName: 'Lourdes Bautista', program: "Mom's Act", volume: 240,
    collectionDate: '2024-04-05', mode: 'PU', status: 'READY', aob: '2 months', collectedBy: 'Carmen Cruz, R.M.',
  },
  {
    batchNumber: 'BTN-2024-007', ctn: 'CTN-2024-007', dtn: 'DTN-2024-007',
    donorName: 'Teresita Gonzales', program: 'Supsup Todo', volume: 60,
    collectionDate: '2024-06-03', mode: 'FC', status: 'RAW', aob: '3 weeks', collectedBy: 'Carmen Cruz, R.M.',
  },
  {
    batchNumber: 'BTN-2024-008', ctn: 'CTN-2024-008', dtn: 'DTN-2024-008',
    donorName: 'Remedios Villanueva', program: 'Milky Way', volume: 180,
    collectionDate: '2024-05-30', mode: 'FC', status: 'PASTEURIZED', aob: '1.5 months', collectedBy: 'Maria Santos, R.N.',
  },
]

export const LAB_TESTS: LabTest[] = [
  {
    id: 'LT-001', batchNumber: 'BTN-2024-004', ctn: 'CTN-2024-004', dtn: 'DTN-2024-004',
    sampleVolume: 4, dateSent: '2024-05-16', expectedDate: '2024-05-30', daysElapsed: 8,
    result: 'Pending', testedBy: 'Juan Dela Cruz, M.T.', testType: 'PRE',
  },
  {
    id: 'LT-002', batchNumber: 'BTN-2024-002', ctn: 'CTN-2024-002', dtn: 'DTN-2024-002',
    sampleVolume: 3, dateSent: '2024-05-28', expectedDate: '2024-06-11', daysElapsed: 4,
    result: 'Pending', testedBy: 'Juan Dela Cruz, M.T.', testType: 'POST',
  },
  {
    id: 'LT-003', batchNumber: 'BTN-2024-001', ctn: 'CTN-2024-001', dtn: 'DTN-2024-001',
    sampleVolume: 5, dateSent: '2024-01-17', expectedDate: '2024-01-31', daysElapsed: 14,
    result: 'PASS', testedBy: 'Juan Dela Cruz, M.T.', testType: 'PRE',
  },
  {
    id: 'LT-004', batchNumber: 'BTN-2024-005', ctn: 'CTN-2024-005', dtn: 'DTN-2024-005',
    sampleVolume: 4, dateSent: '2024-02-03', expectedDate: '2024-02-17', daysElapsed: 14,
    result: 'FAIL', testedBy: 'Juan Dela Cruz, M.T.', testType: 'PRE',
  },
  {
    id: 'LT-005', batchNumber: 'BTN-2024-006', ctn: 'CTN-2024-006', dtn: 'DTN-2024-006',
    sampleVolume: 5, dateSent: '2024-04-08', expectedDate: '2024-04-22', daysElapsed: 14,
    result: 'PASS', testedBy: 'Juan Dela Cruz, M.T.', testType: 'POST',
  },
]

export const PASTEURIZATION_RECORDS: PasteurizationRecord[] = [
  {
    id: 'PST-001', batchNumber: 'BTN-2024-001', operator: 'Juan Dela Cruz, M.T.',
    temperature: 62.5, duration: 30, date: '2024-02-02', postTestStatus: 'PASS',
  },
  {
    id: 'PST-002', batchNumber: 'BTN-2024-003', operator: 'Juan Dela Cruz, M.T.',
    temperature: 62.5, duration: 30, date: '2024-03-25', postTestStatus: 'PASS',
  },
  {
    id: 'PST-003', batchNumber: 'BTN-2024-006', operator: 'Juan Dela Cruz, M.T.',
    temperature: 62.5, duration: 30, date: '2024-04-20', postTestStatus: 'PASS',
  },
  {
    id: 'PST-004', batchNumber: 'BTN-2024-008', operator: 'Juan Dela Cruz, M.T.',
    temperature: 62.5, duration: 30, date: '2024-06-10', postTestStatus: 'Pending',
  },
]

export const RECIPIENTS: Recipient[] = [
  {
    id: 'RCP-001', guardianName: 'Margarita Ramos', babyName: 'Baby Boy Ramos',
    hospital: 'Ospital ng Makati', nicuStatus: true, contact: '09171112222', aob: '28 weeks',
  },
  {
    id: 'RCP-002', guardianName: 'Corazon Navarro', babyName: 'Baby Girl Navarro',
    hospital: 'Makati Medical Center', nicuStatus: true, contact: '09182223333', aob: '30 weeks',
  },
  {
    id: 'RCP-003', guardianName: 'Imelda Castillo', babyName: 'Baby Boy Castillo',
    hospital: 'Philippine General Hospital', nicuStatus: false, contact: '09193334444', aob: '36 weeks',
  },
  {
    id: 'RCP-004', guardianName: 'Patricia Mendoza', babyName: 'Baby Girl Mendoza',
    hospital: 'Ospital ng Makati', nicuStatus: true, contact: '09204445555', aob: '27 weeks',
  },
]

export const INQUIRIES: Inquiry[] = [
  {
    id: 'INQ-001', recipientId: 'RCP-001', recipientName: 'Margarita Ramos', babyName: 'Baby Boy Ramos',
    nicuStatus: true, inquiryType: 'Walk-in', date: '2024-06-01', daysWaiting: 5,
    status: 'WAITING', notes: 'Mother is very anxious. Baby born at 28 weeks. First inquiry.',
  },
  {
    id: 'INQ-002', recipientId: 'RCP-002', recipientName: 'Corazon Navarro', babyName: 'Baby Girl Navarro',
    nicuStatus: true, inquiryType: 'Hotline Call', date: '2024-05-28', daysWaiting: 9,
    status: 'NOTIFIED', notes: 'Called hotline. Notified via SMS on June 3.',
  },
  {
    id: 'INQ-003', recipientId: 'RCP-003', recipientName: 'Imelda Castillo', babyName: 'Baby Boy Castillo',
    nicuStatus: false, inquiryType: 'Walk-in', date: '2024-06-02', daysWaiting: 4,
    status: 'CANCELLED', notes: 'Non-NICU. Baby does not qualify per eligibility guidelines.',
  },
  {
    id: 'INQ-004', recipientId: 'RCP-004', recipientName: 'Patricia Mendoza', babyName: 'Baby Girl Mendoza',
    nicuStatus: true, inquiryType: 'Walk-in', date: '2024-05-20', daysWaiting: 17,
    status: 'FULFILLED', notes: 'Milk dispensed. 120mL released on June 4.',
  },
]

export const SMS_LOGS: SMSLog[] = [
  {
    id: 'SMS-001', recipient: 'Corazon Navarro', contact: '09182223333',
    message: 'Magandang araw po! Ang hinihintay na gatas para kay Baby Girl Navarro ay handa na. Pumunta po kayo sa Makati Human Milk Bank para sa dispensing.',
    trigger: 'Milk Available', dateSent: '2024-06-03 09:30', status: 'Sent',
  },
  {
    id: 'SMS-002', recipient: 'Patricia Mendoza', contact: '09204445555',
    message: 'Kumpirmasyon: 120mL ng pasteurized na gatas ay inilabas na para kay Baby Girl Mendoza. Maraming salamat sa inyong tiwala sa Makati Human Milk Bank.',
    trigger: 'Dispensing Confirmation', dateSent: '2024-06-04 14:15', status: 'Sent',
  },
  {
    id: 'SMS-003', recipient: 'Margarita Ramos', contact: '09171112222',
    message: 'Magandang araw po! Ang hinihintay na gatas para kay Baby Boy Ramos ay handa na. Pumunta po kayo sa Makati Human Milk Bank.',
    trigger: 'Milk Available', dateSent: '2024-06-05 10:00', status: 'Failed',
  },
  {
    id: 'SMS-004', recipient: 'Teresita Gonzales', contact: '09237890123',
    message: 'Update: Ang inyong donor application ay nasa proseso na. Makikipag-ugnayan kami sa inyo kapag may update.',
    trigger: 'Status Update', dateSent: '2024-06-05 11:30', status: 'Pending',
  },
]

export const DISPENSING_RECORDS: DispensingRecord[] = [
  {
    id: 'DSP-001', recipient: 'Patricia Mendoza', babyName: 'Baby Girl Mendoza',
    batchNumber: 'BTN-2024-001', dtn: 'DTN-2024-001', volume: 120,
    totalFee: 240, dispensedBy: 'Maria Santos, R.N.', date: '2024-06-04',
  },
  {
    id: 'DSP-002', recipient: 'Corazon Navarro', babyName: 'Baby Girl Navarro',
    batchNumber: 'BTN-2024-003', dtn: 'DTN-2024-003', volume: 200,
    totalFee: 400, dispensedBy: 'Carmen Cruz, R.M.', date: '2024-05-15',
  },
]

export const AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001', timestamp: '2024-06-05 14:32', user: 'Carmen Cruz, R.M.',
    role: 'Midwife', action: 'INSERT', module: 'donors', recordId: 'DTN-2024-008',
    summary: 'New donor registered: Remedios Villanueva',
  },
  {
    id: 'AUD-002', timestamp: '2024-06-05 13:45', user: 'Juan Dela Cruz, M.T.',
    role: 'Medical Technologist', action: 'UPDATE', module: 'milk_batches', recordId: 'BTN-2024-001',
    summary: 'status: POST_TESTING → READY',
  },
  {
    id: 'AUD-003', timestamp: '2024-06-05 12:20', user: 'Juan Dela Cruz, M.T.',
    role: 'Medical Technologist', action: 'INSERT', module: 'milk_tests', recordId: 'LT-003',
    summary: 'Pre-test result logged for BTN-2024-001: PASS',
  },
  {
    id: 'AUD-004', timestamp: '2024-06-05 11:55', user: 'Maria Santos, R.N.',
    role: 'Nurse', action: 'INSERT', module: 'dispensing_records', recordId: 'DSP-001',
    summary: '120mL dispensed to Patricia Mendoza (Baby Girl Mendoza)',
  },
  {
    id: 'AUD-005', timestamp: '2024-06-05 09:30', user: 'System',
    role: 'Administrator', action: 'INSERT', module: 'sms_logs', recordId: 'SMS-001',
    summary: 'SMS sent to Corazon Navarro (09182223333) - Milk Available',
  },
  {
    id: 'AUD-006', timestamp: '2024-06-04 16:10', user: 'Juan Dela Cruz, M.T.',
    role: 'Medical Technologist', action: 'INSERT', module: 'pasteurization_records', recordId: 'PST-004',
    summary: 'Pasteurization logged for BTN-2024-008: 62.5°C / 30 min',
  },
  {
    id: 'AUD-007', timestamp: '2024-06-03 10:45', user: 'Maria Santos, R.N.',
    role: 'Nurse', action: 'INSERT', module: 'inquiries', recordId: 'INQ-001',
    summary: 'New walk-in inquiry: Margarita Ramos (Baby Boy Ramos, NICU)',
  },
  {
    id: 'AUD-008', timestamp: '2024-06-01 08:30', user: 'Administrator',
    role: 'Administrator', action: 'UPDATE', module: 'users', recordId: 'USR-003',
    summary: 'role: Nurse → Medical Technologist for user Juan Dela Cruz',
  },
]

export const MONTHLY_COLLECTION = [
  { month: 'Jan', volume: 4800, batches: 12 },
  { month: 'Feb', volume: 5200, batches: 14 },
  { month: 'Mar', volume: 4600, batches: 11 },
  { month: 'Apr', volume: 6100, batches: 16 },
  { month: 'May', volume: 5800, batches: 15 },
  { month: 'Jun', volume: 3200, batches: 8 },
]

export const SMS_TEMPLATES = {
  milkAvailable: 'Magandang araw po! Ang hinihintay na gatas para kay [BABY_NAME] ay handa na. Pumunta po kayo sa Makati Human Milk Bank sa 1126 Rodriguez Ave., Brgy. Bangkal, Makati City para sa dispensing. Para sa katanungan, tawagan po kami sa 8888-7777.',
  dispensingConfirmation: 'Kumpirmasyon: [VOLUME]mL ng pasteurized na gatas ay inilabas na para kay [BABY_NAME]. Kabuuang bayad: ₱[TOTAL_FEE]. Maraming salamat sa inyong tiwala sa Makati Human Milk Bank.',
  statusUpdate: 'Update sa inyong application: [STATUS]. Para sa karagdagang impormasyon, makipag-ugnayan po sa Makati Human Milk Bank sa 8888-7777.',
}
