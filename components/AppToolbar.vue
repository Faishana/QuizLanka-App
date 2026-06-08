<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-toolbar-title>
      QuizLanka AI
    </v-toolbar-title>

    <v-spacer />

    <v-btn
      text
      @click="logout"
    >
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {

  methods: {

    logout () {
      localStorage.removeItem('token')

      this.$router.push('/login')
    }
  }
}
</script>
