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

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

String.prototype.startswith = function(prefix) {
    return this.indexOf(prefix, 0) !== -1;
}


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

setdefault('JSDIR','./');

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

function preRun(){
    console.log("preRun: Begin")
    //FS.init()

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



function init_loop(){
    console.log("init_loop:Begin")
    var scripts = document.getElementsByTagName('script')
    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i]
        if(script.type == "text/µpython"){
            var cs = allocate(intArrayFromString(script.text), 'i8', ALLOC_STACK);
            //console.log(script.text)
            Module._PyRun_SimpleString(cs)
            Module._free(cs);
            break
        }
    }
    console.log("init_loop:End")
}

function term_impl(text){
    window.text_area.value += text
//    var element = document.doc_form.text_area;
//    element.value += text;
//    return element;
}


function text_area_out(text){
    try {

        if (arguments.length > 1)
            text = Array.prototype.slice.call(arguments).join(' ')

        var add_trail = true;
        var tl = text.length;

        //maybe got DLE+ETX flush mark
        if (tl>=2){

            if (  (text.charCodeAt(tl-2)==16) &&  (text.charCodeAt(tl-1)==3) ) {

                // only DLE_ETX get out , that's just an io flush
                if (tl==2)
                    return;
                //chop
                text = text.substring(0,tl-2);
                //no \n for data transmission.
                add_trail = false;
            }
        }

        text = text.replace( String.fromCharCode(16)+ String.fromCharCode(3), '!!') ;

        // anything raw data would have the trailing \n chopped.
        if (!add_trail){
            term_impl(text)
            return ;
        }

        if (text.indexOf(">>> ", 0) !== -1){
            var element = term_impl(">>> ");
            element.scrollTop = element.scrollHeight;
            Module.printErr = window.old_stderr;
            return;
        }

    } catch (x){
        console.log("text_area_out: "+ x +" text="+text);
    }
}


window.Module = {
    preRun : [preRun],
    postRun: [postRun],
    print : text_area_out,
    printErr : console.log,
}



async function pythons(argc, argv){
    var textarea = document.getElementById('output');
        textarea.rows=25 ;
        textarea.style.height = "640px";
    window.text_area = textarea
    var scripts = document.getElementsByTagName('script')
    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i]
        if(script.type == "text/µpython"){
            console.log("starting upython")
            include("micropython.js")
            break
        }
    }
}

