const gridSize = 20;
const step = 2 / gridSize; // since clip space is [-1, 1]

const triangles = [];
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    // compute quad bounds in clip space
    const x0 = -1 + x * step;
    const x1 = x0 + step;
    const y0 = -1 + y * step;
    const y1 = y0 + step;

    // Top-right triangle
    triangles.push([
      x0, y1, 0, 1,
      x1, y1, 0, 1,
      x1, y0, 0, 1,
    ]);
    triangles.push([
      // Bottom-left triangle
      x1, y0, 0, 1,
      x0, y0, 0, 1,
      x0, y1, 0, 1
    ]);
  }
}

const vertices = new Float32Array(triangles.flat());

const vertexBuffers = [
  {
    attributes: [
      {
        shaderLocation: 0, // position
        offset: 0,
        format: "float32x4",
      },
    ],
    arrayStride: 16, // 16 bytes for position
    stepMode: "vertex",
  },
];

const triCount = triangles.length;

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
  i += 0.02;

  if (i > 360.0) {
    i -= 360.0;
  }

  uniformOffsetView[0] = i;
  render();

  requestAnimationFrame(loop);
}

loop();