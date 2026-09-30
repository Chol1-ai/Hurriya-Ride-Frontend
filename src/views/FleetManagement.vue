<script setup>
import ScreenModule from './ScreenModule.vue'
defineProps({ screen: { type: Object, default: null }, section: { type: String, default: 'overview' } })
</script>
<template><ScreenModule role="Fleet" :section="section" :screen="screen" /></template>
