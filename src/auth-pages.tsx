import {
  Link,
  Outlet,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { type FormEvent, type ReactNode, useState } from 'react'
import heroImg from './assets/hero.png'
import {
  AuthApiError,
  authApi,
  type LoginRequest,
  type RegisterRequest,
} from './auth'

type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>

type LoginValues = LoginRequest

type RegisterValues = RegisterRequest & {
  confirmPassword: string
  acceptTerms: boolean
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RootLayout() {
  return <Outlet />
}

export function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({})

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: '/' })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateLogin(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    loginMutation.mutate(values)
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your private workspace."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(email) => {
            setValues((current) => ({ ...current, email }))
          }}
        />
        <FormField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(password) => {
            setValues((current) => ({ ...current, password }))
          }}
        />

        <ServerError error={loginMutation.error} />

        <SubmitButton
          label="Sign in"
          loadingLabel="Signing in"
          isLoading={loginMutation.isPending}
        />
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600">
        New to Cursor Portal?{' '}
        <Link
          to="/signup"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export function SignUpPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [values, setValues] = useState<RegisterValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<FieldErrors<RegisterValues>>({})

  const registerMutation = useMutation({
    mutationFn: (formValues: RegisterValues) =>
      authApi.register({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
      }),
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: '/' })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateRegister(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    registerMutation.mutate(values)
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with a secure session that is ready for protected routes."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="signup-name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(name) => {
            setValues((current) => ({ ...current, name }))
          }}
        />
        <FormField
          id="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(email) => {
            setValues((current) => ({ ...current, email }))
          }}
        />
        <FormField
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={(password) => {
            setValues((current) => ({ ...current, password }))
          }}
        />
        <FormField
          id="signup-confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(confirmPassword) => {
            setValues((current) => ({ ...current, confirmPassword }))
          }}
        />
        <label className="flex gap-3 text-sm leading-6 text-zinc-700">
          <input
            type="checkbox"
            checked={values.acceptTerms}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                acceptTerms: event.target.checked,
              }))
            }}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-700"
          />
          <span>
            I agree to the account terms and security policy.
            {errors.acceptTerms ? (
              <span className="mt-1 block text-sm font-medium text-red-600">
                {errors.acceptTerms}
              </span>
            ) : null}
          </span>
        </label>

        <ServerError error={registerMutation.error} />

        <SubmitButton
          label="Create account"
          loadingLabel="Creating account"
          isLoading={registerMutation.isPending}
        />
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const user = authApi.getCurrentUser()
  const aiHighlights = [
    {
      label: 'Models monitored',
      value: '12',
      detail: 'Production and sandbox agents',
    },
    {
      label: 'Tasks automated',
      value: '3.8k',
      detail: 'Across support, research, and reporting',
    },
    {
      label: 'Avg. response time',
      value: '1.4s',
      detail: 'For approved AI workflows',
    },
  ]
  const aiWorkflows = [
    'Summarize customer conversations into action items',
    'Draft reports from uploaded knowledge sources',
    'Classify requests and route them to the right team',
  ]

  const handleLogout = async () => {
    authApi.logout()
    await router.invalidate()
    await navigate({ to: '/login' })
  }

  return (
    <main className="min-h-svh bg-[#f6f7f4] px-4 py-8 text-zinc-950 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl flex-col justify-between rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">
              AI workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Intelligence dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            Sign out
          </button>
        </header>

        <div className="grid gap-6 py-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-zinc-950">
              Build, monitor, and improve your AI workflows.
            </h2>
            <p className="text-base leading-7 text-zinc-600">
              Welcome back,{' '}
              <span className="font-semibold text-zinc-950">
                {user?.name}
              </span>
              . Use this protected space to review model performance, track
              automation coverage, and keep human approval in the loop for
              sensitive AI decisions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {aiHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="text-2xl font-semibold text-zinc-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-[#eef6f2] p-5">
            <p className="text-sm font-semibold uppercase text-emerald-700">
              Active AI workflows
            </p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-700">
              {aiWorkflows.map((workflow) => (
                <li key={workflow} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-700" />
                  <span>{workflow}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg bg-white/70 p-4 text-sm leading-6 text-zinc-600">
              Signed in as <span className="font-semibold">{user?.email}</span>
              . Your session keeps this AI dashboard available only after
              authentication.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <main className="min-h-svh bg-[#f6f7f4] text-zinc-950">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-zinc-200 bg-[#eef6f2] px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <Link
            to="/login"
            className="flex w-fit items-center gap-3 text-sm font-semibold text-zinc-900"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-950 text-sm font-bold text-white">
              CP
            </span>
            Cursor Portal
          </Link>

          <div className="max-w-md">
            <img
              src={heroImg}
              alt=""
              className="mb-10 h-44 w-44 object-contain"
            />
            <p className="mb-4 text-sm font-semibold uppercase text-emerald-700">
              Secure access
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-950">
              Manage every workspace session with confidence.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-zinc-600">
              A focused authentication flow with guarded navigation, persistent
              sessions, and clear feedback for every account action.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {['Route guards', 'Query mutations', 'Local session'].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-emerald-200 bg-white/70 px-3 py-3 font-medium text-zinc-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <Link
                to="/login"
                className="mb-8 flex w-fit items-center gap-3 text-sm font-semibold text-zinc-900"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-950 text-sm font-bold text-white">
                  CP
                </span>
                Cursor Portal
              </Link>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl font-semibold leading-tight text-zinc-950">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        className="h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SubmitButton({
  label,
  loadingLabel,
  isLoading,
}: {
  label: string
  loadingLabel: string
  isLoading: boolean
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-500"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {isLoading ? loadingLabel : label}
    </button>
  )
}

function ServerError({ error }: { error: Error | null }) {
  if (!error) {
    return null
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      {error instanceof AuthApiError
        ? error.message
        : 'Something went wrong. Please try again.'}
    </div>
  )
}

function validateLogin(values: LoginValues) {
  const errors: FieldErrors<LoginValues> = {}

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

function validateRegister(values: RegisterValues) {
  const errors: FieldErrors<RegisterValues> = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Enter your full name.'
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'Accept the terms to continue.'
  }

  return errors
}
