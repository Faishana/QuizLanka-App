<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">
        Subjects
      </h1>
      <p class="page-subtitle">
        Manage subjects and link them to a grade.
      </p>
    </div>

    <v-card class="panel-card" flat>
      <v-card-title class="panel-title d-flex align-center">
        Subjects List

        <v-spacer />

        <v-btn class="create-btn" @click="openCreateDialog">
          <v-icon left size="18">
            mdi-plus
          </v-icon>
          Add Subject
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="subjects"
        :loading="loading"
        class="dark-table"
      >
        <template #item.icon="{ item }">
          <v-avatar size="42" tile>
            <v-img
              v-if="item.icon"
              :src="item.icon"
              contain
            />
            <v-icon v-else>
              mdi-book-open-page-variant
            </v-icon>
          </v-avatar>
        </template>

        <template #item.color="{ item }">
          <span class="color-swatch">
            <span class="color-dot" :style="{ background: item.color }" />
            {{ item.color }}
          </span>
        </template>

        <template #item.is_active="{ item }">
          <v-chip small :class="item.is_active ? 'chip-green' : 'chip-red'">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn x-small class="edit-btn mr-2" @click="editSubject(item)">
            Edit
          </v-btn>

          <v-btn x-small class="delete-btn" @click="deleteSubject(item)">
            Delete
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-8 empty-text">
            No subjects found
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
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
            class="dark-field mt-4"
          />

          <v-text-field
            v-model="form.name"
            label="Subject Name"
            outlined
            class="dark-field"
          />

          <v-text-field
            v-model="form.color"
            label="Color"
            outlined
            class="dark-field"
          >
            <template #append>
              <span class="color-preview" :style="{ background: form.color }" />
            </template>
          </v-text-field>

          <v-file-input
            v-model="form.icon"
            label="Subject Icon"
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            prepend-icon="mdi-image"
            outlined
            class="dark-field"
          />

          <div v-if="previewImage" class="text-center mt-3">
            <v-img
              :src="previewImage"
              max-width="80"
              max-height="80"
              contain
            />
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn class="save-btn" @click="saveSubject">
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
      previewImage: null,

      form: {
        id: null,
        grade_id: null,
        name: '',
        color: '#3B82F6',
        description: '',
        icon: null
      },

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Icon', value: 'icon', sortable: false },
        { text: 'Name', value: 'name' },
        { text: 'Slug', value: 'slug' },
        { text: 'Color', value: 'color' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  watch: {
    'form.icon' (file) {
      if (file instanceof File) {
        this.previewImage = URL.createObjectURL(file)
      } else {
        this.previewImage = null
      }
    }
  },

  mounted () {
    const gradeId = this.$route.query.grade
    if (gradeId) {
      this.loadSubjectsByGrade(gradeId)
    } else {
      this.loadSubjects()
    }

    this.loadGrades()
  },

  methods: {

    async loadSubjectsByGrade (gradeId) {
      try {
        const res = await this.$axios.get(
          `/subjects/grade/${gradeId}`
        )

        this.subjects = res.data.data
      } catch (error) {
        console.error(error)
      }
    },

    async loadSubjects () {
      try {
        this.loading = true

        const response = await this.$axios.get('/admin/subjects')

        this.subjects = response.data.data
      } catch (error) {
        console.error('Failed to load subjects:', error)
      } finally {
        this.loading = false
      }
    },

    async loadGrades () {
      try {
        const response = await this.$axios.get('/admin/grades')

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
      this.previewImage = null

      this.form = {
        id: null,
        grade_id: null,
        name: '',
        color: '#3B82F6',
        description: '',
        icon: null
      }

      this.dialog = true
    },

    editSubject (subject) {
      this.isEdit = true
      this.previewImage = subject.icon || null

      this.form = {
        ...subject,
        icon: null // Reset icon to null, will be set if user uploads new one
      }

      this.dialog = true
    },

    async saveSubject () {
      try {
        const formData = new FormData()

        formData.append('grade_id', this.form.grade_id)
        formData.append('name', this.form.name)
        formData.append('color', this.form.color)
        formData.append('description', this.form.description || '')

        if (this.form.icon instanceof File) {
          formData.append('icon', this.form.icon)
        }

        if (this.isEdit) {
          formData.append('_method', 'PUT')

          await this.$axios.post(
            `/admin/subjects/${this.form.id}`,
            formData
          )
        } else {
          await this.$axios.post(
            '/admin/subjects',
            formData
          )
        }

        this.dialog = false
        this.previewImage = null

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
          `/admin/subjects/${subject.id}`
        )

        await this.loadSubjects()
      } catch (error) {
        console.error('Failed to delete subject:', error)
      }
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

.dark-field ::v-deep .v-input__control .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px;
}
.dark-field ::v-deep fieldset {
  border-color: rgba(148, 163, 184, 0.25) !important;
}
.dark-field ::v-deep input,
.dark-field ::v-deep textarea,
.dark-field ::v-deep .v-select__selection {
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

.color-swatch {
  display: inline-flex;
  align-items: center;
  color: #CBD5E1;
  font-size: 12.5px;
}
.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.color-preview {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }

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

.dialog-card {
  background: #0F1729 !important;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.dialog-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
}
.dialog-actions {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 12px;
}
.cancel-btn {
  color: #94A3B8 !important;
  text-transform: none;
}
.save-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
}
</style>
