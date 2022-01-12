function chunk (init?:string) {
    const code:string[] = init ? [init] : []

    function append (...snippet:string[]) {
        code.push(...snippet)
    }

    function sew (sep='') {
        return code.join(sep)
    }

    return {
        append,
        sew,
    }
}

export function createFuncEnv () {
    let id = 0
    const params:string[] = []
    const args:any[] = []
    function ref (x:any) {
        for (let i = 0; i < args.length; i++) {
            if (x === args[i]) return params[i]
        }

        const p = '_r' + id++
        params.push(p)
        args.push(x)
        return p
    }

    const locals:string[] = []
    const vals:any[] = []
    function val (x:any) {
        const l = '_v' + id++
        locals.push(l)
        vals.push(x)
        return l
    }

    const epilog = chunk()
    function code (...snippets:string[]) {
        epilog.append(...snippets)
    }

    function sew () {
        function bindings () {
            if (locals.length === 0) return ''

            const decl = 'let ' + locals.join(',') + ';'
            const inits = locals.map((l, i) => `${l}=${vals[i]};`).join('')
            return decl + inits
        }

        return bindings() + epilog.sew()
    }

    function make (funcStr:string) : Function {
        const body = `'use strict';` + sew() + `return ${funcStr};`
        const fn = Function.apply(null, params.concat(body))
        return fn.apply(null, args)
    }

    return {
        ref,
        val,
        code,
        make,
    }
}

export function createFuncJob (ctx:ReturnType<typeof createFuncEnv>) {
    function ref (x:any) {
        return ctx.ref(x)
    }

    let id = 0
    const locals:string[] = []
    const vals:any[] = []
    function val (x:any) {
        const l = 'v' + id++
        locals.push(l)
        vals.push(x)
        return l
    }

    const epilog = chunk()
    function code (...snippets:string[]) {
        epilog.append(...snippets)
    }

    function sew () {
        function bindings () {
            if (locals.length === 0) return ''

            const decl = 'let ' + locals.join(',') + ';'
            const inits = locals.map((l, i) => `${l}=${vals[i]};`).join('')
            return decl + inits
        }

        return 'function(){' + bindings() + epilog.sew() + '}'
    }

    return {
        ref,
        val,
        code,
        sew,
    }
}
