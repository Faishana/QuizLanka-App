<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <h1 class="page-title">
          Materials
        </h1>
        <p class="page-subtitle">
          Upload and manage study materials used to generate questions.
        </p>
      </div>
    </div>

    <v-card class="panel-card mb-6" flat>
      <v-card-text>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search Materials"
          dense
          outlined
          hide-details
          class="dark-field"
        />
      </v-card-text>
    </v-card>

    <v-card class="panel-card" flat>
      <v-card-title class="panel-title d-flex align-center flex-wrap">
        Materials List

        <v-spacer />

        <v-btn class="create-btn mr-2" @click="openUploadDialog">
          <v-icon left size="18">
            mdi-upload
          </v-icon>
          Upload Material
        </v-btn>

        <v-btn class="refresh-btn" :loading="loading" @click="loadMaterials">
          <v-icon left size="16">
            mdi-refresh
          </v-icon>
          Refresh
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="materials"
        :search="search"
        :loading="loading"
        class="dark-table"
      >
        <template v-slot:item.material_type="{ item }">
          <v-chip small :class="getTypeClass(item.material_type)">
            {{ getTypeLabel(item.material_type) }}
          </v-chip>
        </template>

        <template v-slot:item.medium="{ item }">
          <v-chip small class="chip-violet">
            {{ getMediumLabel(item.medium) }}
          </v-chip>
        </template>

        <template v-slot:item.questions_count="{ item }">
          <v-chip small class="chip-cyan">
            {{ item.questions_count || 0 }}
          </v-chip>
        </template>

        <template v-slot:item.processing_status="{ item }">
          <v-chip small :class="getStatusClass(item.processing_status)">
            {{ getStatusLabel(item.processing_status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            small
            class="view-btn mr-2"
            :disabled="item.processing_status !== 'completed'"
            @click="viewMaterial(item)"
          >
            View
          </v-btn>

          <v-btn
            small
            class="edit-btn mr-2"
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
            class="delete-btn mr-2"
            @click="confirmDelete(item)"
          >
            <v-icon small left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>

          <v-btn
            small
            class="questions-btn"
            @click="viewQuestions(item)"
          >
            Questions
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-8 empty-text">
            No materials found
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- View Material Dialog -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Material Details
        </v-card-title>

        <v-card-text v-if="selectedMaterial" class="dialog-body">
          <p><strong class="detail-key">Title:</strong> {{ selectedMaterial.title }}</p>
          <p>
            <strong class="detail-key">Type:</strong>
            <v-chip small :class="getTypeClass(selectedMaterial.material_type)">
              {{ getTypeLabel(selectedMaterial.material_type) }}
            </v-chip>
          </p>
          <p><strong class="detail-key">Grade:</strong> {{ selectedMaterial.grade_name || selectedMaterial.grade?.name || 'N/A' }}</p>
          <p><strong class="detail-key">Subject:</strong> {{ selectedMaterial.subject_name || selectedMaterial.subject?.name || 'N/A' }}</p>
          <p>
            <strong class="detail-key">Medium:</strong>
            <v-chip small class="chip-violet">
              {{ getMediumLabel(selectedMaterial.medium) }}
            </v-chip>
          </p>
          <p>
            <strong class="detail-key">Status:</strong>
            <v-chip small :class="getStatusClass(selectedMaterial.processing_status)">
              {{ getStatusLabel(selectedMaterial.processing_status) }}
            </v-chip>
          </p>
          <p><strong class="detail-key">Questions:</strong> {{ selectedMaterial.questions_count || 0 }}</p>

          <v-divider class="my-3 dialog-divider" />

          <p><strong class="detail-key">Extracted Text Preview:</strong></p>
          <div class="text-preview-container">
            <div class="text-preview">
              {{ selectedMaterial.extracted_text_preview || 'No text extracted yet.' }}
            </div>
          </div>

          <div v-if="selectedMaterial.chunks && selectedMaterial.chunks.length > 0">
            <v-divider class="my-3 dialog-divider" />
            <p><strong class="detail-key">Chunks:</strong> {{ selectedMaterial.chunks.length }}</p>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Material Dialog -->
    <v-dialog v-model="editDialog" max-width="700">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Edit Material
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="editForm.title"
            label="Title"
            outlined
            class="dark-field mt-4"
          />

          <v-select
            v-model="editForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
            outlined
            class="dark-field"
          />

          <v-select
            v-model="editForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
            outlined
            class="dark-field"
          />

          <v-select
            v-model="editForm.medium"
            :items="mediums"
            item-text="label"
            item-value="value"
            label="Medium"
            outlined
            class="dark-field"
          />
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="editDialog = false">
            Cancel
          </v-btn>

          <v-btn class="save-btn" :loading="saving" @click="updateMaterial">
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title dialog-title--danger">
          Delete Material
        </v-card-title>

        <v-card-text class="dialog-body">
          Are you sure you want to delete the material "{{ materialToDelete?.title }}"?
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="deleteDialog = false">
            Cancel
          </v-btn>

          <v-btn class="delete-confirm-btn" @click="deleteMaterial">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Upload Material Dialog -->
    <v-dialog v-model="uploadDialog" max-width="700">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Upload Material
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="uploadForm.title"
            label="Material Title"
            outlined
            required
            class="dark-field mt-4"
          />

          <v-select
            v-model="uploadForm.grade_id"
            :items="grades"
            item-text="name"
            item-value="id"
            label="Grade"
            outlined
            required
            class="dark-field"
          />

          <v-select
            v-model="uploadForm.subject_id"
            :items="subjects"
            item-text="name"
            item-value="id"
            label="Subject"
            outlined
            required
            class="dark-field"
          />

          <v-select
            v-model="uploadForm.medium"
            :items="mediums"
            item-text="label"
            item-value="value"
            label="Medium"
            outlined
            required
            class="dark-field"
          />

          <v-select
            v-model="uploadForm.material_type"
            :items="materialTypes"
            item-text="label"
            item-value="value"
            label="Material Type"
            outlined
            required
            class="dark-field"
          />

          <v-file-input
            v-model="uploadForm.file"
            label="Upload Material"
            accept=".pdf,.docx,.txt"
            outlined
            show-size
            prepend-icon="mdi-file-upload"
            class="dark-field"
          />
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="closeUploadDialog">
            Cancel
          </v-btn>

          <v-btn class="upload-btn" :loading="uploading" @click="uploadMaterial">
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

      mediums: [
        { label: '🇱🇰 Sinhala Medium', value: 'si' },
        { label: '🇬🇧 English Medium', value: 'en' },
        { label: 'தமிழ் Tamil Medium', value: 'ta' }
      ],

      materialTypes: [
        { label: '📘 Lesson Material', value: 'lesson' },
        { label: '📄 Past Paper', value: 'past_paper' }
      ],

      editForm: {
        id: null,
        title: '',
        grade_id: null,
        subject_id: null,
        medium: null
      },

      uploadForm: {
        title: '',
        grade_id: null,
        subject_id: null,
        medium: 'si',
        material_type: 'lesson',
        file: null
      },

      headers: [
        { text: 'ID', value: 'id', sortable: true },
        { text: 'Title', value: 'title', sortable: true },
        { text: 'Type', value: 'material_type', sortable: true },
        { text: 'Medium', value: 'medium', sortable: true },
        { text: 'Questions', value: 'questions_count', sortable: true },
        { text: 'Status', value: 'processing_status', sortable: true },
        { text: 'Created', value: 'created_at', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadMaterials()
    this.loadGrades()
    this.loadSubjects()

    // Auto-refresh every 5 seconds only if there are pending materials
    this.interval = setInterval(() => {
      const hasPending = this.materials.some(
        m => m.processing_status === 'pending' || m.processing_status === 'processing'
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

        // $axios already attaches the auth token via the app's request
        // interceptor, so no need to read localStorage/set headers here.
        const response = await this.$axios.get('/admin/materials')

        this.materials = response.data.data || []
      } catch (error) {
        console.error('Failed to load materials:', error)
      } finally {
        this.loading = false
      }
    },

    async loadGrades () {
      try {
        const response = await this.$axios.get('/admin/grades')
        this.grades = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load grades', error)
        this.$toast?.error('Failed to load grades') || alert('Failed to load grades')
      }
    },

    async loadSubjects () {
      try {
        this.subjectsLoading = true
        const response = await this.$axios.get('/admin/subjects')
        this.subjects = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load subjects', error)
        this.$toast?.error('Failed to load subjects') || alert('Failed to load subjects')
      } finally {
        this.subjectsLoading = false
      }
    },

    async viewMaterial (material) {
      try {
        const response = await this.$axios.get(`/admin/materials/${material.id}`)
        const materialData = response.data.data || response.data

        this.selectedMaterial = {
          ...materialData,
          grade_name: materialData.grade?.name || materialData.grade_name || materialData.grade,
          subject_name: materialData.subject?.name || materialData.subject_name || materialData.subject,
          title: materialData.title,
          material_type: materialData.material_type,
          medium: materialData.medium,
          processing_status: materialData.processing_status,
          extracted_text_preview: materialData.extracted_text_preview,
          questions_count: materialData.questions_count || 0,
          chunks: materialData.chunks || []
        }
        this.viewDialog = true
      } catch (error) {
        console.error('Failed to load material', error)
        this.$toast?.error('Failed to load material') || alert('Failed to load material')
      }
    },

    openUploadDialog () {
      this.uploadForm = {
        title: '',
        grade_id: null,
        subject_id: null,
        medium: 'si',
        material_type: 'lesson',
        file: null
      }
      this.uploadDialog = true
    },

    closeUploadDialog () {
      this.uploadDialog = false
      this.uploadForm = {
        title: '',
        grade_id: null,
        subject_id: null,
        medium: 'si',
        material_type: 'lesson',
        file: null
      }
    },

    editMaterial (material) {
      this.editForm = {
        id: material.id,
        title: material.title,
        grade_id: material.grade_id,
        subject_id: material.subject_id,
        medium: material.medium
      }

      this.editDialog = true
    },

    async updateMaterial () {
      if (!this.editForm.title || !this.editForm.title.trim()) {
        this.$toast?.error('Title is required') || alert('Title is required')
        return
      }

      if (!this.editForm.grade_id) {
        this.$toast?.error('Grade is required') || alert('Grade is required')
        return
      }

      if (!this.editForm.subject_id) {
        this.$toast?.error('Subject is required') || alert('Subject is required')
        return
      }

      if (!this.editForm.medium) {
        this.$toast?.error('Medium is required') || alert('Medium is required')
        return
      }

      this.saving = true

      try {
        await this.$axios.put(`/admin/materials/${this.editForm.id}`, {
          title: this.editForm.title,
          grade_id: this.editForm.grade_id,
          subject_id: this.editForm.subject_id,
          medium: this.editForm.medium
        })

        this.$toast?.success('Material updated successfully') || alert('Material updated successfully')
        this.editDialog = false
        await this.loadMaterials()
      } catch (error) {
        console.error('Failed to update material', error)
        const message = error.response?.data?.message || 'Failed to update material'
        this.$toast?.error(message) || alert(message)
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
        await this.$axios.delete(`/admin/materials/${this.materialToDelete.id}`)
        this.$toast?.success('Material deleted successfully') || alert('Material deleted successfully')
        this.deleteDialog = false
        await this.loadMaterials()
      } catch (error) {
        console.error('Failed to delete material', error)
        const message = error.response?.data?.message || 'Failed to delete material'
        this.$toast?.error(message) || alert(message)
      }
    },

    viewQuestions (material) {
      this.$router.push(`/materials/${material.id}/questions`)
    },

    async uploadMaterial () {
      if (!this.uploadForm.title || !this.uploadForm.title.trim()) {
        this.$toast?.error('Title is required') || alert('Title is required')
        return
      }

      if (!this.uploadForm.grade_id) {
        this.$toast?.error('Grade is required') || alert('Grade is required')
        return
      }

      if (!this.uploadForm.subject_id) {
        this.$toast?.error('Subject is required') || alert('Subject is required')
        return
      }

      if (!this.uploadForm.medium) {
        this.$toast?.error('Medium is required') || alert('Medium is required')
        return
      }

      if (!this.uploadForm.material_type) {
        this.$toast?.error('Material type is required') || alert('Material type is required')
        return
      }

      if (!this.uploadForm.file) {
        this.$toast?.error('Please select a file') || alert('Please select a file')
        return
      }

      this.uploading = true

      try {
        const formData = new FormData()
        formData.append('grade_id', this.uploadForm.grade_id)
        formData.append('subject_id', this.uploadForm.subject_id)
        formData.append('medium', this.uploadForm.medium)
        formData.append('title', this.uploadForm.title)
        formData.append('material_type', this.uploadForm.material_type)

        const file = Array.isArray(this.uploadForm.file)
          ? this.uploadForm.file[0]
          : this.uploadForm.file

        formData.append('file', file)

        const response = await this.$axios.post('/admin/materials/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.$toast?.success(response.data.message || 'Material uploaded successfully') || alert(response.data.message || 'Material uploaded successfully')
        this.closeUploadDialog()
        await this.loadMaterials()
      } catch (error) {
        console.error('Upload failed', error)
        const message = error.response?.data?.message || 'Upload failed'
        this.$toast?.error(message) || alert(message)
      } finally {
        this.uploading = false
      }
    },

    getMediumLabel (medium) {
      const labels = {
        si: '🇱🇰 Sinhala',
        en: '🇬🇧 English',
        ta: 'தமிழ் Tamil'
      }
      return labels[medium] || medium || 'N/A'
    },

    getStatusClass (status) {
      const classes = {
        completed: 'chip-green',
        pending: 'chip-amber',
        processing: 'chip-cyan',
        generating_questions: 'chip-cyan',
        failed: 'chip-red'
      }
      return classes[status] || 'chip-neutral'
    },

    getStatusLabel (status) {
      const labels = {
        completed: '✅ Completed',
        pending: '⏳ Pending',
        processing: '🔄 Processing',
        generating_questions: '🤖 Generating',
        failed: '❌ Failed'
      }
      return labels[status] || status
    },

    getTypeClass (type) {
      return type === 'lesson' ? 'chip-cyan' : 'chip-amber'
    },

    getTypeLabel (type) {
      return type === 'lesson' ? '📘 Lesson' : '📄 Past Paper'
    }
  }
}
</script>

<style scoped>
.page-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 24px;
  margin: 0;
}
.page-subtitle {
  color: #94A3B8;
  font-size: 13.5px;
  margin: 4px 0 0;
}

.panel-card {
  background: rgba(17, 25, 45, 0.72) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
}
.panel-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15px;
}

.create-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
  box-shadow: none !important;
}
.refresh-btn {
  background: rgba(148, 163, 184, 0.1) !important;
  color: #CBD5E1 !important;
  text-transform: none;
  box-shadow: none !important;
}

.dark-field ::v-deep .v-input__control .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px;
}
.dark-field ::v-deep fieldset {
  border-color: rgba(148, 163, 184, 0.25) !important;
}
.dark-field ::v-deep input,
.dark-field ::v-deep .v-select__selection,
.dark-field ::v-deep .v-file-input__text {
  color: #F1F5F9 !important;
}
.dark-field ::v-deep .v-label {
  color: #94A3B8 !important;
}
.dark-field.v-input--is-focused ::v-deep fieldset {
  border-color: #22D3EE !important;
}
.dark-field ::v-deep .v-icon {
  color: #64748B !important;
}

.dark-table {
  background: transparent !important;
}
.dark-table ::v-deep table {
  background: transparent;
}
.dark-table ::v-deep th {
  background: rgba(148, 163, 184, 0.05) !important;
  color: #94A3B8 !important;
  font-size: 11.5px !important;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14) !important;
}
.dark-table ::v-deep td {
  color: #E2E8F0 !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08) !important;
  font-size: 13.5px;
}
.dark-table ::v-deep tbody tr:hover {
  background: rgba(255, 255, 255, 0.03) !important;
}
.dark-table ::v-deep .v-data-footer {
  color: #94A3B8 !important;
  border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
}

