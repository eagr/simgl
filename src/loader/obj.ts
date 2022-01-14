enum OBJ_DATA_TYPE {
    VERTEX = 'v',
    TEXTURE_VERTEX = 'vt',
    VERTEX_NORMAL = 'vn',

    POINT = 'p',
    LINE = 'l',
    FACE = 'f',
}

function toInt (x) {
    return parseInt(x, 10)
}

export function parseOBJ (raw:string, vp:string, fp:string) : Model {
    const vertices:number[][] = []
    const faces:number[][] = []

    const lines = raw.split('\n')
    for (let i = 0; i < lines.length; i++) {
        const ln = lines[i].split(' ')
        const type = ln.shift()
        switch (type) {
            case OBJ_DATA_TYPE.VERTEX:
                vertices.push(ln.map(parseFloat))
                break
            case OBJ_DATA_TYPE.FACE:
                faces.push(ln.map(toInt))
                break
            default:
                break
        }
    }

    return {
        [vp]: vertices,
        [fp]: faces,
    }
}
