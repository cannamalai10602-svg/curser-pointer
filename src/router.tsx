import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { authApi } from './auth'
import {
  DashboardPage,
  LoginPage,
  RootLayout,
  SignUpPage,
} from './auth-pages'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (!authApi.getCurrentUser()) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (authApi.getCurrentUser()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  beforeLoad: () => {
    if (authApi.getCurrentUser()) {
      throw redirect({ to: '/' })
    }
  },
  component: SignUpPage,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  loginRoute,
  signUpRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
