import Cesium from '@/cesiumUtils/cesium'

export default class ImportCZML {
  /**
     *Creates an instance of ImportCZML.
     * @param {*} viewer 需要传入
     * @memberof ImportCZML
     */
  constructor(viewer, uri) {
    this.viewer = viewer
    this.uri = uri
    this.init()
  }

  /**
   * 生成kzml
   */
  init() {
    const { viewer, uri } = this
    viewer.dataSources.add(
      Cesium.CzmlDataSource.load(uri)
    )
  }

  reset() {
    this.viewer.dataSources.removeAll()
  }
}
