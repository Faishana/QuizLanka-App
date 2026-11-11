<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">
        Subjects
      </h1>
      <p class="page-subtitle">
        Manage subjects, categories, grades and A/L streams.
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
            <v-img v-if="item.icon" :src="item.icon" contain />
            <v-icon v-else>
              mdi-book-open-page-variant
            </v-icon>
          </v-avatar>
        </template>

        <template #item.grade_category="{ item }">
          <v-chip small>
            {{ categoryLabel(item.grade_category) }}
          </v-chip>
        </template>

        <!-- Grades column: gracefully handle government subjects (no grades) -->
        <template #item.grades="{ item }">
          <div class="py-2">
            <template v-if="item.grades && item.grades.length">
              <v-chip
                v-for="grade in item.grades"
                :key="grade.id"
                x-small
                class="mr-1 mb-1"
              >
                {{ grade.name }}
              </v-chip>
            </template>

            <span v-else class="grey--text">
              No grades
            </span>
          </div>
        </template>

        <template #item.al_streams="{ item }">
          <div class="py-2">
            <v-chip
              v-for="stream in item.al_streams || []"
              :key="stream"
              x-small
              color="primary"
              outlined
              class="mr-1 mb-1"
            >
              {{ streamLabel(stream) }}
            </v-chip>

            <span v-if="!item.al_streams || !item.al_streams.length">
              -
            </span>
          </div>
        </template>

        <template #item.color="{ item }">
          <span class="color-swatch">
            <span
              class="color-dot"
              :style="{ background: item.color }"
            />
            {{ item.color }}
          </span>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            small
            :class="item.is_active ? 'chip-green' : 'chip-red'"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            x-small
            class="edit-btn mr-2"
            @click="editSubject(item)"
          >
            Edit
          </v-btn>

          <v-btn
            x-small
            class="delete-btn"
            @click="deleteSubject(item)"
          >
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

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="650" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          {{ isEdit ? 'Edit Subject' : 'Add Subject' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="subjectForm">
            <!-- Subject Name -->
            <v-text-field
              v-model="form.name"
              label="Subject Name"
              outlined
              :rules="[v => !!v || 'Subject name is required']"
              class="dark-field mt-4"
            />

            <!-- Grade Category -->
            <v-select
              v-model="form.grade_category"
              :items="categories"
              item-text="text"
              item-value="value"
              label="Grade Category"
              outlined
              class="dark-field"
              :rules="[v => !!v || 'Select a category']"
              @change="onCategoryChange"
            />

            <!-- Multiple Grade Selection (hidden for Government) -->
            <v-select
              v-if="form.grade_category !== 'gov'"
              ref="gradeSelect"
              v-model="form.grade_ids"
              :items="filteredGrades"
              item-text="name"
              item-value="id"
              label="Select Grades"
              outlined
              multiple
              chips
              deletable-chips
              :disabled="!form.grade_category"
              :rules="[
                v => (v && v.length > 0) || 'Select at least one grade'
              ]"
              class="dark-field"
            >
              <template #prepend-item>
                <v-list-item ripple @click="toggleAllGrades">
                  <v-list-item-action>
                    <v-icon>
                      {{ allGradesSelected ? 'mdi-close-box' : 'mdi-checkbox-blank-outline' }}
                    </v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ allGradesSelected ? 'Clear all' : 'Select all' }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider class="mt-2" />
              </template>

              <template #append-item>
                <v-divider class="mb-2" />
                <div class="pa-2 text-right">
                  <v-btn
                    small
                    text
                    class="cancel-btn"
                    @click="closeGradeMenu"
                  >
                    Done
                  </v-btn>
                </div>
              </template>
            </v-select>

            <!-- Multiple A/L Stream Selection (A/L only) -->
            <v-select
              v-if="form.grade_category === 'al'"
              ref="streamSelect"
              v-model="form.al_streams"
              :items="alStreams"
              item-text="text"
              item-value="value"
              label="Select A/L Streams"
              placeholder="Choose one or more streams"
              outlined
              multiple
              chips
              deletable-chips
              class="dark-field"
              :rules="[
                v => (v && v.length > 0) || 'Select at least one A/L stream'
              ]"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 3"
                  small
                  close
                  @click:close="removeStream(item.value)"
                >
                  {{ item.text }}
                </v-chip>

                <span
                  v-else-if="index === 3"
                  class="grey--text text-caption"
                >
                  +{{ form.al_streams.length - 3 }} more
                </span>
              </template>

              <template #append-item>
                <v-divider class="mb-2" />
                <div class="pa-2 text-right">
                  <v-btn
                    small
                    text
                    class="cancel-btn"
                    @click="closeStreamMenu"
                  >
                    Done
                  </v-btn>
                </div>
              </template>
            </v-select>

            <!-- Government info banner -->
            <v-alert
              v-if="form.grade_category === 'gov'"
              dense
              text
              type="info"
              class="gov-info mb-4"
            >
              Government exam subjects are not tied to any grade or A/L stream.
            </v-alert>

            <!-- Color -->
            <v-text-field
              v-model="form.color"
              label="Subject Color"
              outlined
              class="dark-field"
            >
              <template #append>
                <span
                  class="color-preview"
                  :style="{ background: form.color }"
                />
              </template>
            </v-text-field>

            <!-- Description -->
            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              rows="2"
              class="dark-field"
            />

            <!-- Icon -->
            <v-file-input
              v-model="form.icon"
              label="Subject Icon"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              prepend-icon="mdi-image"
              outlined
              class="dark-field"
              show-size
            />

            <div v-if="previewImage" class="text-center mt-3">
              <v-img
                :src="previewImage"
                max-width="80"
                max-height="80"
                contain
                class="mx-auto"
              />
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn
            text
            class="cancel-btn"
            :disabled="saving"
            @click="closeDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            class="save-btn"
            :loading="saving"
            :disabled="saving"
            @click="saveSubject"
          >
            {{ isEdit ? 'Update Subject' : 'Save Subject' }}
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
      dialog: false,
      isEdit: false,

      subjects: [],
      grades: [],
      previewImage: null,

      categories: [
        { text: 'Grade 5 Scholarship', value: 'scholarship' },
        { text: 'Ordinary Level (O/L)', value: 'ol' },
        { text: 'Advanced Level (A/L)', value: 'al' },
        { text: 'Government Exams', value: 'gov' }
      ],

      alStreams: [
        { text: 'Biological Science', value: 'bio' },
        { text: 'Physical Science / Maths', value: 'maths' },
        { text: 'Technology', value: 'technology' },
        { text: 'Arts', value: 'arts' },
        { text: 'Commerce', value: 'commerce' }
      ],

      form: {
        id: null,
        name: '',
        grade_category: null,
        grade_ids: [],
        al_streams: [],
        color: '#3B82F6',
        description: '',
        icon: null
      },

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Icon', value: 'icon', sortable: false },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'grade_category' },
        { text: 'Grades', value: 'grades', sortable: false },
        { text: 'A/L Streams', value: 'al_streams', sortable: false },
        { text: 'Color', value: 'color' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  computed: {
    filteredGrades () {
      if (!this.form.grade_category) {
        return []
      }

      return this.grades.filter((grade) => {
        const category = grade.category || grade.grade_category
        return category === this.form.grade_category
      })
    },

    allGradesSelected () {
      return (
        this.filteredGrades.length > 0 &&
        this.form.grade_ids.length === this.filteredGrades.length
      )
    }
  },

  watch: {
    'form.icon' (file) {
      if (file instanceof File) {
        this.previewImage = URL.createObjectURL(file)
      } else if (!file) {
        this.previewImage = null
      }
    }
  },

  mounted () {
    this.loadSubjects()
    this.loadGrades()
  },

  methods: {
    /**
     * Safe notification helper.
     */
    notify (type, message) {
      try {
        if (this.$toast && typeof this.$toast[type] === 'function') {
          this.$toast[type](message)
          return
        }
      } catch (e) {
        // ignore — fall through to console
      }

      if (type === 'error') {
        console.error('[Notification Error]', message)
      } else {
        console.log('[Notification Success]', message)
      }
    },

    categoryLabel (value) {
      const category = this.categories.find(item => item.value === value)
      return category ? category.text : (value || '-')
    },

    streamLabel (value) {
      const stream = this.alStreams.find(item => item.value === value)
      return stream ? stream.text : (value || '-')
    },

    removeStream (value) {
      this.form.al_streams = this.form.al_streams.filter(
        stream => stream !== value
      )
    },

    guessCategory (grades) {
      if (!Array.isArray(grades) || !grades.length) {
        return null
      }
      return grades[0].category || null
    },

    async loadSubjects () {
      try {
        this.loading = true

        const gradeId = this.$route.query.grade
        let response

        if (gradeId) {
          response = await this.$axios.get(
            `/admin/subjects/grade/${gradeId}`
          )
        } else {
          response = await this.$axios.get('/admin/subjects')
        }

        this.subjects = response.data.data || []
      } catch (error) {
        console.error('Failed to load subjects:', {
          status: error.response && error.response.status,
          data: error.response && error.response.data,
          message: error.message
        })

        const msg =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          'Failed to load subjects'

        this.notify('error', msg)
      } finally {
        this.loading = false
      }
    },

    async loadGrades () {
      try {
        const response = await this.$axios.get('/admin/grades')
        this.grades = response.data.data || []
      } catch (error) {
        console.error('Failed to load grades:', {
          status: error.response && error.response.status,
          data: error.response && error.response.data,
          message: error.message
        })

        const msg =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          'Failed to load grades'

        this.notify('error', msg)
      }
    },

    closeGradeMenu () {
      this.$nextTick(() => {
        const el = this.$refs.gradeSelect
        if (!el) {
          return
        }

        if (typeof el.blur === 'function') {
          el.blur()
        }

        const input = el.$el && el.$el.querySelector('input')
        if (input) {
          input.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true
            })
          )
        }
      })
    },

    closeStreamMenu () {
      this.$nextTick(() => {
        const el = this.$refs.streamSelect
        if (!el) {
          return
        }

        if (typeof el.blur === 'function') {
          el.blur()
        }

        const input = el.$el && el.$el.querySelector('input')
        if (input) {
          input.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true
            })
          )
        }
      })
    },

    toggleAllGrades () {
      if (this.allGradesSelected) {
        this.form.grade_ids = []
      } else {
        this.form.grade_ids = this.filteredGrades.map(g => g.id)
      }
    },

    /**
     * Category change handler.
     * Government subjects do not need grades or A/L streams.
     */
    onCategoryChange () {
      // Government subjects do not need grades or A/L streams.
      if (this.form.grade_category === 'gov') {
        this.form.grade_ids = []
        this.form.al_streams = []
        return
      }

      const allowedIds = this.grades
        .filter(
          g =>
            (g.category || g.grade_category) === this.form.grade_category
        )
        .map(g => g.id)

      const stillValid = this.form.grade_ids.every(id =>
        allowedIds.includes(id)
      )

      if (!stillValid) {
        this.form.grade_ids = []
      }

      // Clear A/L streams when switching to another category.
      if (this.form.grade_category !== 'al') {
        this.form.al_streams = []
      }
    },

    resetForm () {
      this.form = {
        id: null,
        name: '',
        grade_category: null,
        grade_ids: [],
        al_streams: [],
        color: '#3B82F6',
        description: '',
        icon: null
      }

      this.previewImage = null

      if (this.$refs.subjectForm) {
        this.$refs.subjectForm.resetValidation()
      }
    },

    openCreateDialog () {
      this.isEdit = false
      this.resetForm()
      this.dialog = true
    },

    editSubject (subject) {
      this.isEdit = true
      this.previewImage = subject.icon || null

      // Fallback: derive grade_ids from grades array if missing
      const gradeIds =
        Array.isArray(subject.grade_ids) && subject.grade_ids.length
          ? subject.grade_ids
          : (subject.grades || []).map(g => g.id)

      let streams = Array.isArray(subject.al_streams)
        ? subject.al_streams
        : []

      if (!streams.length && Array.isArray(subject.grades)) {
        streams = [
          ...new Set(
            subject.grades.reduce((all, grade) => {
              return all.concat(grade.al_streams || [])
            }, [])
          )
        ]
      }

      // Backward compatibility with old single-stream responses.
      if (!streams.length && subject.al_stream) {
        streams = [subject.al_stream]
      }

      const category =
        subject.grade_category || this.guessCategory(subject.grades)

      this.form = {
        id: subject.id,
        name: subject.name || '',
        grade_category: category,
        // Government subjects never carry grades or streams.
        grade_ids: category === 'gov' ? [] : gradeIds,
        al_streams: category === 'gov' ? [] : streams,
        color: subject.color || '#3B82F6',
        description: subject.description || '',
        icon: null
      }

      this.dialog = true
    },

    closeDialog () {
      this.dialog = false
      this.previewImage = null
      this.resetForm()
    },

    async saveSubject () {
      if (!this.$refs.subjectForm.validate()) {
        return
      }

      const category = this.form.grade_category

      // Validate grades only for non-government subjects.
      if (
        category !== 'gov' &&
        (!Array.isArray(this.form.grade_ids) ||
          this.form.grade_ids.length === 0)
      ) {
        this.notify('error', 'Please select at least one grade')
        return
      }

      // Validate A/L streams.
      if (
        category === 'al' &&
        (!Array.isArray(this.form.al_streams) ||
          this.form.al_streams.length === 0)
      ) {
        this.notify('error', 'Please select at least one A/L stream')
        return
      }

      try {
        this.saving = true

        const formData = new FormData()

        formData.append('name', this.form.name)
        formData.append('grade_category', category)
        formData.append('color', this.form.color || '#3B82F6')
        formData.append('description', this.form.description || '')

        // Only send grade IDs for non-government subjects.
        if (category !== 'gov') {
          this.form.grade_ids.forEach((id) => {
            formData.append('grade_ids[]', id)
          })
        }

        // Only send A/L streams for A/L subjects.
        if (category === 'al') {
          this.form.al_streams.forEach((stream) => {
            formData.append('al_streams[]', stream)
          })
        }

        // Subject icon.
        if (this.form.icon instanceof File) {
          formData.append('icon', this.form.icon)
        }

        let response

        if (this.isEdit) {
          formData.append('_method', 'PUT')

          response = await this.$axios.post(
            `/admin/subjects/${this.form.id}`,
            formData
          )
        } else {
          response = await this.$axios.post(
            '/admin/subjects',
            formData
          )
        }

        this.notify(
          'success',
          (response &&
            response.data &&
            response.data.message) ||
            (this.isEdit
              ? 'Subject updated successfully'
              : 'Subject created successfully')
        )

        this.dialog = false
        this.resetForm()

        await this.$nextTick()
        await this.loadSubjects()

        this.subjects = [...this.subjects]
      } catch (error) {
        console.error('Failed to save subject:', {
          status: error.response && error.response.status,
          data: error.response && error.response.data,
          message: error.message
        })

        let message = 'Failed to save subject'

        const data = error.response && error.response.data

        if (data) {
          if (data.message) {
            message = data.message
          }

          if (data.errors && typeof data.errors === 'object') {
            const firstField = Object.keys(data.errors)[0]

            if (
              firstField &&
              Array.isArray(data.errors[firstField]) &&
              data.errors[firstField].length
            ) {
              message = `${firstField}: ${data.errors[firstField][0]}`
            }
          }
        }

        this.notify('error', message)
      } finally {
        this.saving = false
      }
    },

    async deleteSubject (subject) {
      if (
        !window.confirm(
          `Are you sure you want to delete ${subject.name}?`
        )
      ) {
        return
      }

      try {
        const response = await this.$axios.delete(
          `/admin/subjects/${subject.id}`
        )

        this.notify(
          'success',
          (response &&
            response.data &&
            response.data.message) ||
            'Subject deleted successfully'
        )

        await this.loadSubjects()
        this.subjects = [...this.subjects]
      } catch (error) {
        console.error('Failed to delete subject:', {
          status: error.response && error.response.status,
          data: error.response && error.response.data,
          message: error.message
        })

        const msg =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          'Failed to delete subject'

        this.notify('error', msg)
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

/* Government info banner */
.gov-info ::v-deep .v-alert__content {
  color: #A5B4FC !important;
  font-size: 13px;
}
::v-deep .v-alert.gov-info {
  background: rgba(99, 102, 241, 0.12) !important;
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 10px;
  color: #A5B4FC !important;
}

/* Ensure the grades dropdown menu (rendered in body) is readable */
::v-deep .v-menu__content .v-list {
  background: #0F1729 !important;
}
::v-deep .v-menu__content .v-list-item__title {
  color: #E2E8F0 !important;
}
::v-deep .v-menu__content .v-list-item--active {
  background: rgba(34, 211, 238, 0.12) !important;
}
::v-deep .v-menu__content .v-list-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
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
