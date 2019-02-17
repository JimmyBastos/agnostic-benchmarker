<template>
  <Highcharts :options="chartOptions"/>
</template>


<script lang="ts">
import {
  IJSONResult,
  resultsData,
  TypesResult,
  TypesResultValue
} from '@/results.data'
import { Chart } from 'highcharts-vue'
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'

class Dataset {
  constructor (
    public name: string,
    public data: Array<number | object>,
    public color: string,
    public borderColor: string,
    public borderWidth = 1
  ) {}
}

@Component({
  components: {
    Highcharts: Chart
  }
})
export default class ResultHighCharts extends Vue {
  @Prop({ required: true })
  public resultType!: TypesResult

  @Prop({ required: true })
  public xAxisTitle!: string

  @Prop({ default: 'median' })
  public resultValueType!: TypesResultValue

  @Prop({ default: () => new Object() })
  public options!: {}

  get chartOptions (): object {
    const defaultOptions = {
      chart: {
        renderTo: 'container',
        type: 'column'
      },
      title: {
        text: 'Fruit Consumption'
      },
      yAxis: {
        min: 0,
        title: {
            text: this.xAxisTitle
        },
        labels: {
            overflow: 'justify'
        }
      },
      xAxis: {
        type: 'category',
        categories: this.resultLabels
      },
      plotOptions: {
        pointPadding: 0.2,
        borderWidth: 0,

        column: {
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: false
        }
      }
    }
    return { ...defaultOptions, ...this.options, series:  this.resultDatasets }
  }

  get resultsData (): object {
    return {
      labels: this.resultLabels,
      datasets: this.resultDatasets
    }
  }

  get filteredResults (): IJSONResult[] {
    return resultsData.filter((r) => r.type === this.resultType)
  }

  get resultLabels (): string[] {
    return [...new Set(this.filteredResults.map((r) => r.label || ''))]
  }

  get resultDatasets () {
    const getResults = (data: IJSONResult[], valueType: TypesResultValue, framework: string): number[] =>
      data
        .filter((result) => result.framework.includes(framework))
        .map((resultData) => (+resultData[valueType].toFixed(2)))

    return [
      new Dataset(
        'React',
        getResults(this.filteredResults, this.resultValueType, 'react'),
        'rgba(97, 218, 251, 1)',
        'rgb(97, 218, 251)'
      ),
      new Dataset(
        'Angular',
        getResults(this.filteredResults, this.resultValueType, 'angular'),
        'rgba(221, 0, 49, 1)',
        'rgb(221, 0, 49)'
      ),
      new Dataset(
        'Vue',
        getResults(this.filteredResults, this.resultValueType, 'vue'),
        'rgba(66, 185, 131, 1)',
        'rgb(66, 185, 131)'
      )
    ]
  }
}
</script>
