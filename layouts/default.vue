<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list dense nav>
        <v-subheader>
          MAIN
        </v-subheader>

        <v-list-item to="/dashboard">
          <v-list-item-title>
            Dashboard
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-subheader>
          EDUCATION
        </v-subheader>

        <v-list-item to="/grades">
          <v-list-item-title>
            Grades
          </v-list-item-title>
        </v-list-item>

        <v-list-item to="/subjects">
          <v-list-item-title>
            Subjects
          </v-list-item-title>
        </v-list-item>

        <v-list-item to="/lessons">
          <v-list-item-title>
            Lessons
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-subheader>
          CONTENT
        </v-subheader>

        <v-list-item to="/materials">
          <v-list-item-title>
            Materials
          </v-list-item-title>
        </v-list-item>

        <v-list-item to="/questions">
          <v-list-item-title>
            Questions
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-subheader>
          QUIZZES
        </v-subheader>

        <v-list-item to="/quiz-history">
          <v-list-item-title>
            Quiz History
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-toolbar-title>
        QuizLanka AI Admin
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        text
        @click="logout"
      >
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  methods: {
    logout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      this.$store.commit('auth/LOGOUT')

      this.$router.push('/login')
    }
  }
}
</script>
