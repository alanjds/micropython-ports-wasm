/* http://github.com/pmp-p */
/*
  embed AUTO-GENERATED by /data/cross/micropython-cross/micropython/ports/wasm-xp/modgen/__main__.py
*/


#include <string.h>
#include <stdio.h>

#include "py/obj.h"
#include "py/runtime.h"

static void print(mp_obj_t str) {
    mp_obj_print(str, PRINT_STR);
    mp_obj_print(mp_obj_new_str_via_qstr("\n",1), PRINT_STR);
}

static void null_pointer_exception(void){
    fprintf(stderr, "null pointer exception in function pointer call\n");
}

STATIC mp_obj_t PyBytes_FromString(char *string){
    vstr_t vstr;
    vstr_init_len(&vstr, strlen(string));
    strcpy(vstr.buf, string);
    return mp_obj_new_str_from_vstr(&mp_type_bytes, &vstr);
}

#define None mp_const_none
#define bytes(cstr) PyBytes_FromString(cstr)

    
//modgen

#include "py/emitglue.h"
#include "py/parse.h"
#include "py/lexer.h"
#include "py/compile.h"

extern mp_lexer_t* mp_lexer_new_from_file(const char *filename);
extern void mp_raw_code_save_file(mp_raw_code_t *rc, const char *filename);
// Save .mpy file to file system
int raw_code_save_file(mp_raw_code_t *rc, const char *filename) {  return 0; }


/* #1@14 os_read() -> bytes  */

STATIC mp_obj_t //bytes
embed_os_read(size_t argc, const mp_obj_t *argv) {
    // simple read string

    static char buf[256];
    //fputs(p, stdout);
    char *s = fgets(buf, sizeof(buf), stdin);
    if (!s) {
        //return mp_obj_new_int(0);
        buf[0]=0;
        fprintf(stderr,"embed.os_read EOF\n" );
    } else {
        int l = strlen(buf);
        if (buf[l - 1] == '\n') {
            if ( (l>1) && (buf[l - 2] == '\r') )
                buf[l - 2] = 0;
            else
                buf[l - 1] = 0;
        } else {
            l++;
        }
        fprintf(stderr,"embed.os_read [%s]\n", buf );
    }
    return bytes(buf);
    //return bytes()
} /* os_read */
//   # py comment #1


/* #2@41 vars(module_obj : mp_obj_t = None ) -> dict  */

STATIC mp_obj_t //dict
embed_vars(size_t argc, const mp_obj_t *argv) {

    mp_obj_t* module_obj;
    if (argc>0)
        module_obj = (mp_obj_t*)argv[0];
    else module_obj = NULL ;


    mp_obj_dict_t *mod_globals = mp_obj_module_get_globals(module_obj);
    return mod_globals;
    //return dict()
} /* vars */


/* #3@47 os_compile(source_file : const_char_p="", mpy_file : const_char_p="") -> void  */

STATIC mp_obj_t //ptr
embed_os_compile(size_t argc, const mp_obj_t *argv) {

    const char *source_file;
    if (argc>0)
        source_file = mp_obj_str_get_str(argv[0]);
    else
        source_file = mp_obj_new_str_via_qstr("",0);


    const char *mpy_file;
    if (argc>1)
        mpy_file = mp_obj_str_get_str(argv[1]);
    else
        mpy_file = mp_obj_new_str_via_qstr("",0);

    vstr_t vstr;

    if (argc == 2 && argv[1] != mp_const_none) {
        //done by glue code
    } else {
        vstr_init(&vstr, strlen(source_file) + 5);  // +5 for NUL and .mpy
        vstr_add_str(&vstr, source_file);
        if (vstr.len > 3 && memcmp(&vstr.buf[vstr.len - 3], ".py", 3) == 0) {
            // remove .py extension to replace with .mpy
            vstr_cut_tail_bytes(&vstr, 3);
        }
        vstr_add_str(&vstr, ".mpy");
        mpy_file = vstr_null_terminated_str(&vstr);
    }

    mp_lexer_t *lex = mp_lexer_new_from_file(source_file);
    mp_parse_tree_t parse_tree = mp_parse(lex, MP_PARSE_FILE_INPUT);
    mp_raw_code_t *rc = mp_compile_to_raw_code(&parse_tree,
                                               qstr_from_str(source_file),
                                               MP_EMIT_OPT_NONE,
                                               false);
    mp_raw_code_save_file(rc, mpy_file);
    return mp_const_none;
    return None;
} /* os_compile */


/* #4@74 echosum1(num : int=0) -> int  */

STATIC mp_obj_t //int
embed_echosum1(size_t argc, const mp_obj_t *argv) {

    int num;
    if (argc>0)
        num = mp_obj_get_int(argv[0]);
    else num = 0 ;


    return MP_OBJ_NEW_SMALL_INT(num+1);
    //return int()
} /* echosum1 */

// py comment #2

/* #5@80 callsome(fn : void=npe) -> void  */

STATIC mp_obj_t //ptr
embed_callsome(size_t argc, const mp_obj_t *argv) {

    void (*fn)(void);
    if (argc>0)
        fn = (void*)argv[0] ;
    else fn = &null_pointer_exception;


    (*fn)();
    return None;
} /* callsome */


/* #6@85 somecall(s:str='pouet')  */

STATIC mp_obj_t //void
embed_somecall(size_t argc, const mp_obj_t *argv) {

    mp_obj_t s;
    if (argc>0)
        s = (mp_obj_t*)argv[0];
    else s =  mp_obj_new_str_via_qstr("pouet",5);


    fprintf(stderr, "FPRINTF[%s]\n", mp_obj_str_get_str(s) );
    print(s);
    return None;
} /* somecall */

// c comment #3



/***************************** MODULE INTERFACE ***************************/

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_callsome_obj,
    0, 1, embed_callsome);

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_echosum1_obj,
    0, 1, embed_echosum1);

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_os_compile_obj,
    0, 2, embed_os_compile);

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_os_read_obj,
    0, 0, embed_os_read);

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_somecall_obj,
    0, 1, embed_somecall);

STATIC MP_DEFINE_CONST_FUN_OBJ_VAR_BETWEEN(embed_vars_obj,
    0, 1, embed_vars);

STATIC const mp_map_elem_t embed_globals_table[] = {

    {MP_ROM_QSTR(MP_QSTR_callsome), (mp_obj_t)&embed_callsome_obj },
    {MP_ROM_QSTR(MP_QSTR_echosum1), (mp_obj_t)&embed_echosum1_obj },
    {MP_ROM_QSTR(MP_QSTR_os_compile), (mp_obj_t)&embed_os_compile_obj },
    {MP_ROM_QSTR(MP_QSTR_os_read), (mp_obj_t)&embed_os_read_obj },
    {MP_ROM_QSTR(MP_QSTR_somecall), (mp_obj_t)&embed_somecall_obj },
    {MP_ROM_QSTR(MP_QSTR_vars), (mp_obj_t)&embed_vars_obj },

};

STATIC MP_DEFINE_CONST_DICT(mp_module_embed_globals, embed_globals_table);

const mp_obj_module_t mp_module_embed = {
    .base = { &mp_type_module },
    .globals = (mp_obj_dict_t*)&mp_module_embed_globals,
};


