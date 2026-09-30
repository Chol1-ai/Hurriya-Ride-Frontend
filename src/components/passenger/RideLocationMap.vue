<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  pickup: { type: Object, required: true },
  destination: { type: Object, required: true },
})
const emit = defineEmits(['update:pickup', 'update:destination', 'route'])

const mapElement = ref(null)
const activePin = ref('pickup')
const routeDistance = ref(null)
const routeDuration = ref(null)
const message = ref('Tap the map to pin the selected location.')
const locationLoading = ref(false)

let map
let pickupMarker
let destinationMarker
let routeLine
let routeRequest

function hasPoint(point) {
  return point?.lat != null
    && point?.lng != null
    && Number.isFinite(Number(point.lat))
    && Number.isFinite(Number(point.lng))
}

function iconFor(type) {
  const isPickup = type === 'pickup'
  return Leaflet.divIcon({
    className: 'ride-location-icon',
    html: `<span class="ride-location-pin ${isPickup ? 'pickup-pin' : 'destination-pin'}">${isPickup ? 'P' : 'D'}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function syncMarker(type) {
  const point = props[type]
  const currentMarker = type === 'pickup' ? pickupMarker : destinationMarker
  if (!map || !hasPoint(point)) {
    if (currentMarker) map.removeLayer(currentMarker)
    if (type === 'pickup') pickupMarker = null
    else destinationMarker = null
    return
  }

  const position = [Number(point.lat), Number(point.lng)]
  if (currentMarker) {
    currentMarker.setLatLng(position)
  } else {
    const marker = Leaflet.marker(position, { icon: iconFor(type) }).addTo(map)
    if (type === 'pickup') pickupMarker = marker
    else destinationMarker = marker
  }
}

function clearRoute() {
  if (routeLine) map?.removeLayer(routeLine)
  routeLine = null
  routeDistance.value = null
  routeDuration.value = null
  emit('route', null)
}

async function updateRoute() {
  if (!map || !hasPoint(props.pickup) || !hasPoint(props.destination)) {
    clearRoute()
    return
  }

  routeRequest?.abort()
  routeRequest = new AbortController()
  message.value = 'Calculating road distance…'

  try {
    const { pickup, destination } = props
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const response = await fetch(url, { signal: routeRequest.signal })
    if (!response.ok) throw new Error('Routing service unavailable')
    const data = await response.json()
    const route = data.routes?.[0]
    if (data.code !== 'Ok' || !route) throw new Error('No road route found for these pins')

    if (routeLine) map.removeLayer(routeLine)
    routeLine = Leaflet.geoJSON(route.geometry, {
      style: { color: '#e89827', weight: 5, opacity: 0.9 },
    }).addTo(map)
    map.fitBounds(routeLine.getBounds().pad(0.16), { maxZoom: 15 })
    routeDistance.value = route.distance
    routeDuration.value = route.duration
    emit('route', { distanceMeters: route.distance, durationSeconds: route.duration })
    message.value = 'Road route calculated.'
  } catch (error) {
    if (error.name === 'AbortError') return
    clearRoute()
    message.value = error.message || 'Could not calculate a road route.'
  }
}

function setPin(type, latitude, longitude) {
  const previous = props[type]
  const label = previous.label?.trim() || (type === 'pickup' ? 'Pinned pickup' : 'Pinned destination')
  emit(`update:${type}`, { ...previous, label, lat: latitude, lng: longitude })
  message.value = `${type === 'pickup' ? 'Pickup' : 'Destination'} pin placed.`
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    message.value = 'Location is not available in this browser.'
    return
  }

  locationLoading.value = true
  navigator.geolocation.getCurrentPosition((position) => {
    setPin('pickup', position.coords.latitude, position.coords.longitude)
    map.setView([position.coords.latitude, position.coords.longitude], 15)
    locationLoading.value = false
  }, (error) => {
    message.value = error.code === error.PERMISSION_DENIED
      ? 'Allow location access, or tap the map to place the pickup pin.'
      : 'Could not get your location. Tap the map to place the pickup pin.'
    locationLoading.value = false
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
}

watch(() => [props.pickup.lat, props.pickup.lng, props.destination.lat, props.destination.lng], () => {
  syncMarker('pickup')
  syncMarker('destination')
  updateRoute()
})

onMounted(() => {
  map = Leaflet.map(mapElement.value, { scrollWheelZoom: false }).setView([4.8594, 31.5713], 13)
  Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  map.on('click', (event) => setPin(activePin.value, event.latlng.lat, event.latlng.lng))
  syncMarker('pickup')
  syncMarker('destination')
  updateRoute()
  window.setTimeout(() => map?.invalidateSize(), 0)
})

onBeforeUnmount(() => {
  routeRequest?.abort()
  map?.remove()
})
</script>

<template>
  <section class="map-section" aria-labelledby="map-heading">
    <div class="map-heading">
      <div>
        <p class="eyebrow">Pickup and destination</p>
        <h2 id="map-heading">Pin your route</h2>
      </div>
      <button class="map-location-button" type="button" :disabled="locationLoading" @click="useCurrentLocation">
        {{ locationLoading ? 'Finding location…' : 'Use my location' }}
      </button>
    </div>
    <div class="pin-mode" role="group" aria-label="Choose which location to pin">
      <button type="button" :aria-pressed="activePin === 'pickup'" :class="{ active: activePin === 'pickup' }" @click="activePin = 'pickup'">Pickup{{ hasPoint(pickup) ? ' pinned' : '' }}</button>
      <button type="button" :aria-pressed="activePin === 'destination'" :class="{ active: activePin === 'destination' }" @click="activePin = 'destination'">Destination{{ hasPoint(destination) ? ' pinned' : '' }}</button>
    </div>
    <div ref="mapElement" class="ride-map" aria-label="Map for choosing pickup and destination"></div>
    <div class="map-footer" aria-live="polite">
      <span>{{ message }}</span>
      <strong v-if="routeDistance !== null">{{ (routeDistance / 1000).toFixed(1) }} km · {{ Math.max(1, Math.round(routeDuration / 60)) }} min</strong>
    </div>
  </section>
</template>

<style>
.map-section { margin: 24px 0 4px; padding: 18px 0; border-top: 1px solid var(--outline); border-bottom: 1px solid var(--outline); }
.map-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.map-heading .eyebrow { margin-bottom: 5px; }
.map-heading h2 { margin: 0; color: var(--on-surface); font-size: 18px; }
.map-location-button, .pin-mode button { min-height: 40px; padding: 0 12px; border: 1px solid var(--outline); border-radius: 5px; background: var(--surface-container); color: var(--on-surface); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.map-location-button:disabled { cursor: wait; opacity: .7; }
.pin-mode { display: flex; gap: 8px; margin-bottom: 10px; }
.pin-mode button.active { border-color: var(--primary); color: var(--primary-soft); }
.ride-map { z-index: 0; width: 100%; height: 320px; overflow: hidden; border: 1px solid var(--outline); border-radius: 6px; background: var(--surface-low); }
.ride-location-icon { border: 0; background: transparent; }
.ride-location-pin { display: grid; width: 30px; height: 30px; place-items: center; border: 2px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 8px rgba(0,0,0,.45); color: #fff; font: 700 12px/1 sans-serif; }
.ride-location-pin::first-letter { transform: rotate(45deg); }
.pickup-pin { background: #047857; }
.destination-pin { background: #be123c; }
.map-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding-top: 10px; color: var(--muted); font-size: 12px; }
.map-footer strong { color: var(--primary-soft); font-variant-numeric: tabular-nums; }
@media (max-width: 480px) {
  .map-heading { align-items: flex-start; flex-direction: column; }
  .ride-map { height: 280px; }
  .map-footer { align-items: flex-start; flex-direction: column; }
}
</style>