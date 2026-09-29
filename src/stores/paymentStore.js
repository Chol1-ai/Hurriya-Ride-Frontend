import { defineStore } from 'pinia'
import api from '../api/client'

export const usePaymentStore = defineStore('payment', {
  state: () => ({ items: [], loading: false }),
  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
  },
  actions: {
    async load() {
      this.loading = true
      try {
        const response = await api.getPayments()
        this.items = response.payments || []
        return this.items
      } finally {
        this.loading = false
      }
    },
    async topUp(amount) {
      const response = await api.topup(amount)
      await this.load()
      return response
    },
  },
})
