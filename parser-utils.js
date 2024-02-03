
const { existsFolder, c } = require("./utils")
const path = require("path");
const fs = require("fs");
const { exit } = require("process");
const vm = require("vm")

/**
 * 
 * @typedef CsvJsModul 
 * @property {object[]} items 
 */

/**
 * 
 * @param {string} csvjsFile 
 * @returns {CsvJsModul}
 */
function parse(csvjsFile) {
    var Module = module.constructor;
    var m = new Module()
    var content = fs.readFileSync(csvjsFile);
    m.compile(content, csvjsFile);
    return m.exports;
}

/**
 * 
 * @typedef CsvJsCodeTree
 * @property {CsvJsCodeDataSectionNode} dataSectionNode 
 * @property {CsvJsCodeExportsSectionNode} exportsSectionNode 
 */

/**
 * 
 * @typedef CsvJsCodeExportsSectionNode
 * @property {CsvJsCodeExportsCodeBlockNode|CsvJsCodeExportsAddCallNode[]} codeSegments 
 */
/**
 * 
 * @typedef CsvJsCodeExportsAddCallNode
 * @property {string} operand js expression of type array or a dataset name
 */
/**
 * 
 * @typedef CsvJsCodeExportsLoopNode
 * @property {CsvJsCodeExportsLoopStepNode[]} stepNodes
 * @property {string} whileExpression //unmodified (the indexing syntax [property] compiles to "_i(item.property)"  )
 */
/**
 * 
 * @typedef CsvJsCodeExportsLoopStepNode
 * @property {string} propertyName
 * @property {"inc_num,"|"inc_alpha"|"dec_num"|"dec_alpha"} stepMethod
 */
/**
 * 
 * @typedef CsvJsCodeExportsSegmentNode
 * @property {CsvJsCodeExportsSegmentNode[]} codeSegments 
 */
/**
 * 
 * @typedef CsvJsCodeDataSectionNode
 * @property {CsvJsCodeDatasetNode[]} datasetNodes
 */
/**
 * 
 * @typedef CsvJsCodeDatasetNode
 * @property {string} name 
 * @property {any[][]} rows 
 */

/**
 * creates an exported items list from csvjs syntax, (this method implements and defines the csvjs language)
 * @param {string} content 
 * @param {string} debugFileName 
 * @returns {object[]}  
 */
