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
          @click="openUploadDialog"
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
        <template v-slot:item.questions_count="{ item }">
          <v-chip
            small
            color="primary"
          >
            {{ item.questions_count }}
          </v-chip>
        </template>

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
      <v-card color="black" dark>
        <v-card-title class="white--text">
          Material Details
        </v-card-title>

        <v-card-text v-if="selectedMaterial">
          <p><strong>Title:</strong> {{ selectedMaterial.title }}</p>
          <p><strong>Grade:</strong> {{ selectedMaterial.grade_name || selectedMaterial.grade?.name || 'N/A' }}</p>
          <p><strong>Subject:</strong> {{ selectedMaterial.subject_name || selectedMaterial.subject?.name || 'N/A' }}</p>
          <p>
            <strong>Status:</strong>
            <v-chip
              small
              :color="getStatusColor(selectedMaterial.processing_status)"
              dark
            >
              {{ selectedMaterial.processing_status }}
            </v-chip>
          </p>

          <v-divider class="my-3" />

          <p><strong>Extracted Text Preview:</strong></p>
          <div
            class="text-preview"
            :style="{ maxHeight: '300px', overflow: 'auto', backgroundColor: '#1a1a1a', padding: '12px', borderRadius: '4px', color: '#e0e0e0' }"
          >
            {{ selectedMaterial.extracted_text_preview || 'No text extracted yet.' }}
          </div>
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
            outlined
          />

          <v-select
            v-model="editForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
            outlined
            @change="loadSubjectsByGradeForEdit"
          />

          <v-select
            v-model="editForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
            outlined
            :disabled="!editForm.grade_id"
            :loading="subjectsLoading"
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
            :loading="saving"
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
            label="Material Title"
            outlined
            required
          />

          <v-select
            v-model="uploadForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
            outlined
            required
            @change="loadSubjectsByGradeForUpload"
          />

          <v-select
            v-model="uploadForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
            outlined
            required
            :disabled="!uploadForm.grade_id"
            :loading="subjectsLoading"
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
            @click="closeUploadDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            color="success"
            :loading="uploading"
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
      saving: false,
      uploading: false,
      subjectsLoading: false,
      search: '',

      materials: [],
      grades: [],
      subjects: [],

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
        subject_id: null
      },

      uploadForm: {
        title: '',
        grade_id: null,
        subject_id: null,
        file: null
      },

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Title', value: 'title' },
        { text: 'Questions', value: 'questions_count', sortable: true },
        { text: 'Status', value: 'processing_status' },
        { text: 'Created', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadMaterials()
    this.loadGrades()

    // Auto-refresh every 5 seconds only if there are pending materials
    this.interval = setInterval(() => {
      const hasPending = this.materials.some(
        m => m.processing_status === 'pending'
      )

      if (hasPending) {
        this.loadMaterials()
      }
    }, 5000)
  },

  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval)
    }
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
        alert('Failed to load grades')
      }
    },

    async loadSubjectsByGradeForUpload (gradeId) {
      if (!gradeId) {
        this.subjects = []
        this.uploadForm.subject_id = null
        return
      }

      try {
        this.subjectsLoading = true
        const response = await this.$axios.get(`/subjects/grade/${gradeId}`)
        this.subjects = response.data.data || response.data
        this.uploadForm.subject_id = null
      } catch (error) {
        console.error('Failed to load subjects', error)
        alert('Failed to load subjects')
      } finally {
        this.subjectsLoading = false
      }
    },

    async loadSubjectsByGradeForEdit (gradeId) {
      if (!gradeId) {
        this.subjects = []
        this.editForm.subject_id = null
        return
      }

      try {
        this.subjectsLoading = true
        const response = await this.$axios.get(`/subjects/grade/${gradeId}`)
        this.subjects = response.data.data || response.data
        // Clear subject when grade changes
        this.editForm.subject_id = null
      } catch (error) {
        console.error('Failed to load subjects', error)
        alert('Failed to load subjects')
      } finally {
        this.subjectsLoading = false
      }
    },

    async viewMaterial (material) {
      try {
        const response = await this.$axios.get(`/materials/${material.id}`)
        const materialData = response.data.data || response.data

        // Ensure grade and subject names are accessible
        this.selectedMaterial = {
          ...materialData,
          grade_name: materialData.grade?.name || materialData.grade_name || materialData.grade,
          subject_name: materialData.subject?.name || materialData.subject_name || materialData.subject,
          title: materialData.title,
          processing_status: materialData.processing_status,
          extracted_text_preview: materialData.extracted_text_preview
        }
        this.viewDialog = true
      } catch (error) {
        console.error('Failed to load material', error)
        alert('Failed to load material')
      }
    },

    openUploadDialog () {
      this.uploadForm = {
        title: '',
        grade_id: null,
        subject_id: null,
        file: null
      }
      this.subjects = []
      this.uploadDialog = true
    },

    closeUploadDialog () {
      this.uploadDialog = false
      this.uploadForm = {
        title: '',
        grade_id: null,
        subject_id: null,
        file: null
      }
      this.subjects = []
    },

    editMaterial (material) {
      this.editForm = {
        id: material.id,
        title: material.title,
        grade_id: material.grade_id,
        subject_id: material.subject_id
      }

      // Load subjects for the current grade
      this.loadSubjectsByGradeForEdit(material.grade_id)
      this.editDialog = true
    },

    async updateMaterial () {
      // Validation
      if (!this.editForm.title || !this.editForm.title.trim()) {
        alert('Title is required')
        return
      }

      if (!this.editForm.grade_id) {
        alert('Grade is required')
        return
      }

      if (!this.editForm.subject_id) {
        alert('Subject is required')
        return
      }

      this.saving = true

      try {
        await this.$axios.put(`/materials/${this.editForm.id}`, {
          title: this.editForm.title,
          grade_id: this.editForm.grade_id,
          subject_id: this.editForm.subject_id
        })

        alert('Material updated successfully')
        this.editDialog = false
        await this.loadMaterials()
      } catch (error) {
        console.error('Failed to update material', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to update material')
        }
      } finally {
        this.saving = false
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
        await this.loadMaterials()
      } catch (error) {
        console.error('Failed to delete material', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to delete material')
        }
      }
    },

    viewQuestions (material) {
      this.$router.push(`/materials/${material.id}/questions`)
    },

    async uploadMaterial () {
      // Validation
      if (!this.uploadForm.title || !this.uploadForm.title.trim()) {
        alert('Title is required')
        return
      }

      if (!this.uploadForm.grade_id) {
        alert('Grade is required')
        return
      }

      if (!this.uploadForm.subject_id) {
        alert('Subject is required')
        return
      }

      if (!this.uploadForm.file) {
        alert('Please select a file')
        return
      }

      this.uploading = true

      try {
        const formData = new FormData()
        formData.append('grade_id', this.uploadForm.grade_id)
        formData.append('subject_id', this.uploadForm.subject_id)
        formData.append('title', this.uploadForm.title)

        // Handle file safely (Vuetify sometimes returns array)
        const file = Array.isArray(this.uploadForm.file)
          ? this.uploadForm.file[0]
          : this.uploadForm.file

        formData.append('file', file)

        const response = await this.$axios.post('/materials/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            console.log('Upload:', percent + '%')
          }
        })

        // Use the message returned from backend
        alert(response.data.message || 'Material uploaded successfully')
        this.closeUploadDialog()
        await this.loadMaterials()
      } catch (error) {
        console.error('Upload failed', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Upload failed')
        }
      } finally {
        this.uploading = false
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
.text-preview {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
