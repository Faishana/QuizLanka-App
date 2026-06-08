<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <h1>Materials</h1>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search Materials"
          dense
          outlined
          hide-details
        />
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        Materials List

        <v-spacer />
        <v-spacer />

        <v-btn
          color="success"
          class="mr-2"
          @click="uploadDialog = true"
        >
          <v-icon left>
            mdi-upload
          </v-icon>

          Upload Material
        </v-btn>

        <v-btn
          color="primary"
          @click="loadMaterials"
        >
          Refresh
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="materials"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.processing_status="{ item }">
          <v-chip
            small
            :color="getStatusColor(item.processing_status)"
            dark
          >
            {{ item.processing_status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            small
            color="info"
            class="mr-2"
            :disabled="item.processing_status !== 'completed'"
            @click="viewMaterial(item)"
          >
            View
          </v-btn>

          <v-btn
            small
            color="warning"
            class="mr-2"
            :disabled="item.processing_status !== 'completed'"
            @click="editMaterial(item)"
          >
            <v-icon small left>
              mdi-pencil
            </v-icon>
            Edit
          </v-btn>

          <v-btn
            small
            color="error"
            class="mr-2"
            @click="confirmDelete(item)"
          >
            <v-icon small left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>

          <v-btn
            small
            color="primary"
            @click="viewQuestions(item)"
          >
            Questions
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- View Material Dialog -->
    <v-dialog
      v-model="viewDialog"
      max-width="700"
    >
      <v-card
        color="black"
        dark
      >
        <v-card-title class="white--text">
          Material Details
        </v-card-title>

        <v-card-text>
          <pre class="white--text">{{ selectedMaterial }}</pre>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            color="white"
            @click="viewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Material Dialog -->
    <v-dialog
      v-model="editDialog"
      max-width="700"
    >
      <v-card>
        <v-card-title>
          Edit Material
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="editForm.title"
            label="Title"
          />

          <v-select
            v-model="editForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
          />

          <v-select
            v-model="editForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
          />

          <v-select
            v-model="editForm.lesson_id"
            :items="lessons"
            item-text="title"
            item-value="id"
            label="Lesson"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="editDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            @click="updateMaterial"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline error--text">
          Delete Material
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete the material "{{ materialToDelete?.title }}"?
          This action cannot be undone.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="error"
            @click="deleteMaterial"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Upload Material Dialog -->
    <v-dialog
      v-model="uploadDialog"
      max-width="700"
    >
      <v-card>
        <v-card-title>
          Upload Material
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="uploadForm.title"
            label="Title"
          />

          <v-select
            v-model="uploadForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
          />

          <v-select
            v-model="uploadForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
          />

          <v-select
            v-model="uploadForm.lesson_id"
            :items="lessons"
            item-text="title"
            item-value="id"
            label="Lesson"
          />

          <v-file-input
            v-model="uploadForm.file"
            label="Upload Material"
            accept=".pdf,.docx,.txt"
            outlined
            show-size
            prepend-icon="mdi-file-upload"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="uploadDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="success"
            @click="uploadMaterial"
          >
            Upload
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
      search: '',
      materials: [],
      selectedMaterial: null,
      viewDialog: false,
      uploadDialog: false,
      editDialog: false,
      deleteDialog: false,
      materialToDelete: null,
      editForm: {
        id: null,
        title: '',
        grade_id: null,
        subject_id: null,
        lesson_id: null
      },
      uploadForm: {
        title: '',
        grade_id: null,
        subject_id: null,
        lesson_id: null,
        file: null
      },
      grades: [],
      subjects: [],
      lessons: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Title', value: 'title' },
        { text: 'Questions', value: 'questions_count' },
        { text: 'Status', value: 'processing_status' },
        { text: 'Created', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  watch: {
    'uploadForm.grade_id' (gradeId) {
      this.loadSubjectsByGrade(gradeId)
      this.uploadForm.subject_id = null
      this.uploadForm.lesson_id = null
    },

    'uploadForm.subject_id' (subjectId) {
      this.loadLessonsBySubject(subjectId)
      this.uploadForm.lesson_id = null
    },

    'editForm.grade_id' (gradeId) {
      this.loadSubjectsByGradeForEdit(gradeId)
      this.editForm.subject_id = null
      this.editForm.lesson_id = null
    },

    'editForm.subject_id' (subjectId) {
      this.loadLessonsBySubjectForEdit(subjectId)
      this.editForm.lesson_id = null
    }
  },

  mounted () {
    this.loadMaterials()

    this.interval = setInterval(() => {
      this.loadMaterials()
    }, 5000)
  },

  beforeDestroy () {
    clearInterval(this.interval)
  },

  methods: {
    async loadMaterials () {
      try {
        this.loading = true
        const response = await this.$axios.get('/materials')
        this.materials = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load materials', error)
        alert('Failed to load materials')
      } finally {
        this.loading = false
      }
    },

    async loadGrades () {
      try {
        const response = await this.$axios.get('/grades')
        this.grades = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load grades', error)
      }
    },

    async loadAllSubjects () {
      try {
        const response = await this.$axios.get('/subjects')
        this.subjects = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load subjects', error)
      }
    },

    async loadSubjectsByGrade (gradeId) {
      if (!gradeId) {
        this.subjects = []
        return
      }
      try {
        const response = await this.$axios.get(`/subjects/${gradeId}`)
        this.subjects = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load subjects by grade', error)
      }
    },

    async loadLessonsBySubject (subjectId) {
      if (!subjectId) {
        this.lessons = []
        return
      }
      try {
        const response = await this.$axios.get(`/lessons/${subjectId}`)
        this.lessons = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load lessons', error)
      }
    },

    async loadSubjectsByGradeForEdit (gradeId) {
      if (!gradeId) {
        this.subjects = []
        return
      }
      try {
        const response = await this.$axios.get(`/subjects/${gradeId}`)
        this.subjects = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load subjects by grade', error)
      }
    },

    async loadLessonsBySubjectForEdit (subjectId) {
      if (!subjectId) {
        this.lessons = []
        return
      }
      try {
        const response = await this.$axios.get(`/lessons/${subjectId}`)
        this.lessons = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load lessons', error)
      }
    },

    async generateQuestions (material) {
      if (material.processing_status !== 'completed') {
        alert('Cannot generate questions: Material processing is not completed yet.')
        return
      }
      try {
        await this.$axios.post(`/materials/${material.id}/generate-questions`)
        alert('Questions generated successfully')
      } catch (error) {
        console.error('Failed to generate questions', error)
        alert('Failed to generate questions')
      }
    },

    async viewMaterial (material) {
      try {
        const response = await this.$axios.get(`/materials/${material.id}`)
        this.selectedMaterial = response.data
        this.viewDialog = true
      } catch (error) {
        console.error('Failed to load material', error)
        alert('Failed to load material')
      }
    },

    editMaterial (material) {
      this.editForm = {
        id: material.id,
        title: material.title,
        grade_id: material.grade_id,
        subject_id: material.subject_id,
        lesson_id: material.lesson_id
      }
      this.loadSubjectsByGradeForEdit(material.grade_id)
      this.loadLessonsBySubjectForEdit(material.subject_id)
      this.editDialog = true
    },

    async updateMaterial () {
      try {
        await this.$axios.put(`/materials/${this.editForm.id}`, {
          title: this.editForm.title,
          grade_id: this.editForm.grade_id,
          subject_id: this.editForm.subject_id,
          lesson_id: this.editForm.lesson_id
        })

        alert('Material updated successfully')
        this.editDialog = false
        this.loadMaterials()
      } catch (error) {
        console.error('Failed to update material', error)
        alert('Failed to update material')
      }
    },

    confirmDelete (material) {
      this.materialToDelete = material
      this.deleteDialog = true
    },

    async deleteMaterial () {
      try {
        await this.$axios.delete(`/materials/${this.materialToDelete.id}`)
        alert('Material deleted successfully')
        this.deleteDialog = false
        this.loadMaterials()
      } catch (error) {
        console.error('Failed to delete material', error)
        alert('Failed to delete material')
      }
    },

    viewQuestions (material) {
      this.$router.push(`/materials/${material.id}/questions`)
    },

    async uploadMaterial () {
      if (!this.uploadForm.file) {
        alert('Please select a file')
        return
      }
      try {
        const formData = new FormData()
        formData.append('grade_id', this.uploadForm.grade_id)
        formData.append('subject_id', this.uploadForm.subject_id)
        formData.append('lesson_id', this.uploadForm.lesson_id)
        formData.append('title', this.uploadForm.title)
        formData.append('file', this.uploadForm.file)

        await this.$axios.post('/materials/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            )

            console.log('Upload:', percent + '%')
          }
        })

        alert('Material uploaded successfully')
        this.uploadDialog = false
        this.uploadForm = {
          title: '',
          grade_id: null,
          subject_id: null,
          lesson_id: null,
          file: null
        }
        this.loadMaterials()
      } catch (error) {
        console.error('Upload failed', error)
        alert('Upload failed')
      }
    },

    getStatusColor (status) {
      switch (status) {
        case 'completed':
          return 'success'

        case 'pending':
          return 'warning'

        case 'failed':
          return 'error'

        default:
          return 'grey'
      }
    }
  }
}
</script>

<style scoped>
pre {
  background-color: transparent;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: white;
}
</style>
