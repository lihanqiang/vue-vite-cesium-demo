import path from 'path';
import { getBaseDir } from 'ee-core/ps';
import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: 'electron-egg',//软件顶部或左上角名称(会被 html中的 title标签覆盖)
      width: 980,//软件窗口宽度
      height: 650,//软件窗口高度
      minWidth: 400,//软件窗口最小宽度
      minHeight: 300,//软件窗口最小高度
      webPreferences: {
        //webSecurity: false, // 如果需要跨域，请打开注释
        contextIsolation: false,// 设置此项为false后，才可在渲染进程中使用electron api
        nodeIntegration: true,// node模块
      },
      frame: true, // 软件窗口是否有边框
      show: false,
      titleBarStyle: "hidden", //设置窗口标题栏样式
      titleBarOverlay: {
          color: '#141135', //eletron按钮背景色
          symbolColor: '#cccccc',
          height: 40
      },
      autoHideMenuBar: true, //隐藏electron菜单栏
      backgroundColor: '#000',
      icon: path.join(getBaseDir(), 'public', 'images', 'logo.ico'),
    },
    logger: {
      level: 'INFO',
      outputJSON: false,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log',
    },
    remote: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/',
    },
    socketServer: {
      enable: true,
      port: 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
      },
      channel: 'socket-channel',
    },
    httpServer: {
      enable: true,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      host: '127.0.0.1',
      port: 7071,
    },
    mainServer: {
      indexPath: '/public/dist/index.html',
    }
  };
};

export default config;