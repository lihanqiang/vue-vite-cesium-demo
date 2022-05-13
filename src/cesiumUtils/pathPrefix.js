const isProduction = process.env.NODE_ENV === 'production'

export const pathPrefix = isProduction ? '/vue-vite-cesium-demo' : ''
