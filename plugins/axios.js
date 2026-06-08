export default ({ $axios, store }) => {
  $axios.onRequest((config) => {
    const token = store.state.auth.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
