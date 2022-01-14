import { assert } from '../util/assert'
import { getLine } from '../util/misc'

enum PLY_STATE {
    HEADER = 1,
    BODY = 2,
}

export function parsePLY (raw:string, vp:string, fp:string) : Model {
    let nv = 0
    let nf = 0

    let ptr = 0
    let state = PLY_STATE.HEADER
    while (state === PLY_STATE.HEADER) {
        const ln = getLine(raw, ptr)
        ptr += ln.length + 1

        if (ln.indexOf('end_header') >= 0) {
            state = PLY_STATE.BODY
            break
        }

        const header = ln.trim().split(' ')
        const kw = header[0]
        if (kw === 'element') {
            const type = header[1]
            if (type === 'vertex') nv = parseInt(header[2], 10)
            if (type === 'face') nf = parseInt(header[2], 10)
        }
    }

    const body = raw.substring(ptr).split('\n')

    // x y z
    const vertices:number[][] = new Array(nv)
    for (let i = 0; i < nv; i++) {
        const ln = body[i].trim()
        vertices[i] = ln.split(' ').map((x) => parseFloat(x))
    }

    // n v1 ... vn
    const faces:number[][] = new Array(nf)
    for (let i = 0; i < nf; i++) {
        const ln = body[i + nv].trim()
        const f = ln.split(' ').map((x) => parseInt(x, 10))

        const n = f.shift()
        assert(n === f.length, `Invalid face value: ${ln}`)

        faces[i] = f
    }

    return {
        [vp]: vertices,
        [fp]: faces,
    }
}
