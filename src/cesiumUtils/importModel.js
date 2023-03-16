import Cesium from '@/cesiumUtils/cesium'

export default class ImportModel {
  /**
     * Creates an instance of ImportModel.
     * @param {*} viewer required
     * @param {*} options.uri model uri, required
     * @param {*} options.position [lon, lat, hei] of model, required
     * @param {*} options.conf config of model, see defaultConf, optional
     * @memberof ImportModel
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.position = options.position
    this.conf = options.conf
    this.InitModel()
  }

  // generate entities
  InitModel() {
    const { viewer } = this
    const {
      id, name, text, scale = 1
    } = this.conf
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...this.position)
    const modelConf = {
      id,
      position: cartesian3,
      model: {
        uri: this.uri,
        scale
      },
      label: {
        position: cartesian3,
        backgroundPadding: new Cesium.Cartesian2(7, 7),
        showBackground: true,
        text,
        name,
        font: '30px sans-serif',
        scale: 0.4,
        fillColor: Cesium.Color.WHITE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(700000, 8000000),
        pixelOffset: new Cesium.Cartesian2(0, -50)
      }
    }
    if (id !== 'sat') {
      modelConf.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(1000, 500000)
    }
    const model = viewer.entities.add(modelConf)
    Cesium.when(model.readyPromise).then((thisModel) => {
      thisModel.activeAnimations.addAll({
        loop: Cesium.ModelAnimationLoop.REPEAT
      })
    })
  }

  /**
   * compute height of point
   * @param {*} text // text
   * @param {*} position // position
   * @memberof ImportModel
   */
  computeHeight(lon = 103, lat = 33.8084) {
    const { viewer } = this
    const positions = Cesium.Cartographic.fromDegrees(lon, lat)
    // eslint-disable-next-line new-cap
    let promise = new Cesium.sampleTerrain(viewer.terrainProvider, 13, [positions])
    promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions)
    Cesium.when(promise, (updatedPositions) => {
    })
  }

  /**
   * add label
   * @param {*} text // text
   * @param {*} position // position
   * @memberof ImportModel
   */
  addPrimitiveLabel(text = '', position) {
    if (!text) {
      return
    }
    const labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection())
    labels.add({
      position: Cesium.Cartesian3.fromDegrees(...position),
      backgroundPadding: new Cesium.Cartesian2(7, 7),
      showBackground: true,
      text,
      font: '30px sans-serif',
      scale: 0.4,
      fillColor: Cesium.Color.WHITE,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000, 500000),
      eyeOffset: Cesium.Cartesian3(1000.0, 0.0, 0.0),
      pixelOffset: new Cesium.Cartesian2(0, -50)
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    })
  }

  /**
   * add lines of two points
   * @param {*} targetPos // postion of endPoint
   * @memberof ImportModel
   */
  addPrimitiveLine(targetPos) {
    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([...this.position, ...targetPos]),
          width: 2
        })
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
          color: Cesium.Color.YELLOW, // line's color
          gapColor: Cesium.Color.TRANSPARENT, // gap color
          dashLength: 5 // dash length
        })
      })
    })
    this.viewer.scene.primitives.add(primitive)
  }
}
