import * as fs from 'fs'
import * as path from 'path'

export const skipError = (caller: string, err: Error, xpath: string, message = '') =>
  console.error(`[ERROR]: ignoring error in ${caller} for xpath = ${xpath} ${message}`, err.toString().split('\n')[0])

export let config = {
  FRAMEWORKS_DIR: '../frameworks',
  PORT: 8080,
  REPEAT_RUN: 10,
  REPEAT_RUN_STARTUP: 4,
  DROP_WORST_RUN: 0,
  WARMUP_COUNT: 5,
  TIMEOUT: 60 * 1000,
  LOG_PROGRESS: true,
  LOG_DETAILS: false,
  LOG_DEBUG: false,
  LOG_TIMELINE: false,
  EXIT_ON_ERROR: false,
  STARTUP_DURATION_FROM_EVENTLOG: true,
  STARTUP_SLEEP_DURATION: 1000,
  FORK_CHROMEDRIVER: true,
  RUN_ON_ANDROID_ADB: false,
}

export interface IJSONResult {
  framework: string,
  benchmark: string,
  label?: string,
  description?: string,
  type: string,
  min: number,
  max: number,
  mean: number,
  geometricMean: number,
  standardDeviation: number,
  median: number,
  values: number[]
}

export interface IBenchmarkError {
  imageFile: string
  exception: string
}

export interface IErrorsAndWarning {
  errors: IBenchmarkError[]
  warnings: string[]
}

export interface IBenchmarkDriverOptions {
  headless?: boolean
  chromeBinaryPath?: string
}

export interface IBenchmarkOptions extends IBenchmarkDriverOptions {
  outputDirectory: string
  port: string
  numIterationsForAllBenchmarks: number
  numIterationsForStartupBenchmark: number
}

export interface IFrameworkData {
  name: string
  fullNameWithVersion: string
  uri: string
  useShadowRoot: boolean
}

function isFrameworkData(data: IFrameworkData | null): data is IFrameworkData {
  const hasName = (data as IFrameworkData).name !== undefined
  const hasVersion = (data as IFrameworkData).fullNameWithVersion !== undefined

  return hasName && hasVersion
}

abstract class FrameworkVersionInformationValid {
  public url: string
  constructor(public directory: string, customURL: string | undefined, public useShadowRoot: boolean) {
    this.directory = directory
    this.url = 'frameworks/' + directory + (customURL ? customURL : '')
  }
}

export class FrameworkVersionInformationDynamic extends FrameworkVersionInformationValid {
  constructor(
    directory: string, public packageNames: string[],
    customURL: string | undefined, useShadowRoot: boolean = false) {
    super(directory, customURL, useShadowRoot)
  }
}

export class FrameworkVersionInformationError {
  constructor(public directory: string, public error: string) { }
}

export type TFrameworkVersionInformation = FrameworkVersionInformationDynamic | FrameworkVersionInformationError

export type IMatchPredicate = (frameworkDirectory: string) => boolean

export class PackageVersionInformationValid {
  constructor(public packageName: string, public version: string) { }
}

export class PackageVersionInformationErrorUnknownPackage {
  constructor(public packageName: string) { }
}

export class PackageVersionInformationErrorNoPackageJSONLock {
  constructor() {
    /* ??? Empty Class ??? */
  }
}

export type PackageVersionInformation = PackageVersionInformationValid | PackageVersionInformationErrorUnknownPackage | PackageVersionInformationErrorNoPackageJSONLock

const matchAll: IMatchPredicate = (frameworkDirectory: string) => true

