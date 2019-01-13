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
const path = __importStar(require("path"));
const R = __importStar(require("ramda"));
const chrome = __importStar(require("selenium-webdriver/chrome"));
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const chromedriver = require('chromedriver');
const jStat = require('jStat').jStat;
const webdriverAccess_1 = require("./webdriverAccess");
const selenium_webdriver_1 = require("selenium-webdriver");
const benchmarks_1 = require("./benchmarks");
const common_1 = require("./common");
selenium_webdriver_1.promise.USE_PROMISE_MANAGER = false;
function extractRelevantEvents(entries) {
    const filteredEvents = [];
    const protocolEvents = [];
    entries.forEach((x) => {
        const e = JSON.parse(x.message).message;
        if (common_1.config.LOG_DETAILS) {
            console.log(JSON.stringify(e));
        }
        if (e.method === 'Tracing.dataCollected') {
            protocolEvents.push(e);
        }
        if (e.method && (e.method.startsWith('Page') || e.method.startsWith('Network'))) {
            protocolEvents.push(e);
        }
        else if (e.params.name === 'EventDispatch') {
            if (e.params.args.data.type === 'click') {
                if (common_1.config.LOG_TIMELINE) {
                    console.log('CLICK ', JSON.stringify(e));
                }
                filteredEvents.push({ type: 'click', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur });
            }
        }
        else if (e.params.name === 'TimeStamp' &&
            (e.params.args.data.message === 'afterBenchmark' || e.params.args.data.message === 'finishedBenchmark' || e.params.args.data.message === 'runBenchmark' || e.params.args.data.message === 'initBenchmark')) {
            filteredEvents.push({ type: e.params.args.data.message, ts: +e.params.ts, dur: 0, end: +e.params.ts });
            if (common_1.config.LOG_TIMELINE) {
                console.log('TIMESTAMP ', JSON.stringify(e));
            }
        }
        else if (e.params.name === 'navigationStart') {
            filteredEvents.push({ type: 'navigationStart', ts: +e.params.ts, dur: 0, end: +e.params.ts });
            if (common_1.config.LOG_TIMELINE) {
                console.log('NAVIGATION START ', JSON.stringify(e));
            }
        }
        else if (e.params.name === 'Paint') {
            if (common_1.config.LOG_TIMELINE) {
                console.log('PAINT ', JSON.stringify(e));
            }
            filteredEvents.push({ type: 'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts + e.params.dur, evt: JSON.stringify(e) });
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
        }
        else if (e.params.name === 'MajorGC' && e.params.args.usedHeapSizeAfter) {
            filteredEvents.push({ type: 'gc', ts: +e.params.ts, end: +e.params.ts, mem: Number(e.params.args.usedHeapSizeAfter) / 1024 / 1024 });
            if (common_1.config.LOG_TIMELINE) {
                console.log('GC ', JSON.stringify(e));
            }
        }
    });
    return { filteredEvents, protocolEvents };
}
function fetchEventsFromPerformanceLog(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        let timingResults = [];
        let protocolResults = [];
        let entries = [];
        do {
            entries = yield driver.manage().logs().get(selenium_webdriver_1.logging.Type.PERFORMANCE);
            const { filteredEvents, protocolEvents } = extractRelevantEvents(entries);
            timingResults = timingResults.concat(filteredEvents);
            protocolResults = protocolResults.concat(protocolEvents);
        } while (entries.length > 0);
        return { timingResults, protocolResults };
    });
}
function type_eq(requiredType) {
    return (e) => e.type === requiredType;
}
function type_neq(requiredType) {
    return (e) => e.type !== requiredType;
}
function asString(res) {
    return res.reduce((old, cur) => old + '\n' + JSON.stringify(cur), '');
}
function extractRawValue(results, id) {
    const audits = results.audits;
    if (!audits) {
        return null;
    }
    const AUDIT_WITH_ID = audits[id];
    if (typeof AUDIT_WITH_ID === 'undefined') {
        return null;
    }
    if (typeof AUDIT_WITH_ID.rawValue === 'undefined') {
        return null;
    }
    return AUDIT_WITH_ID.rawValue;
}
function rmDir(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        if (files.length > 0) {
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
                else {
                    rmDir(filePath);
                }
            }
        }
        fs.rmdirSync(dirPath);
    }
    catch (e) {
        return;
    }
}
function runLighthouse(framework, benchmarkOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = {
            chromeFlags: [
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
        };
        try {
            if (fs.existsSync('prefs')) {
                rmDir('prefs');
            }
            fs.mkdirSync('prefs');
            fs.mkdirSync('prefs/Default');
            fs.copyFileSync('chromePreferences.json', 'prefs/Default/Preferences');
            const options = { chromeFlags: opts.chromeFlags, logLevel: 'info', userDataDir: 'prefs' };
            if (benchmarkOptions.chromeBinaryPath) {
                options.chromePath = benchmarkOptions.chromeBinaryPath;
            }
            const chromeInstance = yield chromeLauncher.launch(options);
            opts.port = chromeInstance.port;
            const results = yield lighthouse(`http://192.168.1.100:${benchmarkOptions.port}/`, opts, null);
            yield chromeInstance.kill();
            const LighthouseData = {
                TimeToConsistentlyInteractive: extractRawValue(results.lhr, 'interactive'),
                ScriptBootUpTtime: Math.max(16, extractRawValue(results.lhr, 'bootup-time')),
                MainThreadWorkCost: extractRawValue(results.lhr, 'mainthread-work-breakdown'),
                TotalKiloByteWeight: extractRawValue(results.lhr, 'total-byte-weight') / 1024.0,
            };
            return LighthouseData;
        }
        catch (error) {
            console.log('error running lighthouse', error);
            throw error;
        }
    });
}
function computeResultsCPU(driver, benchmarkOptions, framework, benchmark, warnings) {
    return __awaiter(this, void 0, void 0, function* () {
        const entriesBrowser = yield driver.manage().logs().get(selenium_webdriver_1.logging.Type.BROWSER);
        if (common_1.config.LOG_DEBUG) {
            console.log('browser entries', entriesBrowser);
        }
        const perfLogEvents = (yield fetchEventsFromPerformanceLog(driver));
        const filteredEvents = perfLogEvents.timingResults;
        if (common_1.config.LOG_DEBUG) {
            console.log('filteredEvents ', asString(filteredEvents));
        }
        let remaining = R.dropWhile(type_eq('initBenchmark'))(filteredEvents);
        const results = [];
        while (remaining.length > 0) {
            const evts = R.splitWhen(type_eq('finishedBenchmark'))(remaining);
            if (R.find(type_neq('runBenchmark'))(evts[0]) && evts[1].length > 0) {
                const eventsDuringBenchmark = R.dropWhile(type_neq('runBenchmark'))(evts[0]);
                if (common_1.config.LOG_DEBUG) {
                    console.log('eventsDuringBenchmark ', eventsDuringBenchmark);
                }
                const clicks = R.filter(type_eq('click'))(eventsDuringBenchmark);
                if (clicks.length !== 1) {
                    console.log('exactly one click event is expected', eventsDuringBenchmark);
                    throw new Error('exactly one click event is expected');
                }
                const eventsAfterClick = (R.dropWhile(type_neq('click'))(eventsDuringBenchmark));
                if (common_1.config.LOG_DEBUG) {
                    console.log('eventsAfterClick', eventsAfterClick);
                }
                const paints = R.filter(type_eq('paint'))(eventsAfterClick);
                if (paints.length === 0) {
                    console.log('at least one paint event is expected after the click event', eventsAfterClick);
                    throw new Error('at least one paint event is expected after the click event');
                }
                console.log('# of paint events ', paints.length);
                if (paints.length > 2) {
                    warnings.push(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`);
                    console.log(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`);
                }
                paints.forEach((paint) => {
                    if (paint && paint.end) {
                        console.log('duration to paint ', ((paint.end - clicks[0].ts) / 1000.0));
                    }
                });
                const lastPaint = R.reduce((max, elem) => max.end > elem.end ? max : elem, { end: 0 }, paints);
                const upperBoundForSoundnessCheck = (R.last(eventsDuringBenchmark).end - eventsDuringBenchmark[0].ts) / 1000.0;
                const duration = (lastPaint.end - clicks[0].ts) / 1000.0;
                console.log('*** duration', duration, 'upper bound ', upperBoundForSoundnessCheck);
                if (duration < 0) {
                    console.log('soundness check failed. reported duration is less 0', asString(eventsDuringBenchmark));
                    throw new Error('soundness check failed. reported duration is less 0');
                }
                if (duration > upperBoundForSoundnessCheck) {
                    console.log('soundness check failed. reported duration is bigger than whole benchmark duration', asString(eventsDuringBenchmark));
                    throw new Error('soundness check failed. reported duration is bigger than whole benchmark duration');
                }
                results.push(duration);
            }
            remaining = R.drop(1, evts[1]);
        }
        if (results.length !== benchmarkOptions.numIterationsForAllBenchmarks) {
            console.log(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`, results, asString(filteredEvents));
            throw new Error(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`);
        }
        return results;
    });
}
function computeResultsMEM(driver, benchmarkOptions, framework, benchmark, warnings) {
    return __awaiter(this, void 0, void 0, function* () {
        const entriesBrowser = yield driver.manage().logs().get(selenium_webdriver_1.logging.Type.BROWSER);
        if (common_1.config.LOG_DEBUG) {
            console.log('browser entries', entriesBrowser);
        }
        const filteredEvents = (yield fetchEventsFromPerformanceLog(driver)).timingResults;
        if (common_1.config.LOG_DEBUG) {
            console.log('filteredEvents ', filteredEvents);
        }
        let remaining = R.dropWhile(type_eq('initBenchmark'))(filteredEvents);
        const results = [];
        while (remaining.length > 0) {
            const evts = R.splitWhen(type_eq('finishedBenchmark'))(remaining);
            if (R.find(type_neq('runBenchmark'))(evts[0]) && evts[1].length > 0) {
                const eventsDuringBenchmark = R.dropWhile(type_neq('runBenchmark'))(evts[0]);
                if (common_1.config.LOG_DEBUG) {
                    console.log('eventsDuringBenchmark ', eventsDuringBenchmark);
                }
                const gcs = R.filter(type_eq('gc'))(eventsDuringBenchmark);
                const mem = R.last(gcs).mem;
                console.log('*** memory', mem);
                results.push(mem);
            }
            remaining = R.drop(1, evts[1]);
        }
        if (results.length !== benchmarkOptions.numIterationsForAllBenchmarks) {
            console.log(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`, results, asString(filteredEvents));
            throw new Error(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForAllBenchmarks}`);
        }
        return results;
    });
}
function buildDriver(benchmarkOptions) {
    const logPref = new selenium_webdriver_1.logging.Preferences();
    logPref.setLevel(selenium_webdriver_1.logging.Type.PERFORMANCE, selenium_webdriver_1.logging.Level.ALL);
    logPref.setLevel(selenium_webdriver_1.logging.Type.BROWSER, selenium_webdriver_1.logging.Level.ALL);
    let options = new chrome.Options();
    if (common_1.config.RUN_ON_ANDROID_ADB) {
        options = options.androidPackage('com.android.chrome');
    }
    let chromeArgs = [
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
    ];
    if (benchmarkOptions.headless) {
        chromeArgs.push('--headless', '--disable-gpu'); // https://bugs.chromium.org/p/chromium/issues/detail?id=737678
    }
    options = chromeArgs.reduce((options, arg) => options.addArguments(arg), options);
    if (benchmarkOptions.chromeBinaryPath) {
        options = options.setChromeBinaryPath(benchmarkOptions.chromeBinaryPath);
    }
    options = options.setLoggingPrefs(logPref);
    options = options.setPerfLoggingPrefs({
        enableNetwork: true, enablePage: true,
        traceCategories: lighthouse.traceCategories.join(', '),
    });
    // Do the following lines really cause https://github.com/krausest/js-framework-benchmark/issues/303 ?
    // let service = new chrome.ServiceBuilder(args.chromeDriver).build();
    // return chrome.Driver.createSession(options, service);
    return new selenium_webdriver_1.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}
