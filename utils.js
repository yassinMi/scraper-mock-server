
const _c = require("console-control-strings")
const fs = require("fs")
/**
 * 
 * @param { "cyan"|"green"|"red"|"grey"|"yellow"|"magenta"|"blue"|"white"} color
 * @param {string} str
 * 
 * @returns {string} colored string for console
 * 
 */

function c( color, str, ...params){
    return _c.color(color) + str + _c.color("white")+params.reduce((prev,current)=>{return prev + current},"");
}


function existsFolder(folder){
    try {
        fs.accessSync(folder);
        return true;
    }
    catch (error) {
        return false;
    }
}

exports.existsFolder = existsFolder;
exports.c = c;