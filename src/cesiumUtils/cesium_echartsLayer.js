/* eslint-disable */
import echarts from './importEcharts'
import Cesium from '@/cesiumUtils/cesium'

class RegisterCoordinateSystem {
    constructor(glMap) {
        this._GLMap = glMap;
        this._mapOffset = [0, 0];
        this.radians = Cesium.Math.toRadians(80)
        this.dimensions = ['lng', 'lat'];
    }

    setMapOffset (mapOffset) {
        this._mapOffset = mapOffset;
    }

    getMap () {
        return this._GLMap;
    }

    fixLat (lat) {
        return lat >= 90 ? 89.99999999999999 : lat <= -90 ? -89.99999999999999 : lat
    }

    dataToPoint (coords) {
        let lonlat = [99999, 99999];
        coords[1] = this.fixLat(coords[1]);
        let position = Cesium.Cartesian3.fromDegrees(coords[0], coords[1]);
        if (!position) return lonlat;
        let coordinates = this._GLMap.cartesianToCanvasCoordinates(position);
        if (!coordinates) return lonlat;
        if (this._GLMap.mode === Cesium.SceneMode.SCENE3D) {
            if (Cesium.Cartesian3.angleBetween(this._GLMap.camera.position, position) > this.radians) return !1;
        }
        return [coordinates.x - this._mapOffset[0], coordinates.y - this._mapOffset[1]];
    }

    pointToData (pixel) {
        let mapOffset = this._mapOffset,
            coords = this._bmap.project([pixel[0] + pixel[0], pixel[1] + pixel[1]]);
        return [coords.lng, coords.lat];
    }

    getViewRect () {
        let api = this._api;
        return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
    }

    getRoamTransform () {
        return echarts.matrix.create();
    }

    create (echartModel, api) {
        this._api = api;
        let registerCoordinateSystem;
        echartModel.eachComponent("GLMap", function (seriesModel) {
            let painter = api.getZr().painter;
            if (painter) {
                try {
                    let glMap = echarts.glMap;
                    registerCoordinateSystem = new RegisterCoordinateSystem(glMap, api);
                    registerCoordinateSystem.setMapOffset(seriesModel.__mapOffset || [0, 0]);
                    seriesModel.coordinateSystem = registerCoordinateSystem;
                } catch (error) {
                    console.log(error);
                }
            }
        })
        echartModel.eachSeries(function (series) {
            "GLMap" === series.get("coordinateSystem") && (series.coordinateSystem = registerCoordinateSystem);
        })
    }
}

export class EchartsLayer {
    constructor(viewer, option) {
        this._viewer = viewer;
        this._isRegistered = false;
        this._chartLayer = this._createLayerContainer();
        this.option = option;
        this._chartLayer.setOption(option);
        this.resizeFuc = null
        this.resize()
    }

    _createLayerContainer () {
        let scene = this._viewer.scene;
        let container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0px';
        container.style.left = '0px';
        container.style.right = '0px';
        container.style.bottom = '0px';
        container.style.width = scene.canvas.width + "px";
        container.style.height = scene.canvas.height + "px";
        container.style.pointerEvents = "none";
        this._viewer.container.appendChild(container);
        this._echartsContainer = container;
        echarts.glMap = scene;
        this._register();
        return echarts.init(container);
    }
    _register () {
        if (this._isRegistered) return;
        echarts.registerCoordinateSystem("GLMap", new RegisterCoordinateSystem(echarts.glMap));
        echarts.registerAction({
            type: "GLMapRoam",
            event: "GLMapRoam",
            update: "updateLayout"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
        }, function (e, t) { });
        echarts.extendComponentModel({
            type: "GLMap",
            getBMap: function () {
                return this.__GLMap
            },
            defaultOption: {
                roam: !1
            }
        });
        echarts.extendComponentView({
            type: "GLMap",
            init: function (echartModel, api) {
                this.api = api, echarts.glMap.postRender.addEventListener(this.moveHandler, this);
            },
            moveHandler: function (e, t) {
                this.api.dispatchAction({
                    type: "GLMapRoam"
                })
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            render: function (e, t, i) { },
            dispose: function () {
                echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
            }
        })
        this._isRegistered = true;
    }

    dispose () {
        this._echartsContainer && (this._viewer.container.removeChild(this._echartsContainer), this._echartsContainer = null);
        this._chartLayer && (this._chartLayer.dispose(), this._chartLayer = null);
        this._isRegistered = false;
    }

    destroy () {
        window.removeEventListener('resize', this.resizeFuc)
        this.dispose();
    }

    updateEchartsLayer (option) {
        this._chartLayer && this._chartLayer.setOption(option);
    }

    getMap () {
        return this._viewer;
    }

    getEchartsLayer () {
        return this._chartLayer;
    }

    show () {
        this._echartsContainer && (this._echartsContainer.style.visibility = "visible");
    }

    hide () {
        this._echartsContainer && (this._echartsContainer.style.visibility = "hidden");
    }
    resize () {
        const me = this;
        window.addEventListener('resize', this.resizeFuc = () => {
            const scene = me._viewer.scene;
            me._echartsContainer.style.width = scene.canvas.style.width;
            me._echartsContainer.style.height = scene.canvas.style.height;
            me._chartLayer.resize();
        })
    }
}
