
import * as chrome from 'selenium-webdriver/chrome'
import { config, skipError } from './common'

import {
  By,
  Condition,
  WebDriver,
  WebElement,
} from 'selenium-webdriver'

interface IPathPart {
  tagName: string
  index: number
}

let useShadowRoot = false

export function setUseShadowRoot(val: boolean) {
  useShadowRoot = val
}

function convertPath(path: string): IPathPart[] {
  const parts = path.split(/\//).filter((v) => !!v)
  const res: IPathPart[] = []
  for (const part of parts) {
    const components = part.split(/\[|]/).filter((v) => !!v)
    const tagName = components[0]
    let index: number = 0
    if (components.length === 2) {
      index = Number(components[1])
      if (!index) {
        console.log('Index can\'t be parsed', components[1])
        throw new Error('Index can\'t be parsed ' + components[1])
      }
    } else {
      index = 1
    }
    res.push({ tagName, index })
  }
  return res
}

// Fake findByXPath for simple XPath expressions to allow usage with shadow dom
async function findByXPath(node: WebElement, path: string): Promise<WebElement> {
  const paths = convertPath(path)
  let n = node
  try {
    for (const p of paths) {
      const elems = await n.findElements(By.css(p.tagName + ':nth-child(' + (p.index) + ')'))
      if (elems && elems.length) { n = elems[0] }
    }
  } catch (e) {
    // can happen for StaleElementReferenceError
  }
  return n
}

function elemNull(v: any) {
  console.log('*** ELEMENT WAS NULL')
  return false
}

function waitForCondition(driver: WebDriver) {
  return async (text: string, fn: (driver: WebDriver) => Promise<boolean>, timeout: number): Promise<boolean> => {
    return await driver.wait(new Condition<boolean>(text, fn), timeout)
  }
}

// driver.findElement(By.xpath("//tbody/tr[1]/td[1]")).getText().then(...) can throw a stale element error:
// thus we're using a safer way here:
export async function testTextContains(driver: WebDriver, xpath: string, text: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testTextContains ${xpath} ${text}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        if (elem == null) { return false }
        const v = await elem.getText()
        return !!v && (v.indexOf(text) > -1)
      } catch (err) {
        skipError('testTextContains', err, xpath, `text = ${text}`)
        return false
      }
    }, timeout)
}

export function testTextNotContained(driver: WebDriver, xpath: string, text: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testTextNotContained ${xpath} ${text}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        if (elem == null) { return false }
        const value = await elem.getText()
        return !!value && !value.includes(text)
      } catch (err) {
        skipError('testTextNotContained', err, xpath, `text = ${text}`)
        return false
      }
    }, timeout)
}

export async function testTextEqual(driver: WebDriver, xpath: string, text: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testTextContains ${xpath} ${text}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        if (elem == null) { return false }
        const value = await elem.getText()
        return !!value && (value === text)
      } catch (err) {
        skipError('testTextEqual', err, xpath, `text = ${text}`)
        return false
      }
    }, timeout)
}

export function testTextNotEqual(driver: WebDriver, xpath: string, text: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testTextNotEqual ${xpath} ${text}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        if (elem == null) { return false }
        const value = await elem.getText()
        return !!value && (value !== text)
      } catch (err) {
        skipError('testTextNotEqual', err, xpath, `text = ${text}`)
        return false
      }
    }, timeout)
}

export function testClassContains(driver: WebDriver, xpath: string, text: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testClassContains ${xpath} ${text}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        if (elem == null) { return false }
        const v = await elem.getAttribute('class')
        return !!v && (v.indexOf(text) > -1)
      } catch (err) {
        skipError('testClassContains', err, xpath, `text = ${text}`)
        return false
      }
    }, timeout)
}

export function testElementLocatedByXpath(driver: WebDriver, xpath: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testElementLocatedByXpath ${xpath}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        return elem ? true : false
      } catch (err) {
        skipError('testElementLocatedByXpath', err, xpath)
        return false
      }
    }, timeout)
}

export function testElementNotLocatedByXPath(driver: WebDriver, xpath: string, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(`testElementNotLocatedByXPath ${xpath}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await findByXPath(elem, xpath)
        return !!elem
      } catch (err) {
        err = err.toString().split('\n')[0]
        skipError('testElementNotLocatedByXPath', err, xpath)
        return false
      }
    }, timeout)
}

export function testElementLocatedById(driver: WebDriver, id: string, timeout = config.TIMEOUT): Promise<boolean> {
  return waitForCondition(driver)(`testElementLocatedById ${id}`,
    async (webDriver) => {
      try {
        let elem = await shadowRoot(webDriver)
        elem = await elem.findElement(By.id(id))
        return true
      } catch (err) {
        skipError('testElementLocatedById', err, id)
        return false
      }
    }, timeout)
}

async function retry<T>(
  retryCount: number,
  driver: WebDriver,
  fun: (driver: WebDriver, retryCount: number) => Promise<T>,
): Promise<T | null> {
  for (let i = 0; i < retryCount; i++) {
    try {
      return fun(driver, i)
    } catch (err) {
      console.log('retry failed')
    }
  }
  return null
}

// Stale element prevention. For aurelia even after a testElementLocatedById clickElementById for the same id can fail
// No idea how that can be explained
export function clickElementById(driver: WebDriver, id: string) {
  return retry(5, driver, async (webDriver) => {
    let elem = await shadowRoot(webDriver)
    elem = await elem.findElement(By.id(id))
    await elem.click()
  })
}

export function clickElementByXPath(driver: WebDriver, xpath: string) {
  return retry(5, driver, async (webDriver, count) => {
    if (count > 1 && config.LOG_DETAILS) {
      console.log('clickElementByXPath ', xpath, ' attempt #', count)
    }
    let elem = await shadowRoot(webDriver)
    elem = await findByXPath(elem, xpath)
    await elem.click()
  })
  // Stale element possible:
  // return to(driver.findElement(By.xpath(xpath)).click());
}

export async function getTextByXPath(driver: WebDriver, xpath: string): Promise<string> {
  return await retry(5, driver, async (webDriver, count) => {
    if (count > 1 && config.LOG_DETAILS) { console.log('getTextByXPath ', xpath, ' attempt #', count) }
    let elem = await shadowRoot(webDriver)
    elem = await findByXPath(elem, xpath)
    return await elem.getText()
  }) || ''
}

async function shadowRoot(driver: WebDriver): Promise<WebElement> {
  return useShadowRoot
    ? await driver.executeScript('return document.querySelector("main-element").shadowRoot') as WebElement
    : await driver.findElement(By.tagName('body'))
}
