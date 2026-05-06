struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) texCoord : vec2f
}

struct MyUniform {
  gridSize: f32
}

@group(0) @binding(0) var<uniform> myUniform: MyUniform;
@group(1) @binding(0) var _sampler: sampler;
@group(1) @binding(1) var _texture: texture_2d<f32>; 

@vertex fn vertex_main(@location(0) position: vec4f) -> VertexOut
{
  var output : VertexOut;
  output.position = vec4f(
    (position.x / myUniform.gridSize - 0.5) * 2,
    (position.y / myUniform.gridSize - 0.5) * 2,
    position.z,
    position.w
  );
  output.texCoord = position.xy;
  return output;
}

@fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
  let texCoord = vec2f(fragData.texCoord.x, 1.0 - fragData.texCoord.y);
  return textureSample(_texture, _sampler, texCoord);
}