<template>
  <div id="button-wrapper">
    <button v-on:click="nominate">Nominate</button>
  </div>
</template>

<script>
import { ApiPromise, WsProvider } from '@polkadot/api'
import {
  isWeb3Injected,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp'
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
      isWeb3Injected: false,
      allInjected: null,
    }
  },
  async created() {
    this.allInjected = await web3Enable('Nominate button')
    this.isWeb3Injected = isWeb3Injected
    const wsProvider = new WsProvider(config.nodeWs)
    this.api = await ApiPromise.create({ provider: wsProvider })
  },
  methods: {
    async nominate() {
      // the address we use to use for signing, as injected
      const SENDER = '5H16fVkfiyTAPyeiw3s7SZd3YHtptbH2WW8pN7QZyQji8LGq'
      const target = ['5C556QTtg1bJ43GDSgeowa3Ark6aeSHGTac1b2rKSXtgmSmW']

      // finds an injector for an address
      const injector = await web3FromAddress(SENDER)
      this.api.setSigner(injector.signer)

      const transfer = this.api.tx.staking.bond(SENDER, this.amount, 0)

      transfer.signAndSend(SENDER, { signer: injector.signer }, (result) => {
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
      })

      const nominateTransfer = this.api.tx.staking.nominate(target)

      nominateTransfer.signAndSend(
        SENDER,
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