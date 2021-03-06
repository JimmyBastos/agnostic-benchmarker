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
const SHORT_TIMEOUT = 20 * 500;
const TABLE_SIZE = 50;
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
const benchAddOne = new class extends Benchmark {
    constructor() {
        super({
            id: '01_add_one',
            label: 'Adicionar item',
            description: 'Tempo gasto para inserir um registro na lista',
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
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[1]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button__delete');
            yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]/td[2]/span', SHORT_TIMEOUT);
        });
    }
}();
const benchUpdateOne = new class extends Benchmark {
    constructor() {
        super({
            id: '03_update_one',
            label: 'Atualizar item',
            description: 'Tempo gasto para atualizar um registro.',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[1]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield webdriverAccess_1.getTextByXPath(driver, '//tbody/tr[1]/td[2]/span');
            yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button__update');
            yield webdriverAccess_1.testTextNotEqual(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT);
        });
    }
}();
const benchPopulate = new class extends Benchmark {
    constructor() {
        super({
            id: '04_populate50',
            label: 'Inserir 50 items',
            description: 'Tempo gasto para inserir 50 registros na lista.',
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
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
}();
const benchSwapTwoRows = new class extends Benchmark {
    constructor() {
        super({
            id: '05_swap_rows',
            label: 'Permutar items',
            description: 'Duração para permutar dois registros em uma lista de 50 items',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const oneRowPath = `//tbody/tr[1]/td[1]`, anotherRowPath = `// tbody/tr[${TABLE_SIZE}]/td[1]`, oneRowText = yield webdriverAccess_1.getTextByXPath(driver, oneRowPath), anotherRowText = yield webdriverAccess_1.getTextByXPath(driver, anotherRowPath);
            yield webdriverAccess_1.clickElementById(driver, 'button__swap');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[50]/td[1]`, oneRowText, SHORT_TIMEOUT);
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, anotherRowText, SHORT_TIMEOUT);
        });
    }
}();
const benchSuffle = new class extends Benchmark {
    constructor() {
        super({
            id: '06_suffle',
            label: 'Inverter lista',
            description: 'Duração para inverter a ordem de uma lista de 50 items',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__shuffle');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT);
        });
    }
}();
const benchSort = new class extends Benchmark {
    constructor() {
        super({
            id: '07_sort',
            label: 'Ordenar lista',
            description: 'Duração para ordenar uma lista de 50 items',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            // populate table
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
            // reverse table
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__shuffle', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__shuffle');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__sort');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, '1', SHORT_TIMEOUT);
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[50]/td[1]`, '50', SHORT_TIMEOUT);
        });
    }
}();
const benchClearAll = new class extends Benchmark {
    constructor() {
        super({
            id: '08_clear50',
            label: 'Limpar lista',
            description: 'Duração para limpar uma lista com 50 registros',
            type: BenchmarkType.CPU,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__clear');
            yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]');
        });
    }
}();
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
}();
const benchAddOne5Memory = new class extends Benchmark {
    constructor() {
        super({
            id: '21_add_one_5-memory',
            label: 'Adicionar item',
            description: 'Uso de memória para adicionar item 5 vezes',
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
            for (let i = 0; i < 5; i++) {
                yield webdriverAccess_1.clickElementById(driver, 'button__add');
                yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${i + 1}]/td[2]/span`, SHORT_TIMEOUT);
            }
        });
    }
}();
const benchUpdateOne5Memory = new class extends Benchmark {
    constructor() {
        super({
            id: '22_update5-memory',
            label: 'Atualizar item',
            description: 'Uso de memória para atualizar um item 5 vezes',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__add', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__add');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span');
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 5; i++) {
                const text = yield webdriverAccess_1.getTextByXPath(driver, '//tbody/tr[1]/td[2]/span');
                yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[3]/a.button__update');
                yield webdriverAccess_1.testTextNotContained(driver, '//tbody/tr[1]/td[2]/span', text, SHORT_TIMEOUT);
            }
        });
    }
}();
const benchAddRemoveOne5Memory = new class extends Benchmark {
    constructor() {
        super({
            id: '23_add_remove_one5-memory',
            label: 'Adicionar e remover item',
            description: 'Uso de memória para adicionar e remover item 5 vezes',
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
            for (let i = 0; i < 5; i++) {
                yield webdriverAccess_1.clickElementById(driver, 'button__add');
                yield webdriverAccess_1.testElementLocatedByXpath(driver, '//tbody/tr[1]/td[2]/span');
                yield webdriverAccess_1.clickElementByXPath(driver, '//tbody/tr[1]/td[4]/a.button__delete');
                yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]/td[2]/span', SHORT_TIMEOUT);
            }
        });
    }
}();
const benchSwapTwoRows5Memory = new class extends Benchmark {
    constructor() {
        super({
            id: '24_swap_rows5-memory',
            label: 'Permutar items',
            description: 'Uso de memória para permutar dois registros em uma lista de 50 items 5 vezes',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 5; i++) {
                const oneRowPath = `//tbody/tr[1]/td[1]`, anotherRowPath = `// tbody/tr[${TABLE_SIZE}]/td[1]`, oneRowText = yield webdriverAccess_1.getTextByXPath(driver, oneRowPath), anotherRowText = yield webdriverAccess_1.getTextByXPath(driver, anotherRowPath);
                yield webdriverAccess_1.clickElementById(driver, 'button__swap');
                yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[50]/td[1]`, oneRowText, SHORT_TIMEOUT);
                yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, anotherRowText, SHORT_TIMEOUT);
            }
        });
    }
}();
const benchPopulateMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '25_populate-memory',
            label: 'Inserir 50 itens',
            description: 'Uso de memória para inserir 50 registros na lista.',
            type: BenchmarkType.MEM,
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
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
}();
const benchSuffleMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '26_shuffle-memory',
            label: 'Inverter lista',
            description: 'Uso de memória para inverter a ordem de uma lista de 50 items',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomItem = Math.floor((Math.random() * TABLE_SIZE) + 1);
            yield webdriverAccess_1.clickElementById(driver, 'button__shuffle');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT);
        });
    }
}();
const benchSortMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '27_sort-memory',
            label: 'Ordenar lista',
            description: 'Uso de memória para ordenar uma lista de 50 items',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomItem = Math.floor((Math.random() * TABLE_SIZE) + 1);
            // populate table
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
            // shuffle table
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__shuffle', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__shuffle');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, TABLE_SIZE.toString(), SHORT_TIMEOUT);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__sort');
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[1]/td[1]`, '1', SHORT_TIMEOUT);
            yield webdriverAccess_1.testTextEqual(driver, `//tbody/tr[50]/td[1]`, '50', SHORT_TIMEOUT);
        });
    }
}();
const benchClearMemory = new class extends Benchmark {
    constructor() {
        super({
            id: '28_populateclear-memory',
            label: 'Inserir 50 e limpar',
            description: 'Uso de memória para inserir e limpar 50 registros na lista.',
            type: BenchmarkType.MEM,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.testElementLocatedById(driver, 'button__populate', SHORT_TIMEOUT);
            yield webdriverAccess_1.clickElementById(driver, 'button__populate');
            yield webdriverAccess_1.testElementLocatedByXpath(driver, `//tbody/tr[${TABLE_SIZE}]/td[2]/span`);
        });
    }
    run(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webdriverAccess_1.clickElementById(driver, 'button__clear');
            yield webdriverAccess_1.testElementNotLocatedByXPath(driver, '//tbody/tr[1]');
        });
    }
}();
/*************************************************
 * STARTUP BECHMARK
 *
 * Time to application startup
 *************************************************/
