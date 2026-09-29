<script setup>
defineProps({ title: { type: String, default: 'Hurriya Ride' }, role: { type: String, default: 'Operations' } })
</script>

<template>
  <header class="topbar">
    <div><span class="eyebrow">{{ role }}</span><strong>{{ title }}</strong></div>
    <span class="connection"><i></i> Connected</span>
  </header>
</template>
