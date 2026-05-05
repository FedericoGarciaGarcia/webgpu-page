const gridSize = 10;

const triangles = [];
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    // compute quad bounds in clip space
    const x0 = x;
    const x1 = x0 + 1;
    const y0 = y;
    const y1 = y0 + 1;

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

// "offset" is a 32bit float (4 bytes)
// "gridSize" is a 32 bit float (4 bytes)
const uniformBufferSize = 4 * 2;

const textureSrc = 'examples/texture/crate.png';

const {render, uniformValues} = await Renderer({
  vertices,
  vertexBuffers,
  shaders,
  triCount,
  uniformBufferSize,
  textureSrc
});

const kOffsetOffset = 0;
const uniformOffsetView = new Float32Array(
  uniformValues,
  kOffsetOffset,
  1
);
const kGridSizeOffset = 4;
const uniformGridSizeView = new Float32Array(
  uniformValues,
  kGridSizeOffset,
  1
);
uniformGridSizeView[0] = gridSize;

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