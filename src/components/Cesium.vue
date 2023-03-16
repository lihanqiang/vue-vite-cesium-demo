<template>
  <div id="cesiumContainer"></div>
  <div id="baseLayerPickerContainer"></div>
  <Panel v-model:visible="dialogVisible" @btnClick="btnClickHandler">
  </Panel>
  <div class="measure-div">
    <div id="measure"></div>
  </div>
  <!-- real-time video streaming -->
  <div class="h5videodiv" :class="{ show: videoShow }">
    <video id="h5sVideo1" class="h5video" autoplay webkit-playsinline playsinline></video>
    <div class="playpause">
      <img :src="play" alt="">
    </div>
  </div>
  <select v-model="langModel">
    <option v-for="l in Object.keys(lang)" :key="l" :value="l">{{ l }}</option>
  </select>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import Cesium from '@/cesiumUtils/cesium'
import play from '@/assets/play.png'
import { initCesium } from '@/cesiumUtils/initCesium'
import '@/cesiumUtils/flowLine'
import '@/cesiumUtils/waveMaterial'
import '@/cesiumUtils/wallDiffuse'
import { setRain, setSnow, setFog } from '@/cesiumUtils/cesiumEffects'
import SatRoaming from '@/cesiumUtils/satelliteRoaming'
import { setScan } from '@/cesiumUtils/scan'
import { setFlyline, flyLineDestroy } from '@/cesiumUtils/flyline'
import { setSpreadEllipse, destroy as SpreadDestroy } from '@/cesiumUtils/spreadEllipse'
import { randomGenerateBillboards, destroyBillboard } from '@/cesiumUtils/randomPoints'
import { setEmitter } from '@/cesiumUtils/emitter'
import { setRadarStaticScan } from '@/cesiumUtils/radarStaticScan'
import { setRadarDynamicScan } from '@/cesiumUtils/radarDynamicScan'
import ViewShed from '@/cesiumUtils/ViewShed'
import TilesetFlow from '@/cesiumUtils/tilesetFlow'
import * as paths from '@/assets/paths'
import ImportPlane from '@/cesiumUtils/importPlane'
import DrawLines from '@/cesiumUtils/drawLines'
import { drawLinesAndAirplane, settleBaseRadarCarRadio, destoryDrone } from '@/cesiumUtils/planeRoam'
import { addGeojson, removeGeojson } from '@/cesiumUtils/addGeojson'
import { WallRegularDiffuse, removeWall } from '@/cesiumUtils/wallRegularDiffuse'
import gerateSatelliteLines from '@/mocks/satellitePath'
import { initVedeo, toggleVideo } from '@/cesiumUtils/rtsp'
import { analysisVisible, clearLine } from '@/cesiumUtils/visionAnalysis'
import { setRiverFlood } from '@/cesiumUtils/riverFlood'
import { setRiverDynamic } from '@/cesiumUtils/riverDynamic'
import { setTrackPlane } from '@/cesiumUtils/trackPalne'
import { setWhiteBuild } from '@/cesiumUtils/whiteBuild'
import { addEcharts } from '@/cesiumUtils/addEcharts'
import { langRef, lang } from '@/cesiumUtils/i18n'

import Measure from '@/cesiumUtils/cesiumMeasure'
import Panel from '@/components/Panel.vue'

let sat
let rain
let snow
let fog
let shed
let tileset
let direct
let round
let circle
let measureTool

let viewer3D = null

const addresses = []

const langModel = langRef

const dialogVisible = ref(true)
const videoShow = ref(false)
const clickedDrone = ref(false)

const showMeasure = () => {
  measureTool?.destroy()
  measureTool = new Measure({
    viewer: viewer3D,
    target: 'measure'
  })
}
const caller = (isActive, resolve, reject) => {
  if (isActive) {
    resolve()
  } else {
    reject()
  }
}

const back2Home = () => {
  document.querySelector('.cesium-home-button').click()
}

