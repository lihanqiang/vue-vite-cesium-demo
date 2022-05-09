import Cesium from '@/cesiumUtils/cesium'

let entities = []
let onTickcallback1
// 根据第一个点 偏移距离 角度 求取第二个点的坐标
function calcPoints(x1 = 105, y1 = 30, radius = 10000, heading = 1, height = 100000) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1))
  const rx = radius * Math.cos((heading * Math.PI) / 180.0)
  const ry = radius * Math.sin((heading * Math.PI) / 180.0)
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)// 变化
  const d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3())
  const c = Cesium.Cartographic.fromCartesian(d)
  const x2 = Cesium.Math.toDegrees(c.longitude)
  const y2 = Cesium.Math.toDegrees(c.latitude)
  return Cesium.Cartesian3.fromDegrees(x2, y2, height)
}

// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA, pointB) {
  // 建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
  // 向量AB
  const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3())
  // 因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
  // AB为世界坐标中的向量
  // 因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3())
  // 归一化
  const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3())
  // heading
  const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
}

// 根据两个坐标点,获取Pitch(俯仰角)
function getPitch(pointA, pointB) {
  const transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
  const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3())
  const direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector)
  Cesium.Cartesian3.normalize(direction, direction)
  // 因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
  return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z)
}

// 获取圆形路径上的点
function getRoutePoints(lng, lat, radius, height) {
  let h = 0
  const points = Array(3600).fill('').map(() => {
    h += 0.1
    return calcPoints(lng, lat, radius, h, height)
  })
  return points
}

export const setTrackPlane = (viewer, active) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104, 32, 2000000),
      duration: 1.6
    })
    const startPoint = Cesium.Cartesian3.fromDegrees(
      103,
      32,
      0
    )
    let endPoint = Cesium.Cartesian3.fromDegrees(
      105,
      32,
      100000
    )
    let heading = 0
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.midpoint(startPoint, endPoint, new Cesium.Cartesian3())
      }, false),
      cylinder: {
        length: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.distance(startPoint, endPoint)
        }, false),
        topRadius: 50000,
        bottomRadius: 0,
        material: new Cesium.WaveMaterialProperty(
          new Cesium.Color(0.1, 1, 0, 0.6),
          10000, // 循环时长
          1.0, // 速度
          10, // 圈数
          0.2 // 环高
        )
      },
      orientation: new Cesium.CallbackProperty(() => {
        const h = getHeading(startPoint, endPoint)
        const hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(90), Cesium.Math.toRadians(90), Cesium.Math.toRadians(0)
        )
        const p = getPitch(startPoint, endPoint)
        hpr.pitch -= p
        hpr.heading += h
        return Cesium.Transforms.headingPitchRollQuaternion(startPoint, hpr)
      }, false)
    }))
    const startPoint2 = Cesium.Cartesian3.fromDegrees(
      105,
      32,
      0
    )
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        return endPoint
      }, false),
      model: {
        uri: `/src/assets/models/CesiumAir.glb`,
        scale: 2,
        minimumPixelSize: 60
      },
      orientation: new Cesium.CallbackProperty(() => {
        const h = getHeading(startPoint2, endPoint)
        const hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(180), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)
        )
        hpr.heading += h
        return Cesium.Transforms.headingPitchRollQuaternion(startPoint2, hpr)
      }, false)
    }))

    viewer.clock.onTick.addEventListener(onTickcallback1 = () => {
      heading += 0.1
      endPoint = calcPoints(105, 32, 200000, heading, 500000)
    })
    const points = getRoutePoints(105, 32, 200000, 500000) // 获取圆路径上的点
    entities.push(viewer.entities.add({
      polyline: {
        positions: points,
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.ORANGE,
          dashLength: 8.0
        })
      }
    }))
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, points.length, new Cesium.JulianDate())
    // 时间段循环
    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = stop.clone()
    viewer.clock.currentTime = start.clone()
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // Loop at the end
    // Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop)
  } else if (entities.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
    viewer.clock.onTick.removeEventListener(onTickcallback1)
    entities = []
  }
}

