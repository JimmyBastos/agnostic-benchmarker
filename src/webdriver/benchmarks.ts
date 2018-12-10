import {
  // Builder,
  // logging,
  // promise,
  WebDriver,
} from 'selenium-webdriver'

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
  testTextNotContained,
} from './webdriverAccess'

export enum BenchmarkType {
  CPU,
  MEM,
  STARTUP,
}

const SHORT_TIMEOUT = 20 * 1000

const TABLE_SIZE = 100

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
      label: 'adicionar item',
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

const benchRemoveOne = new class extends Benchmark {
  constructor() {
    super({
      id: '02_remove_one',
      label: 'remover item',
      description: 'Tempo gasto para remover um registro em uma lista de 100 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')

    await clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button_delete')
    await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
  }
}()

const benchUpdateOne = new class extends Benchmark {
  constructor() {
    super({
      id: '03_update_one',
      label: 'atualizar item',
      description: 'Tempo gasto para atualizar um registro em uma lista de 100 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')

    await clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button_update')
    await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
  }
}()

const benchPopulate = new class extends Benchmark {
  constructor() {
    super({
      id: '04_populate100',
      label: 'inserir 100 items',
      description: 'Tempo gasto para inserir 100 registros na lista.',
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

const benchSwapRows = new class extends Benchmark {
  constructor() {
    super({
      id: '05_swap_rows',
      label: 'permutar items',
      description: 'Duração para permutar dois registros em uma lista de 100 items',
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

    await testTextContains(driver, `//tbody/tr[999]/td[1]`, oneRowText, SHORT_TIMEOUT)
    await testTextContains(driver, `//tbody/tr[1]/td[1]`, anotherRowText, SHORT_TIMEOUT)
  }
}()

const benchSuffle = new class extends Benchmark {
  constructor() {
    super({
      id: '06_shuffle100',
      label: 'embaralhar lista',
      description: 'Duração para embaralhar uma lista de 100 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)
  }

  public async run(driver: WebDriver) {
    const row = Math.floor((Math.random() * TABLE_SIZE) + 1)
    const text = row.toString()
    await clickElementById(driver, 'button__shuffle')
    await testTextNotContained(driver, `//tbody/tr[${row}]/td[1]`, text, SHORT_TIMEOUT)
  }
}()

const benchSort = new class extends Benchmark {
  constructor() {
    super({
      id: '07_sort100',
      label: 'ordenar lista',
      description: 'Duração para ordenar uma lista de 100 items',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    const row = Math.floor((Math.random() * TABLE_SIZE) + 1)
    const text = row.toString()
    // populate table
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)

    // shuffle table
    await testElementLocatedById(driver, 'button__shuffle', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__shuffle')
    await testTextNotContained(driver, `//tbody/tr[${row}]/td[1]`, text, SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__sort')
    await testTextContains(driver, `//tbody/tr[1]/td[1]`, '1', SHORT_TIMEOUT)
    await testTextContains(driver, `//tbody/tr[100]/td[1]`, '100', SHORT_TIMEOUT)
  }
}()

const benchClearAll = new class extends Benchmark {
  constructor() {
    super({
      id: '08_clear100',
      label: 'limpar lista',
      description: 'Duração para limpar uma lista com 100 registros',
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

const benchReadyMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '20_ready-memory',
      label: 'memória ao iniciar',
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

  public async after(driver: WebDriver, framework: IFrameworkData) {
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span')
  }
}()

const benchPopulateMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '21_populate-memory',
      label: 'memória ao inserir 100 itens',
      description: 'Uso de memória após inserir 100 registros na lista.',
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


const benchUpdate5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '22_update5-memory',
      label: 'memória ao atualizar item',
      description: 'Uso de memória após atualizar um item 5 vezes',
      type: BenchmarkType.MEM,
    })
  }

  async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span')
  }

  async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')
      await clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button_update')
      await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
    }
  }
}

const benchPopulate5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '23_populate5-memory',
      label: 'memória ao inserir 100 items (5 ciclos)',
      description: 'Uso de memória após inserir 100 registros na lista 5 vezes.',
      type: BenchmarkType.MEM,
    })
  }

  async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
  }

  async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      await clickElementById(driver, 'button__populate')
      await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE * (i + 1)}]/td[2]/span`)
    }
  }
}

const benchPopulateClear5Memory = new class extends Benchmark {
  constructor() {
    super({
      id: '24_populateclear5-memory',
      label: 'memória ao inserir e limpar 100 items (5 ciclos)',
      description: 'Uso de memória após inserir e limpar 100 registros na lista 5 vezes.',
      type: BenchmarkType.MEM,
    })
  }

  async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
  }

  async run(driver: WebDriver) {
    for (let i = 0; i < 5; i++) {
      await clickElementById(driver, 'button__populate')
      await testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`)

      await clickElementById(driver, 'button__clear')
      await testElementNotLocatedByXPath(driver, '//tbody/tr[1]')
    }
  }
}

const benchStartup = new class extends Benchmark {
  constructor() {
    super({
      id: '30_startup',
      label: 'tempo de inicialização',
      description: 'Tempo para analisar/compilar/avaliar os scripts (html, css, js)',
      type: BenchmarkType.STARTUP,
    })
  }

  public async init(driver: WebDriver) { await driver.get(`http://localhost:${config.PORT}/`) }

  public async run(driver: WebDriver, framework: IFrameworkData) {
    await driver.get(`http://localhost:${config.PORT}`)
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
}()

const benchStartupConsistentlyInteractive: IStartupBenchmarkResult = {
  id: '31_startup-ci',
  label: 'tempo até interatividade',
  description: 'Tempo até interatividade',
  type: BenchmarkType.STARTUP,
  property: 'TimeToConsistentlyInteractive',
}

const benchStartupBootup: IStartupBenchmarkResult = {
  id: '32_startup-bt',
  label: 'tempo de carregamento de scripts',
  description: 'Tempo total para carregar, compilar e avaliar todos os scripts da página.',
  type: BenchmarkType.STARTUP,
  property: 'ScriptBootUpTtime',
}

const benchStartupMainThreadWorkCost: IStartupBenchmarkResult = {
  id: '33_startup-mainthreadcost',
  label: 'utilização da tread principal',
  description: 'Quantidade total de tempo gasto executando tarefas na thread principal.',
  type: BenchmarkType.STARTUP,
  property: 'MainThreadWorkCost',
}

const benchStartupTotalBytes: IStartupBenchmarkResult = {
  id: '34_startup-totalbytes',
  label: 'consumo da rede em kilobytes',
  description: 'Custo de recursos de rede de todos os recursos carregados na página (gziped).',
  type: BenchmarkType.STARTUP,
  property: 'TotalKiloByteWeight',
}

// const benchStartup = new BenchStartup()

export let benchmarks: Benchmark[] = [
  benchStartup,
  benchAddOne,
  benchPopulate,
  benchSuffle,
  benchSort,
  benchClearAll,
  benchUpdateOne,
  benchReadyMemory,
  benchPopulateMemory,
  benchUpdate5Memory,
  benchPopulate5Memory,
  benchPopulateClear5Memory,
]

export function fileName(framework: IFrameworkData, benchmark: IBenchmarkInfo) {
  return `${framework.fullNameWithVersion}_${benchmark.id}.json`
}
