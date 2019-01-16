import * as fs from 'fs'
import { Benchmark, benchmarks, BenchmarkType, fileName, ILighthouseData } from './benchmarks'
const yargs = require('yargs')
import { fork } from 'child_process'
import * as R from 'ramda'
import { config, IBenchmarkError, IBenchmarkOptions, IErrorsAndWarning, IFrameworkData, IJSONResult, initializeFrameworks } from './common'

import { executeBenchmark } from './forkedBenchmarkRunner'

const frameworks = initializeFrameworks()

function forkedRun(frameworkName: string, benchmarkName: string, benchmarkOptions: IBenchmarkOptions): Promise<IErrorsAndWarning> {
  if (config.FORK_CHROMEDRIVER) {
    return new Promise((resolve, reject) => {
      const forked = fork('dist/forkedBenchmarkRunner.js')
      if (config.LOG_DEBUG) { console.log('forked child process') }
      forked.send({ frameworks, frameworkName, benchmarkName, benchmarkOptions })
      forked.on('message', (msg) => {
        if (config.LOG_DEBUG) { console.log('main process got message from child', msg) }
        resolve(msg)
      })
    })
  } else {
    return executeBenchmark(frameworks, frameworkName, benchmarkName, benchmarkOptions)
  }
}

async function runBench(frameworkNames: string[], benchmarkNames: string[], outputDir: string) {
  const errors: IBenchmarkError[] = []
  const warnings: string[] = []

  let runTheseFrameworks = frameworks.filter((fw) => frameworkNames.some((name) => fw.fullNameWithVersion.includes(name)))
  const runTheseBenchmarks = benchmarks.filter((bm) => benchmarkNames.some((name) => bm.id.toLowerCase().includes(name)))

  const restart: string = '' // 'rx-domh-rxjs-v0.0.2-keyed';

  const index = runTheseFrameworks.findIndex((f) => f.fullNameWithVersion === restart)

  if (index > -1) { runTheseFrameworks = runTheseFrameworks.slice(index) }

  console.log('Frameworks that will be benchmarked', runTheseFrameworks)
  console.log('Benchmarks that will be run', runTheseBenchmarks.map((b) => b.id))

  const data: [[IFrameworkData, Benchmark]] = [] as any

  for (const framework of runTheseFrameworks) {
    for (const benchmark of runTheseBenchmarks) {
      data.push([framework, benchmark])
    }
  }

  for (const [framework, benchmark] of data) {

    const benchmarkOptions: IBenchmarkOptions = {
      outputDirectory: outputDir,
      port: config.PORT.toFixed(),
      headless: args.headless,
      chromeBinaryPath: args.chromeBinary,
      numIterationsForAllBenchmarks: config.REPEAT_RUN,
      numIterationsForStartupBenchmark: config.REPEAT_RUN_STARTUP,
    }

    try {
      const errorsAndWarnings: IErrorsAndWarning = await forkedRun(framework.name, benchmark.id, benchmarkOptions)
      errors.splice(errors.length, 0, ...errorsAndWarnings.errors)
      warnings.splice(warnings.length, 0, ...errorsAndWarnings.warnings)
    } catch (err) {
      console.log(`Error executing benchmark ${framework.name} and benchmark ${benchmark.id}`)
    }
  }

  if (warnings.length > 0) {
    console.log('================================')
    console.log('The following warnings were logged:')
    console.log('================================')

    warnings.forEach((e) => {
      console.log(e)
    })
  }

  if (errors.length > 0) {
    console.log('================================')
    console.log('The following benchmarks failed:')
    console.log('================================')

    errors.forEach((e) => {
      console.log('[' + e.imageFile + ']')
      console.log(e.exception)
      console.log()
    })
    throw new Error('Benchmarking failed with errors')
  }
}

const args = yargs(process.argv)
  .usage('$0 [--framework Framework1 Framework2 ...] [--benchmark Benchmark1 Benchmark2 ...] [--count n] [--androidBench] [--exitOnError]')
  .help('help')
  .default('check', 'false')
  .default('androidBench', 'false')
  .default('fork', 'true')
  .default('exitOnError', 'false')
  .default('count', config.REPEAT_RUN)
  .default('port', config.PORT)
  .string('chromeBinary')
  .string('chromeDriver')
  .boolean('headless')
  .array('framework')
  .array('benchmark')
  .argv

console.log(args)

const runBenchmarks = args.benchmark && args.benchmark.length > 0 ? args.benchmark : ['']
const runFrameworks = args.framework && args.framework.length > 0 ? args.framework : ['']
const count = Number(args.count)
config.PORT = Number(args.port)
config.REPEAT_RUN = count
config.FORK_CHROMEDRIVER = args.fork === 'true'
config.RUN_ON_ANDROID_ADB = args.androidBench === 'true'

const dir = args.check === 'true' ? 'results-check' : '../result-data'
const exitOnError = args.exitOnError === 'true'

config.EXIT_ON_ERROR = exitOnError

console.log('fork chromedriver process?', config.FORK_CHROMEDRIVER)

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

if (args.help) {
  yargs.showHelp()
} else {
  runBench(runFrameworks, runBenchmarks, dir).then((_) => {
    console.log('successful run')
  }).catch((error) => {
    console.log('run was not completely sucessful')
  })
}
