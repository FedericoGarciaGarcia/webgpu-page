/**
 * @typedef {Object} Params
 * @property {Float32Array} vertices
 * @property {any} vertexBuffers
 * @property {number} triCount
 * @property {string} shaders
 * @property {number} uniformBufferSize
 * @property {string} [textureSrc]
 */

/**
 * Creates a WebGPU renderer with a group of vertices, a shader, and a uniform.
 * Optionally a texture can be passed. The texture is bound to group(1)
 * @param {Params} params
 */
async function Renderer({vertices, vertexBuffers, triCount, shaders, uniformBufferSize, textureSrc}) {
  // An adapter represents a physical GPU and driver available on your
  // system.
  const adapter = await navigator.gpu.requestAdapter();

  // A logical device is an abstraction via which a single web app
  // can access GPU capabilities. A logical device  is the basis
  // from which a web app accesses all WebGPU functionality.
  const device = await adapter.requestDevice();

  // To make your shader code available to WebGPU, you have to put
  // it inside a GPUShaderModule.
  const shaderModule = device.createShaderModule({
    code: shaders
  });

  // Get the canvas and its context
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("webgpu");

  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "premultiplied",
  });

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength, // make it big enough to store vertices in
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

  const pipelineDescriptor = {
    // "label" is optional but we add one, because if
    // there's an error "label" will be printed out, so
    // it's a lot easier to track the code that had the
    // issue when debugging
    label: 'our-only-pipeline',
    vertex: {
      module: shaderModule,
      // Because there is only one "vertex" function we can
      // omit the "entryPoint"
      // entryPoint: "vertex_main",
      buffers: vertexBuffers,
    },
    fragment: {
      module: shaderModule,
      // entryPoint: "fragment_main",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
    layout: "auto",
  };

  const pipeline = device.createRenderPipeline(pipelineDescriptor);

  // Create buffer for uniforms
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Create a typedarray to hold the values for the uniforms in JavaScript
  const uniformValues = new ArrayBuffer(uniformBufferSize);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: uniformBuffer },
    ],
  });

  let textureBindGroup;
  if (textureSrc) {
    // Load PNG file
    const img = new Image();
    img.src = textureSrc;
    await img.decode();

    const imageBitmap = await createImageBitmap(img);

    const texture = device.createTexture({
      size: [imageBitmap.width, imageBitmap.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Copy image into GPU texture
    device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: texture },
      [imageBitmap.width, imageBitmap.height]
    );

    const sampler = device.createSampler({
      minFilter: 'linear',
      magFilter: 'linear',
      addressModeU: "repeat",
      addressModeV: "repeat",
    });

    textureBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture },
      ],
    });
  }

  const render = () => {
    // Copy the values from JavaScript to the GPU
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    const textureView = context.getCurrentTexture().createView();
    
    // Make a command encoder to start encoding commands.
    const encoder = device.createCommandEncoder();

    // The "renderPassDescriptor" describes which textures we want
    // to draw to and how to use them.
    const renderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
      }],
    };

    // Make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    if (textureSrc) {
      pass.setBindGroup(1, textureBindGroup);
    }
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(triCount * 3); // Call vertex shader 3 times per triangle
    pass.end();

    device.queue.submit([encoder.finish()]);
  }

  return {render, uniformValues}
};