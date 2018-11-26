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

// benchRun,
// benchUpdate,
// benchSelect,
// benchSwapRows,
// benchRemove,
// benchRunBig,
// benchAppendToManyRows,
// benchClear,
// benchReadyMemory,
// benchRunMemory,
// benchUpdate5Memory,
// benchReplace5Memory,
// benchCreateClear5Memory,
// benchStartup,

// button__add
// button__populate
// button__populate_hot
// button__shuffle
// button__clear

const SHORT_TIMEOUT = 20 * 1000

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

const benchAdd = new class extends Benchmark {
  constructor() {
    super({
      id: '01_add_one',
      label: 'Add one row',
      description: 'Duration for creating 1 row after the page loaded.',
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

const benchPopulate = new class extends Benchmark {
  constructor() {
    super({
      id: '02_run1k',
      label: 'populate 1.000 rows',
      description: 'Duration for creating 1.000 rows after the page loaded.',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span')
  }
}()

const benchPopulateHot = new class extends Benchmark {
  constructor() {
    super({
      id: '03_run10k',
      label: 'populate 10.000 rows',
      description: 'Duration for creating 10.000 rows after the page loaded.',
      type: BenchmarkType.CPU,
    })
  }

  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate_hot', SHORT_TIMEOUT)
  }

  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__populate_hot')
    await testElementLocatedByXpath(driver, '//tbody/tr[10000]/td[2]/span')
  }
}()

const benchSuffle = new class extends Benchmark {
  constructor() {
    super({
      id: '04_shuffle1k',
      label: 'shuffle all rows',
      description: 'Duration for shuffle all rows of the table.', // (with ' + config.WARMUP_COUNT + ' warmup iterations).
      type: BenchmarkType.CPU,
    })
  }
  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    // for (let i = 0; i < config.WARMUP_COUNT; i++) {
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span')
    // }
  }
  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__shuffle')
    // TODO: Test the shuffle result
    await testTextNotContained(driver, '//tbody/tr[1000]/td[1]', '1000', SHORT_TIMEOUT)
  }
}()

const benchUpdateCell = new class extends Benchmark {
  constructor() {
    super({
      id: '06_update_cell',
      label: 'clear rows',
      description: 'Duration for remove 1 row to a 1000 rows table',
      type: BenchmarkType.CPU,
    })
  }
  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span')
  }
  public async run(driver: WebDriver) {
    const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')

    await clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button_update')
    await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
  }
}()

const benchRemoveCell = new class extends Benchmark {
  constructor() {
    super({
      id: '07_remove_cell',
      label: 'clear rows',
      description: 'Duration for remove 1 row to a 1000 rows table',
      type: BenchmarkType.CPU,
    })
  }
  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span')
  }
  public async run(driver: WebDriver) {
    const text = await getTextByXPath(driver, '//tbody/tr[1]/td[2]/span')

    await clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button_delete')
    await testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT)
  }
}()

const benchClear = new class extends Benchmark {
  constructor() {
    super({
      id: '05_clear1k_x8',
      label: 'clear rows',
      description: 'Duration to clear the table filled with 1.000 rows. Simulated 8x CPU slowdown',
      type: BenchmarkType.CPU,
      throttleCPU: 8,
    })
  }
  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT)
    await clickElementById(driver, 'button__populate')
    await testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span')
  }
  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__clear')
    await testElementNotLocatedByXPath(driver, '//tbody/tr[1]')
  }
}()

const benchReadyMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '06_ready-memory',
      label: 'ready memory',
      description: 'Memory usage after page load.',
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

const benchRunMemory = new class extends Benchmark {
  constructor() {
    super({
      id: '07_run-memory',
      label: 'run memory',
      description: 'Memory usage after adding 1000 rows.',
      type: BenchmarkType.MEM,
    })
  }
  public async init(driver: WebDriver) {
    await testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT)
  }
  public async run(driver: WebDriver) {
    await clickElementById(driver, 'button__add')
    await testElementLocatedByXpath(driver, '//tbody/tr[2]/td[2]/span')
  }
}()

const benchStartup = new class extends Benchmark {
  constructor() {
    super({
      id: '30_startup',
      label: 'startup time',
      description: 'Time for loading, parsing and starting up',
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
  label: 'consistently interactive',
  description: 'a pessimistic TTI - when the CPU and network are both definitely very idle. (no more CPU tasks over 50ms)',
  type: BenchmarkType.STARTUP,
  property: 'TimeToConsistentlyInteractive',
}

const benchStartupBootup: IStartupBenchmarkResult = {
  id: '32_startup-bt',
  label: 'script bootup time',
  description: 'the total ms required to parse/compile/evaluate all the page\'s scripts',
  type: BenchmarkType.STARTUP,
  property: 'ScriptBootUpTtime',
}

const benchStartupMainThreadWorkCost: IStartupBenchmarkResult = {
  id: '33_startup-mainthreadcost',
  label: 'main thread work cost',
  description: 'total amount of time spent doing work on the main thread. includes style/layout/etc.',
  type: BenchmarkType.STARTUP,
  property: 'MainThreadWorkCost',
}

const benchStartupTotalBytes: IStartupBenchmarkResult = {
  id: '34_startup-totalbytes',
  label: 'total kilobyte weight',
  description: 'network transfer cost (post-compression) of all the resources loaded into the page.',
  type: BenchmarkType.STARTUP,
  property: 'TotalKiloByteWeight',
}

// const benchStartup = new BenchStartup()

export let benchmarks: Benchmark[] = [
  // benchStartup,
  // benchAdd,
  // benchPopulate,
  // benchPopulateHot,
  // benchSuffle,
  // benchClear,
  benchRemoveCell,
  // benchUpdateCell,
  // benchReadyMemory,
  // benchRunMemory,
  // benchUpdate5Memory,
  // benchReplace5Memory,
  // benchCreateClear5Memory,
]

export function fileName(framework: IFrameworkData, benchmark: IBenchmarkInfo) {
  return `${framework.fullNameWithVersion}_${benchmark.id}.json`
}
