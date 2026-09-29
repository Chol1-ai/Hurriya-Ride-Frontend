import { defineStore } from 'pinia'
import api from '../api/client'

const savedRide = JSON.parse(localStorage.getItem('hurriya-ride-state') || 'null')

export const useRideStore = defineStore('ride', {
  state: () => savedRide || ({ status: 'idle', activeTrip: null, onlineDrivers: 128, queue: 12 }),
  getters: {
    statusLabel: (state) => ({ idle: 'Ready for a request', searching: 'Finding a nearby driver', active: 'Trip in progress', completed: 'Trip completed' }[state.status] || state.status),
  },
  actions: {
    persist() { localStorage.setItem('hurriya-ride-state', JSON.stringify(this.$state)) },
    setStatus(status) { this.status = status; this.persist() },
    setActiveTrip(trip) { this.activeTrip = trip; this.status = trip ? 'active' : 'idle'; this.persist() },
    async requestRide(vehicle = 'Boda', pickup = 'Current location', destination = 'Airport Road') {
      this.status = 'searching'
      this.persist()

      try {
        const payload = {
          pickup,
          destination,
          vehicleType: vehicle,
          passengerId: 'demo-passenger',
        }
        const response = await api.requestRide(payload)

        this.activeTrip = {
          id: response.ride?.id || `HR-${Date.now().toString().slice(-6)}`,
          vehicle,
          pickup: response.ride?.pickup || pickup,
          dropoff: response.ride?.destination || destination,
          fare: response.ride?.fare || (vehicle === 'Boda' ? 4500 : 7500),
        }
        this.status = 'active'
        this.queue += 1
        this.persist()
        return response
      } catch (error) {
        this.status = 'idle'
        this.persist()
        throw error
      }
    },
    cancelRide() { this.activeTrip = null; this.status = 'idle'; this.persist() },
    completeRide() { this.status = 'completed'; this.persist() },
    toggleOnline() { this.status = this.status === 'offline' ? 'idle' : 'offline'; this.persist() },
    setQueue(queue) { this.queue = Math.max(0, queue); this.persist() },
  },
})
