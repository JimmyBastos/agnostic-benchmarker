import * as fs from 'fs'
import * as path from 'path'
import * as R from 'ramda'
import * as chrome from 'selenium-webdriver/chrome'

const lighthouse: any = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const chromedriver: any = require('chromedriver')
const jStat: any = require('jStat').jStat

import { setUseShadowRoot } from './webdriverAccess'

import { lhConfig } from './lighthouseConfig'

import {
  Builder,
  logging,
  promise,
  WebDriver,
} from 'selenium-webdriver'

import {
  Benchmark,
  benchmarks,
  BenchmarkType,
  fileName,
  ILighthouseData,
} from './benchmarks'

import {
  config,
  IBenchmarkDriverOptions,
  IBenchmarkError,
  IBenchmarkOptions,
  IErrorsAndWarning,
  IFrameworkData,
  IJSONResult,
} from './common'

promise.USE_PROMISE_MANAGER = false

interface ITimingResult {
  type: string
  ts: number
  dur?: number
  end?: number
  mem?: number
  evt?: any
}

function extractRelevantEvents(entries: logging.Entry[]) {
  const filteredEvents: ITimingResult[] = []
  const protocolEvents: any[] = []
  entries.forEach((x) => {
    const e = JSON.parse(x.message).message
    if (config.LOG_DETAILS) { console.log(JSON.stringify(e)) }
    if (e.method === 'Tracing.dataCollected') {
      protocolEvents.push(e)
    }
    if (e.method && (e.method.startsWith('Page') || e.method.startsWith('Network'))) {
      protocolEvents.push(e)
    } else if (e.params.name === 'EventDispatch') {
      if (e.params.args.data.type === 'click') {
        if (config.LOG_TIMELINE) { console.log('CLICK ', JSON.stringify(e)) }
        filteredEvents.push({ type: 'click', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur })
      }
    } else if (e.params.name === 'TimeStamp' &&
      (e.params.args.data.message === 'afterBenchmark' || e.params.args.data.message === 'finishedBenchmark' || e.params.args.data.message === 'runBenchmark' || e.params.args.data.message === 'initBenchmark')) {
      filteredEvents.push({ type: e.params.args.data.message, ts: +e.params.ts, dur: 0, end: +e.params.ts })
      if (config.LOG_TIMELINE) { console.log('TIMESTAMP ', JSON.stringify(e)) }
    } else if (e.params.name === 'navigationStart') {
      filteredEvents.push({ type: 'navigationStart', ts: +e.params.ts, dur: 0, end: +e.params.ts })
      if (config.LOG_TIMELINE) { console.log('NAVIGATION START ', JSON.stringify(e)) }
    } else if (e.params.name === 'Paint') {
      if (config.LOG_TIMELINE) { console.log('PAINT ', JSON.stringify(e)) }
      filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur, evt: JSON.stringify(e) })
      // } else if (e.params.name === 'Rasterize') {
      //   console.log('RASTERIZE ', JSON.stringify(e))
      //   filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur, evt: JSON.stringify(e) })
      // } else if (e.params.name === 'CompositeLayers') {
      //   console.log('COMPOSITE ', JSON.stringify(e))
      //   filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts, evt: JSON.stringify(e) })
      // } else if (e.params.name === 'Layout') {
      //   console.log('LAYOUT ', JSON.stringify(e))
      //   filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: e.params.ts, evt: JSON.stringify(e) })
      // } else if (e.params.name === 'UpdateLayerTree') {
      //   console.log('UPDATELAYER ', JSON.stringify(e))
      //   filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur, evt: JSON.stringify(e) })
    } else if (e.params.name === 'MajorGC' && e.params.args.usedHeapSizeAfter) {
      filteredEvents.push({ type: 'gc', ts: +e.params.ts, end: +e.params.ts, mem: Number(e.params.args.usedHeapSizeAfter) / 1024 / 1024 })
      if (config.LOG_TIMELINE) { console.log('GC ', JSON.stringify(e)) }
    }
  })
  return { filteredEvents, protocolEvents }
}