export function loadFrameworkVersionInformation(matchPredicate: IMatchPredicate = matchAll): TFrameworkVersionInformation[] {
  const allFrameworksDir = config.FRAMEWORKS_DIR

  const directories = fs.readdirSync(allFrameworksDir)

  const result = new Array<TFrameworkVersionInformation>()

  for (const frameworkDir of directories) {
    const packageJSONPath = path.resolve(allFrameworksDir, frameworkDir, 'package.json')
    if (fs.existsSync(packageJSONPath)) {
      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf8'))

      const PACKAGE_META_KEY = 'framework-metadata'

      if (packageJSON[PACKAGE_META_KEY]) {
        if (packageJSON[PACKAGE_META_KEY].frameworkVersionFromPackage) {
          result.push(
            new FrameworkVersionInformationDynamic(
              frameworkDir,
              packageJSON[PACKAGE_META_KEY].frameworkVersionFromPackage.split(':'),
              packageJSON[PACKAGE_META_KEY].customURL,
              packageJSON[PACKAGE_META_KEY].useShadowRoot,
            ),
          )
        } else {
          result.push(new FrameworkVersionInformationError(frameworkDir, `package.json must contain a \'frameworkVersionFromPackage\' in the \'${PACKAGE_META_KEY}\' property`))
        }
      } else {
        result.push(new FrameworkVersionInformationError(frameworkDir, `package.json must contain a \'${PACKAGE_META_KEY}\' property`))
      }
    } else {
      result.push(new FrameworkVersionInformationError(frameworkDir, 'No package.json found'))
    }
  }

  return result
}

export class PackageVersionInformationResult {

  public versions: PackageVersionInformation[] = []

  constructor(public framework: FrameworkVersionInformationDynamic) { }

  public add(packageVersionInformation: PackageVersionInformation) {
    this.versions.push(packageVersionInformation)
  }

  public getVersionName(): string {
    if (this.versions.filter((pi) => pi instanceof PackageVersionInformationErrorNoPackageJSONLock).length > 0) {
      return 'invalid (no package-lock)'
    }
    return this.versions.map((version) => (version instanceof PackageVersionInformationValid) ? version.version : 'invalid').join(' + ')
  }

  public getFrameworkData(): IFrameworkData {
    return {
      name: this.framework.directory,
      fullNameWithVersion: this.framework.directory + '@' + this.getVersionName(),
      uri: this.framework.url,
      useShadowRoot: this.framework.useShadowRoot,
    }
  }
}

export function determineInstalledVersions(framework: FrameworkVersionInformationDynamic): PackageVersionInformationResult {
  const allFrameworksDir = config.FRAMEWORKS_DIR
  const packageLockJSONPath = path.resolve(allFrameworksDir, framework.directory, 'package-lock.json')

  const versions = new PackageVersionInformationResult(framework)
  if (fs.existsSync(packageLockJSONPath)) {
    const packageLock = JSON.parse(fs.readFileSync(packageLockJSONPath, 'utf8'))
    for (const packageName of framework.packageNames) {
      if (packageLock.dependencies[packageName]) {
        versions.add(new PackageVersionInformationValid(packageName, packageLock.dependencies[packageName].version))
      } else {
        versions.add(new PackageVersionInformationErrorUnknownPackage(packageName))
      }
    }
  } else {
    versions.add(new PackageVersionInformationErrorNoPackageJSONLock())
  }
  return versions
}

export function initializeFrameworks(matchPredicate: IMatchPredicate = matchAll): IFrameworkData[] {
  const frameworkVersionInformations = loadFrameworkVersionInformation(matchPredicate)

  const result: IFrameworkData[] = []

  const frameworks = frameworkVersionInformations.map((versionInfo) => {
    if (versionInfo instanceof FrameworkVersionInformationDynamic) {
      return determineInstalledVersions(versionInfo).getFrameworkData()
    } else {
      console.log(`WARNING: Ignoring package ${versionInfo.directory}: ${versionInfo.error}`)
      return null
    }
  })

  frameworks.forEach((fd) => { if (isFrameworkData(fd)) { result.push(fd) } })

  if (config.LOG_DETAILS) {
    console.log('All available frameworks: ')
    console.log(result.map((fd) => fd.fullNameWithVersion))
  }

  return result
}
