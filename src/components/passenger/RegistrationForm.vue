<script setup>
defineEmits(['submit'])
</script>
<template><form class="registration" @submit.prevent="$emit('submit')"><label>Mobile number<input type="tel" placeholder="+211 9XX XXX XXX" required /></label><label>Full name<input type="text" placeholder="Your name" required /></label><button>Continue with SMS verification</button></form></template>
<style scoped>.registration{display:grid;gap:14px}.registration label{display:grid;gap:6px;color:var(--muted);font-size:12px;font-weight:700}.registration input{padding:12px 14px;background:var(--surface-container);border:1px solid var(--outline);border-radius:7px;color:var(--on-surface)}.registration button{padding:12px;border:0;border-radius:7px;background:var(--primary);color:#472a00;font-weight:700}</style>
