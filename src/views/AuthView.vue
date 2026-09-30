<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({ allowedRole: { type: String, default: 'Passenger' } })
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mode = ref(props.allowedRole === 'Passenger' && route.query.mode === 'register' ? 'register' : 'login')
const form = ref({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

const roleHome = { Passenger: '/passenger', Driver: '/driver', Fleet: '/fleet', Admin: '/admin' }
const isPublicPassengerLogin = computed(() => props.allowedRole === 'Passenger')
const roleLabel = computed(() => ({ Passenger: 'Passenger', Driver: 'Driver', Fleet: 'Fleet', Admin: 'Admin' }[props.allowedRole] || 'Passenger'))
const redirectPath = computed(() => route.query.redirect || roleHome[props.allowedRole] || '/passenger')

async function submit() {
  error.value = ''
  loading.value = true

  try {
    if (mode.value === 'login') {
      await authStore.login(form.value.email, form.value.password)
      if (authStore.role !== props.allowedRole) {
        authStore.signOut()
        error.value = `This sign-in is for ${roleLabel.value.toLowerCase()} accounts only.`
        return
      }
    } else {
      await authStore.register(form.value.name || 'Demo rider', form.value.email, 'Passenger', form.value.password)
    }

    router.push(String(redirectPath.value))
  } catch (submitError) {
    error.value = submitError.message || 'Authentication failed.'
  } finally {
    loading.value = false
  }
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
  if (mode.value === 'register') {
    form.value = { name: '', email: '', password: '' }
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand-block">
          <span class="brand-pill">{{ roleLabel === 'Passenger' ? 'Hurriya Ride' : `Hurriya ${roleLabel}` }}</span>
          <h1>{{ mode === 'login' ? `${roleLabel} sign in` : 'Create your account' }}</h1>
          <p>{{ mode === 'login' ? `Sign in to continue to your ${roleLabel.toLowerCase()} workspace.` : 'Set up a passenger account to start booking trips and payments.' }}</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <label v-if="mode === 'register'">
          Full name
          <input v-model="form.name" type="text" placeholder="Amin Hassan" required />
        </label>

        <label>
          Email
          <input v-model="form.email" type="email" placeholder="you@example.com" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" placeholder="Enter your password" required />
        </label>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account' }}
        </button>

        <button v-if="isPublicPassengerLogin" class="secondary-button" type="button" @click="toggleMode">
          {{ mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in' }}
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: radial-gradient(circle at top, rgba(255,170,68,0.2), transparent 35%), #07131f;
}

.auth-card {
  width: min(100%, 470px);
  padding: 32px 28px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 22px;
  background: rgba(6, 17, 28, 0.9);
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.45);
}

.brand-pill {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,170,68,0.12);
  color: #fbbf24;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 18px 0 10px;
  font-size: clamp(28px, 4vw, 40px);
}

p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.6;
}

.auth-form {
  margin-top: 28px;
  display: grid;
  gap: 18px;
}

label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 13px 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(15, 23, 42, 0.7);
  color: white;
  font: inherit;
}

button {
  width: 100%;
  min-height: 48px;
  border-radius: 10px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1f2937;
}

.secondary-button {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #e2e8f0;
}

.error-message {
  color: #fca5a5;
  font-size: 13px;
  font-weight: 700;
}

button:disabled {
  opacity: 0.75;
  cursor: wait;
}
</style>
