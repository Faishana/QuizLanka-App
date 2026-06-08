<template>
  <div>
    <h1 class="mb-4">
      Lessons
    </h1>

    <v-card>
      <v-card-title>
        Lessons

        <v-spacer />

        <v-btn
          color="primary"
          @click="openCreateDialog"
        >
          Add Lesson
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="lessons"
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
            color="warning"
            class="mr-2"
            @click="editLesson(item)"
          >
            Edit
          </v-btn>

          <v-btn
            small
            color="error"
            @click="deleteLesson(item)"
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
          {{ isEdit ? 'Edit Lesson' : 'Add Lesson' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.title"
            label="Lesson Title"
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
            @click="saveLesson"
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

      lessons: [],

      form: {
        id: null,
        subject_id: null,
        title: '',
        description: ''
      },

      headers: [
        {
          text: 'ID',
          value: 'id'
        },
        {
          text: 'Title',
          value: 'title'
        },
        {
          text: 'Slug',
          value: 'slug'
        },
        {
          text: 'Sort Order',
          value: 'sort_order'
        },
        {
          text: 'Status',
          value: 'is_active'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false
        }
      ]
    }
  },

  mounted () {
    this.loadLessons()
  },

  methods: {
    async loadLessons () {
      try {
        this.loading = true

        const subjectId = this.$route.query.subject

        if (!subjectId) {
          console.warn('No subject ID provided')
          return
        }

        // Fixed API URL to match new route structure
        const response = await this.$axios.get(
          `/lessons/subject/${subjectId}`
        )

        this.lessons = response.data.data
      } catch (error) {
        console.error('Failed to load lessons:', error)
      } finally {
        this.loading = false
      }
    },

    openCreateDialog () {
      console.log('Subject Query:', this.$route.query.subject)

      this.isEdit = false

      this.form = {
        id: null,
        subject_id: Number(this.$route.query.subject),
        title: '',
        description: ''
      }

      console.log('Form Initialized:', this.form)

      this.dialog = true
    },

    async saveLesson () {
      try {
        console.log('Form Data:', this.form)

        if (this.isEdit) {
          await this.$axios.put(
            `/lessons/${this.form.id}`,
            this.form
          )
        } else {
          await this.$axios.post(
            '/lessons',
            this.form
          )
        }

        this.dialog = false

        await this.loadLessons()
      } catch (error) {
        console.log(error.response.data)
        console.error('Failed to save lesson:', error)
      }
    },

    async deleteLesson (lesson) {
      if (!window.confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
        return
      }

      try {
        await this.$axios.delete(
          `/lessons/${lesson.id}`
        )

        await this.loadLessons()
      } catch (error) {
        console.error('Failed to delete lesson:', error)
      }
    }
  }
}
</script>
