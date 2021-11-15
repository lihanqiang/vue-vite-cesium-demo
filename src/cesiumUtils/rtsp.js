/* eslint-disable no-use-before-define */
import { H5sPlayerCreate } from '@/cesiumUtils/h5splayerhelper'

const conf1 = {
  protocol: 'http:', // 'http:' or 'https:'
  host: window.setting.rtspUrl, // 'localhost:8080'
  rootpath: '/', // '/' or window.location.pathname
  token: 'token1',
  hlsver: 'v1', // v1 is for ts, v2 is for fmp4
  session: 'c1782caf-b670-42d8-ba90-2244d0b0ee83', // session got from login
  autoplay: true
}
let v1
// 实时视频
export const initVedeo = (id) => {
  conf1.videoid = id
  v1 = H5sPlayerCreate(conf1)
  const thisDom = document.querySelector(`#${id}`)
  const parentDom = thisDom.parentNode
  parentDom.onclick = () => {
    toggleVideo(id)
  }
  toggleVideo(id)
}

export const toggleVideo = (id) => {
  const thisDom = document.querySelector(`#${id}`)
  const nextDom = thisDom.nextSibling
  if (thisDom.paused) {
    if (v1 != null) {
      v1.disconnect()
      v1 = null
    }
    v1 = H5sPlayerCreate(conf1)
    v1.connect()
    nextDom.style.display = 'none'
  } else {
    v1.disconnect()
    v1 = null
    thisDom.pause()
    nextDom.style.display = 'block'
  }
}
