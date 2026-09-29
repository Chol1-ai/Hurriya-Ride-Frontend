<script setup>
defineProps({ open: Boolean, title: { type: String, default: '' } })
defineEmits(['close'])
</script>
<template><div v-if="open" class="modal-backdrop" @click.self="$emit('close')"><section class="modal"><header><h2>{{ title }}</h2><button aria-label="Close" @click="$emit('close')">×</button></header><slot /></section></div></template>
<style scoped>.modal-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:#010f1fcc}.modal{width:min(520px,100%);padding:24px;background:var(--surface-container);border:1px solid var(--outline);border-radius:12px}.modal header{display:flex;justify-content:space-between;align-items:center}.modal h2{margin:0}.modal button{border:0;background:transparent;color:var(--on-surface);font-size:24px}</style>
