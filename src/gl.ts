import { extNames, type2UniformX } from './dict'
import { createFuncEnv, createFuncJob } from './func'
import { assert, error } from './util/assert'
import { arrayShape, flattenArray } from './util/flatten'
import { join } from './util/misc'

const VAO = extNames.VAO

function noop () { }

function shader (gl:WebGLRenderingContext, type:number, src:string) : WebGLShader {
    const sh = gl.createShader(type) as WebGLShader
    gl.shaderSource(sh, src)
    gl.compileShader(sh)

    const success = gl.getShaderParameter(sh, gl.COMPILE_STATUS)
    if (!success) {
        const err = gl.getShaderInfoLog(sh) as string
        gl.deleteShader(sh)
        throw new Error(err)
    }

    return sh
}

function contextState (gl:WebGLRenderingContext, extSpec:string[]) {
    // always use vao
    if (extSpec.indexOf(VAO) < 0) extSpec.push(VAO)

    const exts:Record<string, any> = {}
    for (let i = 0; i < extSpec.length; i++) {
        const name = extSpec[i]
        exts[name] = gl.getExtension(name)
    }

    const state = {
        gl,
        exts,
        restore,
        release,
    }

    function restore () {
        const names = Object.keys(extSpec)
        for (let i = 0; i < names.length; i++) {
            const name = names[i]
            exts[name] = gl.getExtension(name)
        }
    }

    function release () {
        state.exts = {}
    }

    return state
}

export class SimGL {
    private _context:SimContextState

    constructor (
        public readonly gl:WebGLRenderingContext,
        opts:{
            extensions:string[],
        },
    ) {
        const { extensions } = opts

        const context = this._context = contextState(gl, extensions) as SimContextState
        const env = context.env = createFuncEnv()
        const refs:Record<string, string> = context.refs = {}

        const shared = {
            gl,
            exts: context.exts,
        }

        Object.keys(shared).forEach((key) => {
            refs[key] = env.ref(shared[key])
        })

        // handle context lost and restored
        function onLost (ev) {
            ev.preventDefault()
        }
        function onRestored () {
            context.restore()
        }
        const c = gl.canvas
        c.addEventListener('webglcontextlost', onLost)
        c.addEventListener('webglcontextrestored', onRestored)

        this.release = () => {
            c.removeEventListener('webglcontextlost', onLost)
            c.removeEventListener('webglcontextrestored', onRestored)
            context.release()
        }
    }

    public readonly release = noop

    public program (spec:SimProgramSpec) {
        return new SimProgram(this._context, spec)
    }

    public clear (opts:{
        depth?:number,
        stencil?:number,
        color?:number[]|number,
    }) {
        assert(
            typeof opts === 'object' && opts != null,
            '`clear()` expects an object as input',
        )

        const gl = this.gl
        const { depth, stencil, color } = opts

        let mask = 0
        if (typeof depth === 'number') {
            mask |= gl.DEPTH_BUFFER_BIT
            gl.clearDepth(depth)
        }
        if (typeof stencil === 'number') {
            mask |= gl.STENCIL_BUFFER_BIT
            gl.clearStencil(stencil | 0)
        }
        if (color) {
            mask |= gl.COLOR_BUFFER_BIT
            gl.clearColor(+color[0] || 0, +color[1] || 0, +color[2] || 0, +color[3] || 0)
        }
        gl.clear(mask)
    }
}

function programState () {
    const state = {
        gl: null,
        prog: null,
        vao: null,
        attrib: [],
        elem: {},
        unif: [],
        restore,
        release,
    } as any

    function restore () {
    }

    function release () {
    }

    return state
}

function isDynamic (x) {
    return typeof x === 'function'
}

function processAttrib (gl:WebGLRenderingContext, attrib:Record<string, any>) {
    const attrState:Record<string, any>[] = []

    const names = Object.keys(attrib)
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        const attr = attrib[name]

        const shape = arrayShape(attr)
        let size = 1
        for (let i = 1; i < shape.length; i++) {
            size *= shape[i]
        }
        const type = gl.FLOAT
        const data = flattenArray(attr, shape, type)

        const state = {
            name,
            usage: gl.STATIC_DRAW,
            size,
            type,
            data,
            normalized: false,
            stride: 0,
            offset: 0,
        }
        attrState.push(state)
    }

    return attrState
}

