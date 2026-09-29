<script setup>
defineProps({ screen: { type: Object, required: true } })
</script>

<template>
  <section class="preview-panel">
    <div class="preview-heading"><div><span class="eyebrow">{{ screen.dashboard }} dashboard · {{ screen.role }} module</span><h2>{{ screen.label }}</h2></div><a class="open-link" :href="screen.assetPath" target="_blank" rel="noreferrer">Open original ↗</a></div>
    <iframe class="preview-frame" :src="screen.assetPath" :title="screen.label"></iframe>
  </section>
</template>
