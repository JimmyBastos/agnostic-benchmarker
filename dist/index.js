"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const benchmarks_1 = require("./webdriver/benchmarks");
const yargs = require('yargs');
const child_process_1 = require("child_process");
const common_1 = require("./webdriver/common");
const forkedBenchmarkRunner_1 = require("./webdriver/forkedBenchmarkRunner");
const frameworks = common_1.initializeFrameworks();
function forkedRun(frameworkName, benchmarkName, benchmarkOptions) {
    if (common_1.config.FORK_CHROMEDRIVER) {
        return new Promise((resolve, reject) => {
            const forked = child_process_1.fork('dist/webdriver/forkedBenchmarkRunner.js');
            if (common_1.config.LOG_DEBUG) {
                console.log('forked child process');
            }
            forked.send({ frameworks, frameworkName, benchmarkName, benchmarkOptions });
            forked.on('message', (msg) => {
                if (common_1.config.LOG_DEBUG) {
                    console.log('main process got message from child', msg);
                }
                resolve(msg);
            });
        });
    }
    else {
        return forkedBenchmarkRunner_1.executeBenchmark(frameworks, frameworkName, benchmarkName, benchmarkOptions);
    }
}
function runBench(frameworkNames, benchmarkNames, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        const warnings = [];
        let runTheseFrameworks = frameworks.filter((fw) => frameworkNames.some((name) => fw.fullNameWithVersion.includes(name)));
        const runTheseBenchmarks = benchmarks_1.benchmarks.filter((bm) => benchmarkNames.some((name) => bm.id.toLowerCase().includes(name)));
        const restart = ''; // 'rx-domh-rxjs-v0.0.2-keyed';
        const index = runTheseFrameworks.findIndex((f) => f.fullNameWithVersion === restart);
        if (index > -1) {
            runTheseFrameworks = runTheseFrameworks.slice(index);
        }
        console.log('Frameworks that will be benchmarked', runTheseFrameworks);
        console.log('Benchmarks that will be run', runTheseBenchmarks.map((b) => b.id));
        const data = [];
        for (const framework of runTheseFrameworks) {
            for (const benchmark of runTheseBenchmarks) {
                data.push([framework, benchmark]);
            }
        }
        for (const [framework, benchmark] of data) {
            const benchmarkOptions = {
                outputDirectory: outputDir,
                port: common_1.config.PORT.toFixed(),
                headless: args.headless,
                chromeBinaryPath: args.chromeBinary,
                numIterationsForAllBenchmarks: common_1.config.REPEAT_RUN,
                numIterationsForStartupBenchmark: common_1.config.REPEAT_RUN_STARTUP,
            };
            try {
                const errorsAndWarnings = yield forkedRun(framework.name, benchmark.id, benchmarkOptions);
                errors.splice(errors.length, 0, ...errorsAndWarnings.errors);
                warnings.splice(warnings.length, 0, ...errorsAndWarnings.warnings);
            }
            catch (err) {
                console.log(`Error executing benchmark ${framework.name} and benchmark ${benchmark.id}`);
            }
        }
        if (warnings.length > 0) {
            console.log('================================');
            console.log('The following warnings were logged:');
            console.log('================================');
            warnings.forEach((e) => {
                console.log(e);
            });
        }
        if (errors.length > 0) {
            console.log('================================');
            console.log('The following benchmarks failed:');
            console.log('================================');
            errors.forEach((e) => {
                console.log('[' + e.imageFile + ']');
                console.log(e.exception);
                console.log();
            });
            throw new Error('Benchmarking failed with errors');
        }
    });
}
const args = yargs(process.argv)
    .usage('$0 [--framework Framework1 Framework2 ...] [--benchmark Benchmark1 Benchmark2 ...] [--count n] [--androidBench] [--exitOnError]')
    .help('help')
    .default('check', 'false')
    .default('androidBench', 'false')
    .default('fork', 'true')
    .default('exitOnError', 'false')
    .default('count', common_1.config.REPEAT_RUN)
    .default('port', common_1.config.PORT)
    .string('chromeBinary')
    .string('chromeDriver')
    .boolean('headless')
    .array('framework')
    .array('benchmark')
    .argv;
console.log(args);
const runBenchmarks = args.benchmark && args.benchmark.length > 0 ? args.benchmark : [''];
const runFrameworks = args.framework && args.framework.length > 0 ? args.framework : [''];
const count = Number(args.count);
common_1.config.PORT = Number(args.port);
common_1.config.REPEAT_RUN = count;
common_1.config.FORK_CHROMEDRIVER = args.fork === 'true';
common_1.config.RUN_ON_ANDROID_ADB = args.androidBench === 'true';
const dir = args.check === 'true' ? 'results_check' : 'results';
const exitOnError = args.exitOnError === 'true';
common_1.config.EXIT_ON_ERROR = exitOnError;
console.log('fork chromedriver process?', common_1.config.FORK_CHROMEDRIVER);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
if (args.help) {
    yargs.showHelp();
}
else {
    runBench(runFrameworks, runBenchmarks, dir).then((_) => {
        console.log('successful run');
    }).catch((error) => {
        console.log('run was not completely sucessful');
    });
}
