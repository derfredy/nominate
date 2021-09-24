<template>
  <div id="button-wrapper">
    <b-form class="mt-2" @submit="onSubmit">
      <b-button type="submit" :disabled="!selectedAddress">Nominate</b-button>
    </b-form>
  </div>
</template>

<script>
import { ApiPromise, WsProvider } from '@polkadot/api'
import { encodeAddress } from '@polkadot/keyring'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { config } from '/config.js'
export default {
  props: {
    amount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      api: null,
      extensions: null,
    }
  },

  async created() {
    const wsProvider = new WsProvider(config.nodeWs)
    this.api = await ApiPromise.create({ provider: wsProvider })
  },
  methods: {
    selectedAddress() {
      return this.$store.state.selectedAddress
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
          const amount = this.amount
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
</style>