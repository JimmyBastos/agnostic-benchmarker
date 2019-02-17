<script lang="ts">
import {
  IJSONResult,
  resultsData,
  TypesResult,
  TypesResultValue
} from '@/results.data'
import { Bar, mixins as ChartMixins } from 'vue-chartjs'
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'

class Dataset {
  constructor (
    public label: string,
    public data: Array<number | object>,
    public backgroundColor: string,
    public borderColor: string,
    public borderWidth = 1
  ) {}
}

@Component
export default class ResultChart extends Mixins(Bar) {
  @Prop({ required: true })
  public resultType!: TypesResult

  @Prop({ default: 'median' })
  public resultValueType!: TypesResultValue

  @Prop({ default: () => new Object() })
  public options!: {}

  private defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    showTooltips : false,
    showInlineValues : true,
    centeredInllineValues : true,
    tooltipCaretSize : 0,
    tooltipTemplate : '<%= value %>',
    fontSize: 14,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ],
      xAxes: [
        {
          categoryPercentage: 0.25,
          barThickness: 12
        }
      ]
    }
  }

  get chartOptions (): object {
    return { ...this.defaultOptions, ...this.options }
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
    const getResults = (data: IJSONResult[], valueType: TypesResultValue, framework: string): object[] =>
      data.filter((r) => r.framework.includes(framework)).map((r) => ({ x: r.label, y: r[valueType].toFixed(2) }))

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

  @Watch('resultDatasets', { deep: true })
  public loadChart () {
    this.renderChart(this.resultsData, this.chartOptions)
  }

  public mounted () {
    this.loadChart()
  }
}
</script>
