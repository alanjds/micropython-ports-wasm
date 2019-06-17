"use strict";


function undef(e,o){
    if (typeof o === 'undefined' || o === null)
        o = window;
    //else console.log('domain '+o)

    try {
        e = o[e];
    } catch (x) { return true }

    if (typeof e === 'undefined' || e === null)
        return true;
    return false;
}

function defined(e,o){return !undef(e,o)}

const delay = (ms, fn_solver) => new Promise(resolve => setTimeout(() => resolve(fn_solver()), ms*1000));

String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

String.prototype.endswith = String.prototype.endsWith
String.prototype.startswith = String.prototype.startsWith


function setdefault(n,v,o){
    if (o == null)
        o = window;

    if (undef(n,o)){
        o[n]=v;
        console.log('  |-- ['+n+'] set to ['+ o[n]+']' );
        return true;
    }
    return false;
}

setdefault('JSDIR','');

function include(filename, filetype){
    if (filetype===null ||typeof filetype === 'undefined')
        filetype = 'js';
        if (filename.endswith('css'))
            filetype = 'css';

    if ( (filename.indexOf('.') === 0) || (filename.indexOf('/') === 0 ) ){
        //absolute !
    } else {
        //corrected
        filename = window.JSDIR + filename;
    }

    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
        fileref.setAttribute('async',false);
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }   else {
        console.log("#error can't include "+filename+' as ' +filetype);
        return false;
    }
    if (typeof fileref!="undefined")
        console.log("#included "+filename+' as ' +filetype);

        document.getElementsByTagName("head")[0].appendChild(fileref)
        fileref.async = false;
        fileref.defer = false;
        //fileref.src = window.URL.createObjectURL( window.EMScript );
        //document.body.appendChild(fileref);
}
window.include = include;

function _until(fn_solver){
    return async function fwrapper(){
        var argv = Array.from(arguments)
        function solve_me(){return  fn_solver.apply(window, argv ) }
        while (!await delay(0, solve_me ) )
            {};
    }
}

// =================  EMSCRIPTEN ================================

function preRun(){
    console.log("preRun: Begin")
    //FS.init()
    var argv = window.location.href.split('?',2)
    var e;
    while (e=argv.shift())
        Module.arguments.push(e)
    argv = Module.arguments.pop().split('&')
    while (e=argv.shift())
        Module.arguments.push(e)
    console.log("preRun: End")
}


function write_file(dirname, filename, arraybuffer) {
    FS.createPath('/',dirname,true,true);
    FS.createDataFile(dirname,filename, arraybuffer, true, true);
}


//async
function postRun(){
    console.log("postRun: Begin")
    setTimeout(init_loop,1)
    console.log("postRun: End")
}

function PyRun_VerySimpleFile(text){
    var cs = allocate(intArrayFromString(text), 'i8', ALLOC_STACK);
    //console.log(script.text)
    Module._PyRun_VerySimpleFile(cs)
    Module._free(cs)
}

function PyRun_SimpleString(text){
    var cs = allocate(intArrayFromString(text), 'i8', ALLOC_STACK);
    //console.log(script.text)
    Module._PyRun_SimpleString(cs)
    Module._free(cs)
}


function awfull_get(url) {
    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
      } else {
            // Unable to compute progress information since the total size is unknown
      }
    }

    function transferFailed(evt) {
      console.log("callfs: An error occurred while transferring the file '"+window.currentTransfer+"'");
    }

    function transferCanceled(evt) {
      console.log("callfs: transfer '"+window.currentTransfer+"' has been canceled by the user.");
    }

    var oReq = new XMLHttpRequest();

    function transferComplete(evt) {
        if (oReq.status==404){
            console.log("callfs: File not found : "+ tB_name + ' in ' + (tD_name || '/') );
            window.currentTransferSize = -1 ;

        } else {
            window.currentTransferSize = oReq.response.length;
            console.log("callfs: Transfer is complete saving : "+window.currentTransferSize);
        }
    }

    oReq.overrideMimeType("text/plain; charset=x-user-defined");
    oReq.addEventListener("progress", updateProgress);
    oReq.addEventListener("load", transferComplete);
    oReq.addEventListener("error", transferFailed);
    oReq.addEventListener("abort", transferCanceled);
    oReq.open("GET",url ,false);
    oReq.send();
    return oReq.response
}