function forceGC(framework, driver) {
    return __awaiter(this, void 0, void 0, function* () {
        if (framework.name.startsWith('angular-v4')) {
            // workaround for window.gc for angular 4 - closure rewrites windows.gc");
            yield driver.executeScript('window.Angular4PreservedGC();');
        }
        else {
            for (let i = 0; i < 5; i++) {
                yield driver.executeScript('window.gc();');
            }
        }
    });
}
function snapMemorySize(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        const heapSnapshot = yield driver.executeScript(':takeHeapSnapshot');
        const node_fields = heapSnapshot.snapshot.meta.node_fields;
        const nodes = heapSnapshot.nodes;
        let k = node_fields.indexOf('self_size');
        let SELF_SIZE = 0;
        for (const l = nodes.length, d = node_fields.length; k < l; k += d) {
            SELF_SIZE += nodes[k];
        }
        const memory = SELF_SIZE / 1024.0 / 1024.0;
        return memory;
    });
}
function runBenchmark(driver, benchmark, framework) {
    return __awaiter(this, void 0, void 0, function* () {
        yield benchmark.run(driver, framework);
        if (common_1.config.LOG_PROGRESS) {
            console.log('after run ', benchmark.id, benchmark.type, framework.name);
        }
        if (benchmark.type === benchmarks_1.BenchmarkType.MEM) {
            yield forceGC(framework, driver);
        }
    });
}
function afterBenchmark(driver, benchmark, framework) {
    return __awaiter(this, void 0, void 0, function* () {
        if (benchmark.after) {
            yield benchmark.after(driver, framework);
            if (common_1.config.LOG_PROGRESS) {
                console.log('after benchmark ', benchmark.id, benchmark.type, framework.name);
            }
        }
    });
}
function initBenchmark(driver, benchmark, framework) {
    return __awaiter(this, void 0, void 0, function* () {
        yield benchmark.init(driver, framework);
        if (common_1.config.LOG_PROGRESS) {
            console.log('after initialized ', benchmark.id, benchmark.type, framework.name);
        }
        if (benchmark.type === benchmarks_1.BenchmarkType.MEM) {
            yield forceGC(framework, driver);
        }
    });
}
function writeResult(res, dir) {
    const benchmark = res.benchmark;
    const framework = res.framework.name;
    let type = '';
    switch (benchmark.type) {
        case benchmarks_1.BenchmarkType.CPU:
            type = 'cpu';
            break;
        case benchmarks_1.BenchmarkType.MEM:
            type = 'memory';
            break;
        case benchmarks_1.BenchmarkType.STARTUP:
            type = 'startup';
            break;
    }
    for (const resultKind of benchmark.resultKinds()) {
        const data = benchmark.extractResult(res.results, resultKind);
        const s = jStat(data);
        console.log(`result ${benchmarks_1.fileName(res.framework, resultKind)} min ${s.min()} max ${s.max()} mean ${s.mean()} median ${s.median()} stddev ${s.stdev(true)}`);
        const result = {
            framework: res.framework.fullNameWithVersion,
            benchmark: resultKind.id,
            label: benchmark.label,
            description: benchmark.description,
            type,
            min: s.min(),
            max: s.max(),
            mean: s.mean(),
            median: s.median(),
            geometricMean: s.geomean(),
            standardDeviation: s.stdev(true),
            values: data,
        };
        fs.writeFileSync(`${dir}/${benchmarks_1.fileName(res.framework, resultKind)}`, JSON.stringify(result), { encoding: 'utf8' });
    }
}
function registerError(driver, framework, benchmark, error) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileNameErrorScreenshot = 'error-' + framework.name + '-' + benchmark.id + '.png';
        console.error('Benchmark failed', error);
        const image = yield driver.takeScreenshot();
        console.error(`Writing screenshot ${fileNameErrorScreenshot}`);
        fs.writeFileSync(fileNameErrorScreenshot, image, { encoding: 'base64' });
        return { imageFile: fileNameErrorScreenshot, exception: error };
    });
}
const wait = (delay = 1000) => new Promise((res) => setTimeout(res, delay));
function runMemOrCPUBenchmark(framework, benchmark, benchmarkOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        const warnings = [];
        console.log('benchmarking ', framework, benchmark.id);
        const driver = buildDriver(benchmarkOptions);
        try {
            for (let i = 0; i < benchmarkOptions.numIterationsForAllBenchmarks; i++) {
                try {
                    webdriverAccess_1.setUseShadowRoot(framework.useShadowRoot);
                    yield driver.get(`http://192.168.1.100:${benchmarkOptions.port}/`);
                    // await (driver as any).sendDevToolsCommand('Network.enable');
                    // await (driver as any).sendDevToolsCommand('Network.emulateNetworkConditions', {
                    //     offline: false,
                    //     latency: 200, // ms
                    //     downloadThroughput: 780 * 1024 / 8, // 780 kb/s
                    //     uploadThroughput: 330 * 1024 / 8, // 330 kb/s
                    // });
                    yield driver.executeScript('console.timeStamp(\'initBenchmark\')');
                    yield initBenchmark(driver, benchmark, framework);
                    if (benchmark.throttleCPU) {
                        console.log('CPU slowdown', benchmark.throttleCPU);
                        yield driver.sendDevToolsCommand('Emulation.setCPUThrottlingRate', { rate: benchmark.throttleCPU });
                    }
                    yield driver.executeScript('console.timeStamp(\'runBenchmark\')');
                    yield runBenchmark(driver, benchmark, framework);
                    if (benchmark.throttleCPU) {
                        console.log('resetting CPU slowdown');
                        yield driver.sendDevToolsCommand('Emulation.setCPUThrottlingRate', { rate: 1 });
                    }
                    yield driver.executeScript('console.timeStamp(\'finishedBenchmark\')');
                    yield afterBenchmark(driver, benchmark, framework);
                    yield driver.executeScript('console.timeStamp(\'afterBenchmark\')');
                }
                catch (e) {
                    errors.push(yield registerError(driver, framework, benchmark, e));
                    throw e;
                }
            }
            const results = benchmark.type === benchmarks_1.BenchmarkType.CPU ? yield computeResultsCPU(driver, benchmarkOptions, framework, benchmark, warnings) : yield computeResultsMEM(driver, benchmarkOptions, framework, benchmark, warnings);
            yield writeResult({ framework, results, benchmark }, benchmarkOptions.outputDirectory);
            console.log('QUIT');
            yield driver.close();
            yield driver.quit();
        }
        catch (e) {
            console.log('ERROR:', e);
            yield driver.close();
            yield driver.quit();
            if (common_1.config.EXIT_ON_ERROR) {
                throw new Error('Benchmarking failed');
            }
        }
        return { errors, warnings };
    });
}
function runStartupBenchmark(framework, benchmark, benchmarkOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('benchmarking startup', framework, benchmark.id);
        const errors = [];
        const results = [];
        for (let i = 0; i < benchmarkOptions.numIterationsForStartupBenchmark; i++) {
            try {
                results.push(yield runLighthouse(framework, benchmarkOptions));
            }
            catch (error) {
                errors.push({ imageFile: '', exception: error });
                throw error;
            }
        }
        yield writeResult({ framework, results, benchmark }, benchmarkOptions.outputDirectory);
        return { errors, warnings: [] };
    });
}
function executeBenchmark(frameworks, frameworkName, benchmarkName, benchmarkOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const runFrameworks = frameworks.filter((f) => frameworkName === f.name);
        const runBenchmarks = benchmarks_1.benchmarks.filter((b) => benchmarkName === b.id);
        if (runFrameworks.length !== 1) {
            throw new Error(`Framework name ${frameworkName} is not unique`);
        }
        if (runBenchmarks.length !== 1) {
            throw new Error(`Benchmark name ${benchmarkName} is not unique`);
        }
        const framework = runFrameworks[0];
        const benchmark = runBenchmarks[0];
        let errorsAndWarnings;
        if (benchmark.type === benchmarks_1.BenchmarkType.STARTUP) {
            errorsAndWarnings = yield runStartupBenchmark(framework, benchmark, benchmarkOptions);
        }
        else {
            errorsAndWarnings = yield runMemOrCPUBenchmark(framework, benchmark, benchmarkOptions);
        }
        return errorsAndWarnings;
    });
}
exports.executeBenchmark = executeBenchmark;
process.on('message', (msg) => {
    if (common_1.config.LOG_DEBUG) {
        console.log('child process got message', msg);
    }
    const { frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions } = msg;
    if (!benchmarkOptions.port) {
        benchmarkOptions.port = common_1.config.PORT.toFixed();
    }
    try {
        const errorsPromise = executeBenchmark(frameworks, frameworkName, benchmarkName, benchmarkOptions);
        errorsPromise.then((errorsAndWarnings) => {
            if (common_1.config.LOG_DEBUG) {
                console.log('benchmark finished - got errors promise', errorsAndWarnings);
            }
            process.send(errorsAndWarnings);
            process.exit(0);
        }).catch((err) => {
            console.log('error running benchmark', err);
            process.exit(1);
        });
    }
    catch (err) {
        console.log('error running benchmark', err);
        process.exit(1);
    }
});
