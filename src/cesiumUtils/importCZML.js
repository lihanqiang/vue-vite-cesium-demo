import Cesium from '@/cesiumUtils/cesium'

export default class ImportCZML {
  /**
     * Creates an instance of ImportCZML.
     * @param {*} viewer required
     * @memberof ImportCZML
     */
  constructor(viewer, uri) {
    this.viewer = viewer
    this.uri = uri
    this.init()
  }

  /**
   * generate kzml
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
