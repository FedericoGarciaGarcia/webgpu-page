const vertices = new Float32Array([
  0,    0.5, 0, 1, // position
  0.6,  0,   0, 1, // color
 -0.5, -0.6, 0, 1, // position
  0,    0,   0, 1, // color
  0.5, -0.6, 0, 1, // position
  0,    0,   1, 1, // color
]);

const vertexBuffers = [
  {
    attributes: [
      {
        shaderLocation: 0, // position
        offset: 0,
        format: "float32x4",
      },
      {
        shaderLocation: 1, // color
        offset: 16,
        format: "float32x4",
      },
    ],
    arrayStride: 16 + 16, // 16 bytes for position and 16 bytes
                          // for color for each vertex
    stepMode: "vertex",
  },
];

const triCount = 1;

// "scale" is 1 32bit float (4bytes each)
const uniformBufferSize = 16;

const {render, uniformValues} = await Renderer({
  vertices,
  vertexBuffers,
  shaders,
  triCount,
  uniformBufferSize
});

// Create a "view" in f32 for the "offset" uniform so we can update it
// later in the render loop with float values
const kOffsetOffset = 0;
const uniformOffsetView = new Float32Array(uniformValues, kOffsetOffset, 1);

let i=0;

function loop() {
  i += 0.05;

  if (i > 360.0) {
    i -= 360.0;
  }

  uniformOffsetView[0] = i;
  render();

  requestAnimationFrame(loop);
}

loop();