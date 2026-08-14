export type AuthUser = {
  id: string
  name: string
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  name: string
}

type StoredUser = AuthUser & {
  password: string
}

const CURRENT_USER_KEY = 'auth-demo.current-user'
const USERS_KEY = 'auth-demo.users'

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthApiError'
  }
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)

    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJson = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const readUsers = () => readJson<StoredUser[]>(USERS_KEY, [])

const writeUsers = (users: StoredUser[]) => {
  writeJson(USERS_KEY, users)
}

const sanitizeUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
})

export const authApi = {
  getCurrentUser() {
    return readJson<AuthUser | null>(CURRENT_USER_KEY, null)
  },

  async login({ email, password }: LoginRequest) {
    await delay(700)

    const normalizedEmail = email.trim().toLowerCase()
    const user = readUsers().find(
      (candidate) => candidate.email === normalizedEmail,
    )

    if (!user || user.password !== password) {
      throw new AuthApiError('The email or password you entered is incorrect.')
    }

    const currentUser = sanitizeUser(user)
    writeJson(CURRENT_USER_KEY, currentUser)

    return currentUser
  },

  async register({ name, email, password }: RegisterRequest) {
    await delay(800)

    const normalizedEmail = email.trim().toLowerCase()
    const users = readUsers()
    const accountExists = users.some((user) => user.email === normalizedEmail)

    if (accountExists) {
      throw new AuthApiError('An account with this email already exists.')
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password,
    }

    writeUsers([...users, user])

    const currentUser = sanitizeUser(user)
    writeJson(CURRENT_USER_KEY, currentUser)

    return currentUser
  },

  logout() {
    window.localStorage.removeItem(CURRENT_USER_KEY)
  },
}
