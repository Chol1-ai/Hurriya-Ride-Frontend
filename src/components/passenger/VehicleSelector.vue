<script setup>
defineProps({ modelValue: { type: String, default: 'Boda' } })
defineEmits(['update:modelValue'])
const vehicles = ['Boda','Tuktuk','Car','XL']
</script>
<template><div class="vehicle-selector"><button v-for="vehicle in vehicles" :key="vehicle" :class="{ active: modelValue === vehicle }" @click="$emit('update:modelValue', vehicle)">{{ vehicle }}</button></div></template>
<style scoped>.vehicle-selector{display:flex;gap:8px;flex-wrap:wrap}.vehicle-selector button{padding:10px 14px;border:1px solid var(--outline);border-radius:999px;background:var(--surface-container);color:var(--muted)}.vehicle-selector button.active{background:var(--primary);border-color:var(--primary);color:#472a00;font-weight:700}</style>
