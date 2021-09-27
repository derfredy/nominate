<template>
  <div id="app">
    <b-navbar type="dark" variant="dark">
      <b-container fluid>
        <b-navbar-nav>
          <button
            v-b-modal.wallet-modal
            type="button"
            class="btn btn-outline-info"
          >
            <span>Connect wallet</span>
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
    <b-container>
      <b-row class="justify-content-md-center">        
        <b-form class="mt-2 col-md-4" @submit="onSubmit">
          <label for="input-amount">Amount in pKSM</label>
          <b-form-input
            id="input-amount"
            v-model.number="amount"
            placeholder="Enter amount"
            type="number"
          ></b-form-input>
          <!-- <b-dropdown id="units" :text="selectedUnit" class="mb-0 btn-block">
        <b-dropdown-item
          v-for="unit in units"
          :key="unit"
          @click="setUnit(unit)"
        >
          {{ unit }}
        </b-dropdown-item>
      </b-dropdown> -->
          <b-button type="submit" class="mt-2">Nominate</b-button>
        </b-form>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import WalletSelector from './components/WalletSelector.vue'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { encodeAddress } from '@polkadot/keyring'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { validationMixin } from 'vuelidate'
import { required, integer } from 'vuelidate/lib/validators'
import { config } from '../config.js'

export default {
  name: 'App',
  components: {
    WalletSelector,
  },
  mixins: [validationMixin],
  data() {
    return {
      tranferableBalance: 0,
      amount: 0,
      units: [
        'pico',
        'nano',
        'micro',
        'mili',
        config.denom,
        'Kilo',
        'Mega',
        'Giga',
        'Tera',
      ],
      selectedUnit: config.denom,
      api: null,
      extensions: null,
    }
  },
  validations: {
    amount: {
      required,
      integer,
      minValue: 1,
    },
  },
  async created() {
    const wsProvider = new WsProvider(config.nodeWs)
    this.api = await ApiPromise.create({ provider: wsProvider })
    console.log(this.selectedAddress())
  },
  methods: {
    selectedAddress() {
      return this.$store.state.selectedAddress
    },
    setUnit(unit) {
      this.selectedUnit = unit
    },
    getAmount() {
      switch (this.selectedUnit) {
        case 'pico':
          return this.amount
        case 'nano':
          return this.amount * 1000
        case 'micro':
          return this.amount * 1000000
        case 'mili':
          return this.amount * 1000000000
        case `${config.denom}`:
          return this.amount * 1000000000000
        case 'kilo':
          return this.amount * 1000000000000000
        case 'mega':
          return this.amount * 1000000000000000000
        case 'giga':
          return this.amount * 1000000000000000000000
        case 'tera':
          return this.amount * 1000000000000000000000000
      }
    },
    onSubmit(evt) {
      evt.preventDefault()
      this.stake()
    },
    async stake() {
      const selectedAccount = encodeAddress(this.selectedAddress(), 42)

      const targets = [
        'DSA55HQ9uGHE5MyMouE8Geasi2tsDcu3oHR4aFkJ3VBjZG5',
        'J4XkgJjMP6c1pqneV5KogJvJLM1qReXP9SAMJt33prnDdwB',
        'DSpbbk6HKKyS78c4KDLSxCetqbwnsemv2iocVXwNe2FAvWC',
      ]

      web3FromAddress(selectedAccount)
        .then(async (injector) => {
          this.api.setSigner(injector.signer)
          const amount = parseFloat(this.amount)
          const rewardDestination = 0
          let transactions = []
          transactions.push(
            await this.api.tx.staking.bond(
              this.selectedAddress,
              amount,
              rewardDestination
            )
          )
          transactions.push(await this.api.tx.staking.nominate(targets))
          const extrinsic = await this.api.tx.utility.batch(transactions)
          extrinsic.signAndSend(
            selectedAccount,
            { signer: injector.signer },
            (result) => {
              console.log(`Current status is ${result.status}`)
              if (result.status.isInBlock) {
                console.log(
                  `Transaction included at blockHash ${result.status.asInBlock}`
                )
              } else if (result.status.isFinalized) {
                console.log(
                  `Transaction finalized at blockHash ${result.status.asFinalized}`
                )
              }
            }
          )
        })
        .catch((error) => {
          console.log('Error: ', error)
        })
    },
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
}
</style>
