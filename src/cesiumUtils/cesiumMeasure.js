/* eslint-disable */
import * as Cesium from 'cesium'

var btnPosition
var btnDistance
var btnArea
var btnClear
/*
 * params: option
 *     option.viewer:required 三维视图
 *     option.target:required 测量工具放置的div的id
 * */
function Measure(option) {
  this.viewer = option.viewer
  this.dom = document.getElementById(option.target)
  this.options = option

  var me = this
  btnPosition = document.createElement('button')
  btnPosition.innerHTML = '测量经、纬、高度'
  btnPosition.onclick = function() {
    if (btnPosition.style.background === '') {
      btnPosition.style.background = '#66b0e5bf'
      btnPosition.style.border = '1px solid #fff'
    } else {
      btnPosition.style.background = ''
      btnPosition.style.border = ''
    }
    me._handlerDestroy()
    if (me.bMeasuring) { return }

    me.bMeasuring = true
    me._measurePointLocation()
  }
  btnPosition.className = 'op-btn'
  this.dom.appendChild(btnPosition)

  btnDistance = document.createElement('button')
  btnDistance.innerHTML = '测量距离'
  btnDistance.onclick = function() {
    if (btnDistance.style.background === '') {
      btnDistance.style.background = '#66b0e5bf'
      btnDistance.style.border = '1px solid #fff'
    } else {
      btnDistance.style.background = ''
      btnDistance.style.border = ''
    }
    me._handlerDestroy()
    if (me.bMeasuring) return

    me.bMeasuring = true
    me._measureLineSpace()
  }
  btnDistance.className = 'op-btn'
  this.dom.appendChild(btnDistance)

  btnArea = document.createElement('button')
  btnArea.innerHTML = '测量面积'
  btnArea.onclick = function() {
    if (btnArea.style.background === '') {
      btnArea.style.background = '#66b0e5bf'
      btnArea.style.border = '1px solid #fff'
    } else {
      btnArea.style.background = ''
      btnArea.style.border = ''
    }
    me._handlerDestroy()
    if (me.bMeasuring) { return }

    me.bMeasuring = true
    me._measureAreaSpace()
  }
  btnArea.className = 'op-btn'
  this.dom.appendChild(btnArea)

  btnClear = document.createElement('button')
  btnClear.innerHTML = '清除结果(右键取消)'
  btnClear.onclick = function() {
    me._handlerDestroy()
    // 删除事先记录的id
    for (var i = 0; i < me.measureIds.length; i++) {
      me.viewer.entities.removeById(me.measureIds[i])
    }
    me.measureIds.length = 0
  }
  btnClear.className = 'op-btn'
  this.dom.appendChild(btnClear)

  this.bMeasuring = false
  this.measureIds = []
}

Measure.prototype._measureFinish = function() {
  this.bMeasuring = false
}
Measure.prototype._handlerDestroy = function() {
  var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene._imageryLayerCollection)
  handler.destroy() // 关闭事件句柄
  handler = undefined
  // 记录测量工具状态
  this._measureFinish()
}

