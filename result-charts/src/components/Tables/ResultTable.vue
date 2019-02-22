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
        <tr v-for="dataset in resultDatasets">
          <td>{{ dataset.name }}</td>
          <td v-for="resultValue in dataset.data">{{ resultValue }}</td>
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
} from '@/results.data'
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'

class Dataset {
  constructor (public name: string, public data: Array<number | object>) {}
}

@Component()
export default class ResultTable extends Vue {
  @Prop({ required: true })
  public resultType!: TypesResult

  @Prop({ default: 'median' })
  public resultValueType!: TypesResultValue

  get filteredResults (): IJSONResult[] {
    return resultsData.filter((r) => r.type === this.resultType)
  }

  get resultLabels (): string[] {
    return [...new Set(this.filteredResults.map((r) => r.label || ''))]
  }

  get resultDatasets () {
    const getResults = (
      data: IJSONResult[],
      valueType: TypesResultValue,
      framework: string
    ): number[] =>
      data
        .filter((result) => result.framework.includes(framework))
        .map((resultData) => resultData[valueType].toFixed(2).replace('.', ','))

    return [
      new Dataset(
        'React',
        getResults(this.filteredResults, this.resultValueType, 'react')
      ),
      new Dataset(
        'Angular',
        getResults(this.filteredResults, this.resultValueType, 'angular')
      ),
      new Dataset(
        'Vue',
        getResults(this.filteredResults, this.resultValueType, 'vue')
      )
    ]
  }
}
</script>
