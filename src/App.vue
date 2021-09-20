<template>
  <div id="app">
    <b-navbar type="dark" variant="dark">
      <b-container fluid>
        <b-navbar-nav>
          <button
            v-b-modal.wallet-modal
            type="button"
            class="btn btn-outline-info mr-4"
          >
            <span v-if="selectedAddress">
              <Identicon :address="selectedAddress" :size="22" />
              {{ selectedAddress }}
            </span>
            <span v-else>Connect wallet</span>
          </button>
        </b-navbar-nav>
      </b-container>
      <b-modal id="wallet-modal" size="lg">
        <template #modal-header></template>
        <template #default="{ hide }">
          <WalletSelector @close="hide()" />
          <p class="text-right mt-4 mb-0">
            <b-button class="btn-sm" @click="hide()">Close</b-button>
          </p>
        </template>
        <template #modal-footer></template>
      </b-modal>
    </b-navbar>
    <input v-model.number="amount" placeholder="Enter amount" />
    <NominateButton :amount="amount" />
  </div>
</template>

<script>
import NominateButton from './components/NominateButton.vue'
import WalletSelector from './components/WalletSelector.vue'

export default {
  name: 'App',
  components: {
    NominateButton,
    WalletSelector,
  },
  data() {
    return {
      amount: 0,
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
