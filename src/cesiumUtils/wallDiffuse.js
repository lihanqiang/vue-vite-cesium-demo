/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import Cesium from '@/cesiumUtils/cesium'

/*
 * @Description: thanks for Julian, see: https://blog.csdn.net/weixin_45782925/article/details/123334614
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-07 19:50:46
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-07 19:56:30
 */
class WallDiffuseMaterialProperty {
  constructor(options = {}) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this.color = options.color || 'lightblue'
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType() {
    return Cesium.Material.WallDiffuseMaterialType
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color)
    return result
  }

  equals(other) {
    return (this === other ||
          (other instanceof WallDiffuseMaterialProperty &&
              Cesium.Property.equals(this._color, other._color))
    )
  }
}

Object.defineProperties(WallDiffuseMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color')
})

Cesium.WallDiffuseMaterialProperty = WallDiffuseMaterialProperty
Cesium.Material.WallDiffuseMaterialProperty = 'WallDiffuseMaterialProperty'
Cesium.Material.WallDiffuseMaterialType = 'WallDiffuseMaterialType'
Cesium.Material.WallDiffuseMaterialSource =
  `
  uniform vec4 color;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  material.diffuse = color.rgb * 2.0;
  material.alpha = color.a * (1.0-fract(st.t)) * 0.8;
  return material;
  }                                         
  `

Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseMaterialType, {
  fabric: {
    type: Cesium.Material.WallDiffuseMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0)
    },
    source: Cesium.Material.WallDiffuseMaterialSource
  },
  translucent() {
    return true
  }
})

// eslint-disable-next-line no-new
new WallDiffuseMaterialProperty()
