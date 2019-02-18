<template>
  <div>
    <table class="pure-table" style="width: 100%">
      <thead>
        <tr>
          <th>Framework</th>
          <th v-for="resultCategory in resultLabels">{{ resultCategory }}</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(dataset, index) in resultDatasets">
          <td>{{ dataset.name }}</td>
          <td v-for="(results, index) in dataset.data">
            <div style="white-space: nowrap" v-for="(result, type) in results">
              <b style="display: inline-block">{{ type }}:</b>
              {{ result }}
            </div>
          </td>
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
  constructor(public name: string, public data: Array<number | object>) {}
}

@Component()
export default class ResultFullTable extends Vue {
  @Prop({ required: true })
  public resultType!: TypesResult;

  get resultLabels(): string[] {
    return [
      ...new Set(
        resultsData.map(r => {
          return r.type + " - " + r.label;
        })
      )
    ] as string[];
  }

  get resultDatasets() {
    const formatResult = (result: number) =>
      result.toFixed(2).replace(".", ",");

    const getResults = (data: IJSONResult[], framework: string): object[] =>
      data
        .filter(result => result.framework.includes(framework))
        .map(data => {
          return {
            min: formatResult(data.min),
            max: formatResult(data.max),
            mean: formatResult(data.mean),
            geometricMean: formatResult(data.geometricMean),
            standardDeviation: formatResult(data.standardDeviation)
          };
        });

    return [
      new Dataset("React", getResults(resultsData, "react")),
      new Dataset("Angular", getResults(resultsData, "angular")),
      new Dataset("Vue", getResults(resultsData, "vue"))
    ];
  }
}
</script>
