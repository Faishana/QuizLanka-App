<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1>Grades</h1>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="grades"
        :loading="loading"
      >
        <template #item.is_active="{ item }">
          <v-chip
            small
            :color="item.is_active ? 'success' : 'error'"
            dark
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            small
            color="primary"
            @click="viewSubjects(item)"
          >
            Subjects
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  middleware: 'auth',

  data () {
    return {
      loading: false,

      grades: [],

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Sort Order', value: 'sort_order' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadGrades()
  },

  methods: {
    async loadGrades () {
      try {
        this.loading = true

        const response = await this.$axios.get('/grades')

        this.grades = response.data.data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    viewSubjects (grade) {
      this.$router.push(`/subjects?grade=${grade.id}`)
    }
  }
}
</script>
