export function escapeStr (s) {
    return "'" + s + "'"
}

function identity (x) { return x }

export function join (arr:ArrayLike<any>, sep=',', transform=identity) : string {
    const out:any[] = []
    for (let i = 0; i < arr.length; i++) {
        out.push(transform(arr[i]))
    }
    return out.join(sep)
}
