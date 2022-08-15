// white build
import Cesium from '@/cesiumUtils/cesium'

let primitive
let tilesetPrimitive
function loadTilesShader(tileset) {
  tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        ['true', 'rgba(0, 127.5, 255 ,1)']
      ]
    }
  })
  tileset.tileVisible.addEventListener((tile) => {
    const { content } = tile
    const { featuresLength } = content
    for (let i = 0; i < featuresLength; i += 2) {
      const feature = content.getFeature(i)
      const model = feature.content._model
      if (model && model._sourcePrograms && model._rendererResources) {
        Object.keys(model._sourcePrograms).forEach((key) => {
          const program = model._sourcePrograms[key]
          const fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader]
          let v_position = ''
          if (fragmentShader.indexOf(' v_positionEC;') !== -1) {
            v_position = 'v_positionEC'
          } else if (fragmentShader.indexOf(' v_pos;') !== -1) {
            v_position = 'v_pos'
          }
          const color = `vec4(${feature.color.toString()})`

          model._rendererResources.sourceShaders[program.fragmentShader] =
            `
            varying vec3 ${v_position};
            void main(void){
              vec4 position = czm_inverseModelView * vec4(${v_position},1);
              gl_FragColor = ${color}; // color
              gl_FragColor *= vec4(vec3(position.z / 50.0), 1.0);
              float time = fract(czm_frameNumber / 180.0);
              time = abs(time - 0.5) * 2.0;
              float glowRange = 180.0;
              float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
              gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
            }
          `
        })
        model._shouldRegenerateShaders = true
      }
    }
  })
}
export const setWhiteBuild = (viewer, active) => {
  if (active) {
    if (primitive) {
      viewer.zoomTo(
        tilesetPrimitive,
        new Cesium.HeadingPitchRange(
          0.0,
          -0.5,
          tilesetPrimitive.boundingSphere.radius * 2.0
        )
      )
      return
    }
    primitive = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    new Cesium.Cesium3DTileset({
      url: '/city/tileset.json'
    }).readyPromise
      .then((data) => {
        tilesetPrimitive = data
        primitive.add(tilesetPrimitive)
        loadTilesShader(tilesetPrimitive)
        viewer.zoomTo(
          tilesetPrimitive,
          new Cesium.HeadingPitchRange(
            0.0,
            -0.5,
            tilesetPrimitive.boundingSphere.radius * 2.0
          )
        )
      })
  } else if (primitive) {
    primitive.removeAll()
    primitive = null
  }
}

