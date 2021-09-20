<template>
  <div id="button-wrapper">
    <button v-on:click="nominate">Nominate</button>
  </div>
</template>

<script>
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Enable, web3FromAddress, web3Accounts } from '@polkadot/extension-dapp'
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
      // isWeb3Injected: false,
      extensions: null,
      account: null,
      allAccounts: null,
    }
  },
  async created() {
    this.extensions = await web3Enable('Nominate button')

    if (this.extensions.length === 0) {
      // no extension installed, or the user did not accept the authorization
      // in this case we should inform the use and give a link to the extension
      return
    }

    this.allAccounts = await web3Accounts()
    this.account = this.allAccounts[0]

    // this.isWeb3Injected = isWeb3Injected
    const wsProvider = new WsProvider(config.nodeWs)
    this.api = await ApiPromise.create({ provider: wsProvider })
  },
  methods: {
    async nominate() {
      // the address we use to use for signing, as injected
      // const SENDER = 'DXigJfMhoJz5swr8nVpY1UeWw5BFN2TAkJvYhhZUuCaajV6'
      const target = [
        // 'DSA55HQ9uGHE5MyMouE8Geasi2tsDcu3oHR4aFkJ3VBjZG5',
        // 'J4XkgJjMP6c1pqneV5KogJvJLM1qReXP9SAMJt33prnDdwB',
        // 'DSpbbk6HKKyS78c4KDLSxCetqbwnsemv2iocVXwNe2FAvWC',
        '5ENXqYmc5m6VLMm5i1mun832xAv2Qm9t3M4PWAFvvyCJLNoR'
      ]

      // finds an injector for an address
      const injector = await web3FromAddress(this.$store.state.selectedAddress)
      this.api.setSigner(injector.signer)

      const transfer = this.api.tx.staking.bond(
        this.$store.state.selectedAddress,
        this.amount,
        0
      )

      transfer.signAndSend(
        this.$store.state.selectedAddress,
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

      const nominateTransfer = this.api.tx.staking.nominate(target)

      nominateTransfer.signAndSend(
        this.$store.state.selectedAddress,
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
    },
  },
}
</script>

<style>
</style>