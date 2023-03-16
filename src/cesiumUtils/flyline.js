import Cesium from '@/cesiumUtils/cesium'

const entities = []

const lines = [
  {
    start: {
      lon: 113,
      lat: 28
    },
    end: {
      lon: 110,
      lat: 25
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 108,
      lat: 20
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 98,
      lat: 30
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 104,
      lat: 40
    }
  }
]

function generateCurve(startPoint, endPoint) {
  const addPointCartesian = new Cesium.Cartesian3()
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian)
  const midPointCartesian = new Cesium.Cartesian3()
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian) // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian) // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 5 // 将起始点、终点两个坐标点之间的距离除5,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3()
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint) // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint] // 控制点,points.length必须 ≥ 2
  })
  const curvePoints = []
  // eslint-disable-next-line no-plusplus
  for (let i = 1, len = 300; i < len; i++) {
    curvePoints.push(spline.evaluate(i / len)) // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  return curvePoints // 返回曲线上的多个点坐标集合
}

export const setFlyline = (viewer, points = lines) => {
  points.forEach(({ start, end }) => {
    const material = new Cesium.PolylineTrailLinkMaterialProperty(30000, 10)
    const startPoint = Cesium.Cartesian3.fromDegrees(start.lon, start.lat, 0) // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
    const endPoint = Cesium.Cartesian3.fromDegrees(end.lon, end.lat, 0) // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
    entities.push(viewer.entities.add({
      polyline: {
        positions: generateCurve(startPoint, endPoint), // 多个点坐标构成线条路径
        width: 10,
        material
      }
    }))
  })
}

export const flyLineDestroy = (viewer) => {
  if (entities?.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
  }
}

