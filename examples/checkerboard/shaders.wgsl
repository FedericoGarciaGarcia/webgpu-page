struct VertexOut {
  @builtin(position) position : vec4f
}

struct MyUniform {
  offset: f32
}

@group(0) @binding(0) var<uniform> myUniform: MyUniform;

fn hueToRgb(p: f32, q: f32, t: f32) -> f32 {
  var t_adj = t;
  if (t_adj < 0.0) { t_adj += 1.0; }
  if (t_adj > 1.0) { t_adj -= 1.0; }
  if (t_adj < 1.0 / 6.0) { return p + (q - p) * 6.0 * t_adj; }
  if (t_adj < 1.0 / 2.0) { return q; }
  if (t_adj < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t_adj) * 6.0; }
  return p;
}

fn hslToRgb(hsl: vec3<f32>) -> vec3<f32> {
  let h = hsl.x;
  let s = hsl.y;
  let l = hsl.z;
  
  if (s == 0.0) {
    return vec3(l); // achromatic
  }
  
  let q = select(l * (1.0 + s), l + s - l * s, l < 0.5);
  let p = 2.0 * l - q;
  
  return vec3(
    hueToRgb(p, q, h + 1.0 / 3.0),
    hueToRgb(p, q, h),
    hueToRgb(p, q, h - 1.0 / 3.0)
  );
}

fn hsl_to_rgba(h: f32, s: f32, l: f32) -> vec4<f32> {
    // Hue is expected in the range [0.0, 1.0]
    // S and L are expected in the range [0.0, 1.0]
    
    let rgb = saturate(vec3<f32>(
        abs(h * 6.0 - 3.0) - 1.0,
        2.0 - abs(h * 6.0 - 2.0),
        2.0 - abs(h * 6.0 - 4.0)
    ));

    let c = (1.0 - abs(2.0 * l - 1.0)) * s;
    let result = (rgb - 0.5) * c + l;
    
    return vec4<f32>(result, 1.0);
}

@vertex fn vertex_main(@location(0) position: vec4f) -> VertexOut
{
  var output : VertexOut;
  output.position = position;
  return output;
}

@fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
  let o = myUniform.offset;
  let x = sqrt(fragData.position.x);
  let y = sqrt((fragData.position.y+fragData.position.x));
  let xx = f32(u32(x + o) % 2);
  let yy = f32(u32(y + o) % 2);
  let check = abs(xx - yy);
  let shading = 1.0 - min(1, max(0, (fragData.position.x / 1000) * (fragData.position.y / 1000)));
  let l = 0.5 + shading/2;
  
  if (check > 0.5) {
    return hsl_to_rgba(0, 1, l);
  } else {
    return vec4(1, 1, 1, 1);
  }
}