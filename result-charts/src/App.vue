<template>
  <div id="app">
    <ResultChart result-type="startup" result-value-type="median"/>
    <ResultChart result-type="cpu" result-value-type="median"/>
    <ResultChart result-type="memory" result-value-type="median"/>
  </div>
</template>

<script lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import ResultChart from '@/components/Charts/ResultChart.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    ResultChart
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
</style>
