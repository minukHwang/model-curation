import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const threegenerator = (
  item,
  canvas,
  width,
  height,
  direction,
  isRotate,
  guiIsOpen,
  envMap
) => {
  // Scene
  const scene = new THREE.Scene();

  //Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  directionalLight.position.set(0.25, 3, -2.25);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.far = 15;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.normalBias = 0.05;
  scene.add(directionalLight);

  // Canvas size
  const sizes = {
    width: width,
    height: height,
  };

  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = height;
    sizes.height = height;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Camera
  const camera = new THREE.PerspectiveCamera(
    20,
    sizes.width / sizes.height,
    0.1,
    100
  );
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // envMap
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const environmentMap = cubeTextureLoader.load(envMap);
  environmentMap.encoding = THREE.sRGBEncoding;

  const updateAllMaterials = () => {
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMap = environmentMap;
        child.material.envMapIntensity = debugObject.envMapIntensity;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  };

  // Fit in to Canvas
  const zoomFit = (object3D, camera, viewMode, bFront) => {
    const box = new THREE.Box3().setFromObject(object3D);
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    const centerBox = box.getCenter(new THREE.Vector3());
    let offsetX = 0,
      offsetY = 0,
      offsetZ = 0;
    viewMode === "X"
      ? (offsetX = 1)
      : viewMode === "Y"
      ? (offsetY = 1)
      : (offsetZ = 1);
    if (!bFront) {
      offsetX *= -1;
      offsetY *= -1;
      offsetZ *= -1;
    }
    camera.position.set(
      centerBox.x + offsetX,
      centerBox.y + offsetY,
      centerBox.z + offsetZ
    );
    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, centerBox)
      .normalize();
    const position = direction.multiplyScalar(distance).add(centerBox);
    camera.position.copy(position);
    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
    controls.target.set(centerBox.x, centerBox.y, centerBox.z);
  };

  // Importing model
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  let model;

  gltfLoader.load(item, (gltf) => {
    model = gltf.scene;
    scene.add(model);
    zoomFit(model, camera, direction, true);

    updateAllMaterials();
  });

  // Animation
  const animate = () => {
    if (isRotate) {
      if (model) model.rotation.y += 0.01;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(animate);
  };

  animate();

  // Gui
  const debugObject = {};
  const gui = new dat.GUI();

  gui.add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  });

  gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

  debugObject.envMapIntensity = 4;
  gui
    .add(debugObject, "envMapIntensity")
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials);

  gui
    .add(directionalLight, "intensity")
    .min(0)
    .max(10)
    .step(0.001)
    .name("lightIntensity");
  gui
    .add(directionalLight.position, "x")
    .min(-5)
    .max(10)
    .step(0.001)
    .name("lightX");
  gui
    .add(directionalLight.position, "y")
    .min(-5)
    .max(10)
    .step(0.001)
    .name("lightY");
  gui
    .add(directionalLight.position, "z")
    .min(-5)
    .max(10)
    .step(0.001)
    .name("lightZ");

  if (!guiIsOpen) {
    gui.hide();
  }
};

export default threegenerator;
