import { useReducer, useCallback } from 'react'
import type { LocationData } from '@/lib/location-service'

interface AppState {
  location: string
  date: string
  loading: boolean
  isSearching: boolean
  sectionRefs: {
    search: boolean
    map: boolean
    calendar: boolean
    inspiration: boolean
    cities: boolean
    times: boolean
  }
}

type AppAction =
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_SECTION_REF'; payload: { section: keyof AppState['sectionRefs']; value: boolean } }
  | { type: 'RESET_STATE' }

const initialState: AppState = {
  location: '',
  date: '',
  loading: false,
  isSearching: false,
  sectionRefs: {
    search: false,
    map: false,
    calendar: false,
    inspiration: false,
    cities: false,
    times: false,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.payload }
    case 'SET_DATE':
      return { ...state, date: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload }
    case 'SET_SECTION_REF':
      return {
        ...state,
        sectionRefs: {
          ...state.sectionRefs,
          [action.payload.section]: action.payload.value,
        },
      }
    case 'RESET_STATE':
      return initialState
    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setLocation = useCallback((location: string) => {
    dispatch({ type: 'SET_LOCATION', payload: location })
  }, [])

  const setDate = useCallback((date: string) => {
    dispatch({ type: 'SET_DATE', payload: date })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setSearching = useCallback((searching: boolean) => {
    dispatch({ type: 'SET_SEARCHING', payload: searching })
  }, [])

  const setSectionRef = useCallback((section: keyof AppState['sectionRefs'], value: boolean) => {
    dispatch({ type: 'SET_SECTION_REF', payload: { section, value } })
  }, [])

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [])

  return {
    state,
    actions: {
      setLocation,
      setDate,
      setLoading,
      setSearching,
      setSectionRef,
      resetState,
    },
  }
}