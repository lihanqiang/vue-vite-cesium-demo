import Cesium from '@/cesiumUtils/cesium'
import { deepObjectMerge } from '.'
import { $t } from './i18n'

export default class DrawSatellite {
  /**
     *Creates an instance of DrawSatellite.
     * @param {*} viewer required
     * @param {*} options.lines  lines set, required eg. [104, 30, 100, 105, 30, 101]
     * @param {*} options.conf configuration of model, see defaultConf, optional
     * @memberof DrawSatellite
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.entity = undefined
    this.entity2 = undefined
    this.lines = options.lines
    this.InitLine()
    this.InitRadarArea()
  }

  // route
  InitLine() {
    const defaultConf = {
      id: 'satellite',
      name: 'wxgj',
      // DisplayCondition
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 1000),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.lines),
        width: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.WHITE
        })
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
  }

  /**
   *
   * radar survey area
   * @param {*} position computeFlight return position
   * @memberof Roaming
   */
  InitRadarArea() {
    const position = Cesium.Cartesian3.fromDegrees(...[89, 0, 350000])
    const hpr = new Cesium.HeadingPitchRoll(0, 0.0, 0.0)
    const op = Cesium.Cartesian3.fromDegrees(...[89, 0, 350000])
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(op, hpr)
    this.entity2 = this.viewer.entities.add({
      id: '233',
      name: $t('sat survey area'),
      // position
      position,
      orientation,
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 700000,
        material: Cesium.Color.BLUE.withAlpha(0.1),
        outline: 1,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.1)
      }
    })
    // this.viewer.zoomTo(this.entity2)
  }

  // removeLine
  removeLine() {
    this.viewer.entities.remove(this.entity)
    this.viewer.entities.remove(this.entity2)
  }
}
