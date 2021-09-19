<template>
  <div id="app">
    <input v-model.number="amount" placeholder="Enter amount" />
    <NominateButton :amount="amount" />
  </div>
</template>

<script>
import NominateButton from './components/NominateButton.vue'

export default {
  name: 'App',
  components: {
    NominateButton,
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