async function fetchEventsFromPerformanceLog(driver: WebDriver): Promise<{ timingResults: ITimingResult[], protocolResults: any[] }> {
  let timingResults: ITimingResult[] = []
  let protocolResults: any[] = []
  let entries = []
  do {
    entries = await driver.manage().logs().get(logging.Type.PERFORMANCE)
    const { filteredEvents, protocolEvents } = extractRelevantEvents(entries)
    timingResults = timingResults.concat(filteredEvents)
    protocolResults = protocolResults.concat(protocolEvents)
  } while (entries.length > 0)
  return { timingResults, protocolResults }
}

function type_eq(requiredType: string) {
  return (e: ITimingResult) => e.type === requiredType
}
function type_neq(requiredType: string) {
  return (e: ITimingResult) => e.type !== requiredType
}

function asString(res: ITimingResult[]): string {
  return res.reduce((old, cur) => old + '\n' + JSON.stringify(cur), '')
}

function extractRawValue(results: any, id: string) {
  const audits = results.audits
  if (!audits) { return null }
  const AUDIT_WITH_ID = audits[id]
  if (typeof AUDIT_WITH_ID === 'undefined') { return null }
  if (typeof AUDIT_WITH_ID.rawValue === 'undefined') { return null }
  return AUDIT_WITH_ID.rawValue
}

function rmDir(dirPath: string) {
  try {
    const files = fs.readdirSync(dirPath)
    if (files.length > 0) {
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        } else {
          rmDir(filePath)
        }
      }
    }
    fs.rmdirSync(dirPath)
  } catch (e) { return }
}

async function runLighthouse(framework: IFrameworkData, benchmarkOptions: IBenchmarkOptions): Promise<ILighthouseData> {
  const opts = {
    chromeFlags:
      [
        '--headless',
        '--no-sandbox',
        '--no-first-run',
        '--enable-automation',
        '--disable-infobars',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-cache',
        '--disable-translate',
        '--disable-sync',
        '--disable-extensions',
        '--disable-default-apps',
        '--window-size=1200,800',
      ],
    onlyCategories: ['performance'],
    port: '',
  }

  try {
    if (fs.existsSync('prefs')) { rmDir('prefs') }
    fs.mkdirSync('prefs')
    fs.mkdirSync('prefs/Default')
    fs.copyFileSync('chromePreferences.json', 'prefs/Default/Preferences')

    const options: any = { chromeFlags: opts.chromeFlags, logLevel: 'info', userDataDir: 'prefs' }
    if (benchmarkOptions.chromeBinaryPath) { options.chromePath = benchmarkOptions.chromeBinaryPath }
    const chromeInstance = await chromeLauncher.launch(options)
    opts.port = chromeInstance.port
    const results = await lighthouse(`http://192.168.1.100:${benchmarkOptions.port}/`, opts, null)
    await chromeInstance.kill()

    const LighthouseData: ILighthouseData = {
      TimeToConsistentlyInteractive: extractRawValue(results.lhr, 'interactive'),
      ScriptBootUpTtime: Math.max(16, extractRawValue(results.lhr, 'bootup-time')),
      MainThreadWorkCost: extractRawValue(results.lhr, 'mainthread-work-breakdown'),
      TotalKiloByteWeight: extractRawValue(results.lhr, 'total-byte-weight') / 1024.0,
    }
    return LighthouseData
  } catch (error) {
    console.log('error running lighthouse', error)
    throw error
  }
}

