<template>
  <div>
    <h1 class="mb-5">
      Dashboard
    </h1>

    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-card>
          <v-card-text>
            <div class="text-h6">
              Grades
            </div>

            <div class="text-h3 font-weight-bold">
              {{ stats.grades }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-card>
          <v-card-text>
            <div class="text-h6">
              Subjects
            </div>

            <div class="text-h3 font-weight-bold">
              {{ stats.subjects }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-card>
          <v-card-text>
            <div class="text-h6">
              Lessons
            </div>

            <div class="text-h3 font-weight-bold">
              {{ stats.lessons }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-text>
            <div class="text-h6">
              Materials
            </div>

            <div class="text-h3 font-weight-bold">
              {{ stats.materials }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-text>
            <div class="text-h6">
              Questions
            </div>

            <div class="text-h3 font-weight-bold">
              {{ stats.questions }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  middleware: 'auth',

  data () {
    return {
      stats: {
        grades: 0,
        subjects: 0,
        lessons: 0,
        materials: 0,
        questions: 0
      }
    }
  },

  mounted () {
    this.loadDashboard()
  },

  methods: {
    async loadDashboard () {
      try {
        const response = await this.$axios.get(
          '/admin/dashboard'
        )

        this.stats = response.data.stats
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