// 获取经纬度
Measure.prototype._measurePointLocation = function() {
  var me = this
  var viewer = this.viewer
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
  handler.setInputAction(function(event) {
    var ray1 = viewer.camera.getPickRay(event.position)
    var cartesian = viewer.scene.globe.pick(ray1, viewer.scene)
    var ellipsoid = viewer.scene.globe.ellipsoid
    // if (!cartesian) {
    //   cartesian = viewer.scene.camera.pickEllipsoid(event.position, ellipsoid)
    // }
    var cartesian3 = new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z)
    var cartographic = ellipsoid.cartesianToCartographic(cartesian3)
    var lng = Cesium.Math.toDegrees(cartographic.longitude)
    var lat = Cesium.Math.toDegrees(cartographic.latitude)
    var height = cartographic.height
    const absLng = Math.abs(lng)
    const absLat = Math.abs(lat)
    const lngs = (lng >= 0 ? absLng.toFixed(2) + 'E' : absLng.toFixed(2) + 'W')
    const lats = (lat >= 0 ? absLat.toFixed(2) + 'N' : absLat.toFixed(2) + 'S')
    // fix without terrain data, show wrong number of height
    height = height >= 0 ? height : 0
    const heightF = height.toFixed(2) + 'm'
    // 在三维场景中添加Label
    const text = `(${lngs}，${lats}，${heightF})`
    var floatingPoint = viewer.entities.add({
      name: '位置点',
      position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text,
        font: '16px sans-serif',
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 1,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20)
      }
    })
    me.measureIds.push(floatingPoint.id)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  handler.setInputAction(function(movement) {
    handler.destroy() // 关闭事件句柄
    handler = undefined
    // 记录测量工具状态
    me._measureFinish()
    me._restoreBtn()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}

// 内部测量距离函数
Measure.prototype._measureLineSpace = function() {
  var me = this
  var viewer = this.viewer
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
  var positions = []
  var poly = null
  var distance = 0
  var cartesian = null
  var floatingPoint
  var labelPt

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (!Cesium.defined(cartesian)) {
      return
    }
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions)
      } else {
        positions.pop()
        positions.push(cartesian)
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.position)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (!Cesium.defined(cartesian)) {
      return
    }

    if (positions.length === 0) {
      positions.push(cartesian)
    }
    positions.push(cartesian)
    // 记录鼠标单击时的节点位置，异步计算贴地距离
    labelPt = positions[positions.length - 1]
    if (positions.length > 2) {
      getSpaceDistance(positions)
    } else if (positions.length === 2) {
      // 在三维场景中添加Label
      floatingPoint = viewer.entities.add({
        name: '空间点',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        }
      })
      me.measureIds.push(floatingPoint.id)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(function(movement) {
    handler.destroy() // 关闭事件句柄
    handler = undefined
    positions.pop() // 最后一个点无效
    if (positions.length === 1) { viewer.entities.remove(floatingPoint) }
    // 记录测量工具状态
    me._measureFinish()
    me._restoreBtn()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  var PolyLinePrimitive = (function() {
    function _(positions) {
      this.options = {
        name: '直线',
        polyline: {
          show: true,
          positions: [],
          material: Cesium.Color.CHARTREUSE,
          width: 2,
          clampToGround: true
        }
      }
      this.positions = positions
      this._init()
    }

    _.prototype._init = function() {
      var _self = this
      var _update = function() {
        return _self.positions
      }
      // 实时更新polyline.positions
      this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
      var addedEntity = viewer.entities.add(this.options)
      me.measureIds.push(addedEntity.id)
    }

    return _
  })()

  // 空间两点距离计算函数
  function getSpaceDistance(positions) {
    // 只计算最后一截，与前面累加
    // 因move和鼠标左击事件，最后两个点坐标重复
    var i = positions.length - 3
    var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
    var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
    getTerrainDistance(point1cartographic, point2cartographic)
  }

  function getTerrainDistance(point1cartographic, point2cartographic) {
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    var cartoPts = [point1cartographic]
    for (var jj = 1000; jj < s; jj += 1000) { // 分段采样计算距离
      var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj)
      cartoPts.push(cartoPt)
    }
    cartoPts.push(point2cartographic)
    // 返回两点之间的距离
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts)
    Cesium.when(promise, function(updatedPositions) {
      // positions height have been updated.
      // updatedPositions is just a reference to positions.
      for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
        var geoD = new Cesium.EllipsoidGeodesic()
        const thisUpdatedPosition = updatedPositions[jj]
        const nextUpdatedPosition = updatedPositions[jj + 1]
        if (!thisUpdatedPosition.height) {
          thisUpdatedPosition.height = 0
        }
        if (!nextUpdatedPosition.height) {
          nextUpdatedPosition.height = 0
        }
        geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1])
        var innerS = geoD.surfaceDistance
        innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height || 0 - updatedPositions[jj].height || 0, 2))
        distance += innerS
      }

      // 在三维场景中添加Label
      var textDisance = distance.toFixed(2) + '米'
      if (distance > 10000) { textDisance = (distance / 1000.0).toFixed(2) + '千米' }
      floatingPoint = viewer.entities.add({
        name: '贴地距离',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: textDisance,
          font: '16px sans-serif',
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 1,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20)
        }
      })
      me.measureIds.push(floatingPoint.id)
    })
  }
}

