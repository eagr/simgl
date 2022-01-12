import { SimGL } from './gl'
import { createFill } from './util/fill'

let supported:string[] = []

export function init (opts?:{
    canvas?:HTMLCanvasElement,
    extensions?:string[],
}) {
    opts = opts || {}
    const c = opts.canvas || document.createElement('canvas')
    const extensions = Array.from(new Set(
        (opts.extensions || []).map((ext) => ext.toLowerCase()),
    ))

    // WebGL detection
    let gl:WebGLRenderingContext|null = null
    try {
        gl = (
            c.getContext('webgl') ||
            c.getContext('experimental-webgl')
        ) as WebGLRenderingContext
    } catch (_) { }
    if (!gl) throw new Error(`WebGL is not supported in this environment`)

    // extension detection
    if (supported.length === 0) {
        supported = (gl.getSupportedExtensions() as string[]).map((ext) => ext.toLowerCase())
    }
    const unsupported:string[] = []
    for (let i = 0; i < extensions.length; i++) {
        const ext = extensions[i]
        if (supported.indexOf(ext) < 0) {
            unsupported.push(ext)
        }
    }
    if (unsupported.length > 0) {
        throw new Error(`Unsupported extensions: ${unsupported.join(', ')}`)
    }

    // make canvas fill container
    if (!c.parentNode) document.body.appendChild(c)
    createFill(c)()

    return new SimGL(gl, {
        extensions,
    })
}
