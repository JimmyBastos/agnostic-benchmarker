import { WebDriver } from 'selenium-webdriver'

import {
  config,
  IFrameworkData,
} from './common'

import {
  clickElementById,
  clickElementByXPath,
  getTextByXPath,
  testClassContains,
  testElementLocatedById,
  testElementLocatedByXpath,
  testElementNotLocatedByXPath,
  testTextContains,
  testTextEqual,
  testTextNotContained,
  testTextNotEqual,
} from './webdriverAccess'

export enum BenchmarkType {
  CPU,
  MEM,
  STARTUP,
}

const SHORT_TIMEOUT = 20 * 500

const TABLE_SIZE = 50

export interface IBenchmarkInfo {
  id: string
  type: BenchmarkType
  label: string
  description: string
  throttleCPU?: number
}

export abstract class Benchmark {
  public id: string
  public type: BenchmarkType
  public label: string
  public description: string
  public throttleCPU?: number

  constructor(public benchmarkInfo: IBenchmarkInfo) {
    this.id = benchmarkInfo.id
    this.type = benchmarkInfo.type
    this.label = benchmarkInfo.label
    this.description = benchmarkInfo.description
    this.throttleCPU = benchmarkInfo.throttleCPU
  }
  public abstract init(driver: WebDriver, framework: IFrameworkData): Promise<any>
  public abstract run(driver: WebDriver, framework: IFrameworkData): Promise<any>
  public after(driver: WebDriver, framework: IFrameworkData) { return }
  // Good fit for a single result creating Benchmark
  public resultKinds(): IBenchmarkInfo[] { return [this.benchmarkInfo] }
  public extractResult(results: any[], resultKind: IBenchmarkInfo): number[] { return results }
}

export interface ILighthouseData {
  TimeToConsistentlyInteractive: number
  ScriptBootUpTtime: number
  MainThreadWorkCost: number
  TotalKiloByteWeight: number
  [propName: string]: number
}

export interface IStartupBenchmarkResult extends IBenchmarkInfo {
  property: keyof ILighthouseData
}