async function computeResultsCPU(driver: WebDriver, benchmarkOptions: IBenchmarkOptions, framework: IFrameworkData, benchmark: Benchmark, warnings: string[]): Promise<number[]> {
  const entriesBrowser = await driver.manage().logs().get(logging.Type.BROWSER)
  if (config.LOG_DEBUG) { console.log('browser entries', entriesBrowser) }
  const perfLogEvents = (await fetchEventsFromPerformanceLog(driver))
  const filteredEvents = perfLogEvents.timingResults

  if (config.LOG_DEBUG) { console.log('filteredEvents ', asString(filteredEvents)) }

  let remaining = R.dropWhile(type_eq('initBenchmark'))(filteredEvents)
  const results = []

  while (remaining.length > 0) {
    const evts = R.splitWhen(type_eq('finishedBenchmark'))(remaining)
    if (R.find(type_neq('runBenchmark'))(evts[0]) && evts[1].length > 0) {
      const eventsDuringBenchmark = R.dropWhile(type_neq('runBenchmark'))(evts[0])

      if (config.LOG_DEBUG) { console.log('eventsDuringBenchmark ', eventsDuringBenchmark) }

      const clicks = R.filter(type_eq('click'))(eventsDuringBenchmark)
      if (clicks.length !== 1) {
        console.log('exactly one click event is expected', eventsDuringBenchmark)
        throw new Error('exactly one click event is expected')
      }

      const eventsAfterClick = (R.dropWhile(type_neq('click'))(eventsDuringBenchmark))

      if (config.LOG_DEBUG) { console.log('eventsAfterClick', eventsAfterClick) }

      const paints = R.filter(type_eq('paint'))(eventsAfterClick)

      if (paints.length === 0) {
        console.log('at least one paint event is expected after the click event', eventsAfterClick)
        throw new Error('at least one paint event is expected after the click event')
      }

      console.log('# of paint events ', paints.length)

      if (paints.length > 2) {
        warnings.push(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`)
        console.log(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`)
      }

      paints.forEach((paint) => {
        if (paint && paint.end) { console.log('duration to paint ', ((paint.end - clicks[0].ts) / 1000.0)) }
      })

      const lastPaint = R.reduce((max, elem) => max.end > elem.end ? max : elem, { end: 0 } as ITimingResult, paints)

      const upperBoundForSoundnessCheck = (R.last(eventsDuringBenchmark).end - eventsDuringBenchmark[0].ts) / 1000.0
      const duration = (lastPaint.end - clicks[0].ts) / 1000.0

      console.log('*** duration', duration, 'upper bound ', upperBoundForSoundnessCheck)
      if (duration < 0) {
        console.log('soundness check failed. reported duration is less 0', asString(eventsDuringBenchmark))
        throw new Error('soundness check failed. reported duration is less 0')
      }

      if (duration > upperBoundForSoundnessCheck) {
        console.log('soundness check failed. reported duration is bigger than whole benchmark duration', asString(eventsDuringBenchmark))
        throw new Error('soundness check failed. reported duration is bigger than whole benchmark duration')
      }
      results.push(duration)
    }
    remaining = R.drop(1, evts[1])
  }
  if (results.length !== benchmarkOptions.numIterationsForAllBenchmarks) {
    console.log(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`, results, asString(filteredEvents))
    throw new Error(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`)
  }
  return results
}

async function computeResultsMEM(driver: WebDriver, benchmarkOptions: IBenchmarkOptions, framework: IFrameworkData, benchmark: Benchmark, warnings: string[]): Promise<number[]> {
  const entriesBrowser = await driver.manage().logs().get(logging.Type.BROWSER)
  if (config.LOG_DEBUG) { console.log('browser entries', entriesBrowser) }
  const filteredEvents = (await fetchEventsFromPerformanceLog(driver)).timingResults

  if (config.LOG_DEBUG) { console.log('filteredEvents ', filteredEvents) }

  let remaining = R.dropWhile(type_eq('initBenchmark'))(filteredEvents)
  const results = []

  while (remaining.length > 0) {
    const evts = R.splitWhen(type_eq('finishedBenchmark'))(remaining)
    if (R.find(type_neq('runBenchmark'))(evts[0]) && evts[1].length > 0) {
      const eventsDuringBenchmark = R.dropWhile(type_neq('runBenchmark'))(evts[0])

      if (config.LOG_DEBUG) { console.log('eventsDuringBenchmark ', eventsDuringBenchmark) }

      const gcs = R.filter(type_eq('gc'))(eventsDuringBenchmark)

      const mem = R.last(gcs).mem

      console.log('*** memory', mem)

      results.push(mem)
    }
    remaining = R.drop(1, evts[1])
  }
  if (results.length !== benchmarkOptions.numIterationsForAllBenchmarks) {
    console.log(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`, results, asString(filteredEvents))
    throw new Error(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`)
  }

  return results
}

