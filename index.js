
const { c, existsFolder } = require("./utils")
const path = require("path");
const { program } = require("commander");
const { exit } = require("process");
const { loadCurrent, deleteEnv } = require("./envirenment");
program.name("sms")
.version("0.1.0")
.command("init","initialize a new envirenment in the current folder, this created the sms-data folder",{executableFile:"sms-init"})
.command("start [PORT]",'start the server')

program.command("delete")
.description("delete the current envirenment (cleans the data folder)")
.option("-h, --hard","force deleting user data under the data folder recurdibely",false)
.action((options)=>{
    var env = loadCurrent(true)
    try{
        let deletedFiles = deleteEnv(env,options.hard);
        console.log(c("green", "removed"))
        exit(0)
    }
    catch (err){
        console.log(c("red", err))
            exit(1)
    }
    
})
/*.description()
    .option("-t, --template <TEMPLATE>", "specify a predefined template")
    .action((args) => {

        
    })
*/
var templateCommand = program.command("template")
templateCommand.command("create")
.description( "create new template")
    .action((args) => {
        console.log(c("green", "created new template (not impl)"))
        exit(0)
    }
    )
templateCommand.command("list")
.description("show available templates")
.action((args) => {
    console.log(c("yellow", "no templates"))
    exit(0)
}
)



program.parse();




