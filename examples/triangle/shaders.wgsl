struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f
}

struct MyUniform {
  scale: f32
}

@group(0) @binding(0) var<uniform> myUniform: MyUniform;

@vertex fn vertex_main(@location(0) position: vec4f,
              @location(1) color: vec4f) -> VertexOut
{
  var output : VertexOut;
  output.position = vec4f(
    position.x + cos(myUniform.scale + position.y) / 3.0,
    position.y + sin(myUniform.scale + position.x) / 3.0,
    position.z,
    position.w
  );
  output.color = color;
  return output;
}

@fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
  let x = f32(i32(fragData.position.x) % 2);
  let y = f32(i32(fragData.position.y) % 2);
  return vec4f(fragData.position.xy * 0.001, 0.0, 1.0);
}