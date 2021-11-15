const setting = {
  geoServerBaseUrl: '/geoserver_cobalt/{z}/{x}/{y}.png',
  geoServerTerrainUrl: '/terrain',
  geoserverHost: 'http://192.168.88.228:10000/',
  rtspUrl: 'localhost:8082',
  SFTP_HOST: '192.168.88.228', // eg. 123.12.11.11
  SFTP_PORT: 22, // default 22
  SFTP_USER: 'root', // user
  SFTP_PASSWORD: '123456', // password
  SFTP_DIST_PATH: '../home/nginx_test/html' // relative path
}

if (typeof window === 'object') {
  window.setting = setting
}

if (typeof exports === 'object') {
  module.exports = setting
}
