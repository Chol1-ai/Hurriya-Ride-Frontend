<script setup>
import ScreenModule from './ScreenModule.vue'
defineProps({ screen: { type: Object, default: null }, section: { type: String, default: 'overview' } })
</script>
<template><ScreenModule role="Admin" :section="section" :screen="screen" /></template>
