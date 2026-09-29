import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AdminDashboard from '../views/AdminDashboard.vue'
import DriverVerification from '../views/DriverVerification.vue'
import FleetManagement from '../views/FleetManagement.vue'
import RevenueLedger from '../views/RevenueLedger.vue'
import DriverAppView from '../views/DriverAppView.vue'
import PassengerAppView from '../views/PassengerAppView.vue'
import AuthView from '../views/AuthView.vue'

function getHomeRouteForRole(role) {
  if (role === 'Admin') return '/admin'
  if (role === 'Fleet') return '/fleet'
  if (role === 'Driver') return '/driver'
  return '/passenger'
}

export const screenCatalog = [
  { slug: 'hurriya_super_app_home_refined', label: 'Passenger home', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'book_a_ride_in_juba_finalized', label: 'Book a ride', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'book_a_delivery', label: 'Book a delivery', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'track_delivery', label: 'Track delivery', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'rider_trip_history', label: 'Trip history', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'rider_trip_receipt', label: 'Trip receipt', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'bill_payments', label: 'Bill payments', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'send_money', label: 'Send money', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'cash_out_request', label: 'Cash out', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'rewards_promos', label: 'Rewards and promos', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'commuter_pass_system', label: 'Commuter pass', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'active_emergency_shield', label: 'Emergency shield', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'safety_toolkit_overlay', label: 'Safety toolkit', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'rider_push_notifications', label: 'Notifications', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'support_chat_interface', label: 'Support chat', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'sign_in_register_enhanced_flow_2', label: 'Registration enhanced', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'otp_verification_flow', label: 'SMS verification', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'welcome_to_hurriya_ride_enhanced', label: 'Welcome', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'book_a_ride_in_juba', label: 'Ride booking draft', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'hurriya_super_app_home', label: 'Passenger home draft', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'incoming_trip_request', label: 'Incoming trip request', role: 'Driver', module: 'DriverAppView' },
  { slug: 'driver_dashboard_offline', label: 'Driver offline dashboard', role: 'Driver', module: 'DriverAppView' },
  { slug: 'active_trip_enhanced_navigation', label: 'Active trip navigation', role: 'Driver', module: 'DriverAppView' },
  { slug: 'trip_matching_connecting', label: 'Trip matching', role: 'Driver', module: 'DriverAppView' },
  { slug: 'earnings_payouts', label: 'Earnings and payouts', role: 'Driver', module: 'DriverAppView' },
  { slug: 'driver_document_onboarding', label: 'Document onboarding', role: 'Driver', module: 'DriverVerification' },
  { slug: 'driver_training_portal', label: 'Driver training', role: 'Driver', module: 'DriverAppView' },
  { slug: 'driver_performance_review', label: 'Driver performance', role: 'Fleet', module: 'FleetManagement' },
  { slug: 'admin_command_center', label: 'Command center', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_command_center_live_hotspots_map', label: 'Live hotspots map', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_sos_alert_panel', label: 'SOS alert panel', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'advanced_operational_analytics', label: 'Operational analytics', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_driver_performance_analytics', label: 'Driver analytics', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'incident_reporting_form', label: 'Incident reporting', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'driver_verification_pipeline', label: 'Verification pipeline', role: 'Admin', module: 'DriverVerification' },
  { slug: 'fleet_management_compliance_refined', label: 'Fleet compliance', role: 'Fleet', module: 'FleetManagement' },
  { slug: 'vehicle_financing_dashboard', label: 'Vehicle financing', role: 'Fleet', module: 'FleetManagement' },
  { slug: 'ssp_revenue_ledger_refined', label: 'SSP revenue ledger', role: 'Admin', module: 'RevenueLedger' },
  { slug: 'corporate_billing_management', label: 'Corporate billing', role: 'Fleet', module: 'RevenueLedger' },
  { slug: 'admin_settings_general_configuration', label: 'General configuration', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_settings_compliance_protocols', label: 'Compliance protocols', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_settings_system_integration', label: 'System integrations', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_settings_security_access', label: 'Security access', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_settings_refined_security_access', label: 'Security access refined', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'admin_settings_create_new_role_modal', label: 'Create role', role: 'Admin', module: 'AdminDashboard' },
  { slug: 'trip_completed_summary', label: 'Trip completed', role: 'Passenger', module: 'PassengerAppView' },
  { slug: 'marketing_landing_page', label: 'Marketing landing page', role: 'Public', module: 'PassengerAppView' },
  { slug: 'shader', label: 'Visual shader study', role: 'Design', module: 'PassengerAppView' },
]

const dashboardByScreen = (screen) => {
  if (screen.role === 'Public') return 'public'
  if (screen.role === 'Design') return 'design'
  if (screen.module === 'DriverVerification') return 'admin'
  if (screen.role === 'Admin') return 'admin'
  if (screen.role === 'Fleet') return 'fleet'
  if (screen.role === 'Driver') return 'driver'
  return 'passenger'
}

screenCatalog.forEach((screen) => {
  screen.dashboard = dashboardByScreen(screen)
  screen.assetPath = `/screens/${screen.dashboard}/${screen.slug}.html`
})

const views = { AdminDashboard, DriverVerification, FleetManagement, RevenueLedger, DriverAppView, PassengerAppView }

const routes = [
  { path: '/login', component: AuthView },
  { path: '/admin/login', component: AuthView, props: { adminOnly: true } },
  { path: '/', redirect: () => {
      const authStore = useAuthStore()
      return authStore.authenticated ? getHomeRouteForRole(authStore.role) : '/login'
    } },
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, allowedRoles: ['Admin'] } },
  { path: '/verification', component: DriverVerification, meta: { requiresAuth: true, allowedRoles: ['Admin', 'Driver'] } },
  { path: '/fleet', component: FleetManagement, meta: { requiresAuth: true, allowedRoles: ['Fleet', 'Admin'] } },
  { path: '/ledger', component: RevenueLedger, meta: { requiresAuth: true, allowedRoles: ['Admin', 'Fleet'] } },
  { path: '/driver', component: DriverAppView, meta: { requiresAuth: true, allowedRoles: ['Driver'] } },
  { path: '/passenger', component: PassengerAppView, meta: { requiresAuth: true, allowedRoles: ['Passenger'] } },
  ...screenCatalog.map((screen) => ({
    path: `/screen/${screen.slug}`,
    component: views[screen.module],
    props: { screen },
    meta: {
      requiresAuth: true,
      allowedRoles: screen.role === 'Public' || screen.role === 'Design' ? undefined : [screen.role],
    },
  })),
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.authenticated && localStorage.getItem('hurriya-auth-session')) {
    await authStore.restoreSession()
  }

  if (to.path === '/login' && authStore.authenticated) {
    return getHomeRouteForRole(authStore.role)
  }

  if (to.path === '/admin/login' && authStore.authenticated) {
    return getHomeRouteForRole(authStore.role)
  }

  if (to.meta.requiresAuth && !authStore.authenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(authStore.role)) {
    return { path: getHomeRouteForRole(authStore.role) }
  }

  return true
})

export default router
