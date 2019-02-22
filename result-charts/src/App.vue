<template>
  <div id="app">
    <ResultTable
      title="Startup"
      xAxisTitle="Tempo (ms)"
      class="chart chart-sup"
      result-type="startup"
      result-value-type="median"
      chart-height="400"
    />
    <ResultTable
      title="Uso de CPU"
      xAxisTitle="Tempo (ms)"
      class="chart chart-cpu"
      result-type="cpu"
      result-value-type="median"
      chart-height="400"
    />
    <ResultTable
      title="Uso de memoria RAM"
      xAxisTitle="Memoria (MB)"
      class="chart chart-mem"
      result-type="memory"
      result-value-type="median"
      chart-height="400"
    />

    <ResultFullTable
      title="Uso de memoria RAM"
      xAxisTitle="Memoria (MB)"
      class="chart chart-mem"
      result-type="memory"
      result-value-type="median"
      chart-height="400"
    />
  </div>
</template>

<script lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import ResultChartJs from '@/components/Charts/ResultChartJs.vue'
import ResultFullTable from '@/components/Tables/ResultFullTable.vue'
import ResultTable from '@/components/Tables/ResultTable.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    ResultChartJs,
    ResultTable,
    ResultFullTable
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  margin: 0 auto;
  .chart {
    padding: 2rem 0;
    margin: 0 auto;
    // &-sup {
    //   width: 600px;
    // }
    // &-cpu {
    //   width: 950px;
    // }
    // &-mem {
    //   width: 800px;
    // }
  }
}
</style>
