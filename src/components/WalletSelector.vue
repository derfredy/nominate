<template>
  <div class="wallet-selector">
    <h2 class="text-center d-block">Select your account</h2>
    <hr />
    <div v-if="loading">
      <h1>Loading</h1>
    </div>
    <div v-else>
      <b-table
        striped
        :fields="fields"
        :items="extensionAccounts"
        class="account-table"
      >
        <template #cell(address)="data">
          
          <span v-if="data.item.name">
            {{ data.item.name }}<br />{{ data.item.address }}
          </span>
          <span v-else>
            {{ data.item.address }}
          </span>
        </template>
        <template #cell(selected)="data">
          <p class="text-right mb-0">
            <b-button variant="info" @click="selectAddress(data.item.address)"
              >CONNECT</b-button
            >
          </p>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { encodeAddress } from '@polkadot/keyring'

import { config } from '../../config.js'

export default {
  
  data() {
    return {
      config,
      detectedExtension: false,
      extensionAccounts: [],
      extensionAddresses: [],
      api: null,
      enableWeb3: false,
      error: null,
      noAccountsFound: true,
      loading: true,
      fields: [
        {
          key: 'address',
          label: 'Account',
        },
        {
          key: 'role',
          label: 'Role',
        },
        {
          key: 'available',
          label: 'Available balance',
        },
        {
          key: 'selected',
          label: '',
        },
      ],
    }
  },
  async created() {
    this.enableWeb3 = await web3Enable('Substrate nominate')
      .then(() => {
        web3Accounts()
          .then((accounts) => {
            const wsProvider = new WsProvider(config.nodeWs)
            ApiPromise.create({ provider: wsProvider }).then(async (api) => {
              this.api = api
              if (accounts.length > 0) {
                this.detectedExtension = true
                console.log('Detected extension')
                for (const account of accounts) {
                  console.log(account)
                  const address = encodeAddress(
                    account.address,
                    config.addressPrefix
                  )
                  const balances = await this.getAccountBalances(address)
                  const role = await this.getAddressRole(address)
                  if (balances.availableBalance.gte(0)) {
                    console.log('Pushing account ' + account)
                    this.extensionAccounts.push({
                      address,
                      name: account.meta.name,
                      role,
                      available: balances.availableBalance,
                      selected: false,
                    })
                  }
                }
                if (
                  this.extensionAccounts.length > 0 &&
                  this.extensionAddresses.length > 0
                ) {
                  this.noAccountsFound = false
                  console.log(this.extensionAddresses)
                } else {
                  this.noAccountsFound = true
                }
                this.loading = false
              }
            })
          })
          .catch((error) => {
            // eslint-disable-next-line
            console.log('Error: ', error)
          })
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log('Error: ', error)
      })
  },
  methods: {
    async getAccountBalances(address) {
      const balances = await this.api.derive.balances.all(address)
      return balances
    },

    async getAddressRole(address) {
      const bonded = await this.api.query.staking.bonded(address)
      if (bonded.toString() && bonded.toString() === address) {
        return `stash/controller`
      } else if (bonded.toString() && bonded.toString() !== address) {
        return `stash`
      } else {
        const stakingLedger = await this.api.query.staking.ledger(address)
        if (stakingLedger.toString()) {
          return `controller`
        } else {
          return `none`
        }
      }
    },
    async selectAddress(address) {
      await this.$store.commit('updateSelectedAddress', address)
      this.$emit('close')
      console.log(this.$store.state)
      return true
    },
  },
}
</script>
