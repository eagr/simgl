function getLine (s:string, p:number) : string {
    const eol = s.indexOf('\n', p)
    const ln = s.substring(p, eol + 1)
    return ln
}

enum OBJ_DATA_TYPE {
    COMMENT = '#',

    VERTEX = 'v',
    TEXTURE_VERTEX = 'vt',
    VERTEX_NORMAL = 'vn',

    POINT = 'p',
    LINE = 'l',
    FACE = 'f',
}

export function parseObj (data:string, vp:string, fp:string) : any {
    const parsed:Model = {
        [vp]: [],
        [fp]: [],
    }

    let ptr = 0
    const len = data.length
    while (ptr < len) {
        const ln = getLine(data, ptr)
        ptr += ln.length

        const [t, a, b, c] = ln.split(/\s+/)
        switch (t) {
            case OBJ_DATA_TYPE.COMMENT:
                break

            case OBJ_DATA_TYPE.VERTEX:
                parsed[vp].push([+a, +b, +c])
                break

            case OBJ_DATA_TYPE.FACE:
                parsed[fp].push([+a, +b, +c])
                break

            default:
                break
        }
    }

    return parsed
}
