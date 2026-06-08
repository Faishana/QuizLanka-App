<template>
  <v-navigation-drawer
    app
    permanent
  >
    <v-list dense nav>
      <v-list-item to="/" exact>
        <v-list-item-icon>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-list-item-icon>

        <v-list-item-title>
          Dashboard
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/materials">
        <v-list-item-icon>
          <v-icon>mdi-file-pdf-box</v-icon>
        </v-list-item-icon>

        <v-list-item-title>
          Materials
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/questions">
        <v-list-item-icon>
          <v-icon>mdi-help-circle</v-icon>
        </v-list-item-icon>

        <v-list-item-title>
          Questions
        </v-list-item-title>
      </v-list-item>

      <v-divider class="my-2" />

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
    </v-list>
  </v-navigation-drawer>
</template>
