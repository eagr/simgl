const gl:WebGLRenderingContext = (WebGLRenderingContext || {}) as any

export const extNames = {
    VAO: 'oes_vertex_array_object',
}

export const type2TypedArrayCtor = {
    [gl.BYTE]: Int8Array,
    [gl.UNSIGNED_BYTE]: Uint8Array,
    [gl.SHORT]: Int16Array,
    [gl.UNSIGNED_SHORT]: Uint16Array,
    [gl.INT]: Int32Array,
    [gl.UNSIGNED_INT]: Uint32Array,
    [gl.FLOAT]: Float32Array,
}

export const type2UniformX = {
    [gl.INT]: '1i',
    [gl.FLOAT]: '1f',
    [gl.FLOAT_VEC2]: '2f',
    [gl.FLOAT_VEC3]: '3f',
    [gl.FLOAT_VEC4]: '4f',
    [gl.INT_VEC2]: '2i',
    [gl.INT_VEC3]: '3i',
    [gl.INT_VEC4]: '4i',
    [gl.BOOL]: '1i',
    [gl.BOOL_VEC2]: '2i',
    [gl.BOOL_VEC3]: '3i',
    [gl.BOOL_VEC4]: '4i',
    [gl.FLOAT_MAT2]: 'Matrix2fv',
    [gl.FLOAT_MAT3]: 'Matrix3fv',
    [gl.FLOAT_MAT4]: 'Matrix4fv',
}
