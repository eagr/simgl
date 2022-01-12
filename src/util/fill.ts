export function createFill (el:HTMLCanvasElement|SVGElement) {
    const isSvg = el instanceof SVGElement

    const style = el.style
    style.position = style.position || 'absolute'
    style.top = '0px'
    style.left = '0px'
    style.width = '100%'
    style.height = '100%'

    return function () {
        const parent = el.parentNode
        if (!parent) return console.warn('element is an orphan')

        let w, h
        if (parent === document.body) {
            w = window.innerWidth
            h = window.innerHeight
        } else {
            const rect = el.getBoundingClientRect()
            w = rect.right - rect.left
            h = rect.bottom - rect.top
        }

        const r = window.devicePixelRatio || 1
        w *= r
        h *= r

        // display size and "drawing" size are different things
        if (isSvg) {
            el.setAttribute('width', w + 'px')
            el.setAttribute('height', h + 'px')
        } else {
            el.width = w
            el.height = h
        }
    }
}
