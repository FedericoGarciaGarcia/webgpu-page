struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) @interpolate(flat) vertexPos : vec4f
}

struct MyUniform {
  offset: f32
}

@group(0) @binding(0) var<uniform> myUniform: MyUniform;

@vertex fn vertex_main(@location(0) position: vec4f) -> VertexOut
{
  var output : VertexOut;
  output.position = vec4f(
    position.x + cos(myUniform.offset + position.y + myUniform.offset + position.x) * 0.2,
    position.y,
    position.z,
    position.w
  );
  output.vertexPos = position;
  return output;
}

@fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
  let x = (fragData.vertexPos.x + 1.0) / 2.0;
  return vec4f(x, 0.0, 1.0 - x, 1.0);
}