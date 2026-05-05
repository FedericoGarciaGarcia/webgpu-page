const vertices = new Float32Array([
  // Top-right triangle
 -1,  1, 0, 1,
  1,  1, 0, 1,
  1, -1, 0, 1,
  // Bottom-left triangle
  1, -1, 0, 1,
 -1, -1, 0, 1,
 -1,  1, 0, 1,
]);

const triCount = 2;

const vertexBuffers = [
  {
    attributes: [
      {
        shaderLocation: 0,
        offset: 0,
        format: "float32x4",
      },
    ],
    arrayStride: 16,
    stepMode: "vertex",
  },
];

// "offset" is 1 32bit float (4bytes)
const uniformBufferSize = 4;

const {render, uniformValues} = await Renderer({
  vertices,
  vertexBuffers,
  triCount,
  shaders,
  uniformBufferSize
});

// Create a "view" in f32 for the "offset" uniform so we can update it
// later in the render loop with float values
const kOffsetOffset = 0;
const uniformOffsetView = new Float32Array(uniformValues, kOffsetOffset, 1);

let i=0;

function loop() {
  i += 0.03;

  if (i > 180.0) {
    i -= 180.0;
  }

  uniformOffsetView[0] = i;
  render();

  requestAnimationFrame(loop);
}

loop();