<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1>Grades</h1>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        Grades

        <v-spacer />

        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search Grades"
          outlined
          dense
          hide-details
          class="mr-4"
          style="max-width: 300px"
        />

        <v-btn
          color="success"
          @click="openCreateDialog"
        >
          <v-icon left>
            mdi-plus
          </v-icon>

          Add Grade
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="grades"
        :search="search"
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
            class="mr-2"
            @click="viewSubjects(item)"
          >
            Subjects
          </v-btn>

          <v-btn
            small
            color="warning"
            class="mr-2"
            @click="editGrade(item)"
          >
            Edit
          </v-btn>

          <v-btn
            small
            color="error"
            @click="deleteGrade(item)"
          >
            Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="createDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>
          {{ form.id ? 'Edit Grade' : 'Create Grade' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Grade Name"
            outlined
            required
          />

          <v-select
            v-model="form.category"
            :items="categoryOptions"
            label="Category"
            outlined
            required
          />

          <v-text-field
            v-model.number="form.sort_order"
            type="number"
            label="Sort Order"
            outlined
          />

          <v-switch
            v-model="form.is_active"
            label="Active"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="createDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            :loading="saving"
            @click="saveGrade"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  middleware: 'auth',

  data () {
    return {
      loading: false,
      saving: false,
      createDialog: false,

      grades: [],
      search: '',

      categoryOptions: [
        'Primary',
        'O/L',
        'A/L',
        'Government exam'
      ],

      form: {
        id: null,
        name: '',
        category: '',
        sort_order: 0,
        is_active: true
      },

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
        console.error('Failed to load grades:', error)
        alert('Failed to load grades')
      } finally {
        this.loading = false
      }
    },

    viewSubjects (grade) {
      this.$router.push(`/subjects?grade=${grade.id}`)
    },

    openCreateDialog () {
      this.form = {
        id: null,
        name: '',
        category: '',
        sort_order: 0,
        is_active: true
      }
      this.createDialog = true
    },

    editGrade (grade) {
      this.form = {
        id: grade.id,
        name: grade.name,
        category: grade.category,
        sort_order: grade.sort_order,
        is_active: !!grade.is_active
      }
      this.createDialog = true
    },

    async saveGrade () {
      // Validation
      if (!this.form.name || !this.form.name.trim()) {
        alert('Grade name is required')
        return
      }

      if (!this.form.category) {
        alert('Category is required')
        return
      }

      this.saving = true

      try {
        if (this.form.id) {
          await this.$axios.put(
            `/grades/${this.form.id}`,
            this.form
          )
          alert('Grade updated successfully')
        } else {
          await this.$axios.post(
            '/grades',
            this.form
          )
          alert('Grade created successfully')
        }

        this.createDialog = false
        await this.loadGrades()
      } catch (error) {
        console.error('Failed to save grade:', error)

        // Show specific error message if available
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to save grade')
        }
      } finally {
        this.saving = false
      }
    },

    async deleteGrade (grade) {
      if (!window.confirm(`Are you sure you want to delete "${grade.name}"?`)) {
        return
      }

      try {
        await this.$axios.delete(`/grades/${grade.id}`)
        alert('Grade deleted successfully')
        await this.loadGrades()
      } catch (error) {
        console.error('Failed to delete grade:', error)

        // Show specific error message if available (e.g., grade has subjects)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to delete grade')
        }
      }
    }
  }
}
</script>
