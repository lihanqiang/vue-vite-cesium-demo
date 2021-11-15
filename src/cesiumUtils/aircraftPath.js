/* eslint-disable no-mixed-operators */
function getPath(lon, lat) {
  const arr = []
  const r = 0.4
  for (let i = 0; i < 10; i++) {
    arr.push(
      lon + 0.2 + r * Math.sin(2 * Math.PI * i / 9),
      lat + r * Math.cos(2 * Math.PI * i / 9),
      8000
    )
  }
  return arr
}
export default getPath
