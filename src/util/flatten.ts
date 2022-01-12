import { type2TypedArrayCtor } from '../dict'

export function arrayShape (arr) : number[] {
    const shape:number[] = []
    for (let maybeArr = arr; maybeArr.length; maybeArr = maybeArr[0]) {
        shape.push(maybeArr.length)
    }
    return shape
}

function flatten1D (arr, sx, out) {
    for (let i = 0; i < sx; i++) {
        out[i] = arr[i]
    }
}

function flatten2D (arr, sx, sy, out) {
    let p = 0
    for (let i = 0; i < sx; i++) {
        const row = arr[i]
        for (let j = 0; j < sy; j++) {
            out[p++] = row[j]
        }
    }
}

function flatten3D (arr, sx, sy, sz, out) {
    let p = 0
    for (let i = 0; i < sx; i++) {
        const row = arr[i]
        for (let j = 0; j < sy; j++) {
            const col = row[j]
            for (let k = 0; k < sz; k++) {
                out[p++] = col[k]
            }
        }
    }
}

export function flattenArray (arr, shape, type) : TypedArray {
    let sz = 0
    for (let i = 0; i < shape.length; i++) {
        sz = Math.max(sz, 1)
        sz *= shape[i]
    }
    sz = Math.max(sz, 1)

    const Ctor = type2TypedArrayCtor[type]
    const out = new Ctor(sz)

    switch (shape.length) {
        case 0:
            out[0] = arr
            break;
        case 1:
            flatten1D(arr, shape[0], out)
            break
        case 2:
            flatten2D(arr, shape[0], shape[1], out)
            break
        case 3:
            flatten3D(arr, shape[0], shape[1], shape[2], out)
            break
        default:
            break
    }

    return out
}
