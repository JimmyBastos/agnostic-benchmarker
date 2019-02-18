<template>
  <div>
    <!-- <Highcharts :options="chartOptions"/> -->
    <table class="pure-table" style="width: 100%">
      <thead>
        <tr>
          <th>Framework</th>
          <th :key="resultCategory" v-for="resultCategory in resultLabels">{{ resultCategory }}</th>
        </tr>
      </thead>

      <tbody>
        <tr :key="dataset.name" v-for="dataset in resultDatasets">
          <td>{{ dataset.name }}</td>
          <td :key="resultValue" v-for="resultValue in dataset.data">{{ resultValue }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script lang="ts">
import {
  IJSONResult,
  resultsData,
  TypesResult,
  TypesResultValue
} from "@/results.data";
import { Chart } from "highcharts-vue";
import { Component, Mixins, Prop, Vue, Watch } from "vue-property-decorator";

class Dataset {
  constructor(
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
  public resultType!: TypesResult;

  @Prop({ required: true })
  public xAxisTitle!: string;

  @Prop({ required: true })
  public chartHeight!: string;

  @Prop({ default: "median" })
  public resultValueType!: TypesResultValue;

  @Prop({ default: () => new Object() })
  public options!: {};

  get chartOptions(): object {
    const defaultOptions = {
      chart: {
        renderTo: "container",
        type: "column",
        height: this.chartHeight
      },
      title: {
        text: ""
      },
      yAxis: {
        min: 0,
        title: {
          text: this.xAxisTitle
        },
        labels: {
          overflow: "justify"
        }
      },
      xAxis: {
        type: "category",
        categories: this.resultLabels
      },
      plotOptions: {
        borderWidth: 0,
        column: {
          pointWidth: 20,
          pointPadding: 0.085,
          groupPadding: 0.1,
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: false
        }
      }
    };
    return { ...defaultOptions, ...this.options, series: this.resultDatasets };
  }

  get resultsData(): object {
    return {
      labels: this.resultLabels,
      datasets: this.resultDatasets
    };
  }

  get filteredResults(): IJSONResult[] {
    return resultsData.filter(r => r.type === this.resultType);
  }

  get resultLabels(): string[] {
    return [...new Set(this.filteredResults.map(r => r.label || ""))];
  }

  get resultDatasets() {
    const getResults = (
      data: IJSONResult[],
      valueType: TypesResultValue,
      framework: string
    ): number[] =>
      data
        .filter(result => result.framework.includes(framework))
        .map(resultData => resultData[valueType].toFixed(2).replace(".", ","));

    return [
      new Dataset(
        "React",
        getResults(this.filteredResults, this.resultValueType, "react"),
        "rgba(97, 218, 251, 1)",
        "rgb(97, 218, 251)"
      ),
      new Dataset(
        "Angular",
        getResults(this.filteredResults, this.resultValueType, "angular"),
        "rgba(221, 0, 49, 1)",
        "rgb(221, 0, 49)"
      ),
      new Dataset(
        "Vue",
        getResults(this.filteredResults, this.resultValueType, "vue"),
        "rgba(66, 185, 131, 1)",
        "rgb(66, 185, 131)"
      )
    ];
  }
}
</script>
