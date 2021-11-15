/* eslint-disable */
import Cesium from '@/cesiumUtils/cesium'
import img from '@/assets/redLine.png'
export default class PolylineTrailLinkMaterialProperty {
  constructor (duration, d) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._colorSubscription = undefined
    this.duration = duration || 3000
    this._time = (new Date()).getTime()
    this._d = d // speed, larger is faster
    this.isTranslucent = function () {
      return true
    }
    this.conbineProp()
    this.init()
  }
  getType () {
    return 'PolylineTrailLink'
  }
  getValue (time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color)
    result.image = Cesium.Material.PolylineTrailLinkImage
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._d
    return result
  }
  equals (other) {
    return this === other ||
        (other instanceof PolylineTrailLinkMaterialProperty &&
          Cesium.Property.equals(this._color, other._color))
  }
  conbineProp () {
    Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false
        },
        configurable: true
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged
        },
        configurable: true
      }
    })
  }
  init () {
    Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink'
    Cesium.Material.PolylineTrailLinkImage = img
    Cesium.Material.PolylineTrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
      {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;
          vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
          material.alpha = colorImage.a * color.a;
          material.diffuse = (colorImage.rgb+color.rgb)/2.0;
          return material;
      }`
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
      fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
          color: new Cesium.Color(1.0, 1.0, 1.0, 1),
          image: Cesium.Material.PolylineTrailLinkImage,
          time: -20
        },
        source: Cesium.Material.PolylineTrailLinkSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

// eslint-disable-next-line no-new
new PolylineTrailLinkMaterialProperty()