function compileCsvjs(content, debugFileName) {

    /**
     *  1. build the code tree representation of the file and throw any syntax errors e.g missing exports section
     *  2. validate the tree and throw errors e.g two datasets having the same name
     *  4. compile and execute javascript parts(runtime errors should be mapped to the csvjs file)
     *  3. return the items
     */

    /**
     * @type {Record<string,string>}
     */
    var raw_datasets = {}
    /**
     * @type {Record<string,object[]>}
     */
    var datasets = {}

    /**
     * @type {CsvJsCodeTree}
     */
    let root= {}

    let line=0;
    let col=0;
    let ix=0 //cursor pos

    function readCsvRow(){
        let state = 0 //0:expecting a value char or a comma or a opening " , 1: expecting a value char or a commma or a closing where space is a value cahr" 
        let values = []
        let currentValue = ""
        while (true) {
            let ch = content[ix++]
            if(state===1){
                if(isInlineWhiteSpace(ch)) continue;
                else if(ch==='"'){
                    state=1;
                    continue
                }
                else if(ch===','){
                    values.push(currentValue)
                }
            }
            else {

            }
            

        }
    }
    /**
     * after successfull read cursor is at the position after the ] character
     */
    function readDatasetNameToken(){
        let state=0 //0: expecting [ 1: expecting name 2: expecting name or ]
        let name
        while(true){
            let ch = content[ix++]
            if(state===0){
                if(ch==" "||ch=="\n") continue
                else if(ch=="["){
                    state=1;
                    continue;
                }
                else{
                    throw new Error("expected token '['")
                }
            }
            else if(state===1||state===2){
                if(ch==" "||ch=="\n") new Error(`dataset name cannot contain whitespace characters`)
                else if(ch<='Z' && ch>='a'){
                    name+=ch;
                    state = 3;
                    continue;
                }
                else if(ch=="]"){
                    if(state===2){
                        throw new Error(`dataset name cannot be empty`)
                    }
                    return name;
                }
                else{
                    throw new Error(`dataset name cannot contain character ${ch}`)
                }
            }
            
            
        }
    }
    function isWhiteSpace(ch){
        return ch===' '||ch==='\n'||ch==='\t'||ch==='\r'
    }
    function isInlineWhiteSpace(ch){
        return ch===' '||ch==='\n'
    }
    /**
     * whitespace ahead will be skipped, position will be at a non whitespace char
     */
    function skipWhiteSpace(){
        while(isWhiteSpace(content[ix++]));
    }
    function readDataset(){
        let name = readDatasetNameToken();
        skipWhiteSpace();
        if(content[ix]==='['){
            //indicates opening of a dataset without any content in the current one
            throw new Error(`unexpected token '[', one or more rows are expected in dataset '${name}'`)
        }
        else if(content[ix]==='#'){
            throw new Error(`unexpected token '[', one or more rows are expected in dataset '${name}'`)
        }
        let row = readCsvRow()
        root.dataSectionNode.datasetNodes.push({name:name,rows:[row]})
        while(true){
            if(content[ix]==='['||content[ix]==='#') return
            else{
                row = readCsvRow();
                root.dataSectionNode.datasetNodes[-1].rows.push(row)
            }
        }
        
    }
    function readSectionName(){
        let state=0 //0:expecting #, 1 expecting name, 2:expecting name or linebreak
        let sectionName
        while(true){
            let ch = content[ix++]
            if(state===0){
                if(isInlineWhiteSpace(ch)) continue
                else if(ch=="#"){
                    state=1;
                    continue;
                }
                else{
                    throw new Error("expected token '#'")
                }
            }
            else if(state===1||state===2){
                if(ch==" "||ch=="\n") new Error(`section name cannot contain whitespace characters`)
                else if(ch<='Z' && ch>='a'){
                    sectionName+=ch;
                    state = 3;
                    continue;
                }
                else if(ch==='\n'||ch=='\r'){
                    if(state===2){
                        throw new Error(`section name cannot be empty`)
                    }
                    return sectionName;
                }
                else{
                    throw new Error(`section name cannot contain character ${ch}`)
                }
            }
            
            
        }
    }
        skipWhiteSpace();
        let sectionName= readSectionName()
        if(sectionName=="data"){
            skipWhiteSpace();
            if(content[ch]==='['){
                readDataset();
            }
            else{
                throw new Error(`unexpected token '#${sectionName}'`)
            }
            while(true){
                skipWhiteSpace();
                if(content[ch]==='['){
                    readDataset(); continue;
                }
                else{
                    break;
                }
            }
            
        }
        else if(sectionName=="exports"){
            root.exportsSectionNode = {codeSegments:[]}
        }
        else{
            throw new Error(`unknown token '#${sectionName}'`)
        }
    
        //# validate tree
        if(!root.dataSectionNode) throw new Error(`data section is required`)
        if(!root.exportsSectionNode) throw new Error(`exports section is required`)
        if(!root.dataSectionNode.datasetNodes?.length) throw new Error(`data section is empty`)
        root.dataSectionNode.datasetNodes.forEach(ds=>{
            if(!(ds.rows&&ds.rows.length)) throw new Error(`dataset '${ds.name}' is empty`);
            if(!(ds.name)) throw new Error(`dataset must have non empty name`);
        })
        //todo detect duplicate names

        console.log("parsed tree")
   
    let ctx = vm.createContext({
        ...datasets, //populated by this code
        _export_items:[]//to be populated by the compiled code using wm.run
    })


    let compiledExportSection = "context._export_items = context.products2"


    let currentLineOfset = 0; // for stack trace
    vm.runInContext(compiledExportSection,compiledExportSection, {filename:debugFileName,lineOffset:currentLineOfset})

    return ctx._export_items;

}
/**
 * @typedef IndexTranslator
 * @property {(o:object)=>number} _i convert value to index e.g "ID-004" => 4
 * @property {(i:number)=>object} _o convert index to value e.g 5 => "ID-005" 
 * @property {(i:number)=>number} _inc increment (usually by one)
 */


/**
 * 
 * @param {object[]} items 
 * @returns {IndexTranslator}
 */
function createIndexTranslator(items){
    return {
        _i:(o=>Number.parseInt(o)),
        _o:(i)=>i.toString()}
}
function parseLoopStatement(loopStatment){
    let products2 = [{id:"1"}]
      //csvjs: add loop products2 num_inc by id while [id]<=40
      //js: (similar code must be generated by this function)


      var f = vm.compileFunction()
      vm.createContext()
      let {_i_id,_o_id,_inc_id}= createIndexTranslator(products2)
      let item= products2[0];
      let ix_id=0 //tracks index of property "id"
      let res=  []
      while (ix_id<=40) {
          res.push(item)
          ix_id = _inc_id(ix_id)
          if(products2.length<ix_id){
              item = products2[ix_id]
          }
          else{
              item = {...products2[ix_id%products2.length]}
              item.id = _c_id(i);
          }
      }
}

exports.parse = parse;