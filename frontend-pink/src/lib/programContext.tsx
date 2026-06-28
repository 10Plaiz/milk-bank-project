import { createContext, useContext } from 'react'
import type { ActiveProgram } from '../app/types'

export const ProgramContext = createContext<ActiveProgram>('All')
export const useProgramFilter = () => useContext(ProgramContext)
