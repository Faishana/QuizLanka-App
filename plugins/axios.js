export default ({ $axios, store }) => {
  $axios.onRequest((config) => {
    const token = store.state.auth.token

    console.log('TOKEN =', token)

    if (token) {
      config.headers.common = config.headers.common || {}
      config.headers.common.Authorization = `Bearer ${token}`
    }

    console.log('HEADERS =', config.headers)

    return config
  })
}
