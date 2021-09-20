export const state = () => ({
  selectedAddress: undefined, // connected stash address
})

export const mutations = {
  updateSelectedAddress(state, selectedAddress) {
    state.selectedAddress = selectedAddress
  },
}
