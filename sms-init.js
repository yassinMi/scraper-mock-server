const { c, existsFolder } = require("./utils")
const { exit } = require("process");
const fs = require("fs");
const { loadCurrent, createNew } = require("./envirenment");

let maybeCurrentEnv = loadCurrent()
if(maybeCurrentEnv){
    console.log(c("yellow", "an envirenment already exists"),c("grey", `at '${maybeCurrentEnv.CURRENT_DATA_DIR}'`))
    exit(0)
}
try {
    let env = createNew()
    console.log(c("green", `created new envirenment`),
    c("grey", `at '${env.CURRENT_DATA_DIR}'`))
    exit(0)
} catch (error) {
    console.log(c("red", `failed to create new env: '${error}'`))
    exit(1)
}