const benchAddOne = new class extends Benchmark {
  constructor() {
    super({
      id: '01_add_one',
      label: 'Adicionar item',
      description: 'Tempo gasto para inserir um registro na lista',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span')
  }
}()

/*************************************************
 * CPU BECHMARK
 *
 * CPU usage after run some critical
 * operations.
 *************************************************/

const benchRemoveOne = new class extends Benchmark {
  constructor() {
    super({
      id: '02_remove_one',
      label: 'Remover item',
      description: 'Tempo gasto para remover um registro',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, `//tbody/tr[1]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    await clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button__delete')
    await testElementNotLocatedByXPath(driver, '//tbody/tr[1]/td[2]/span', SHORT_TIMEOUT)
  }
}()

const benchUpdateOne = new class extends Benchmark {
  constructor() {
    super({
      id: '03_update_one',
      label: 'Atualizar item',
      description: 'Tempo gasto para atualizar um registro.',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, `//tbody/tr[1]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')
    await clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button__update')
    await testTextNotEqual(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
  }
}()

const benchPopulate = new class extends Benchmark {
  constructor() {
    super({
      id: '04_populate50',
      label: 'Inserir 50 items',
      description: 'Tempo gasto para inserir 50 registros na lista.',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }
}()

const benchSwapTwoRows = new class extends Benchmark {
  constructor() {
    super({
      id: '05_swap_rows',
      label: 'Permutar items',
      description: 'Duração para permutar dois registros em uma lista de 50 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const
      oneRowPath = `//tbody/tr[1]/td[1]`,
      anotherRowPath = `// tbody/tr[${TABLE_SIZE}]/td[1]`,
      oneRowText = await getTextByXPath(driver, oneRowPath),
      anotherRowText = await getTextByXPath(driver, anotherRowPath)

    await clickElementById(driver, 'button__swap')

    await testTextEqual(driver, `//tbody/tr[50]/td[1]`, oneRowText, SHORT_TIMEOUT)
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, anotherRowText, SHORT_TIMEOUT)
  }
}()

const benchSuffle = new class extends Benchmark {
  constructor() {
    super({
      id: '06_suffle',
      label: 'Inverter lista',
      description: 'Duração para inverter a ordem de uma lista de 50 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__shuffle')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT)
  }
}()

const benchSort = new class extends Benchmark {
  constructor() {
    super({
      id: '07_sort',
      label: 'Ordenar lista',
      description: 'Duração para ordenar uma lista de 50 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    // populate table
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)

    // reverse table
    await testElementLocatedById(driver, 'button__shuffle', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__shuffle')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__sort')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, '1', SHORT_TIMEOUT)
    await testTextEqual(driver, `//tbody/tr[50]/td[1]`, '50', SHORT_TIMEOUT)
  }
}()

const benchClearAll = new class extends Benchmark {
  constructor() {
    super({
      id: '08_clear50',
      label: 'Limpar lista',
      description: 'Duração para limpar uma lista com 50 registros',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__clear')
    await testElementNotLocatedByXPath(driver, '//tbody/tr[1]')
  }
}()

/*************************************************
 * MEMORY BECHMARK
 *
 * Memory resources usage after run some critical
 * operations.
 *************************************************/

const benchReadyMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '20_ready-memory',
      label: 'Iniciar',
      description: 'Uso da memória após o carregamento da página.',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await testElementNotLocatedByXPath(driver, '//tbody/tr[1]')
  }
}()

const benchAddOne5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '21_add_one_5-memory',
      label: 'Adicionar item',
      description: 'Uso de memória para adicionar item 5 vezes',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      await clickElementById(driver, 'button__add')
      await testElementLocatedByXpath(driver, `//tbody/tr[${i + 1}]/td[2]/span`, SHORT_TIMEOUT)
    }
  }
}()

const benchUpdateOne5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '22_update5-memory',
      label: 'Atualizar item',
      description: 'Uso de memória para atualizar um item 5 vezes',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span')
  }

  public async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')
      await clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button__update')
      await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
    }
  }
}()

const benchAddRemoveOne5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '23_add_remove_one5-memory',
      label: 'Adicionar e remover item',
      description: 'Uso de memória para adicionar e remover item 5 vezes',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      await clickElementById(driver, 'button__add')
      await testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span')
      await clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button__delete')
      await testElementNotLocatedByXPath(driver, '//tbody/tr[1]/td[2]/span', SHORT_TIMEOUT)
    }
  }
}()

const benchSwapTwoRows5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '24_swap_rows5-memory',
      label: 'Permutar items',
      description: 'Uso de memória para permutar dois registros em uma lista de 50 items 5 vezes',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      const
        oneRowPath = `//tbody/tr[1]/td[1]`,
        anotherRowPath = `// tbody/tr[${TABLE_SIZE}]/td[1]`,
        oneRowText = await getTextByXPath(driver, oneRowPath),
        anotherRowText = await getTextByXPath(driver, anotherRowPath)

      await clickElementById(driver, 'button__swap')
      await testTextEqual(driver, `//tbody/tr[50]/td[1]`, oneRowText, SHORT_TIMEOUT)
      await testTextEqual(driver, `//tbody/tr[1]/td[1]`, anotherRowText, SHORT_TIMEOUT)
    }
  }
}()

const benchPopulateMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '25_populate-memory',
      label: 'Inserir 50 itens',
      description: 'Uso de memória para inserir 50 registros na lista.',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }
}()

const benchSuffleMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '26_shuffle-memory',
      label: 'Inverter lista',
      description: 'Uso de memória para inverter a ordem de uma lista de 50 items',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const randomItem = Math.floor((Math.random() * TABLE_SIZE) + 1)
    await clickElementById(driver, 'button__shuffle')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT)
  }
}()

const benchSortMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '27_sort-memory',
      label: 'Ordenar lista',
      description: 'Uso de memória para ordenar uma lista de 50 items',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    const randomItem = Math.floor((Math.random() * TABLE_SIZE) + 1)

    // populate table
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)

    // shuffle table
    await testElementLocatedById(driver, 'button__shuffle', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__shuffle')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__sort')
    await testTextEqual(driver, `//tbody/tr[1]/td[1]`, '1', SHORT_TIMEOUT)
    await testTextEqual(driver, `//tbody/tr[50]/td[1]`, '50', SHORT_TIMEOUT)
  }
}()

const benchClearMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '28_populateclear-memory',
      label: 'Inserir 50 e limpar',
      description: 'Uso de memória para inserir e limpar 50 registros na lista.',
      type: BenchmarkType.MEM,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__clear')
    await testElementNotLocatedByXPath(driver, '//tbody/tr[1]')
  }
}()

/*************************************************
 * STARTUP BECHMARK
 *
 * Time to application startup
 *************************************************/
const benchStartupConsistentlyInteractive: IStartupBenchmarkResult = {
  id: '31_startup-ci',
  label: 'Iniciar interação',
  description: 'Tempo até interatividade',
  type: BenchmarkType.STARTUP,
  property: 'TimeToConsistentlyInteractive',
}

const benchStartupBootup: IStartupBenchmarkResult = {
  id: '32_startup-bt',
  label: 'Carregamento de scripts',
  description: 'Tempo total para carregar, compilar e avaliar todos os scripts da página.',
  type: BenchmarkType.STARTUP,
  property: 'ScriptBootUpTtime',
}

const benchStartupMainThreadWorkCost: IStartupBenchmarkResult = {
  id: '33_startup-mainthreadcost',
  label: 'Tread principal',
  description: 'Tempo total executando tarefas na thread principal.',
  type: BenchmarkType.STARTUP,
  property: 'MainThreadWorkCost',
}

const benchStartupTotalBytes: IStartupBenchmarkResult = {
  id: '34_startup-totalbytes',
  label: 'Consumo de dados (kB)',
  description: 'Custo de recursos de rede de todos os recursos carregados na página (gziped).',
  type: BenchmarkType.STARTUP,
  property: 'TotalKiloByteWeight',
}

class BenchStartup extends Benchmark {
  constructor() {
    super({
      id: '30_startup',
      label: 'Inicialização',
      description: 'Tempo para analisar/compilar/avaliar os scripts (html, css, js)',
      type: BenchmarkType.STARTUP,
    })
  }

  public async init(driver: WebDriver) { await driver.get(`http://192.168.1.50:${config.PORT}/`) }

  public async run(driver: WebDriver, framework: IFrameworkData) {
    await driver.get(`http://192.168.1.50:${config.PORT}`)
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
    return driver.sleep(config.STARTUP_SLEEP_DURATION)
  }

  public extractResult(results: ILighthouseData[], resultKind: IBenchmarkInfo): number[] {
    return results.reduce((a, v) => { a.push(v[(resultKind as IStartupBenchmarkResult).property]); return a }, new Array<number>())
  }

  public resultKinds() {
    return [
      benchStartupConsistentlyInteractive,
      benchStartupBootup,
      benchStartupMainThreadWorkCost,
      benchStartupTotalBytes,
    ]
  }
}

const benchStartup = new BenchStartup()

export let benchmarks: Benchmark[] = [
  // benchAddOne,
  // benchUpdateOne, /* Paint calls > 2 */
  // benchRemoveOne, /* Paint calls > 2 */
  // benchSwapTwoRows,
  // benchSuffle,
  // benchSort,
  // benchPopulate,
  // benchClearAll,
  // benchReadyMemory,
  // benchAddOne5Memory,
  // benchUpdateOne5Memory,
  // benchAddRemoveOne5Memory,
  // benchSwapTwoRows5Memory,
  // benchSuffleMemory,
  // benchSortMemory,
  // benchPopulateMemory,
  // benchClearMemory,
  benchStartup,
]

export function fileName(framework: IFrameworkData, benchmark: IBenchmarkInfo) {
  return `${framework.fullNameWithVersion}_${benchmark.id}.json`
}
