import { OrbitControls } from "./OrbitControls.js";

function main() {
  const container: HTMLDivElement = document.querySelector("#scene-container")!;

  /*
   * camera, scene, light, renderer
   */
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(2, 3, 10);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.append(renderer.domElement);

  // Vertex shader
  const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

  // Fragment shader
  const fragmentShader = `
uniform vec3 bottomLeftColor;
uniform vec3 topLeftColor;
uniform vec3 topRightColor;
uniform vec3 bottomRightColor;
varying vec2 vUv;

// Function to convert from sRGB to linear color space
vec3 sRGBToLinear(vec3 color) {
  return pow(color, vec3(2.2));
}

// Function to convert from linear to sRGB color space
vec3 linearTosRGB(vec3 color) {
  return pow(color, vec3(1.0 / 2.2));
}

void main() {
  // Convert colors from sRGB to linear color space before mixing
  vec3 bottomLeftLinear = sRGBToLinear(bottomLeftColor);
  vec3 topLeftLinear = sRGBToLinear(topLeftColor);
  vec3 topRightLinear = sRGBToLinear(topRightColor);
  vec3 bottomRightLinear = sRGBToLinear(bottomRightColor);
  
  // Interpolate the colors in linear space
  vec3 horizontalGradient = mix(bottomLeftLinear, bottomRightLinear, vUv.x);
  vec3 verticalGradient = mix(topLeftLinear, topRightLinear, vUv.y);
  vec3 gradientColor = mix(horizontalGradient, verticalGradient, 0.5);
  
  // Convert the final color back to sRGB color space
  vec3 finalColor = linearTosRGB(gradientColor);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

  // Shader material
  const material2 = new THREE.ShaderMaterial({
    uniforms: {
      bottomLeftColor: {
        value: new THREE.Color(0xead2fc).convertSRGBToLinear(),
      },
      topLeftColor: { value: new THREE.Color(0xbaf1ce).convertSRGBToLinear() },
      topRightColor: { value: new THREE.Color(0xa4e7fe).convertSRGBToLinear() },
      bottomRightColor: {
        value: new THREE.Color(0xa3e7fa).convertSRGBToLinear(),
      },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  // Plane geometry
  const geometry3 = new THREE.PlaneGeometry(100, 100);
  const plane = new THREE.Mesh(geometry3, material2);
  scene.add(plane);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.3;

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
  }
  render();
}

main();
