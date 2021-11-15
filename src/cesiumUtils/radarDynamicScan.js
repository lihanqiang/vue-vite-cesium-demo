/* eslint-disable */
import * as Cesium from 'cesium'
import { setRadarDynamic } from '@/cesiumUtils/radarDynamic'
import img from '@/assets/blue12.png'
let onTickcallback1

// 根据第一个点 偏移距离 角度 求取第二个点的坐标
function calcPoints(x1, y1, radius, heading) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1))
  const rx = radius * Math.cos((heading * Math.PI) / 180.0)
  const ry = radius * Math.sin((heading * Math.PI) / 180.0)
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)//变化
  const d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3())
  const c = Cesium.Cartographic.fromCartesian(d)
  const x2 = Cesium.Math.toDegrees(c.longitude)
  const y2 = Cesium.Math.toDegrees(c.latitude)
  return Cesium.Cartesian3.fromDegrees(x2, y2, 365000)
}

// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA, pointB) {
  //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  //向量AB
  const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
  //AB为世界坐标中的向量
  //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
  //归一化
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
  //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
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
    position: Cesium.Cartesian3.fromDegrees(105, 31, 50000), //位置在圆柱高度的中间点
    cylinder: {
      length: 15000, //高度
      topRadius: 4000, //顶部半径
      bottomRadius: 4000, //底部半径
      material: Cesium.Color.GREEN.withAlpha(0.4),
    },
  })
  setRadarDynamic(viewer, 'radarD1', '动态雷达1', [lng, lat, 0])
  // 执行动画效果
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
