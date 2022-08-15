/* eslint-disable no-underscore-dangle */
import Cesium from '@/cesiumUtils/cesium'

const viewPosition = [116.388404, 39.8960601]
let geojson

export const addGeojson = async(viewer) => {
  const url = `${import.meta.env.VITE_BUILD_PATH_PREFIX}/geojson/gugong.geojson`
  geojson = await Cesium.GeoJsonDataSource.load(url, {
    stroke: Cesium.Color.WHITE,
    fill: Cesium.Color.BLUE.withAlpha(0.3),
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
    entity.polygon.extrudedHeight = (entity.properties.height._value || 0)
  })
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      ...viewPosition,
      1000
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0, 0),
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
