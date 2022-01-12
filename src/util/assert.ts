export function error (m:string) {
    throw new Error('[SimGL] ' + m)
}

export function assert (p:boolean, m:string) {
    if (!p) error(m)
}