const setPlanePath = (viewer, arr, pos, addr) => {
  const plane = new ImportPlane(viewer, {
    uri: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/CesiumAir.glb`,
    position: arr,
    addr,
    arrPos: pos,
    maxLength: (arr.length - 1),
    reduce: pos + 1
  })
  const line = new DrawLines(viewer, {
    lines: arr,
    model: plane.entity
  })
  return {
    plane,
    line
  }
}
const setRoutes = (type = 'direct') => {
  const pathArr = paths[type]
  addresses.push(1)
  return setPlanePath(viewer3D, pathArr[0], (addresses.length - 1), addresses)
}

const destroyPlaneLine = (flyObj) => {
  if (flyObj) {
    const { plane, line } = flyObj
    plane.destroy()
    line.removeLine()
  }
}

const destroyOther = () => {
  destroyPlaneLine(direct)
  destroyPlaneLine(round)
  destroyPlaneLine(circle)
  if (clickedDrone.value) {
    videoShow.value = false
    toggleVideo('h5sVideo1')
    destoryDrone(viewer3D)
  }
}

const btnClickHandler = (btn) => {
  const { id, active } = btn
  switch (id) {
    case 'billboard': {
      caller(active, () => {
        randomGenerateBillboards(viewer3D, 10000)
      }, () => {
        destroyBillboard()
        back2Home()
      })
      break
    }
    case 'sat': {
      caller(active, () => {
        back2Home()
        sat = new SatRoaming(viewer3D, {
          uri: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/Satellite.glb`,
          Lines: gerateSatelliteLines(0, 0)
        })
      }, () => {
        sat?.EndRoaming()
      })
      break
    }
    case 'vision': {
      caller(active, () => {
        shed = new ViewShed(viewer3D)
      }, () => {
        back2Home()
        shed.clear()
      })
      break
    }
    case 'tilesetFlow': {
      caller(active, () => {
        tileset = new TilesetFlow(viewer3D)
      }, () => {
        back2Home()
        tileset.clear()
      })
      break
    }
    case 'visionAnalysis': {
      let timer = 0
      caller(active, () => {
        viewer3D.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(99.445, 25.27, 10000),
          orientation: {
            heading: Cesium.Math.toRadians(0, 0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          }
        })
        clearTimeout(timer)
        timer = setTimeout(() => {
          const poss = [[99.44, 25.29, 1651.66], [99.45, 25.20, 1509.06]]
          Array(10).fill('').forEach((any, i) => {
            analysisVisible(viewer3D, [poss[0], [99.45, poss[1][1] + i * 0.01, 1509.06]])
          })
        }, 3000)
      }, () => {
        clearTimeout(timer)
        clearLine(viewer3D)
      })
      break
    }
    case 'geojson': {
      caller(active, () => {
        addGeojson(viewer3D)
      }, () => {
        back2Home()
        removeGeojson(viewer3D)
      })
      break
    }
    case 'spreadWall': {
      // open selection 'geojson' and see 'spreadWall' more clear
      caller(active, () => {
        const viewPosition = [116.390646, 39.9126084]
        viewer3D.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            viewPosition[0], viewPosition[1] - 0.04,
            1000
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0, 0),
            pitch: Cesium.Math.toRadians(-20),
            roll: 0.0
          }
        })
        WallRegularDiffuse({
          viewer: viewer3D,
          center: viewPosition,
          radius: 400.0,
          edge: 50,
          height: 50.0,
          speed: 15,
          minRidus: 100
        })
      }, () => {
        back2Home()
        removeWall(viewer3D)
      })
      break
    }
    case 'terrain': {
      if (active) {
        viewer3D.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(99.5, 25.2, 10000),
          orientation: {
            heading: Cesium.Math.toRadians(0, 0),
            pitch: Cesium.Math.toRadians(-25),
            roll: 0.0
          }
        })
      } else {
        back2Home()
      }
      break
    }
    case 'direct': {
      destroyOther()
      caller(active, () => {
        direct = setRoutes('direct')
      }, () => {
        back2Home()
      })
      break
    }
    case 'round': {
      destroyOther()
      caller(active, () => {
        round = setRoutes('round')
      }, () => {
        back2Home()
      })
      break
    }
    case 'circle': {
      destroyOther()
      caller(active, () => {
        circle = setRoutes('circle')
      }, () => {
        back2Home()
      })
      break
    }
    case 'drone': {
      caller(active, () => {
        destroyOther()
        settleBaseRadarCarRadio(viewer3D)
        drawLinesAndAirplane(viewer3D)
        initVedeo('h5sVideo1')
        videoShow.value = !videoShow.value
        clickedDrone.value = true
      }, () => {
        destroyOther()
        back2Home()
      })
      break
    }
    case 'scan': {
      back2Home()
      setScan(viewer3D, !active)
      break
    }
    case 'rain': {
      caller(active, () => {
        rain = setRain(viewer3D)
      }, () => {
        viewer3D?.scene?.postProcessStages.remove(rain.rainStage)
      })
      break
    }
    case 'snow': {
      caller(active, () => {
        snow = setSnow(viewer3D)
      }, () => {
        viewer3D?.scene?.postProcessStages.remove(snow.snowStage)
      })
      break
    }
    case 'fog': {
      caller(active, () => {
        fog = setFog(viewer3D)
      }, () => {
        viewer3D?.scene?.postProcessStages.remove(fog.fogStage)
      })
      break
    }
    case 'flyline': {
      if (active) {
        back2Home()
        setFlyline(viewer3D)
      } else {
        flyLineDestroy(viewer3D)
      }
      break
    }
    case 'spreadEllipse': {
      if (active) {
        back2Home()
        setSpreadEllipse(viewer3D)
      } else {
        SpreadDestroy(viewer3D)
      }
      break
    }
    case 'radarStatic': {
      back2Home()
      setRadarStaticScan(viewer3D, active)
      setEmitter(viewer3D, active)
      break
    }
    case 'radarDynamic': {
      back2Home()
      setRadarDynamicScan(viewer3D, active)
      break
    }
    case 'riverFlood': {
      back2Home()
      setRiverFlood(viewer3D, active)
      break
    }
    case 'riverDynamic': {
      back2Home()
      setRiverDynamic(viewer3D, active)
      break
    }
    case 'trackPlane': {
      back2Home()
      setTrackPlane(viewer3D, active)
      break
    }
    case 'whiteBuild': {
      setWhiteBuild(viewer3D, active)
      break
    }
    case 'addEcharts': {
      addEcharts(viewer3D, active)
      break
    }
    default: break
  }
}

