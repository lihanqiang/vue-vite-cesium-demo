/**
 * Check platform and OS
(platform.name); // 'Safari'
(platform.version); // '11.1'
(platform.product); // 'iPad'
(platform.manufacturer); // 'Apple'
(platform.layout); // 'WebKit'
(platform.os.family); // 'iOS'
(platform.description);// 'Safari 11.1 on Apple iPad (iOS 11.0)'

*/
import platform from 'platform'

export function H5siOS() {
  const browserName = platform.os.family
  if (/ios/i.test(browserName)) {
    return true
  }
  return false
}

export function H5sChromeBrowser() {
  const browserName = platform.name
  if (/chrome/i.test(browserName)) {
    return true
  }
  return false
}

export function H5sEdgeBrowser() {
  const browserName = platform.name
  if (/edge/i.test(browserName)) {
    return true
  }
  return false
}

export function H5sSafariBrowser() {
  const browserName = platform.name
  console.log(browserName)
  if (/safari/i.test(browserName)) {
    return true
  }
  return false
}

export function H5sAndriodPlatform() {
  const browserName = platform.os.family
  if (/android/i.test(browserName)) {
    return true
  }
  return false
}

/**
 *=================H5Player Create
 *
 */

export function H5sPlayerCreate(conf) {
  let player

  if (H5siOS()) {
    // eslint-disable-next-line no-undef
    player = new H5sPlayerRTC(conf)
  } else {
    // eslint-disable-next-line no-undef
    player = new H5sPlayerWS(conf)
  }
  return player
}

export function GetURLParameter(sParam) {
  const sPageURL = window.location.search.substring(1)
  const sURLVariables = sPageURL.split('&')
  for (let i = 0; i < sURLVariables.length; i++) {
    const sParameterName = sURLVariables[i].split('=')
    if (sParameterName[0] === sParam) {
      return sParameterName[1]
    }
  }
}

export function H5sSnapshot(vid, fileName) {
  const video = vid
  const w = video.videoWidth// video.videoWidth * scaleFactor;
  const h = video.videoHeight// video.videoHeight * scaleFactor;
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, w, h)
  const MIME_TYPE = 'image/png'
  const imgURL = canvas.toDataURL(MIME_TYPE)

  const dlLink = document.createElement('a')
  dlLink.download = fileName
  dlLink.href = imgURL
  dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':')

  document.body.appendChild(dlLink)
  dlLink.click()
  document.body.removeChild(dlLink)
}