function buildDriver(benchmarkOptions: IBenchmarkDriverOptions) {
  const logPref = new logging.Preferences()
  logPref.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL)
  logPref.setLevel(logging.Type.BROWSER, logging.Level.ALL)

  let options = new chrome.Options()

  if (config.RUN_ON_ANDROID_ADB) {
    options = options.androidPackage('com.android.chrome')
  }

  const chromeArgs: string[] = [
    '--js-flags=--expose-gc',
    '--no-sandbox',
    '--no-first-run',
    '--enable-automation',
    '--disable-infobars',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-cache',
    '--disable-translate',
    '--disable-sync',
    '--disable-extensions',
    '--disable-default-apps',
    '--window-size=1200,800',
  ]

  if (benchmarkOptions.headless) {
    chromeArgs.push('--headless', '--disable-gpu')  // https://bugs.chromium.org/p/chromium/issues/detail?id=737678
  }

  options = chromeArgs.reduce((options, arg) => options.addArguments(arg), options)

  if (benchmarkOptions.chromeBinaryPath) {
    options = options.setChromeBinaryPath(benchmarkOptions.chromeBinaryPath)
  }

  options = options.setLoggingPrefs(logPref)

  options = options.setPerfLoggingPrefs({
    enableNetwork: true, enablePage: true,
    traceCategories: lighthouse.traceCategories.join(', '),
  } as any)

  // Do the following lines really cause https://github.com/krausest/js-framework-benchmark/issues/303 ?
  // let service = new chrome.ServiceBuilder(args.chromeDriver).build();
  // return chrome.Driver.createSession(options, service);
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

async function forceGC(framework: IFrameworkData, driver: WebDriver): Promise<any> {
  if (framework.name.startsWith('angular-v4')) {
    // workaround for window.gc for angular 4 - closure rewrites windows.gc");
    await driver.executeScript('window.Angular4PreservedGC();')
  } else {
    for (let i = 0; i < 5; i++) {
      await driver.executeScript('window.gc();')
    }
  }
}

async function snapMemorySize(driver: WebDriver): Promise<number> {
  const heapSnapshot: any = await driver.executeScript(':takeHeapSnapshot')
  const node_fields: any = heapSnapshot.snapshot.meta.node_fields
  const nodes: any = heapSnapshot.nodes

  let k = node_fields.indexOf('self_size')

  let SELF_SIZE = 0
  for (const l = nodes.length, d = node_fields.length; k < l; k += d) {
    SELF_SIZE += nodes[k]
  }

  const memory = SELF_SIZE / 1024.0 / 1024.0
  return memory
}

async function runBenchmark(driver: WebDriver, benchmark: Benchmark, framework: IFrameworkData): Promise<any> {
  await benchmark.run(driver, framework)
  if (config.LOG_PROGRESS) { console.log('after run ', benchmark.id, benchmark.type, framework.name) }
  if (benchmark.type === BenchmarkType.MEM) {
    await forceGC(framework, driver)
  }
}

async function afterBenchmark(driver: WebDriver, benchmark: Benchmark, framework: IFrameworkData): Promise<any> {
  if (benchmark.after) {
    await benchmark.after(driver, framework)
    if (config.LOG_PROGRESS) { console.log('after benchmark ', benchmark.id, benchmark.type, framework.name) }
  }
}

