import Cesium from '@/cesiumUtils/cesium'

/**
 * tilesetFlow
 * @author Jack
 * @alias TilesetFlow
 * @class
 * @param {Cesium.Viewer} viewer Cesium viewer
 */
export default class TilesetFlow {
  constructor(viewer) {
    this.viewer = viewer
    this.tileset = null
    this.addTileset()
  }

  addTileset() {
    Cesium.ExperimentalFeatures.enableModelExperimental = true
    const tilesets = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      // url or site of tilesets
      url: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/tilesets/buildings/tileset.json`
    }))
    tilesets.readyPromise.then((tileset) => {
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ['true', "color('cyan')"]
          ]
        }
      })
      this.viewer.flyTo(tileset)
    })
    const customShader = new Cesium.CustomShader({
      lightingModel: Cesium.LightingModel.UNLIT,
      fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          float _baseHeight = 0.0; // base height
          float _heightRange = 60.0; // highlight range (_baseHeight to _baseHeight + _heightRange) default 0-60m
          float _glowRange = 300.0; // glow range(height)
            float vtxf_height = fsInput.attributes.positionMC.z-_baseHeight;
            float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
            float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
            material.diffuse*= vec3(vtxf_a12, vtxf_a12, vtxf_a12);
            float vtxf_a13 = fract(czm_frameNumber / 360.0);
            float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
            vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
            float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
            material.diffuse += material.diffuse * (1.0 - vtxf_diff);
        }
        `
    })
    tilesets.customShader = customShader
  }

  clear() {
    if (this.tileset) {
      this.viewer.scene.primitives.remove(this.tileset)
      this.tileset = null
    }
  }
}
