/* eslint-disable no-underscore-dangle */
import Cesium from '@/cesiumUtils/cesium'

const viewPosition = [116.388404, 39.8960601]
let geojson

export const addGeojson = async(viewer) => {
  geojson = await Cesium.GeoJsonDataSource.load('/src/assets/geojson/gugong.geojson', {
    stroke: Cesium.Color.WHITE,
    fill: Cesium.Color.BLUE.withAlpha(0.3), // 注意：颜色必须大写，即不能为blue
    strokeWidth: 5
  })
  viewer.dataSources.add(geojson)
  const entities = geojson.entities.values
  const colorHash = {}
  entities.forEach((entity) => {
    const { name } = entity
    let color = colorHash[name]
    if (!color) {
      color = Cesium.Color.fromCssColorString(entity.properties.color._value || '#fff')
      colorHash[name] = color
    }
    entity.polygon.material = color
    entity.polygon.outline = false
    entity.polygon.extrudedHeight = (entity.properties.height._value || 0) // 高度扩大50倍，便于观察
  })
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      ...viewPosition,
      1000
    ),
    orientation: {
    // 指向
      heading: Cesium.Math.toRadians(0, 0),
      // 视角
      pitch: Cesium.Math.toRadians(-20),
      roll: 0.0
    }
  })
}

export const removeGeojson = (viewer) => {
  if (geojson) {
    viewer.dataSources.remove(geojson)
  }
}
