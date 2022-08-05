function gerateSatelliteLines(lon, lat) {
  const arr = []
  // The increment of 'i' cannot be too large, otherwise the differentiator cannot draw the graph as desired.
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
