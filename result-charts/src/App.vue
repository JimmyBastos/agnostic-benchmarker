<template>
  <div id="app">
    <ResultHighCharts
      title="Startup"
      xAxisTitle="Tempo (ms)"
      class="chart"
      result-type="startup"
      result-value-type="median"
    />
    <ResultHighCharts
      title="Uso de CPU"
      xAxisTitle="Tempo (ms)"
      class="chart"
      result-type="cpu"
      result-value-type="median"
    />
    <ResultHighCharts
      title="Uso de memoria RAM"
      xAxisTitle="Memoria (MB)"
      class="chart"
      result-type="memory"
      result-value-type="median"
    />
  </div>
</template>

<script lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import ResultChartJs from '@/components/Charts/ResultChartJs.vue'
import ResultHighCharts from '@/components/Charts/ResultHighCharts.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    ResultChartJs,
    ResultHighCharts
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  max-width: 1228px;
  margin: 0 auto;

  .chart {
    padding: 2rem 0;
  }
}
</style>