// 内部测量菲涅尔区函数
Measure.prototype._measureFRCSpace = function() {
  var me = this
  var viewer = this.viewer
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
  var positions = []
  var poly = null
  var distance = 0
  var cartesian = null
  var floatingPoint
  var labelPt

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (!Cesium.defined(cartesian)) {
      return
    }
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions)
      } else {
        positions.pop()
        positions.push(cartesian)
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.position)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (!Cesium.defined(cartesian)) {
      return
    }

    if (positions.length === 0) {
      positions.push(cartesian)
    }
    positions.push(cartesian)
    // 记录鼠标单击时的节点位置，异步计算贴地距离
    labelPt = positions[positions.length - 1]
    if (positions.length > 2) {
      getSpaceDistance(positions)
    } else if (positions.length === 2) {
      // 在三维场景中添加Label
      floatingPoint = viewer.entities.add({
        name: '空间点',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        }
      })
      me.measureIds.push(floatingPoint.id)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(function(movement) {
    handler.destroy() // 关闭事件句柄
    handler = undefined
    positions.pop() // 最后一个点无效
    if (positions.length === 1) { viewer.entities.remove(floatingPoint) }
    // 记录测量工具状态
    me._measureFinish()
    me._restoreBtn()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  var PolyLinePrimitive = (function() {
    function _(positions) {
      this.options = {
        name: '直线',
        polyline: {
          show: true,
          positions: [],
          material: Cesium.Color.CHARTREUSE,
          width: 2,
          clampToGround: true
        }
      }
      this.positions = positions
      this._init()
    }

    _.prototype._init = function() {
      var _self = this
      var _update = function() {
        return _self.positions
      }
      // 实时更新polyline.positions
      this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
      var addedEntity = viewer.entities.add(this.options)
      me.measureIds.push(addedEntity.id)
    }

    return _
  })()

  // 空间两点距离计算函数
  function getSpaceDistance(positions) {
    // 只计算最后一截，与前面累加
    // 因move和鼠标左击事件，最后两个点坐标重复
    var i = positions.length - 3
    var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
    var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
    getTerrainDistance(point1cartographic, point2cartographic)
  }

  function getTerrainDistance(point1cartographic, point2cartographic) {
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    var cartoPts = [point1cartographic]
    for (var jj = 1000; jj < s; jj += 1000) { // 分段采样计算距离
      var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj)
      cartoPts.push(cartoPt)
    }
    cartoPts.push(point2cartographic)
    // 返回两点之间的距离
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts)
    Cesium.when(promise, function(updatedPositions) {
      // positions height have been updated.
      // updatedPositions is just a reference to positions.
      for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
        var geoD = new Cesium.EllipsoidGeodesic()
        geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1])
        var innerS = geoD.surfaceDistance
        innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height - updatedPositions[jj].height, 2))
        distance += innerS
      }

      // 在三维场景中添加Label
      var textDisance = distance.toFixed(2) + '米'
      if (distance > 10000) { textDisance = (distance / 1000.0).toFixed(2) + '千米' }
      floatingPoint = viewer.entities.add({
        name: '贴地距离',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: textDisance,
          font: '16px sans-serif',
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 1,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20)
        }
      })
      me.measureIds.push(floatingPoint.id)
    })
  }
}

