const { existsFolder, c } = require("./utils")
const path = require("path");
const fs = require("fs");
const { exit } = require("process");


/**
 * @typedef EnvirenmentInfo
 * @property {string} CURRENT_DATA_DIR
 */

/**
 * @typedef ElementSchema
 * @property {SchemaPropertyDefinition[]} Properties
 */

/**
 * @typedef SchemaPropertyDefinition
 * @property {string} Name
 * @property {"string"|"number"} DataType all other values need to be deserialized by the consumer
 */



/**
 * @typedef ElementsSource
 * @property {string} ElementName name, this is by default exposed as http://localhost:4004/{ElementName}?search="abc"
 * @property {"pagesAcess"} PaginationType in v0.1.0 we only support simple 1-based paginations where elements don't change
 * @property {ElementSchema} Schema schema functions are not implemented
 * @property {number} ElementsPerPage may or may not be used depending on pagination type
 * @property {object[]} Dataset
 */


const POTENTIAL_DATA_DIR_NAMES = ["sms-data", "sms-data.yass"]
/**
 * potential data directories (full path)
 */
const POTENTIAL_DATA_DIRS = POTENTIAL_DATA_DIR_NAMES.map(name => path.join(process.cwd(), name))




/**
 * reads from the disk, returns an envirenment info or undefined (if no env exists)
 * @returns {EnvirenmentInfo|undefined}
 */
function loadCurrent(fail=false){
    const CURRENT_DATA_DIR = POTENTIAL_DATA_DIRS.find(existsFolder)
    if (CURRENT_DATA_DIR === undefined) {
        if(fail){
            console.log(c("red", "no envirenment, try sms init"))
            exit(1)
        }
        return undefined;
    }
    return {CURRENT_DATA_DIR:CURRENT_DATA_DIR}
}

/**
 * 
 * @param {EnvirenmentInfo} envInfo 
 * @param {bool} hard user data under the data folder will be removed recursively
 * @returns {number} deleted Files Count
 */
function deleteEnv(envInfo,hard){
    /**
     * @type {string}
     */
    const dir = envInfo.CURRENT_DATA_DIR
    if(!dir) throw new Error(`cannot delete folder '${dir}'`);
    //for extra safety
    if(!dir.includes("sms-data")) throw new Error(`cannot delete folder '${dir}' path not expected`);
    fs.rmdirSync(dir,{recursive:hard})
}

/***
 * @returns {EnvirenmentInfo}
 */
function createNew(){
    const maybeCurrent = POTENTIAL_DATA_DIRS.find(existsFolder)
    if (maybeCurrent) {
        throw new Error("already exists")
    }
    fs.mkdirSync(POTENTIAL_DATA_DIRS[0])
    return {CURRENT_DATA_DIR: POTENTIAL_DATA_DIRS[0]}
}

exports.loadCurrent = loadCurrent;
exports.createNew = createNew;
exports.deleteEnv = deleteEnv;