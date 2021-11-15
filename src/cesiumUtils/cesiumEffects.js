import Cesium from '@/cesiumUtils/cesium'
import RainEffect from '@/cesiumUtils/importRain'
import SnowEffect from '@/cesiumUtils/importSnow'
import FogEffect from '@/cesiumUtils/importFog'

export const setRain = (viewer) => new RainEffect(viewer, {
  tiltAngle: 0.6, // 倾斜角度
  rainSize: 0.6, // 雨大小
  rainSpeed: 100.0 // 雨速
})

export const setSnow = (viewer) => new SnowEffect(viewer, {
  snowSize: 0.02, // 雪大小 ，默认可不写
  snowSpeed: 60.0 // 雪速，默认可不写
})

export const setFog = (viewer) => new FogEffect(viewer, {
  visibility: 0.2,
  color: new Cesium.Color(0.8, 0.8, 0.8, 0.3)
})
