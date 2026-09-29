import { defineStore } from 'pinia'
import api from '../api/client'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const rawSession = localStorage.getItem('hurriya-auth-session')
    const session = rawSession ? JSON.parse(rawSession) : null

    return {
      user: session?.user || null,
      token: session?.token || null,
      role: session?.user?.role || 'Passenger',
      authenticated: Boolean(session?.token),
    }
  },
  actions: {
    persistSession(token, user) {
      this.token = token
      this.user = user
      this.role = user?.role || 'Passenger'
      this.authenticated = true
      api.setToken(token)
      localStorage.setItem('hurriya-auth-session', JSON.stringify({ token, user }))
    },
    clearSession() {
      this.token = null
      this.user = null
      this.role = 'Passenger'
      this.authenticated = false
      api.clearToken()
      localStorage.removeItem('hurriya-auth-session')
    },
    async restoreSession() {
      const session = localStorage.getItem('hurriya-auth-session')
      if (!session) {
        this.clearSession()
        return false
      }

      try {
        const parsed = JSON.parse(session)
        if (!parsed?.token) {
          this.clearSession()
          return false
        }

        this.token = parsed.token
        this.user = parsed.user
        this.role = parsed.user?.role || 'Passenger'
        this.authenticated = true
        api.setToken(parsed.token)
        return true
      } catch (error) {
        this.clearSession()
        return false
      }
    },
    async hydrateSession() {
      if (!this.token) {
        return this.restoreSession()
      }

      try {
        const response = await api.me()
        this.user = response.user
        this.role = response.user?.role || 'Passenger'
        this.authenticated = true
        localStorage.setItem('hurriya-auth-session', JSON.stringify({ token: this.token, user: response.user }))
        return true
      } catch (error) {
        this.clearSession()
        return false
      }
    },
    async login(email, password) {
      const response = await api.login({ email, password })
      this.persistSession(response.token, response.user)
      return response
    },
    async register(name, email, role = 'Passenger', password = 'Password123!') {
      const response = await api.register({ name, email, password, role })
      this.persistSession(response.token, response.user)
      return response
    },
    authenticate(user, role = 'Passenger') {
      this.user = user
      this.role = role
      this.authenticated = true
      this.token = this.token || 'demo-token'
    },
    signOut() {
      this.clearSession()
    },
  },
})
