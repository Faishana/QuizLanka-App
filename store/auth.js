export const state = () => ({
  token: null,
  user: null
})

export const mutations = {

  SET_TOKEN (state, token) {
    state.token = token
  },

  SET_USER (state, user) {
    state.user = user
  },

  LOGOUT (state) {
    state.token = null
    state.user = null
  }

}
