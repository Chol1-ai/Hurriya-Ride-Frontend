<script setup>
import ScreenModule from './ScreenModule.vue'
defineProps({ screen: { type: Object, default: null } })
</script>
<template><ScreenModule role="Passenger" :screen="screen" /></template>
