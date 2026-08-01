export default ({ store }) => {
  if (!process.client) { return }

  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')

  const user =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user')

  if (token) {
    store.commit('auth/SET_TOKEN', token)
  }

  if (user) {
    store.commit('auth/SET_USER', JSON.parse(user))
  }
}
