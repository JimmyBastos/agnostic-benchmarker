"use strict";
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
exports.skipError = (caller, err, xpath, message = '') => console.error(`[ERROR]: ignoring error in ${caller} for xpath = ${xpath} ${message}`, err.toString().split('\n')[0]);
exports.config = {
    FRAMEWORKS_DIR: '../frameworks',
    PORT: 8080,
    REPEAT_RUN: 20,
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
};
function isFrameworkData(data) {
    const hasName = data.name !== undefined;
    const hasVersion = data.fullNameWithVersion !== undefined;
    return hasName && hasVersion;
}
class FrameworkVersionInformationValid {
    constructor(directory, customURL, useShadowRoot) {
        this.directory = directory;
        this.useShadowRoot = useShadowRoot;
        this.directory = directory;
        this.url = 'frameworks/' + directory + (customURL ? customURL : '');
    }
}
class FrameworkVersionInformationDynamic extends FrameworkVersionInformationValid {
    constructor(directory, packageNames, customURL, useShadowRoot = false) {
        super(directory, customURL, useShadowRoot);
        this.packageNames = packageNames;
    }
}
exports.FrameworkVersionInformationDynamic = FrameworkVersionInformationDynamic;
class FrameworkVersionInformationError {
    constructor(directory, error) {
        this.directory = directory;
        this.error = error;
    }
}
exports.FrameworkVersionInformationError = FrameworkVersionInformationError;
class PackageVersionInformationValid {
    constructor(packageName, version) {
        this.packageName = packageName;
        this.version = version;
    }
}
exports.PackageVersionInformationValid = PackageVersionInformationValid;
class PackageVersionInformationErrorUnknownPackage {
    constructor(packageName) {
        this.packageName = packageName;
    }
}
exports.PackageVersionInformationErrorUnknownPackage = PackageVersionInformationErrorUnknownPackage;
class PackageVersionInformationErrorNoPackageJSONLock {
    constructor() {
        /* ??? Empty Class ??? */
    }
}
exports.PackageVersionInformationErrorNoPackageJSONLock = PackageVersionInformationErrorNoPackageJSONLock;
const matchAll = (frameworkDirectory) => true;
function loadFrameworkVersionInformation(matchPredicate = matchAll) {
    const allFrameworksDir = exports.config.FRAMEWORKS_DIR;
    const directories = fs.readdirSync(allFrameworksDir);
    const result = new Array();
    for (const frameworkDir of directories) {
        const packageJSONPath = path.resolve(allFrameworksDir, frameworkDir, 'package.json');
        if (fs.existsSync(packageJSONPath)) {
            const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf8'));
            const PACKAGE_META_KEY = 'framework-metadata';
            if (packageJSON[PACKAGE_META_KEY]) {
                if (packageJSON[PACKAGE_META_KEY].frameworkVersionFromPackage) {
                    result.push(new FrameworkVersionInformationDynamic(frameworkDir, packageJSON[PACKAGE_META_KEY].frameworkVersionFromPackage.split(':'), packageJSON[PACKAGE_META_KEY].customURL, packageJSON[PACKAGE_META_KEY].useShadowRoot));
                }
                else {
                    result.push(new FrameworkVersionInformationError(frameworkDir, `package.json must contain a \'frameworkVersionFromPackage\' in the \'${PACKAGE_META_KEY}\' property`));
                }
            }
            else {
                result.push(new FrameworkVersionInformationError(frameworkDir, `package.json must contain a \'${PACKAGE_META_KEY}\' property`));
            }
        }
        else {
            result.push(new FrameworkVersionInformationError(frameworkDir, 'No package.json found'));
        }
    }
    return result;
}
exports.loadFrameworkVersionInformation = loadFrameworkVersionInformation;
class PackageVersionInformationResult {
    constructor(framework) {
        this.framework = framework;
        this.versions = [];
    }
    add(packageVersionInformation) {
        this.versions.push(packageVersionInformation);
    }
    getVersionName() {
        if (this.versions.filter((pi) => pi instanceof PackageVersionInformationErrorNoPackageJSONLock).length > 0) {
            return 'invalid (no package-lock)';
        }
        return this.versions.map((version) => (version instanceof PackageVersionInformationValid) ? version.version : 'invalid').join(' + ');
    }
    getFrameworkData() {
        return {
            name: this.framework.directory,
            fullNameWithVersion: this.framework.directory + '@' + this.getVersionName(),
            uri: this.framework.url,
            useShadowRoot: this.framework.useShadowRoot,
        };
    }
}
exports.PackageVersionInformationResult = PackageVersionInformationResult;
function determineInstalledVersions(framework) {
    const allFrameworksDir = exports.config.FRAMEWORKS_DIR;
    const packageLockJSONPath = path.resolve(allFrameworksDir, framework.directory, 'package-lock.json');
    const versions = new PackageVersionInformationResult(framework);
    if (fs.existsSync(packageLockJSONPath)) {
        const packageLock = JSON.parse(fs.readFileSync(packageLockJSONPath, 'utf8'));
        for (const packageName of framework.packageNames) {
            if (packageLock.dependencies[packageName]) {
                versions.add(new PackageVersionInformationValid(packageName, packageLock.dependencies[packageName].version));
            }
            else {
                versions.add(new PackageVersionInformationErrorUnknownPackage(packageName));
            }
        }
    }
    else {
        versions.add(new PackageVersionInformationErrorNoPackageJSONLock());
    }
    return versions;
}
exports.determineInstalledVersions = determineInstalledVersions;
function initializeFrameworks(matchPredicate = matchAll) {
    const frameworkVersionInformations = loadFrameworkVersionInformation(matchPredicate);
    const result = [];
    const frameworks = frameworkVersionInformations.map((versionInfo) => {
        if (versionInfo instanceof FrameworkVersionInformationDynamic) {
            return determineInstalledVersions(versionInfo).getFrameworkData();
        }
        else {
            console.log(`WARNING: Ignoring package ${versionInfo.directory}: ${versionInfo.error}`);
            return null;
        }
    });
    frameworks.forEach((fd) => { if (isFrameworkData(fd)) {
        result.push(fd);
    } });
    if (exports.config.LOG_DETAILS) {
        console.log('All available frameworks: ');
        console.log(result.map((fd) => fd.fullNameWithVersion));
    }
    return result;
}
exports.initializeFrameworks = initializeFrameworks;
