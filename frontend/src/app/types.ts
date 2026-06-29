export type AccessRole = 'Admin' | 'Doctor' | 'Nurse' | 'Midwife' | 'Medical Technologist'

export type UserRole = AccessRole | 'Administrator'

export type DatabaseRole = 'admin' | 'staff'

export type ProgramType = 'Supsup Todo' | "Mom's Act" | 'Milky Way'

export type ActiveProgram = ProgramType | 'All'

export type ScreeningStatus = 'Pending' | 'Passed' | 'Failed'

export type BatchStatus =
  | 'RAW'
  | 'PRE_TESTING'
  | 'PRE_TEST_PASSED'
  | 'PASTEURIZED'
  | 'POST_TESTING'
  | 'READY'
  | 'DISPENSED'
  | 'DISCARDED'

export type CollectionMode = 'FC' | 'PU'

export type InquiryStatus = 'WAITING' | 'NOTIFIED' | 'FULFILLED' | 'CANCELLED'

export type SMSStatus = 'Sent' | 'Failed' | 'Pending'

export type TestType = 'PRE' | 'POST'

export type TestResult = 'PASS' | 'FAIL' | 'Pending'

export interface AppUser {
  name: string
  role: UserRole
  initials: string
}

export interface CreateAccessAccountInput {
  fullName: string
  email: string
  password: string
}

export type Screen =
  | 'login'
  | 'dashboard'
  | 'donors'
  | 'collection'
  | 'lab'
  | 'pasteurization'
  | 'inventory'
  | 'recipients'
  | 'inquiry'
  | 'sms'
  | 'dispensing'
  | 'reports'
  | 'audit'
  | 'users'
  | 'settings'
