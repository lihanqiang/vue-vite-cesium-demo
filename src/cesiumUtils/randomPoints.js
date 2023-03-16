import Cesium from '@/cesiumUtils/cesium'
import ship0 from '@/assets/ships/ship0.png'
import ship1 from '@/assets/ships/ship1.png'
import ship2 from '@/assets/ships/ship2.png'
import ship3 from '@/assets/ships/ship3.png'
import ship4 from '@/assets/ships/ship4.png'

const images = [
  ship0,
  ship1,
  ship2,
  ship3,
  ship4
]

let labels = []
let billboards = []
let lines = []
let preRender

// 生成点
const generatePos = (count = 2000, center = [25, 20, 0]) => {
  const baseLat = center[0] || 135
  const baseLon = center[1] || 20
  const baseH = center[2] || 0
  const Cartesian3Pos = Array(count).fill('').map(() => {
    const lat = baseLat + Math.random() * 100 - 50
    const lon = baseLon + Math.random() * 100 - 50
    return Cesium.Cartesian3.fromDegrees(lat, lon, baseH)
  })
  return Cartesian3Pos
}

const generateDis = (range = 500) => {
  return Math.random() * range - range
}

const animatePrimitive = (primitive, pos) => {
  const positionScratch = new Cesium.Cartesian3()
  Cesium.Cartesian3.clone(primitive.position, positionScratch)
  Cesium.Cartesian3.add(positionScratch, new Cesium.Cartesian3(...pos), positionScratch)
  primitive.position = positionScratch
}

const getUniqPoints = (lineArr) => {
  const arr = []
  lineArr.forEach((line) => {
    const { from, to } = line
    arr.push(from, to)
  })
  const uniqArr = []
  arr.forEach((line) => {
    if (!uniqArr.find((thisLine) => {
      return thisLine.label.id === line.label.id
    })) {
      uniqArr.push(line)
    }
  })
  return uniqArr
}

// draw line
const drawlinePrimitives = (viewer, lineRelations) => {
  lines = viewer.scene.primitives.add(new Cesium.PolylineCollection())
  lineRelations.forEach(({ from, to }) => {
    lines.add({
      id: `${from.id}-${to.id}`,
      show: true,
      positions: [from.positionOnEllipsoid, to.positionOnEllipsoid],
      width: 1,
      material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
        color: Cesium.Color.CYAN,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: 5
      })
      // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.RED, 3000, 1),
    })
    // uniq points
    const uniqDots = getUniqPoints(lineRelations)
    preRender = viewer.scene.preRender.addEventListener(() => {
      uniqDots.forEach((each) => {
        animatePrimitive(each.billboard, [generateDis(), generateDis()])
        animatePrimitive(each.label, [generateDis(), generateDis()])
        // animatePrimitive(each.circle, pos)
      })
      // eslint-disable-next-line no-underscore-dangle
      lines._polylines.forEach((l) => {
        const splited = l.id.split('-')
        const fromId = splited[0]
        const toId = splited[1]
        // find source target position
        const source = uniqDots.find(({ id }) => `${id}` === fromId)
        const target = uniqDots.find(({ id }) => `${id}` === toId)
        const sourcePos = source.billboard.position
        const targetPos = target.billboard.position
        l.positions = [sourcePos, targetPos]
      })
    })
  })
}

export const randomGeneratePoints = (viewer, count) => {
  const pointPrimitives = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
  const posArr = generatePos(count)
  posArr.forEach((positionOnEllipsoid) => {
    pointPrimitives.add({
      pixelSize: 5,
      color: Cesium.Color.BLUE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 0,
      position: positionOnEllipsoid
    })
  })
}

export const setCircles = (viewer, positionOnEllipsoid, id, startColorOpcity = 0.6, sizeEdge = 100, speed = 1) => {
  const circles = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
  let pixelSize = 1
  const circle = circles.add({
    id: `circle${id}`,
    position: positionOnEllipsoid
  })
  const colorStep = startColorOpcity / sizeEdge
  viewer.scene.preUpdate.addEventListener(() => {
    pixelSize += speed
    if (pixelSize >= sizeEdge) {
      pixelSize = 1
    }
    circle.pixelSize = pixelSize
    circle.color = Cesium.Color.GRAY.withAlpha(startColorOpcity - colorStep * pixelSize)
  })
}
/**
 *
 * @param {Viwer} viewer viewer
 * @param {Number} count points num
 * @param {Number} imgIndex default undefined
 */
export const randomGenerateBillboards = (viewer, count, imgIndex) => {
  const posArr = generatePos(count)
  const facilityHeight = 30
  billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection())
  labels = viewer.scene.primitives.add(new Cesium.LabelCollection())
  const lineRelations = []
  posArr.forEach((positionOnEllipsoid, i) => {
    const name = `ship${i}`
    let ship = images[imgIndex]
    if (imgIndex === undefined) {
      const index = window.parseInt(Math.random() * 5)
      ship = images[index]
    }
    billboards.add({
      id: `billboard_${i}`,
      name,
      image: ship,
      scale: 0.1,
      position: positionOnEllipsoid,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1e10),
      scaleByDistance: new Cesium.NearFarScalar(10000000, 1, 1e9 + 1, 0)
      // pixelOffset: new Cesium.Cartesian2(0.0, -facilityHeight) // 在原位置上偏移，防止叠在一起看不到了
      // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0), // 随着距离改变偏移量
      // translucencyByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.1)// 随着距离改变透明度
    })
    labels.add({
      id: `label_${i}`,
      show: true,
      position: positionOnEllipsoid,
      text: name,
      scale: 1,
      font: '15px Microsoft YaHei',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2.0,
      showBackground: false,
      backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
      backgroundPadding: new Cesium.Cartesian2(7, 5),
      style: Cesium.LabelStyle.FILL,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1e8),
      scaleByDistance: new Cesium.NearFarScalar(10000000, 1, 10000001, 0),
      pixelOffset: new Cesium.Cartesian2(0.0, -facilityHeight) // pixelOffset
      // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0), // change pixelOffset Scale By Distance
      // translucencyByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.1)// change translucency By Distance
    })
    // lines
    if (i < posArr.length && i) {
      if (!lineRelations.length) {
        if (lineRelations.length < 5) {
          lineRelations.push({
            from: {
              id: i - 1,
              billboard: billboards.get(i - 1),
              label: labels.get(i - 1),
              positionOnEllipsoid: posArr[i - 1]
            },
            to: {
              id: i,
              billboard: billboards.get(i),
              label: labels.get(i),
              positionOnEllipsoid
            }
          })
        }
      }
    }
  })
  drawlinePrimitives(viewer, lineRelations)
}

export const destroyBillboard = () => {
  if (preRender) {
    preRender()
  }
  labels.removeAll()
  billboards.removeAll()
  lines.removeAll()
}
