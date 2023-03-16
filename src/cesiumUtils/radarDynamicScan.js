/* eslint-disable */
import * as Cesium from 'cesium'
import { setRadarDynamic } from '@/cesiumUtils/radarDynamic'
import img from '@/assets/blue12.png'
import { $t } from './i18n'

// compute target point postion according to first point position radius and heading
function calcPoints(x1, y1, radius, heading) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1))
  const rx = radius * Math.cos((heading * Math.PI) / 180.0)
  const ry = radius * Math.sin((heading * Math.PI) / 180.0)
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)
  const d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3())
  const c = Cesium.Cartographic.fromCartesian(d)
  const x2 = Cesium.Math.toDegrees(c.longitude)
  const y2 = Cesium.Math.toDegrees(c.latitude)
  return Cesium.Cartesian3.fromDegrees(x2, y2, 365000)
}

// getHeading
function getHeading(pointA, pointB) {
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
  const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
  //heading
  const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
}

function getPitch(pointA, pointB){
  let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  let direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
  Cesium.Cartesian3.normalize(direction, direction);
  return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
}

export const setRadarDynamicScan = (viewer, active) => {
  let lng = 105.1, lat = 31.85,height = 365000
  if (!active) {
    viewer.entities.removeById('radarD1')
    viewer.entities.removeById('radarScanD1')
    viewer.entities.removeById('yuanzhu')
    return
  }
  let heading = 192
  let position2 = Cesium.Cartesian3.fromDegrees(105,31,height)
  viewer.entities.add({
    id: "radarScanD1",
    name: "radarScanD1",
    position: new Cesium.CallbackProperty(() => {return position2}, false),
    cylinder: {
      length: 800000.0,
      topRadius: 50000,
      bottomRadius:200000,
      material:new Cesium.ImageMaterialProperty({
        image:img,
        color:Cesium.Color.WHITE.withAlpha(0.3),
        transparent:true,
      }),
      // Cesium.Color.AQUAMARINE.withAlpha(0.3),
    },
    orientation: new Cesium.CallbackProperty(()=>{
      return Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(105, 31,0),
        new Cesium.HeadingPitchRoll(
          getHeading(Cesium.Cartesian3.fromDegrees(105, 31,0),position2),
          Cesium.Math.toRadians(0),
          Cesium.Math.toRadians(120),
        )
      )
    },false),
  })
  viewer.entities.add({
    id:'yuanzhu',
    // position is at half of cylinder height
    position: Cesium.Cartesian3.fromDegrees(105, 31, 50000),
    cylinder: {
      length: 15000, // length
      topRadius: 4000, // topRadius
      bottomRadius: 4000, // bottomRadius
      material: Cesium.Color.GREEN.withAlpha(0.4),
    },
  })
  setRadarDynamic(viewer, 'radarD1', $t('dynamic radar 1'), [lng, lat, 0])
  // enable animations
  viewer.clock.onTick.addEventListener(onTickcallback1 = () => {
    if(heading<192){
      heading+=0.05
    }
    if(heading<200&&heading>=192){
      heading+=0.08
    }
    if(heading<210&&heading>=200){
      heading+=0.05
    }
    if(heading>=210&&heading<315){
      heading+=0.15
    }
    if(heading>=315&&heading<360){
      heading+=0.25
    }
    if(heading>=0&&heading<110){
      heading+=0.2
    }
    if(heading>=110&&heading<192){
      heading+=0.06
    }
    if(heading>360){
      heading = 0
    }
    position2 = calcPoints(105,31,400000, heading)
  })
}
