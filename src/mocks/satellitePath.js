function gerateSatelliteLines(lon, lat) {
  const arr = []
  // i的增量不能太大，不然差值器无法把图形如愿画出来
  for (let i = 0; i <= 360; i += 10) {
    arr.push(
      lon + i,
      lat,
      700000
    )
  }
  return arr
}
export default gerateSatelliteLines
