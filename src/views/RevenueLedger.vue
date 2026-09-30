<script setup>
import { useAuthStore } from '../stores/authStore'
import ScreenModule from './ScreenModule.vue'
defineProps({ screen: { type: Object, default: null } })
const authStore = useAuthStore()
</script>
<template><ScreenModule :role="screen?.role || authStore.role" section="ledger" :screen="screen" /></template>
