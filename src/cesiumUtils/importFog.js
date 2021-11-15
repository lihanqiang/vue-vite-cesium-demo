/* eslint-disable */
import Cesium from '@/cesiumUtils/cesium'

export default class FogEffect {
  constructor(viewer, options) {
    if (!viewer) throw new Error('no viewer object!')
    options = options || {}
    this.visibility = Cesium.defaultValue(options.visibility, 0.1)
    this.color = Cesium.defaultValue(options.color,
      new Cesium.Color(0.8, 0.8, 0.8, 0.5))
    this._show = Cesium.defaultValue(options.show, !0)
    this.viewer = viewer
    this.init()
  }

  init() {
    this.fogStage = new Cesium.PostProcessStage({
      name: 'czm_fog',
      fragmentShader: this.fog(),
      uniforms: {
        visibility: () => this.visibility,
        fogColor: () => this.color
      }
    })
    this.viewer.scene.postProcessStages.add(this.fogStage)
  }

  destroy() {
    if (!this.viewer || !this.fogStage) return
    this.viewer.scene.postProcessStages.remove(this.fogStage)
    this.fogStage.destroy()
    delete this.visibility
    delete this.color
    this.fogStage = null
  }

  show(visible) {
    this._show = visible
    this.fogState.enabled = this._show
  }

  fog() {
    // eslint-disable-next-line no-multi-str
    return 'uniform sampler2D colorTexture;\n\
      uniform sampler2D depthTexture;\n\
      uniform float visibility;\n\
      uniform vec4 fogColor;\n\
      varying vec2 v_textureCoordinates; \n\
      void main(void) \n\
      { \n\
         vec4 origcolor = texture2D(colorTexture, v_textureCoordinates); \n\
         float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
         vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates); \n\
         float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
         if (f < 0.0) f = 0.0; \n\
         else if (f > 1.0) f = 1.0; \n\
         gl_FragColor = mix(origcolor, fogColor, f); \n\
      }\n'
  }
}
