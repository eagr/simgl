**WIP**

Writing raw WebGL is extremely tedious. `simgl` is an endeavor to handle that tediousness.

**features**

* generate code based on your input: shaders, attributes, uniforms, etc.
* handle context lost and restored events transparently

**caveats**

* alway use VAOs

## Usage

```ts
import { init } from 'simgl'

const sgl = init()

const mesh = sgl.program({
  vert: `
  precision highp float;
  attribute vec3 position;
  uniform mat4 view, projection;
  void main () {
    gl_Position = projection * view * vec4(position, 1);
  }
  `,
  frag: `
  precision highp float;
  void main () {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  `,
  attrib: {
    position: meshVertexes,
  },
  elem: vertexIndices,
  unif: {
    projection: projectionData,
    view: viewData,
  },
})

function step () {
  sgl.clear({
    depth: 1,
    color: [0, 0, 0, 1],
  })
  mesh.draw()

  rAF(step)
}
rAF(step)
```
