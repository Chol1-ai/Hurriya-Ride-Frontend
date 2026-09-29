<script setup>
defineProps({ message: { type: String, required: true }, tone: { type: String, default: 'success' } })
</script>
<template><div class="toast" :class="`toast-${tone}`" role="status">{{ message }}</div></template>
<style scoped>.toast{padding:12px 16px;border:1px solid currentColor;border-radius:8px;font-size:13px;font-weight:700}.toast-success{color:var(--success);background:#10b9811a}.toast-warning{color:var(--primary-soft);background:#f59e0b1a}.toast-danger{color:var(--danger);background:#ef44441a}</style>
