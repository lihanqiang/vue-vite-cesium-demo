import Cesium from '@/cesiumUtils/cesium'
import getPath from '@/cesiumUtils/aircraftPath'
import DrawLines from '@/cesiumUtils/drawLinesOld'
import ImportModel from '@/cesiumUtils/importModelOld'
import { $t } from '@/cesiumUtils/i18n'

const CesiumDrone = `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/CesiumDrone.glb`
const FactoryComplex = `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/Factory Complex.glb`
const OfficeBuilding = `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/Office Building.glb`
const radar_dynamic = `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/radar_dynamic.glb`

const baseObj = {}
const radarObj = {}

const viewPosition = [98.5, 25.2]

let planeModel
let traceEntities = []
let thisLineIns

// settle planes and tracks
export const drawLinesAndAirplane = (viewer) => {
  // generate routes
  const arr = getPath(...viewPosition)
  // settle plane at first point
  // eslint-disable-next-line no-use-before-define
  planeModel = importModel(viewer, CesiumDrone, arr.slice(0, 3), {
    id: 'airPlane',
    model: {
      minimumPixelSize: 50,
      runAnimations: true
    }
  })
  const valuesOfRadarObj = Object.values(radarObj)
  traceEntities = valuesOfRadarObj.map((value, i) => {
    // connect between each two point
    // if (i !== valuesOfRadarObj.length - 1) {
    //   const nextEntity = valuesOfRadarObj[i + 1].entity
    //   value.traceTarget(nextEntity)
    // }
    return value.entity
  })
  planeModel.traceTarget(traceEntities)
  // track
  thisLineIns = new DrawLines(viewer, {
    lines: arr,
    showPoint: false,
    model: planeModel.entity
  })
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        ...viewPosition,
        50000
      ),
      orientation: {
        // heading
        heading: Cesium.Math.toRadians(0, 0),
        // pitch
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    })
  }, 500)
}

function importModel(viewer, uri, position, conf, lineConf) {
  return new ImportModel(viewer, {
    uri,
    position,
    conf,
    lineConf
  })
}

// setting radars and nodes
export const settleBaseRadarCarRadio = (viewer) => {
  // eslint-disable-next-line no-use-before-define
  const data = getTargetsData()
  const newData = data.reduce((init, current) => {
    const { children = [] } = current
    if (children.length) {
      init.push(...children)
    }
    return init
  }, [])
  newData.forEach((node) => {
    const baseUri = Math.random() < 0.5 ? FactoryComplex : OfficeBuilding
    if (node.label.includes($t('base'))) {
      baseObj[node.id] = importModel(viewer, baseUri, node.position, {
        id: node.id,
        name: node.label,
        text: node.label,
        pixelOffset: new Cesium.Cartesian2(0, -100),
        model: {
          scale: 1000
        }
      })
    } else if (node.label.includes($t('radar'))) {
      radarObj[node.id] = importModel(viewer, radar_dynamic, node.position, {
        id: node.id,
        name: node.label,
        text: '',
        pixelOffset: new Cesium.Cartesian2(0, -50),
        model: {
          scale: 3
        }
      })
    }
  })
}

function getRandomPosition(pos, r) {
  const random = Math.random()
  const isPlus = random > 0.5
  if (isPlus) {
    return pos + random / r
  }
  return pos - random / r
}

function setBasePosition(data) {
  data.forEach((item) => {
    if (item.position && item.children) {
      item.children.forEach((issue) => {
        const parentPos = item.position
        if (issue.label.includes($t('base'))) {
          issue.position = parentPos
        } else if (issue.label.includes($t('radar'))) {
          issue.position = parentPos.map((l) => {
            return l ? getRandomPosition(l, 10) : l
          })
        }
      })
    }
    if (item && item.children && item.children.length) {
      setBasePosition(item.children)
    }
  })
}

function getTargetsData(basePos = viewPosition) {
  const lon = basePos[0]
  const lat = basePos[1]
  const data = [
    {
      id: 'jd1-1',
      label: '1-1',
      position: [lon - 0.202, lat - 0.12, 0],
      children: [{
        id: 'jd1-1jd',
        label: `1-1${$t('base')}`
      }, {
        id: 'jd1-1ld',
        label: `1-1${$t('radar')}`
      }]
    },
    {
      id: 'jd1-2',
      label: '1-2',
      position: [lon + 0.3342, lat - 0.19, 0],
      children: [{
        id: 'jd1-2jd',
        label: `1-2${$t('base')}`
      }, {
        id: 'jd1-2ld',
        label: `1-2${$t('radar')}`
      }]
    },
    {
      id: 'jd1-3',
      label: '1-3',
      position: [lon + 0.4942, lat - 0.07, 0],
      children: [{
        id: 'jd1-3jd',
        label: `1-3${$t('base')}`
      }, {
        id: 'jd1-3ld',
        label: `1-3${$t('radar')}`
      }]
    },
    {
      id: 'jd1-4',
      label: '1-4',
      position: [lon + 0.3342, lat + 0.45, 0],
      children: [{
        id: 'jd1-4jd',
        label: `1-4${$t('base')}`
      }, {
        id: 'jd1-4ld',
        label: `1-4${$t('radar')}`
      }]
    }
  ]
  setBasePosition(data)
  return data
}

export const destoryDrone = (viewer) => {
  traceEntities.forEach((entity) => {
    viewer.entities.remove(entity)
  })
  Object.values(baseObj).forEach((base) => {
    viewer.entities.remove(base.entity)
  })
  if (thisLineIns) {
    thisLineIns.removeLine()
  }
  if (planeModel?.entity) {
    viewer.entities.remove(planeModel.entity)
    planeModel.destroyWaveAndOnTickListener()
  }
}

