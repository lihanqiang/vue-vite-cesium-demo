/**
 * 基础路由
 * @type { *[] }
 */

const constantRouterMap = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/Index.vue'),
    redirect: { name: 'SceneManager' },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue')
      },
      {
        path: '/sceneManager',
        name: 'SceneManager',
        component: () => import('@/views/sceneManager/Index.vue')
      },
      {
        path: '/userManager',
        name: 'UserManager',
        component: () => import('@/views/userManager/Index.vue')
      },
      {
        path: '/:pathMatch(.*)*', // 使用通配符匹配所有路径
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'), // 指向你的404页面组件
        meta: {
          hidden: true // 在菜单中隐藏这个路由
        }
      }
    ]
  },
  {
    path: '/example',
    component: () => import('@/layouts/AppSider.vue'),
    children: [
      {
        path: '/framework',
        name: 'Framework',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'framework' },
        //props: true,
        redirect: { name: 'FrameworkSocketIpc' },
        children: [
          {
            path: '/framework/socket/ipc',
            name: 'FrameworkSocketIpc',
            component: () => import('@/views/framework/socket/Ipc.vue')
          },
          {
            path: '/framework/socket/httpserver',
            name: 'FrameworkSocketHttpServer',
            component: () => import('@/views/framework/socket/HttpServer.vue')
          },
          {
            path: '/framework/socket/socketserver',
            name: 'FrameworkSocketSocketServer',
            component: () => import('@/views/framework/socket/SocketServer.vue')
          }, 
          {
            path: '/framework/sqlitedb/index',
            name: 'FrameworkSqliteDBIndex',
            component: () => import('@/views/framework/sqlitedb/Index.vue')
          },
          {
            path: '/framework/jobs/index',
            name: 'FrameworkJobsIndex',
            component: () => import('@/views/framework/jobs/Index.vue')
          },
          {
            path: '/framework/software/index',
            name: 'FrameworkSoftwareIndex',
            component: () => import('@/views/framework/software/Index.vue')
          },
          {
            path: '/framework/updater/index',
            name: 'FrameworkUpdaterIndex',
            component: () => import('@/views/framework/updater/Index.vue')
          },
        ]  
      },
      {
        path: '/os',
        name: 'Os',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'os' },
        redirect: { name: 'OsFileIndex' },
        children: [
          {
            path: '/os/file/index',
            name: 'OsFileIndex',
            component: () => import('@/views/os/file/Index.vue')
          },
          {
            path: '/os/file/pic',
            name: 'OsFilePic',
            component: () => import('@/views/os/file/Pic.vue')
          },
          {
            path: '/os/window/index',
            name: 'OsWindowIndex',
            component: () => import('@/views/os/window/Index.vue')
          },
          {
            path: '/os/notification/index',
            name: 'OsNotificationIndex',
            component: () => import('@/views/os/notification/Index.vue')
          }
        ]  
      },      
      {
        path: '/effect',
        name: 'Effect',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'effect' },
        redirect: { name: 'EffectLoginIndex' },
        children: [
          {
            path: '/effect/login/index',
            name: 'EffectLoginIndex',
            component: () => import('@/views/effect/login/Index.vue')
          }
        ]  
      },
      {
        path: '/cross',
        name: 'Cross',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'cross' },
        redirect: { name: 'CrossGoIndex' },
        children: [
          {
            path: '/cross/go/index',
            name: 'CrossGoIndex',
            component: () => import('@/views/cross/go/Index.vue')
          },
          {
            path: '/cross/java/index',
            name: 'CrossJavaIndex',
            component: () => import('@/views/cross/java/Index.vue')
          },
          {
            path: '/cross/python/index',
            name: 'CrossPythonIndex',
            component: () => import('@/views/cross/python/Index.vue')
          },
        ]  
      },
    ]
  },
  {
    path: '/special',
    children: [
      {
        path: 'subwindow',
        name: 'SpecialSubwindowIpc',
        component: () => import('@/views/os/subwindow/Ipc.vue')
      },
      {
        path: '/login',
        name: 'SpecialLoginWindow',
        component: () => import('@/views/effect/login/Window.vue')
      },
    ]
  },
]

export default constantRouterMap