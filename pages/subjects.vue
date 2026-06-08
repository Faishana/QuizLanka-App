<template>
  <div>
    <h1 class="mb-4">
      Subjects
    </h1>

    <v-card>
      <v-card-title>
        Subjects

        <v-spacer />

        <v-btn
          color="primary"
          @click="openCreateDialog"
        >
          Add Subject
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="subjects"
        :loading="loading"
      >
        <template #item.color="{ item }">
          <v-chip
            small
            :color="item.color"
            dark
          >
            {{ item.color }}
          </v-chip>
        </template>

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
            x-small
            color="primary"
            class="mr-2"
            @click="viewLessons(item)"
          >
            Lessons
          </v-btn>

          <v-btn
            x-small
            color="warning"
            class="mr-2"
            @click="editSubject(item)"
          >
            Edit
          </v-btn>

          <v-btn
            x-small
            color="error"
            @click="deleteSubject(item)"
          >
            Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Edit Subject' : 'Add Subject' }}
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="form.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
            outlined
          />

          <v-text-field
            v-model="form.name"
            label="Subject Name"
            outlined
          />

          <v-text-field
            v-model="form.color"
            label="Color"
            outlined
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            outlined
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            @click="saveSubject"
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
      dialog: false,
      isEdit: false,

      subjects: [],
      grades: [],

      form: {
        id: null,
        grade_id: null,
        name: '',
        color: '#3B82F6',
        description: ''
      },

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Slug', value: 'slug' },
        { text: 'Color', value: 'color' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadSubjects()
    this.loadGrades()
  },

  methods: {
    async loadSubjects () {
      try {
        this.loading = true

        const response = await this.$axios.get('/subjects')

        this.subjects = response.data.data
      } catch (error) {
        console.error('Failed to load subjects:', error)
      } finally {
        this.loading = false
      }
    },

    async loadGrades () {
      try {
        const response = await this.$axios.get('/grades')

        this.grades = response.data.data
      } catch (error) {
        console.error('Failed to load grades:', error)
      }
    },

    viewLessons (subject) {
      this.$router.push(
        `/lessons?subject=${subject.id}`
      )
    },

    openCreateDialog () {
      this.isEdit = false

      this.form = {
        id: null,
        grade_id: null,
        name: '',
        color: '#3B82F6',
        description: ''
      }

      this.dialog = true
    },

    editSubject (subject) {
      this.isEdit = true

      this.form = {
        ...subject
      }

      this.dialog = true
    },

    async saveSubject () {
      try {
        if (this.isEdit) {
          await this.$axios.put(
            `/subjects/${this.form.id}`,
            this.form
          )
        } else {
          await this.$axios.post(
            '/subjects',
            this.form
          )
        }

        this.dialog = false

        await this.loadSubjects()
      } catch (error) {
        console.error('Failed to save subject:', error)
      }
    },

    async deleteSubject (subject) {
      if (!window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
        return
      }

      try {
        await this.$axios.delete(
          `/subjects/${subject.id}`
        )

        await this.loadSubjects()
      } catch (error) {
        console.error('Failed to delete subject:', error)
      }
    }
  }
}
</script>
