<template>
  <v-container
    fill-height
    class="d-flex justify-center align-center"
  >
    <v-card width="400">
      <v-card-title>
        Login
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="email"
          label="Email"
        />

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          block
          @click="login"
        >
          Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {

  layout: 'auth',

  data () {
    return {
      email: '',
      password: ''
    }
  },

  methods: {

    async login () {
      try {
        const res = await this.$axios.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        const token = res.data.token
        const user = res.data.user

        this.$store.commit('auth/SET_TOKEN', token)
        this.$store.commit('auth/SET_USER', user)

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        this.$router.push('/dashboard')
      } catch (error) {
        alert(error.response?.data?.message || 'Login Failed')
      }
    }

  }

}
</script>
