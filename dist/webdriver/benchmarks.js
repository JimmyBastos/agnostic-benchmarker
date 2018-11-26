"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const webdriverAccess_1 = require("./webdriverAccess");
var BenchmarkType;
(function (BenchmarkType) {
    BenchmarkType[BenchmarkType["CPU"] = 0] = "CPU";
    BenchmarkType[BenchmarkType["MEM"] = 1] = "MEM";
    BenchmarkType[BenchmarkType["STARTUP"] = 2] = "STARTUP";
})(BenchmarkType = exports.BenchmarkType || (exports.BenchmarkType = {}));
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
const SHORT_TIMEOUT = 20 * 1000;
class Benchmark {
    constructor(benchmarkInfo) {
        this.benchmarkInfo = benchmarkInfo;
        this.id = benchmarkInfo.id;
        this.type = benchmarkInfo.type;
        this.label = benchmarkInfo.label;
        this.description = benchmarkInfo.description;
        this.throttleCPU = benchmarkInfo.throttleCPU;
    }
    after(driver, framework) { return; }
    // Good fit for a single result creating Benchmark
    resultKinds() { return [this.benchmarkInfo]; }
    extractResult(results, resultKind) { return results; }
}
exports.Benchmark = Benchmark;
const benchAdd = new class extends Benchmark {
    constructor() {
        super({
            id: '01_add_one',
            label: 'Add one row',
            description: 'Duration for creating 1 row after the page loaded.',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span');
        });
    }
}();
const benchPopulate = new class extends Benchmark {
    constructor() {
        super({
            id: '02_run1k',
            label: 'populate 1.000 rows',
            description: 'Duration for creating 1.000 rows after the page loaded.',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span');
        });
    }
}();
const benchPopulateHot = new class extends Benchmark {
    constructor() {
        super({
            id: '03_run10k',
            label: 'populate 10.000 rows',
            description: 'Duration for creating 10.000 rows after the page loaded.',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate_hot', SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__populate_hot');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[10000]/td[2]/span');
        });
    }
}();
const benchSuffle = new class extends Benchmark {
    constructor() {
        super({
            id: '04_shuffle1k',
            label: 'shuffle all rows',
            description: 'Duration for shuffle all rows of the table.',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            // for (let i = 0; i < config.WARMUP_COUNT; i++) {
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span');
            // }
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__shuffle');
            // TODO: Test the shuffle result
            yield webdriverAccess_1.testTextNotContained(driver, '//tbody/tr[1000]/td[1]', '1000', SHORT_TIMEOUT);
        });
    }
}();
const benchUpdateCell = new class extends Benchmark {
    constructor() {
        super({
            id: '06_update_cell',
            label: 'clear rows',
            description: 'Duration for remove 1 row to a 1000 rows table',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span');
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield webdriverAccess_1.getTextByXPath(driver, '//tbody/tr[1]/td[2]/span');
            yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button_update');
            yield webdriverAccess_1.testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT);
        });
    }
}();
const benchRemoveCell = new class extends Benchmark {
    constructor() {
        super({
            id: '07_remove_cell',
            label: 'clear rows',
            description: 'Duration for remove 1 row to a 1000 rows table',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span');
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield webdriverAccess_1.getTextByXPath(driver, '//tbody/tr[1]/td[2]/span');
            yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button_delete');
            yield webdriverAccess_1.testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT);
        });
    }
}();
const benchClear = new class extends Benchmark {
    constructor() {
        super({
            id: '05_clear1k_x8',
            label: 'clear rows',
            description: 'Duration to clear the table filled with 1.000 rows. Simulated 8x CPU slowdown',
            type: BenchmarkType.CPU,
            throttleCPU: 8,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1000]/td[2]/span');
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__clear');
            yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]');
        });
    }
}();
const benchReadyMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '06_ready-memory',
            label: 'ready memory',
            description: 'Memory usage after page load.',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]');
        });
    }
    after(driver, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span');
        });
    }
}();
const benchRunMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '07_run-memory',
            label: 'run memory',
            description: 'Memory usage after adding 1000 rows.',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[2]/td[2]/span');
        });
    }
}();
const benchStartup = new class extends Benchmark {
    constructor() {
        super({
            id: '30_startup',
            label: 'startup time',
            description: 'Time for loading, parsing and starting up',
            type: BenchmarkType.STARTUP,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () { yield driver.get(`http://localhost:${common_1.config.PORT}/`); });
    }
    run(driver, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            yield driver.get(`http://localhost:${common_1.config.PORT}`);
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
            return driver.sleep(common_1.config.STARTUP_SLEEP_DURATION);
        });
    }
    extractResult(results, resultKind) {
        return results.reduce((a, v) => { a.push(v[resultKind.property]); return a; }, new Array());
    }
    resultKinds() {
        return [
            benchStartupConsistentlyInteractive,
            benchStartupBootup,
            benchStartupMainThreadWorkCost,
            benchStartupTotalBytes,
        ];
    }
}();
const benchStartupConsistentlyInteractive = {
    id: '31_startup-ci',
    label: 'consistently interactive',
    description: 'a pessimistic TTI - when the CPU and network are both definitely very idle. (no more CPU tasks over 50ms)',
    type: BenchmarkType.STARTUP,
    property: 'TimeToConsistentlyInteractive',
};
const benchStartupBootup = {
    id: '32_startup-bt',
    label: 'script bootup time',
    description: 'the total ms required to parse/compile/evaluate all the page\'s scripts',
    type: BenchmarkType.STARTUP,
    property: 'ScriptBootUpTtime',
};
const benchStartupMainThreadWorkCost = {
    id: '33_startup-mainthreadcost',
    label: 'main thread work cost',
    description: 'total amount of time spent doing work on the main thread. includes style/layout/etc.',
    type: BenchmarkType.STARTUP,
    property: 'MainThreadWorkCost',
};
const benchStartupTotalBytes = {
    id: '34_startup-totalbytes',
    label: 'total kilobyte weight',
    description: 'network transfer cost (post-compression) of all the resources loaded into the page.',
    type: BenchmarkType.STARTUP,
    property: 'TotalKiloByteWeight',
};
// const benchStartup = new BenchStartup()
exports.benchmarks = [
    // benchStartup,
    // benchAdd,
    // benchPopulate,
    // benchPopulateHot,
    // benchSuffle,
    // benchClear,
    benchRemoveCell,
];
function fileName(framework, benchmark) {
    return `${framework.fullNameWithVersion}_${benchmark.id}.json`;
}
exports.fileName = fileName;
//# sourceMappingURL=benchmarks.js.map