.empty-text {
  color: #64748B;
}

.chip-neutral { background: rgba(148, 163, 184, 0.14) !important; color: #E2E8F0 !important; }
.chip-cyan { background: rgba(34, 211, 238, 0.14) !important; color: #22D3EE !important; }
.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-amber { background: rgba(245, 158, 11, 0.16) !important; color: #F59E0B !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }
.chip-violet { background: rgba(139, 92, 246, 0.14) !important; color: #A78BFA !important; }

.view-btn {
  background: rgba(34, 211, 238, 0.12) !important;
  color: #22D3EE !important;
  text-transform: none;
  box-shadow: none !important;
}
.edit-btn {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #F59E0B !important;
  text-transform: none;
  box-shadow: none !important;
}
.delete-btn {
  background: rgba(248, 113, 113, 0.12) !important;
  color: #F87171 !important;
  text-transform: none;
  box-shadow: none !important;
}
.questions-btn {
  background: rgba(139, 92, 246, 0.14) !important;
  color: #A78BFA !important;
  text-transform: none;
  box-shadow: none !important;
}

.dialog-card {
  background: #0F1729 !important;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.dialog-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
}
.dialog-title--danger {
  color: #F87171;
}
.dialog-body {
  color: #CBD5E1;
}
.detail-key {
  color: #94A3B8;
  margin-right: 4px;
}
.dialog-divider {
  border-color: rgba(148, 163, 184, 0.14) !important;
}
.dialog-actions {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 12px;
}
.cancel-btn {
  color: #94A3B8 !important;
  text-transform: none;
}
.save-btn,
.upload-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
}
.delete-confirm-btn {
  background: #F87171 !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
}

/* Extracted text preview */
.text-preview-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow: auto;
}
.text-preview {
  font-family: 'Noto Sans Sinhala', 'Iskoola Pota', 'FM Abhaya', sans-serif;
  font-size: 14.5px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #E2E8F0;
}
</style>
