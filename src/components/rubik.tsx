import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import TWEEN from '../utils/tween.esm.js'
const Rubik = () => {
  const threeRef = useRef<any>()
  const [currentBuffer, setCurrentBuffer] = useState(0)
  const Scene = useRef(new THREE.Scene()).current;
  const Camera = useRef(new THREE.PerspectiveCamera()).current;
  const Renderer = useRef(new THREE.WebGLRenderer({ antialias: true })).current;
  const Controls = useRef(new OrbitControls(Camera, Renderer.domElement))

  let PointGeometry = useRef<any>().current
  const Floor = useRef<any>()
  const Meshs = useRef<any[]>([]).current
  const Lights = useRef<any[]>([]).current
  const amimationFrame = useRef<any>()
  const linePositions = useRef<any>([]).current
  const lineColors = useRef<any>([]).current
  const isDown = useRef<boolean>(false)
  const PI = useRef(15)
  const R = useRef(90)
  const bufArray = useRef<any>([]).current

  // *********************************************************
  // movement
  const mouseDown = useCallback(() => {
    isDown.current = true
  }, [])

  const mouseUp = useCallback(() => {
    isDown.current = true
  }, [])

  const move = useCallback((event) => {
    if(!isDown.current) return;
    R.current -= event.movementX * 0.2
    const x = PI.current * Math.cos(R.current / 100 * Math.PI)
    const y = Camera.position.y + event.movementY * 0.1
    const z = PI.current * Math.sin(R.current / 100 * Math.PI)
    Camera.position.set(x, y, z)
    Camera.lookAt(0, 0, 0)
  }, [])

  const wheel = useCallback((event) => {
    if(event.deltaY>0) PI.current += 1
    else PI.current -= 1
    const x = PI.current * Math.cos(R.current / 100 * Math.PI)
    const y = Camera.position.y
    const z = PI.current * Math.sin(R.current / 100 * Math.PI)
    Camera.position.set(x, y, z)
    Camera.lookAt(0, 0, 0)
  }, [])
  // *********************************************************

  /**
   * ????????????
   */
  const createFloor = useCallback(() => {
    const lambert = new THREE.MeshLambertMaterial({color: '#fff'})
    const plane = new THREE.PlaneGeometry(60, 60)
    const mesh = new THREE.Mesh(plane, lambert)
    mesh.rotation.x = -90 / 180 * Math.PI
    mesh.position.set(0, -4, 0)
    mesh.receiveShadow = true
    Scene.add(mesh)
    Floor.current = mesh
  }, [])

  /**
   * ???????????????
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
   * ????????????
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
    line.castShadow = true
    Scene.add(line)
    Meshs.push(line)
  }, [])

  /**
   * ??????Lambert????????????
   */
  const createLambert = useCallback(() => {
    const lambert = new THREE.MeshLambertMaterial({ color: 'red'})
    const rect = new THREE.BoxBufferGeometry(2 ,2 ,2)
    const mesh = new THREE.Mesh(rect, lambert)
    mesh.position.set( -4, 0, 0 )
    mesh.castShadow = true
    mesh.receiveShadow = true
    Scene.add(mesh)
    Meshs.push(mesh)
  }, [])

  const createPhong = useCallback(() => {
    const phong = new THREE.MeshPhongMaterial({ color: 'red'})
    const rect = new THREE.BoxBufferGeometry(2, 2, 2)
    const mesh = new THREE.Mesh(rect, phong)
    mesh.position.set(-8, 0, 0)
    Scene.add(mesh)
    Meshs.push(mesh)
  }, [])

  const createLight = useCallback(() => {
    // ????????? -- ?????????
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.7)
    dirLight.position.set(0, 200, 100)
    dirLight.castShadow =true
    dirLight.shadow.camera.top = -10
    dirLight.shadow.camera.bottom = 10
    dirLight.shadow.camera.left = 10
    dirLight.shadow.camera.right = -10
    dirLight.shadow.mapSize.width = 512
    dirLight.shadow.mapSize.height = 512

    // // ????????? -- ??????????????????
    // const ambLight = new THREE.AmbientLight('#ffffff', 0.5)

    // Scene.add(dirLight, ambLight)
    // Lights.push(dirLight, ambLight)

    // ?????????
    // const pointLight = new THREE.PointLight('#ffffff', 1, 15)
    // pointLight.position.set(0, 3, 0)
    Scene.add(dirLight)
    Lights.push(dirLight)

  }, [])

  const transition = useCallback(() => {
    console.log('11', PointGeometry)
    
    for (let i = 0, j =0; i < 26016; i++,j++) {
      const item = Meshs[0].geometry.tween[i]
      if(j >= bufArray[currentBuffer].length) {
        j = 0
      }

      item.to({position: bufArray[currentBuffer][j]}, THREE.MathUtils.randFloat(1000, 4000)).onUpdate((item: any) => {
        PointGeometry.attributes.position.array[i] = item.position
        PointGeometry.attributes.position.needsUpdate = true
      }).start()
    }

    setTimeout(() => {
      setCurrentBuffer(currentBuffer+1)
      transition()
    }, 6000)
  }, [PointGeometry])

  const addBox = useCallback(() => {
    const manager = new THREE.LoadingManager()
    const gltfLoader = new GLTFLoader(manager)
    PointGeometry = new THREE.BufferGeometry()

    manager.onStart = () => {
      console.log('STATR');
    }
    manager.onLoad = () => {
      transition()
    }

    gltfLoader.load('src/glb/boxdots.glb', (gltf) => {
      console.log(gltf);
      // Scene.add(gltf.scene)
      gltf.scene.traverse(child => {
        if(child.type === 'Mesh') {
          console.log('child',child);
          const { array } = child?.geometry.attributes.position
          bufArray.push(array)
          bufArray.push(array)
          bufArray.push(array)
        }
      })
    })
    PointGeometry.tween = []
    const vertices = []
    
    /** ????????????????????? */
    for (let i = 0; i < 26016; i++) {
      const position = THREE.MathUtils.randFloat(-4, 4)
      /** ??????????????????easing */

      PointGeometry.tween.push(new TWEEN.Tween({ position }).easing(TWEEN.Easing.Exponential.In))
      vertices.push(position)
    }

    PointGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))

    const points =new THREE.Points(PointGeometry, new THREE.PointsMaterial({
      // map: new THREE.TextureLoader().lo
      alphaTest: 0.1,
      opacity: 0.5,
      transparent: true,
      depthTest: true,
      size: 0.08,
    }))

    Scene.add(points)
    Meshs.push(points)
  }, [])

  const initThree = useCallback(() => {
    Renderer.setSize(window.innerWidth, window.innerHeight);
    Renderer.shadowMap.enabled = true

    // ????????????
    Camera.aspect = window.innerWidth / window.innerHeight
    Camera.fov = 45
    Camera.near = 1
    Camera.position.set(0 , 10, PI.current)
    Camera.lookAt(0, 0, 0)
    Camera.updateProjectionMatrix()
  }, [Renderer, threeRef])

  const initBackGround = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const gradient = ctx?.createLinearGradient(0, 0, window.innerWidth, 0)
    gradient?.addColorStop(0, '#4e22b7')
    gradient?.addColorStop(1, '#3292ff')
    if(ctx.fillStyle) {
      ctx.fillStyle = gradient as CanvasGradient
      ctx?.fillRect(0, 0, window.innerWidth, window.innerHeight)
    }
    const canvasTexture = new THREE.CanvasTexture(canvas)

    Scene.background = canvasTexture
  }, [])

  // ??????
  const renderScene = useCallback(() => {
    Renderer.render(Scene, Camera);
    Meshs.forEach(item => {
      item.rotation.x += 0.01
      item.rotation.y += 0.01
    })
    TWEEN.update()

    amimationFrame.current = window.requestAnimationFrame(() => renderScene())
  }, [Renderer, Meshs, TWEEN])

  const resizeScene = useCallback(() => {
    Renderer.setSize(window.innerWidth, window.innerHeight);

    // ????????????
    Camera.aspect = window.innerWidth / window.innerHeight
    Camera.fov = 45
    Camera.near = 1
    Camera.position.set(0 , 10, PI.current)
    Camera.lookAt(0, 0, 0)
    Camera.updateProjectionMatrix()
  }, [])

  useEffect(() => {
    threeRef.current.append(Renderer.domElement);
    initThree();
    initBackGround()
    // createLight()
    // createFloor()
    // createLambert();
    // createLine();
    // createRect();
    // createPhong();
    addBox()
    renderScene();

    window.addEventListener('resize', resizeScene, false )

    return () => {
      cancelAnimationFrame(amimationFrame.current)
      Meshs.forEach(item => {
        Scene.remove(item)
        item.geometry.dispose()
        item.material.dispose()
      })
      Lights.forEach(item => {
        Scene.remove(item)
      })
      Renderer.dispose();

      window.removeEventListener('resize', resizeScene, false)

      Floor.current && Scene.remove(Floor.current)
      // Scene.dispose();
    }
  }, [])
  // return <div ref={threeRef} onWheel={wheel} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={move} id="canvas-frame" />;
  return <div ref={threeRef} id="canvas-frame" />;
};

export default Rubik;