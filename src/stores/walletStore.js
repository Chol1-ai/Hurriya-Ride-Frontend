import { defineStore } from 'pinia'

const savedWallet = JSON.parse(localStorage.getItem('hurriya-wallet-state') || 'null')

export const useWalletStore = defineStore('wallet', {
  state: () => savedWallet || ({ currency: 'SSP', balance: 45000, pendingSettlement: 0 }),
  getters: { formattedBalance: (state) => `${state.currency} ${state.balance.toLocaleString()}` },
  actions: {
    deposit(amount) {
      const value = Number(amount)
      if (Number.isFinite(value) && value > 0) { this.balance += value; this.persist() }
    },
    pay(amount) {
      const value = Number(amount)
      if (Number.isFinite(value) && value > 0 && value <= this.balance) { this.balance -= value; this.persist(); return true }
      return false
    },
    persist() { localStorage.setItem('hurriya-wallet-state', JSON.stringify(this.$state)) },
  },
})