async function initBenchmark(driver: WebDriver, benchmark: Benchmark, framework: IFrameworkData): Promise<any> {
  await benchmark.init(driver, framework)
  if (config.LOG_PROGRESS) { console.log('after initialized ', benchmark.id, benchmark.type, framework.name) }
  if (benchmark.type === BenchmarkType.MEM) {
    await forceGC(framework, driver)
  }
}

interface IResult<T> {
  framework: IFrameworkData
  results: T[]
  benchmark: Benchmark
}

function writeResult<T>(res: IResult<T>, dir: string) {
  const benchmark = res.benchmark
  const framework = res.framework.name
  let type = ''

  switch (benchmark.type) {
    case BenchmarkType.CPU: type = 'cpu'; break
    case BenchmarkType.MEM: type = 'memory'; break
    case BenchmarkType.STARTUP: type = 'startup'; break
  }

  for (const resultKind of benchmark.resultKinds()) {
    const data = benchmark.extractResult(res.results, resultKind)
    const s = jStat(data)
    console.log(`result ${fileName(res.framework, resultKind)} min ${s.min()} max ${s.max()} mean ${s.mean()} median ${s.median()} stddev ${s.stdev(true)}`)
    const result: IJSONResult = {
      framework: res.framework.fullNameWithVersion,
      benchmark: resultKind.id,
      label: resultKind.label,
      description: resultKind.description,
      type,
      min: s.min(),
      max: s.max(),
      mean: s.mean(),
      median: s.median(),
      geometricMean: s.geomean(),
      standardDeviation: s.stdev(true),
      values: data,
    }
    fs.writeFileSync(`${dir}/${fileName(res.framework, resultKind)}`, JSON.stringify(result), { encoding: 'utf8' })
  }
}

async function registerError(driver: WebDriver, framework: IFrameworkData, benchmark: Benchmark, error: string): Promise<IBenchmarkError> {
  const fileNameErrorScreenshot = 'error-' + framework.name + '-' + benchmark.id + '.png'
  console.error('Benchmark failed', error)
  const image = await driver.takeScreenshot()
  console.error(`Writing screenshot ${fileNameErrorScreenshot}`)
  fs.writeFileSync(fileNameErrorScreenshot, image, { encoding: 'base64' })
  return { imageFile: fileNameErrorScreenshot, exception: error }
}

const wait = (delay = 1000) => new Promise((res) => setTimeout(res, delay))

async function runMemOrCPUBenchmark(framework: IFrameworkData, benchmark: Benchmark, benchmarkOptions: IBenchmarkOptions): Promise<IErrorsAndWarning> {
  const errors: IBenchmarkError[] = []
  const warnings: string[] = []

  console.log('benchmarking ', framework, benchmark.id)
  const driver = buildDriver(benchmarkOptions)
  try {
    for (let i = 0; i < benchmarkOptions.numIterationsForAllBenchmarks; i++) {
      try {
        setUseShadowRoot(framework.useShadowRoot)
        await driver.get(`http://192.168.1.100:${benchmarkOptions.port}/`)

        // await (driver as any).sendDevToolsCommand('Network.enable');
        // await (driver as any).sendDevToolsCommand('Network.emulateNetworkConditions', {
        //     offline: false,
        //     latency: 200, // ms
        //     downloadThroughput: 780 * 1024 / 8, // 780 kb/s
        //     uploadThroughput: 330 * 1024 / 8, // 330 kb/s
        // });
        await driver.executeScript('console.timeStamp(\'initBenchmark\')')
        await initBenchmark(driver, benchmark, framework)
        if (benchmark.throttleCPU) {
          console.log('CPU slowdown', benchmark.throttleCPU)
          await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', { rate: benchmark.throttleCPU })
        }
        await driver.executeScript('console.timeStamp(\'runBenchmark\')')
        await runBenchmark(driver, benchmark, framework)
        if (benchmark.throttleCPU) {
          console.log('resetting CPU slowdown')
          await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', { rate: 1 })
        }
        await driver.executeScript('console.timeStamp(\'finishedBenchmark\')')
        await afterBenchmark(driver, benchmark, framework)
        await driver.executeScript('console.timeStamp(\'afterBenchmark\')')
      } catch (e) {
        errors.push(await registerError(driver, framework, benchmark, e))
        throw e
      }
    }
    const results = benchmark.type === BenchmarkType.CPU ? await computeResultsCPU(driver, benchmarkOptions, framework, benchmark, warnings) : await computeResultsMEM(driver, benchmarkOptions, framework, benchmark, warnings)
    await writeResult({ framework, results, benchmark }, benchmarkOptions.outputDirectory)
    console.log('QUIT')
    await driver.close()
    await driver.quit()
  } catch (e) {
    console.log('ERROR:', e)
    await driver.close()
    await driver.quit()
    if (config.EXIT_ON_ERROR) { throw new Error('Benchmarking failed') }
  }
  return { errors, warnings }
}

