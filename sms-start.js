
const http = require("http")
const express = require("express");
const { Router } = require("express");
const { c, existsFolder } = require("./utils")
const { exit } = require("process");
const path = require("path");
const { loadCurrent } = require("./envirenment");

const app = express();
/**
 * @type {http.Server}
 */
const server = http.createServer(app)

var ENV= loadCurrent(true);
if(ENV===undefined){//wont reach because of the fail:true above
    exit(1)
}


var r = Router()
r.get("/{elementName}/", (req, res) => {
    const searchString = req.query.search
    const elementName = req.params.elementName;
    
    const page = req.query.page ? Number.parseInt(req.query.page) : 1


})



const PORT = 4004
var myIp
try {
    myIp = Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])

} catch (error) {

}
console.log(c("grey", "startig server"))

server.listen(PORT, () => {
    console.log(c("cyan", "scraper-mocl-server"));
    console.log(c("grey", "local         : ") + ` http://localhost:${PORT}/`);
    console.log(c("grey", "on the network: ") + ` http://${myIp}:${PORT}/`);
})