function init_loop(){

    console.log("init_loop:Begin (" + Module.arguments.length+")")
    var scripts = document.getElementsByTagName('script')

    if (Module.arguments.length>1) {

        var argv0 = ""+Module.arguments[1]
        if (argv0.startswith('http')) {
            argv0 = "https://cors-anywhere.herokuapp.com/"+argv0
        }
        console.log('running with sys.argv', argv0)

        window.currentTransferSize = 0
        window.currentTransfer = argv0

        var ab = awfull_get(argv0)
        console.log(ab.length)
        FS.createDataFile("/",'main.py', ab, true, true);
        PyRun_VerySimpleFile('main.py')
        return
    }

    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i]
        if(script.type == "text/µpython"){
            PyRun_SimpleString(script.text)
            break
        }
    }
    console.log("init_loop:End")
}
// ================= STDIN =================================================
window.stdin_array = []
window.stdin = ""

function window_prompt(){
    if (window.stdin.length>0) {
        var string = window.stdin
        window.stdin = ""
        console.log("sent ["+string+"]")
        return string
    }
    return null
}


// ================ STDOUT =================================================
window.stdout_array = []

function pts_decode(text){
    function flush_stdout(){
        var uint8array = new Uint8Array(window.stdout_array)
        var string = new TextDecoder().decode( uint8array )
        term_impl(string)
        window.stdout_array=[]
    }

    try {
        var jsdata = JSON.parse(text);
        var cc = jsdata["1"]
        window.stdout_array.push(cc)
        if (cc==10)
            flush_stdout()
    } catch (x) {
        // found a raw C string via libc
        console.log("C-STR:"+x+":"+text)
        flush_stdout()
        term_impl(text+"\r\n")
    }

}

// ========================== startup hooks ======================================

window.Module = {
    preRun : [preRun],
    postRun: [postRun],
    print : pts_decode,
    printErr : console.log,
}



async function pythons(argc, argv){
    var scripts = document.getElementsByTagName('script')
    /*
    for ?0=xxxxx&1=xxxx argv style
    var argv = []
    for (var i=0;i<10;i++) {
        var arg = new URL(window.location.href).searchParams.get(i);
        if (arg) {
            console.log("argv["+i+"]=",arg)
            argv.push(arg)
        }
        else break
    }
    if (argv.length>0) {
        console.log('running with sys.argv',argv)
        //Module.arguments = argv
        include("micropython.js")
        return;
    }
    */
    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i]
        if(script.type == "text/µpython"){
            console.log("starting upython")
            include("micropython.js")
            break
        }
    }
}



// ========================== C =============================
window.lib = {"name":"lib"};
window.urls = {"name":"http"}

async function _get(url,trigger){
    fetch(url).then( function(r) { return r.arrayBuffer(); } ).then( function(udata) { window[trigger] = udata } );
    await _until(defined)(trigger,window.urls)
    return window.urls[trigger]
}

async function dlopen_lzma(lib,size_hint) {
    if ( file_exists("lib/lib"+lib +".js") ){
        console.log(" =========== CAN RAW EVAL ========== ")
    }
    var lzma_file = "lib"+lib+".js.lzma"
    var blob = await get_lzma( window.lib, lib, lzma_file, size_hint, false, false)
    write_file("lib","lib"+trigger+".so",blob)
}

function file_exists(urlToFile) {
    var xhr = new XMLHttpRequest()
    xhr.open('HEAD', urlToFile, false)
    xhr.send()
    return (xhr.status == 200 )
}




console.log('pythons included')


