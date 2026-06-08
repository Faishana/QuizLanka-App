export default ({ store }) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  if (token) {
    store.commit('auth/SET_TOKEN', token)
  }

  if (user) {
    store.commit('auth/SET_USER', JSON.parse(user))
  }
}
