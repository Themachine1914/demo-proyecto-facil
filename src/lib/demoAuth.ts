// TEMPLATE: CLIENT-SPECIFIC — public demo login for presentations.
export const DEMO_EMAIL = 'demo@proyectofacil.com'
export const DEMO_PASSWORD = 'facil2026'

const SESSION_KEY = 'demo-proyecto-facil-session'

export interface DemoUser {
  email: string
}

export function readDemoSession(): DemoUser | null {
  if (typeof window === 'undefined') return null
  const email = window.sessionStorage.getItem(SESSION_KEY)
  return email ? { email } : null
}

export function writeDemoSession(user: DemoUser | null) {
  if (typeof window === 'undefined') return
  if (user) {
    window.sessionStorage.setItem(SESSION_KEY, user.email)
    return
  }
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function authenticateDemo(email: string, password: string): DemoUser {
  const validEmail = email.trim().toLowerCase() === DEMO_EMAIL
  const validPassword = password === DEMO_PASSWORD
  if (!validEmail || !validPassword) {
    throw new Error('Usuario o contraseña incorrectos')
  }
  return { email: DEMO_EMAIL }
}