onMounted(() => {
  setTimeout(() => {
    viewer3D = initCesium('3d')
    showMeasure()
  })
})
</script>
<style scoped lang="scss">
#cesiumContainer {
  width: 100%;
  height: 100%;
}
#baseLayerPickerContainer {
  position: fixed;
  right: 80px;
  top: 5px;
}
.h5videodiv {
  position: fixed;
  left: 10px;
  top: 10px;
  width: 200px;
  background-color: #000000;
  transform: translateX(-300px);
  transition: all 0.3s ease-in-out;
  &.show {
    transform: translateX(0);
  }
  video{
    width: 100%;
    height: 100%;
  }
  .playpause {
    position: absolute;
    left: calc(50% - 10px);
    top: calc(50% - 10px);
    img{
      cursor: pointer;
      width: 20px;
    }
  }
}
</style>
<style lang="scss">
.measure-div{
  position: absolute;
  right: 181px;
  top: 7px;
  z-index: 1;
  .op-btn{
    line-height: 32px;
    outline: none;
    border: 1px solid #303336;
    background-color: #303336;
    padding: 0 5px;
    color: #fff;
    font-size: 12px;
    border-radius: 2px;
    margin-right: 5px;
    cursor: pointer;
    &:hover{
      background: #48b;
      border-color: #aef;
    }
  }
}
select {
  position: fixed;
  right: 120px;
  top: 7px;
  z-index: 1;
  width: 60px;
  height: 32px;
  border-radius: 4px;
  background: #303336;
  border: 1px solid #444;
  color: #edffff;
  cursor: pointer;
  &:hover {
    background: #48b;
    border-color: #aef;
    box-shadow: 0 0 8px #fff;
  }
  &:focus-visible {
    outline: 0;
  }
}
</style>