async function runStartupBenchmark(framework: IFrameworkData, benchmark: Benchmark, benchmarkOptions: IBenchmarkOptions): Promise<IErrorsAndWarning> {
  console.log('benchmarking startup', framework, benchmark.id)

  const errors: IBenchmarkError[] = []
  const results: ILighthouseData[] = []

  for (let i = 0; i < benchmarkOptions.numIterationsForStartupBenchmark; i++) {
    try {
      results.push(await runLighthouse(framework, benchmarkOptions))
    } catch (error) {
      errors.push({ imageFile: '', exception: error })
      throw error
    }
  }
  await writeResult({ framework, results, benchmark }, benchmarkOptions.outputDirectory)
  return { errors, warnings: [] }
}

export async function executeBenchmark(frameworks: IFrameworkData[], frameworkName: string, benchmarkName: string, benchmarkOptions: IBenchmarkOptions): Promise<IErrorsAndWarning> {
  const runFrameworks = frameworks.filter((f) => frameworkName === f.name)
  const runBenchmarks = benchmarks.filter((b) => benchmarkName === b.id)

  if (runFrameworks.length !== 1) { throw new Error(`Framework name ${frameworkName} is not unique`) }
  if (runBenchmarks.length !== 1) { throw new Error(`Benchmark name ${benchmarkName} is not unique`) }

  const framework = runFrameworks[0]
  const benchmark = runBenchmarks[0]

  let errorsAndWarnings: IErrorsAndWarning
  if (benchmark.type === BenchmarkType.STARTUP) {
    errorsAndWarnings = await runStartupBenchmark(framework, benchmark, benchmarkOptions)
  } else {
    errorsAndWarnings = await runMemOrCPUBenchmark(framework, benchmark, benchmarkOptions)
  }

  return errorsAndWarnings
}

process.on('message', (msg) => {
  if (config.LOG_DEBUG) { console.log('child process got message', msg) }

  const { frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions }: { frameworks: IFrameworkData[], keyed: boolean, frameworkName: string, benchmarkName: string, benchmarkOptions: IBenchmarkOptions } = msg
  if (!benchmarkOptions.port) { benchmarkOptions.port = config.PORT.toFixed() }

  try {
    const errorsPromise = executeBenchmark(frameworks, frameworkName, benchmarkName, benchmarkOptions)
    errorsPromise.then((errorsAndWarnings) => {
      if (config.LOG_DEBUG) { console.log('benchmark finished - got errors promise', errorsAndWarnings) }
      process.send(errorsAndWarnings)
      process.exit(0)
    }).catch((err) => {
      console.log('error running benchmark', err)
      process.exit(1)
    })
  } catch (err) {
    console.log('error running benchmark', err)
    process.exit(1)
  }
})
