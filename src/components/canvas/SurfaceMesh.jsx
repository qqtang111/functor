import { useMemo } from 'react'
import * as THREE from 'three'
import { sample3D } from '../../engine/MathEngine'

export default function SurfaceMesh({ expr, color, range = [-5, 5], wireframe = false, nx = 80, ny = 80, params = {} }) {
  const geo = useMemo(() => {
    const { positions, indices, colors } = sample3D(expr, range, nx, ny, params)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
    return geometry
  }, [expr, range[0], range[1], nx, ny, wireframe, JSON.stringify(params)])

  return (
    <mesh geometry={geo}>
      <meshPhongMaterial
        vertexColors
        side={THREE.DoubleSide}
        shininess={30}
        specular="#222222"
        transparent
        opacity={wireframe ? 0.3 : 0.92}
        wireframe={wireframe}
      />
    </mesh>
  )
}