function processElem (gl:WebGLRenderingContext, elem:any[]) {
    const elemState:Record<string, any>[] = []
    if (!elem.length) return elemState

    const shape = arrayShape(elem)
    const type = gl.UNSIGNED_SHORT
    const data = flattenArray(elem, shape, type)

    const mode = gl.TRIANGLES
    let count = 1
    for (let i = 0; i < shape.length; i++) {
        count *= shape[i]
    }
    const offset = 0

    const state = {
        data,
        usage: gl.STATIC_DRAW,
        mode,
        count,
        type,
        offset,
    }
    elemState.push(state)
    return elemState
}

function processUnif (program:SimProgramState, unif:Record<string, any>) {
    const { gl, prog } = program

    const unifState:Record<string, any>[] = []

    const numUnif = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS)
    const names = Object.keys(unif)
    assert(
        names.length === numUnif,
        `Number of uniform values does not match number of active uniforms`,
    )

    for (let i = 0; i < numUnif; i++) {
        const { name, type } = gl.getActiveUniform(prog, i) as WebGLActiveInfo
        assert(name in unif, 'Value of uniform `' + name + '` is missing')

        const loc = gl.getUniformLocation(prog, name) as WebGLUniformLocation
        const ux = type2UniformX[type] as string

        const un = unif[name]
        const dyn = isDynamic(un)
        const data = dyn ? un : flattenArray(un, arrayShape(un), gl.FLOAT)

        const state = {
            name,
            type,
            ux,
            loc,
            data,
            dyn,
        }
        unifState.push(state)
    }

    return unifState
}

function makeDraw (context:SimContextState, program:SimProgramState) {
    const { env, refs } = context
    const { prog, vao, unif, elem } = program

    const GL = refs.gl
    const EXTS = refs.exts

    const job = createFuncJob(env)

    // bind vao
    job.code(
        GL, '.useProgram(', job.ref(prog), ');',
        EXTS, `['`, VAO, `']`, '.bindVertexArrayOES(', job.ref(vao), ');',
    )

    // uniform
    for (let i = 0; i < unif.length; i++) {
        const { ux, loc, data, dyn } = unif[i]

        job.code(GL, '.uniform', ux, '(', job.ref(loc))

        const pref = ux.charAt(0)
        const isMat = pref === 'M'
        if (isMat) {
            job.code(',false,', job.ref(data), dyn ? '()' : '', ');')
        } else {
            const dim = +pref
            assert(data.length === dim, 'Mismatch between uniform type and value')
            job.code(',', join(data), ');')
        }
    }

    if (elem.length > 0) {
        const { mode, count, type, offset } = elem[0]
        job.code(GL, '.drawElements(', join([mode, count, type, offset]), ');')
    } else {
        // TODO
    }
    return env.make(job.sew())
}

class SimProgram {
    private _program:SimProgramState

    constructor (
        private _context:SimContextState,
        spec:SimProgramSpec,
    ) {
        const { vert, frag, attrib={}, elem=[], unif={} } = spec

        const context = this._context
        const gl = context.gl
        const program = this._program = programState() as SimProgramState
        program.gl = gl

        // shader
        const vs = shader(gl, gl.VERTEX_SHADER, vert)
        const fs = shader(gl, gl.FRAGMENT_SHADER, frag)
        const prog = program.prog = gl.createProgram() as WebGLProgram
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)

        // attribute must be bound BEFORE linking
        const vaoExt = context.exts[VAO] as OES_vertex_array_object
        const vao = program.vao = vaoExt.createVertexArrayOES() as WebGLVertexArrayObjectOES
        vaoExt.bindVertexArrayOES(vao)

        // process data and extract configuration
        program.attrib = processAttrib(gl, attrib)
        program.elem = processElem(gl, elem)

        for (let i = 0; i < program.attrib.length; i++) {
            const attr = program.attrib[i]
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
            gl.bufferData(gl.ARRAY_BUFFER, attr.data, attr.usage)
            gl.vertexAttribPointer(i, attr.size, attr.type, attr.normalized, attr.stride, attr.offset)
            gl.enableVertexAttribArray(i)
            gl.bindAttribLocation(prog, i, attr.name)
        }

        for (let i = 0; i < program.elem.length; i++) {
            const el = program.elem[i]
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, el.data, el.usage)
        }

        vaoExt.bindVertexArrayOES(null)
        gl.linkProgram(prog)

        const success = gl.getProgramParameter(prog, gl.LINK_STATUS)
        if (!success) {
            const log = gl.getProgramInfoLog(prog) as string
            gl.deleteProgram(prog)
            throw error(log)
        }

        program.unif = processUnif(program, unif)

        this._doDraw = makeDraw(context, program)
    }

    private _doDraw:Function = noop

    public draw (opts?:any) {
        const gl = this._context.gl
        if (gl.isContextLost()) error(`Context was lost`)
        this._doDraw()
    }
}
