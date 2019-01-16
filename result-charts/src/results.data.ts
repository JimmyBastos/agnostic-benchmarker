// import { IJSONResult } from '../../src/webdriver/common'

const resultsContext = require.context('../../result-data', false, /\.json$/)

export type TypesResultValue =
  | 'min'
  | 'max'
  | 'mean'
  | 'geometricMean'
  | 'standardDeviation'
  | 'median'

export type TypesResult =
  | 'memory'
  | 'startup'
  | 'cpu'

export interface IJSONResult {
  framework: string,
  benchmark: string,
  label?: string,
  description?: string,
  type: string,
  min: number,
  max: number,
  mean: number,
  geometricMean: number,
  standardDeviation: number,
  median: number,
  values: number[]
}

export const resultsData: IJSONResult[] = resultsContext
  .keys()
  .map((r) => resultsContext(r) as IJSONResult)
  .sort((a, b) => (a.benchmark > b.benchmark) ? 1 : ((b.benchmark > a.benchmark) ? -1 : 0))
