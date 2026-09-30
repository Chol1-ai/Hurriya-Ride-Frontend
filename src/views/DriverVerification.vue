<script setup>
import { useAuthStore } from '../stores/authStore'
import ScreenModule from './ScreenModule.vue'
defineProps({ screen: { type: Object, default: null }, section: { type: String, default: 'drivers' } })
const authStore = useAuthStore()
</script>
<template><ScreenModule :role="screen?.role || authStore.role" :section="section" :screen="screen" /></template>
