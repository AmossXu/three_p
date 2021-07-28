import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Rubik = () => {
  const threeRef = useRef<any>()
  const Scene = useRef(new THREE.Scene()).current;
  const Camera = useRef(new THREE.PerspectiveCamera()).current;
  const Renderer = useRef(new THREE.WebGLRenderer()).current;
  const Meshs = useRef<any[]>([]).current
  const amimationFrame = useRef<any>()
  const linePositions = useRef<any>([]).current
  const lineColors = useRef<any>([]).current

  /**
   * 创建正方体
   */
  const createRect = useCallback(() => {
    const rect = new THREE.BoxBufferGeometry(2 ,2 ,2)
    const meshBasic = new THREE.MeshBasicMaterial({color: 'red'})
    const mesh = new THREE.Mesh(rect, meshBasic)
    mesh.position.set(0, 0, 0)
    Meshs.push(mesh)
    Scene.add(mesh)
  }, [])

  /**
   * 创建线条
   */
  const createLine = useCallback(() => {
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true
    })
    const geometry = new THREE.BufferGeometry()
    for(let i = 0; i< 100; i++) {
      const x = Math.random() * 2 -1
      const y = Math.random() * 2 -1
      const z = Math.random() * 2 -1
      linePositions.push(x, y, z)
      lineColors.push(Math.random())
      lineColors.push(Math.random())
      lineColors.push(Math.random())
    }
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( linePositions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( lineColors, 3 ) );
    geometry.computeBoundingSphere()
    const line = new THREE.Line(geometry, lineMaterial)
    line.position.set(4,0,0)
    Scene.add(line)
    Meshs.push(line)
  }, [])


  const initThree = useCallback(() => {
    Renderer.setSize(window.innerWidth, window.innerHeight);

    // 相机参数
    Camera.aspect = window.innerWidth / window.innerHeight
    Camera.fov = 45
    Camera.near = 1
    Camera.position.set(0 , 10, 20)
    Camera.lookAt(0, 0, 0)
    Camera.updateProjectionMatrix()
  }, [Renderer, threeRef])

  // 渲染
  const renderScene = useCallback(() => {
    Renderer.render(Scene, Camera);
    Meshs.forEach(item => {
      item.rotation.x += 0.01
      item.rotation.y += 0.01
    })
    amimationFrame.current = window.requestAnimationFrame(() => renderScene())
  }, [Renderer, Meshs])

  useEffect(() => {
    threeRef.current.append(Renderer.domElement);
    initThree();
    createLine();
    createRect();
    renderScene();

    return () => {
      cancelAnimationFrame(amimationFrame.current)
      Meshs.forEach(item => {
        Scene.remove(item)
        item.geometry.dispose()
        item.material.dispose()
      })
      Renderer.dispose();
      // Scene.dispose();
    }
  }, [])

  return <div ref={threeRef} id="canvas-frame" />;
};

export default Rubik;