const benchStartupConsistentlyInteractive = {
    id: '31_startup-ci',
    label: 'Iniciar interação',
    description: 'Tempo até interatividade',
    type: BenchmarkType.STARTUP,
    property: 'TimeToConsistentlyInteractive',
};
const benchStartupBootup = {
    id: '32_startup-bt',
    label: 'Carregamento de scripts',
    description: 'Tempo total para carregar, compilar e avaliar todos os scripts da página.',
    type: BenchmarkType.STARTUP,
    property: 'ScriptBootUpTtime',
};
const benchStartupMainThreadWorkCost = {
    id: '33_startup-mainthreadcost',
    label: 'Tread principal',
    description: 'Tempo total executando tarefas na thread principal.',
    type: BenchmarkType.STARTUP,
    property: 'MainThreadWorkCost',
};
const benchStartupTotalBytes = {
    id: '34_startup-totalbytes',
    label: 'Consumo de dados (kB)',
    description: 'Custo de recursos de rede de todos os recursos carregados na página (gziped).',
    type: BenchmarkType.STARTUP,
    property: 'TotalKiloByteWeight',
};
class BenchStartup extends Benchmark {
    constructor() {
        super({
            id: '30_startup',
            label: 'Inicialização',
            description: 'Tempo para analisar/compilar/avaliar os scripts (html, css, js)',
            type: BenchmarkType.STARTUP,
        });
    }
    init(driver) {
        return __awaiter(this, void 0, void 0, function* () { yield driver.get(`http://192.168.1.50:${common_1.config.PORT}/`); });
    }
    run(driver, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            yield driver.get(`http://192.168.1.50:${common_1.config.PORT}`);
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
}
const benchStartup = new BenchStartup();
exports.benchmarks = [
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
];
function fileName(framework, benchmark) {
    return `${framework.fullNameWithVersion}_${benchmark.id}.json`;
}
exports.fileName = fileName;
