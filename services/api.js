export default $axios => ({

  login (data) {
    return $axios.post('/auth/login', data)
  },

  profile () {
    return $axios.get('/auth/me')
  },

  dashboard () {
    return $axios.get('/dashboard')
  },

  materials () {
    return $axios.get('/materials')
  }

})
