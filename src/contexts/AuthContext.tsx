import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  authenticateDemo,
  readDemoSession,
  writeDemoSession,
  type DemoUser,
} from '../lib/demoAuth'

interface AuthContextValue {
  user: DemoUser | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => readDemoSession())

  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = authenticateDemo(email, password)
    writeDemoSession(nextUser)
    setUser(nextUser)
  }, [])

  const signOut = useCallback(async () => {
    writeDemoSession(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading: false,
      configured: true,
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
