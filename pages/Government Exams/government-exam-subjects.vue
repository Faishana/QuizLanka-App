
<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">
        Government Exam Subjects
      </h1>
      <p class="page-subtitle">
        Manage subjects under Government Recruitment and Competitive Exams.
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

      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <v-select
              v-model="filterExamId"
              :items="exams"
              item-text="name"
              item-value="id"
              label="Filter by Government Exam"
              outlined
              dense
              clearable
              class="dark-field"
              @change="loadSubjects"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search subjects"
              outlined
              dense
              clearable
              class="dark-field"
              @keyup.enter="loadSubjects"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              block
              outlined
              class="mt-1"
              :loading="loading"
              @click="loadSubjects"
            >
              <v-icon left>
                mdi-magnify
              </v-icon>
              Search
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="subjects"
        :loading="loading"
        class="dark-table"
        :items-per-page="15"
      >
        <template #item.exam="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.exam ? item.exam.name : 'Unknown Exam' }}
            </div>
            <small class="grey--text">
              {{ item.exam && item.exam.category
                ? item.exam.category.name
                : '' }}
            </small>
          </div>
        </template>

        <template #item.questions_count="{ item }">
          <v-chip small color="primary" outlined>
            {{ item.questions_count || 0 }} Questions
          </v-chip>
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
            No Government Exam Subjects found.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          {{ isEdit ? 'Edit Government Exam Subject' : 'Add Government Exam Subject' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="subjectForm">
            <v-select
              v-model="form.government_exam_id"
              :items="exams"
              item-text="name"
              item-value="id"
              label="Government Exam"
              outlined
              class="dark-field mt-4"
              :rules="[v => !!v || 'Please select a Government Exam']"
            />

            <v-text-field
              v-model="form.name"
              label="Subject Name"
              outlined
              class="dark-field"
              :rules="[v => !!(v && v.trim()) || 'Subject name is required']"
            />

            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              rows="3"
              class="dark-field"
            />

            <v-text-field
              v-model.number="form.sort_order"
              label="Sort Order"
              type="number"
              min="0"
              outlined
              class="dark-field"
            />

            <v-switch
              v-model="form.is_active"
              label="Active"
              color="success"
            />
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
      exams: [],

      filterExamId: null,
      search: '',

      form: {
        id: null,
        government_exam_id: null,
        name: '',
        description: '',
        sort_order: 0,
        is_active: true
      },

      headers: [
        { text: 'ID', value: 'id', width: 70 },
        { text: 'Subject Name', value: 'name' },
        { text: 'Government Exam', value: 'exam' },
        { text: 'Questions', value: 'questions_count' },
        { text: 'Sort Order', value: 'sort_order' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadExams()
    this.loadSubjects()
  },

  methods: {
    notify (type, message) {
      if (this.$toast && typeof this.$toast[type] === 'function') {
        this.$toast[type](message)
      } else {
        console.log(message)
      }
    },

    async loadExams () {
      try {
        const response = await this.$axios.get(
          '/admin/government-exams'
        )

        const result = response.data.data

        this.exams = Array.isArray(result)
          ? result
          : (result && result.data) || []
      } catch (error) {
        console.error('Failed to load Government Exams:', error)
        this.notify('error', 'Failed to load Government Exams')
      }
    },

    async loadSubjects () {
      try {
        this.loading = true

        const params = {}

        if (this.filterExamId) {
          params.government_exam_id = this.filterExamId
        }

        if (this.search) {
          params.search = this.search
        }

        const response = await this.$axios.get(
          '/admin/government-exam-subjects',
          { params }
        )

        const result = response.data.data

        this.subjects = Array.isArray(result)
          ? result
          : (result && result.data) || []
      } catch (error) {
        console.error('Failed to load subjects:', error)
        this.notify('error', 'Failed to load Government Exam Subjects')
      } finally {
        this.loading = false
      }
    },

    resetForm () {
      this.form = {
        id: null,
        government_exam_id: this.filterExamId || null,
        name: '',
        description: '',
        sort_order: 0,
        is_active: true
      }

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

      this.form = {
        id: subject.id,
        government_exam_id: subject.government_exam_id,
        name: subject.name || '',
        description: subject.description || '',
        sort_order: subject.sort_order || 0,
        is_active: !!subject.is_active
      }

      this.dialog = true
    },

    closeDialog () {
      this.dialog = false
      this.resetForm()
    },

    async saveSubject () {
      if (!this.$refs.subjectForm.validate()) {
        return
      }

      try {
        this.saving = true

        const payload = {
          government_exam_id: this.form.government_exam_id,
          name: this.form.name.trim(),
          description: this.form.description || null,
          sort_order: Number(this.form.sort_order) || 0,
          is_active: this.form.is_active
        }

        let response

        if (this.isEdit) {
          response = await this.$axios.put(
            `/admin/government-exam-subjects/${this.form.id}`,
            payload
          )
        } else {
          response = await this.$axios.post(
            '/admin/government-exam-subjects',
            payload
          )
        }

        this.notify(
          'success',
          response.data.message || 'Subject saved successfully'
        )

        this.dialog = false
        this.resetForm()

        await this.loadSubjects()
      } catch (error) {
        console.error('Failed to save subject:', error.response || error)

        const data = error.response && error.response.data
        let message = (data && data.message) || 'Failed to save subject'

        if (data && data.errors) {
          const firstField = Object.keys(data.errors)[0]
          if (firstField && data.errors[firstField].length) {
            message = data.errors[firstField][0]
          }
        }

        this.notify('error', message)
      } finally {
        this.saving = false
      }
    },

    async deleteSubject (subject) {
      if (!window.confirm(
        `Are you sure you want to delete "${subject.name}"?`
      )) {
        return
      }

      try {
        const response = await this.$axios.delete(
          `/admin/government-exam-subjects/${subject.id}`
        )

        this.notify(
          'success',
          response.data.message || 'Subject deleted successfully'
        )

        await this.loadSubjects()
      } catch (error) {
        console.error('Failed to delete subject:', error.response || error)

        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          'Failed to delete subject'

        this.notify('error', message)
      }
    }
  }
}
</script>
