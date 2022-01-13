type TypedArray =
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Float32Array
    | Float64Array

type SimState = {
    restore:() => void,
    release:() => void,
}

type SimContextState = {
    gl:WebGLRenderingContext,
    exts:Record<string, any>,
    env:any,
    refs:Record<string, string>,
} & SimState

type SimProgramState = {
    gl:WebGLRenderingContext,
    prog:WebGLProgram,
    vao:WebGLVertexArrayObjectOES,
    attrib:Record<string, any>[],
    elem:Record<string, any>[],
    unif:Record<string, any>[],
} & SimState

type SimProgramSpec = {
    vert:string,
    frag:string,
    attrib?:Record<string, any>,
    elem?:any[],
    unif?:Record<string, any>,
}

type Model = Record<string, any[]>
