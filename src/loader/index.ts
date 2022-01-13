import { assert } from '../util/assert'
import { parseObj } from './obj'

const parsers = {
    '.obj': parseObj,
}

function getExt (path:string) : string {
    const m = path.match(/\.[a-zA-Z0-9]+$/)
    return m ? m[0].toLowerCase() : ''
}

export function loadModel (filepath, vertexProp='vertex', faceProp='face') : Promise<Record<string, any[]>> {
    const ext = getExt(filepath)
    assert(ext !== '', `An extension is required in the file name`)
    assert(ext in parsers, `${ext} format is not supported`)

    let model = {
        [vertexProp]: [],
        [faceProp]: [],
    }

    const url = 'http://127.0.0.1:9966/' + filepath
    return fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
    })
    .then((res) => res.text())
    .then((data) => {
        const parser = parsers[ext]
        const parsed = parser(data, vertexProp, faceProp)
        model[vertexProp] = parsed[vertexProp]
        model[faceProp] = parsed[faceProp]
        return model
    })
}
