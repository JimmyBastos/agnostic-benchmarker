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
const selenium_webdriver_1 = require("selenium-webdriver");
let useShadowRoot = false;
function setUseShadowRoot(val) {
    useShadowRoot = val;
}
exports.setUseShadowRoot = setUseShadowRoot;
function convertPath(path) {
    const parts = path.split(/\//).filter((v) => !!v);
    const res = [];
    for (const part of parts) {
        const components = part.split(/\[|]/).filter((v) => !!v);
        const tagName = components[0];
        let index = 0;
        if (components.length === 2) {
            index = Number(components[1]);
            if (!index) {
                console.log('Index can\'t be parsed', components[1]);
                throw new Error('Index can\'t be parsed ' + components[1]);
            }
        }
        else {
            index = 1;
        }
        res.push({ tagName, index });
    }
    return res;
}
// Fake findByXPath for simple XPath expressions to allow usage with shadow dom
function findByXPath(node, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = convertPath(path);
        let n = node;
        try {
            for (const p of paths) {
                const elems = yield n.findElements(selenium_webdriver_1.By.css(p.tagName + ':nth-child(' + (p.index) + ')'));
                if (elems && elems.length) {
                    n = elems[0];
                }
            }
        }
        catch (e) {
            // can happen for StaleElementReferenceError
        }
        return n;
    });
}
function elemNull(v) {
    console.log('*** ELEMENT WAS NULL');
    return false;
}
function waitForCondition(driver) {
    return (text, fn, timeout) => __awaiter(this, void 0, void 0, function* () {
        return yield driver.wait(new selenium_webdriver_1.Condition(text, fn), timeout);
    });
}
// driver.findElement(By.xpath("//tbody/tr[1]/td[1]")).getText().then(...) can throw a stale element error:
// thus we're using a safer way here:
function testTextContains(driver, xpath, text, timeout = common_1.config.TIMEOUT) {
    return __awaiter(this, void 0, void 0, function* () {
        return waitForCondition(driver)(`testTextContains ${xpath} ${text}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
            try {
                let elem = yield shadowRoot(webDriver);
                elem = yield findByXPath(elem, xpath);
                if (elem == null) {
                    return false;
                }
                const v = yield elem.getText();
                return !!v && (v.indexOf(text) > -1);
            }
            catch (err) {
                common_1.skipError('testTextContains', err, xpath, `text = ${text}`);
                return false;
            }
        }), timeout);
    });
}
exports.testTextContains = testTextContains;
function testTextNotContained(driver, xpath, text, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testTextNotContained ${xpath} ${text}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            if (elem == null) {
                return false;
            }
            const value = yield elem.getText();
            return !!value && !value.includes(text);
        }
        catch (err) {
            common_1.skipError('testTextNotContained', err, xpath, `text = ${text}`);
            return false;
        }
    }), timeout);
}
exports.testTextNotContained = testTextNotContained;
function testTextEqual(driver, xpath, text, timeout = common_1.config.TIMEOUT) {
    return __awaiter(this, void 0, void 0, function* () {
        return waitForCondition(driver)(`testTextContains ${xpath} ${text}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
            try {
                let elem = yield shadowRoot(webDriver);
                elem = yield findByXPath(elem, xpath);
                if (elem == null) {
                    return false;
                }
                const value = yield elem.getText();
                return !!value && (value === text);
            }
            catch (err) {
                common_1.skipError('testTextEqual', err, xpath, `text = ${text}`);
                return false;
            }
        }), timeout);
    });
}
exports.testTextEqual = testTextEqual;
function testTextNotEqual(driver, xpath, text, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testTextNotEqual ${xpath} ${text}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            if (elem == null) {
                return false;
            }
            const value = yield elem.getText();
            return !!value && (value !== text);
        }
        catch (err) {
            common_1.skipError('testTextNotEqual', err, xpath, `text = ${text}`);
            return false;
        }
    }), timeout);
}
exports.testTextNotEqual = testTextNotEqual;
function testClassContains(driver, xpath, text, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testClassContains ${xpath} ${text}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            if (elem == null) {
                return false;
            }
            const v = yield elem.getAttribute('class');
            return !!v && (v.indexOf(text) > -1);
        }
        catch (err) {
            common_1.skipError('testClassContains', err, xpath, `text = ${text}`);
            return false;
        }
    }), timeout);
}
exports.testClassContains = testClassContains;
function testElementLocatedByXpath(driver, xpath, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testElementLocatedByXpath ${xpath}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            return elem ? true : false;
        }
        catch (err) {
            common_1.skipError('testElementLocatedByXpath', err, xpath);
            return false;
        }
    }), timeout);
}
exports.testElementLocatedByXpath = testElementLocatedByXpath;
function testElementNotLocatedByXPath(driver, xpath, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testElementNotLocatedByXPath ${xpath}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            return !!elem;
        }
        catch (err) {
            err = err.toString().split('\n')[0];
            common_1.skipError('testElementNotLocatedByXPath', err, xpath);
            return false;
        }
    }), timeout);
}
exports.testElementNotLocatedByXPath = testElementNotLocatedByXPath;
function testElementLocatedById(driver, id, timeout = common_1.config.TIMEOUT) {
    return waitForCondition(driver)(`testElementLocatedById ${id}`, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        try {
            let elem = yield shadowRoot(webDriver);
            elem = yield elem.findElement(selenium_webdriver_1.By.id(id));
            return true;
        }
        catch (err) {
            common_1.skipError('testElementLocatedById', err, id);
            return false;
        }
    }), timeout);
}
exports.testElementLocatedById = testElementLocatedById;
function retry(retryCount, driver, fun) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < retryCount; i++) {
            try {
                return fun(driver, i);
            }
            catch (err) {
                console.log('retry failed');
            }
        }
        return null;
    });
}
// Stale element prevention. For aurelia even after a testElementLocatedById clickElementById for the same id can fail
// No idea how that can be explained
function clickElementById(driver, id) {
    return retry(5, driver, (webDriver) => __awaiter(this, void 0, void 0, function* () {
        let elem = yield shadowRoot(webDriver);
        elem = yield elem.findElement(selenium_webdriver_1.By.id(id));
        yield elem.click();
    }));
}
exports.clickElementById = clickElementById;
function clickElementByXPath(driver, xpath) {
    return retry(5, driver, (webDriver, count) => __awaiter(this, void 0, void 0, function* () {
        if (count > 1 && common_1.config.LOG_DETAILS) {
            console.log('clickElementByXPath ', xpath, ' attempt #', count);
        }
        let elem = yield shadowRoot(webDriver);
        elem = yield findByXPath(elem, xpath);
        yield elem.click();
    }));
    // Stale element possible:
    // return to(driver.findElement(By.xpath(xpath)).click());
}
exports.clickElementByXPath = clickElementByXPath;
function getTextByXPath(driver, xpath) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield retry(5, driver, (webDriver, count) => __awaiter(this, void 0, void 0, function* () {
            if (count > 1 && common_1.config.LOG_DETAILS) {
                console.log('getTextByXPath ', xpath, ' attempt #', count);
            }
            let elem = yield shadowRoot(webDriver);
            elem = yield findByXPath(elem, xpath);
            return yield elem.getText();
        }))) || '';
    });
}
exports.getTextByXPath = getTextByXPath;
function shadowRoot(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        return useShadowRoot
            ? yield driver.executeScript('return document.querySelector("main-element").shadowRoot')
            : yield driver.findElement(selenium_webdriver_1.By.tagName('body'));
    });
}