// 内部测量面积函数
Measure.prototype._measureAreaSpace = function() {
  var me = this
  var viewer = this.viewer
  // 鼠标事件
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  var positions = []
  var tempPoints = []
  var polygon = null
  var floatingPoint
  var cartesian = null

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (positions.length >= 2) {
      if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(positions)
      } else {
        positions.pop()
        positions.push(cartesian)
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.position)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (positions.length === 0) {
      positions.push(cartesian.clone())
    }
    // positions.pop();
    positions.push(cartesian)
    // 在三维场景中添加点
    var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1])
    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    var heightString = cartographic.height
    tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString })
    floatingPoint = viewer.entities.add({
      name: '多边形点',
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    me.measureIds.push(floatingPoint.id)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(function(movement) {
    handler.destroy()
    positions.pop()
    if (positions.length === 1) {
      viewer.entities.remove(floatingPoint)
      return
    }
    if (positions.length === 2) {
      const len = me.measureIds.length
      const lastFrontPointIdArr = me.measureIds.slice(len - 3, len - 2)
      if (lastFrontPointIdArr.length) {
        viewer.entities.removeById(lastFrontPointIdArr[0])
      }
      viewer.entities.remove(floatingPoint)
      return
    }
    // 记录测量工具状态
    me._measureFinish()

    var textArea = getArea(tempPoints) + '平方千米'
    floatingPoint = viewer.entities.add({
      name: '测量面积',
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: '16px sans-serif',
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 1,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    me.measureIds.push(floatingPoint.id)
    me._restoreBtn()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  var radiansPerDegree = Math.PI / 180.0// 角度转化为弧度(rad)
  var degreesPerRadian = 180.0 / Math.PI// 弧度转化为角度

  // 计算多边形面积
  function getArea(points) {
    var res = 0
    // 拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
      var j = (i + 1) % points.length
      var k = (i + 2) % points.length
      var totalAngle = Angle(points[i], points[j], points[k])

      var dis_temp1 = distance(positions[i], positions[j])
      var dis_temp2 = distance(positions[j], positions[k])
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
    }

    return (res / 1000000.0).toFixed(4)
  }

  /* 角度*/
  function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1)
    var bearing23 = Bearing(p2, p3)
    var angle = bearing21 - bearing23
    if (angle < 0) {
      angle += 360
    }
    return angle
  }
  /* 方向*/
  function Bearing(from, to) {
    var lat1 = from.lat * radiansPerDegree
    var lon1 = from.lon * radiansPerDegree
    var lat2 = to.lat * radiansPerDegree
    var lon2 = to.lon * radiansPerDegree
    var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
    if (angle < 0) {
      angle += Math.PI * 2.0
    }
    angle = angle * degreesPerRadian // 角度
    return angle
  }

  var PolygonPrimitive = (function() {
    function _(positions) {
      this.options = {
        name: '多边形面积',
        polygon: {
          hierarchy: [],
          // perPositionHeight : true,
          material: Cesium.Color.GREEN.withAlpha(0.5)
          // heightReference:20000
        }
      }

      this.hierarchy = { positions }
      this._init()
    }

    _.prototype._init = function() {
      var _self = this
      var _update = function() {
        return _self.hierarchy
      }
      // 实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
      var addedEntity = viewer.entities.add(this.options)
      me.measureIds.push(addedEntity.id)
    }

    return _
  })()

  function distance(point1, point2) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1)
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2)
    /** 根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    // 返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
    return s
  }
}

// 内部测量扇形面积函数
Measure.prototype._measureSectorSpace = function() {
  var me = this
  var viewer = this.viewer
  // 鼠标事件
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  var positions = []
  var tempPoints = []
  var polygon = null
  var floatingPoint
  var cartesian = null

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (positions.length >= 2) {
      if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(positions)
      } else {
        positions.pop()
        positions.push(cartesian)
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(function(movement) {
    const ray = viewer.camera.getPickRay(movement.position)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    if (positions.length === 0) {
      positions.push(cartesian.clone())
    }
    // positions.pop();
    positions.push(cartesian)
    // 在三维场景中添加点
    var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1])
    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    var heightString = cartographic.height
    tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString })
    var headings = Cesium.Math.toRadians(90)
    floatingPoint = viewer.entities.add({
      name: '扇形点',
      position: positions[positions.length - 1],
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(positions[positions.length - 1]),
        new Cesium.HeadingPitchRoll(headings, 0, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0),
        innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
        minimumClock: Cesium.Math.toRadians(-10),
        maximumClock: Cesium.Math.toRadians(10),
        minimumCone: Cesium.Math.toRadians(80),
        maximumCone: Cesium.Math.toRadians(90),
        material: Cesium.Color.GREEN.withAlpha(0.3),
        outline: true

      }
    })
    me.measureIds.push(floatingPoint.id)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(function(movement) {
    handler.destroy()
    positions.pop()
    if (positions.length === 1) {
      viewer.entities.remove(floatingPoint)
      return
    }
    if (positions.length === 2) {
      const len = me.measureIds.length
      const lastFrontPointIdArr = me.measureIds.slice(len - 3, len - 2)
      if (lastFrontPointIdArr.length) {
        viewer.entities.removeById(lastFrontPointIdArr[0])
      }
      viewer.entities.remove(floatingPoint)
      return
    }
    // 记录测量工具状态
    me._measureFinish()

    var textArea = getArea(tempPoints) + '平方千米'
    floatingPoint = viewer.entities.add({
      name: '扇形',
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: '16px sans-serif',
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 1,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    me.measureIds.push(floatingPoint.id)
    me._restoreBtn()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  var radiansPerDegree = Math.PI / 180.0// 角度转化为弧度(rad)
  var degreesPerRadian = 180.0 / Math.PI// 弧度转化为角度

  // 计算多边形面积
  function getArea(points) {
    var res = 0
    // 拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
      var j = (i + 1) % points.length
      var k = (i + 2) % points.length
      var totalAngle = Angle(points[i], points[j], points[k])

      var dis_temp1 = distance(positions[i], positions[j])
      var dis_temp2 = distance(positions[j], positions[k])
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
    }

    return (res / 1000000.0).toFixed(4)
  }

  /* 角度*/
  function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1)
    var bearing23 = Bearing(p2, p3)
    var angle = bearing21 - bearing23
    if (angle < 0) {
      angle += 360
    }
    return angle
  }
  /* 方向*/
  function Bearing(from, to) {
    var lat1 = from.lat * radiansPerDegree
    var lon1 = from.lon * radiansPerDegree
    var lat2 = to.lat * radiansPerDegree
    var lon2 = to.lon * radiansPerDegree
    var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
    if (angle < 0) {
      angle += Math.PI * 2.0
    }
    angle = angle * degreesPerRadian // 角度
    return angle
  }

  var PolygonPrimitive = (function() {
    function _(positions) {
      this.options = {
        name: '多边形面积',
        polygon: {
          hierarchy: [],
          // perPositionHeight : true,
          material: Cesium.Color.GREEN.withAlpha(0.5)
          // heightReference:20000
        }
      }

      this.hierarchy = { positions }
      this._init()
    }

    _.prototype._init = function() {
      var _self = this
      var _update = function() {
        return _self.hierarchy
      }
      // 实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
      var addedEntity = viewer.entities.add(this.options)
      me.measureIds.push(addedEntity.id)
    }

    return _
  })()

  function distance(point1, point2) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1)
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2)
    /** 根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    // 返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
    return s
  }
}

Measure.prototype._restoreBtn = function() {
  const btns = [btnPosition, btnDistance, btnArea, btnClear]
  btns.forEach(dom => {
    dom.style.background = ''
    dom.style.border = ''
  })
}
export default Measure
