const path = require('path')
// https://www.npmjs.com/package/dotenv
require('dotenv').config({
  debug: process.env.DEBUG
})
// https://www.npmjs.com/package/ssh2-sftp-client#sec-1
const Client = require('ssh2-sftp-client')
const setting = require('./public/setting')

const sftp = new Client()
// 连接配置，写在 setting 配置文件
const config = {
  host: setting.SFTP_HOST,
  username: setting.SFTP_USER,
  password: setting.SFTP_PASSWORD,
  port: setting.SFTP_PORT || 22
}

const srcDir = path.join(__dirname, '.', 'dist') // 本地打包目录
const distDir = setting.SFTP_DIST_PATH // 上传到远程的目录
sftp
  .connect(config)
  .then(() => {
    // 监听上传
    sftp.on('upload', (info) => {
      console.log(`\x1B[32muploaded file: ${info.source}\x1B[0m`)
    })
    return sftp.exists(distDir)
  })
  .then((paths) => {
    // 删除远程 dist 目录和目录下的文件
    if (paths === 'd') { // 目录
      return sftp.rmdir(distDir, true)
    }
    if (paths === '-') { // 文件
      return sftp.delete(distDir)
    }
    return paths
  })
  .then(() => {
    // 上传
    return sftp.uploadDir(srcDir, distDir)
  })
  .then(() => {
    console.log('\x1B[36mCongratulations, All dist files uploaded successfully!\x1B[0m')
  })
  .catch((err) => {
    console.warn(`\x1B[31merror: ${err}\x1B[0m`)
  })
  .finally(() => {
    sftp.end()
  })

