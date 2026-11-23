
<template>
  <v-container fluid>
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="7">
        <h2 class="text-h5 font-weight-bold">
          Government Exams
        </h2>
        <p class="grey--text mb-0">
          Register and manage government examinations.
        </p>
      </v-col>

      <v-col cols="12" md="5" class="text-md-right">
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>
            mdi-plus
          </v-icon>
          Add Exam
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filter -->
    <v-card outlined class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-select
              v-model="filterCategory"
              :items="categories"
              item-text="name"
              item-value="id"
              label="Filter by Category"
              outlined
              dense
              clearable
              hide-details
              @change="loadExams"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Exams Table -->
    <v-card outlined>
      <v-card-title>
        Registered Exams
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search exams"
          single-line
          hide-details
          dense
          outlined
          style="max-width: 280px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="exams"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-medium">
            {{ item.name }}
          </div>
          <small class="grey--text">{{ item.slug }}</small>
        </template>

        <template v-slot:item.category="{ item }">
          {{ item.category ? item.category.name : '—' }}
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip
            small
            :color="item.is_active ? 'success' : 'grey'"
            text-color="white"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editExam(item)">
            <v-icon small>
              mdi-pencil
            </v-icon>
          </v-btn>

          <v-btn
            icon
            small
            color="error"
            @click="confirmDelete(item)"
          >
            <v-icon small>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="pa-6 text-center grey--text">
            No government exams found.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Edit Government Exam' : 'Register Government Exam' }}
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-5">
          <v-form ref="examForm" v-model="valid">
            <v-select
              v-model="form.category_id"
              :items="categories"
              item-text="name"
              item-value="id"
              label="Exam Category"
              outlined
              dense
              :rules="[rules.required]"
              required
            />

            <v-text-field
              v-model="form.name"
              label="Exam Name"
              outlined
              dense
              :rules="[rules.required]"
              required
            />

            <v-text-field
              v-model="form.exam_type"
              label="Exam Type"
              hint="Example: Open, Limited, Competitive"
              persistent-hint
              outlined
              dense
            />

            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              dense
              rows="3"
              auto-grow
            />

            <v-switch
              v-model="form.is_active"
              label="Active"
              color="success"
              inset
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!valid || saving"
            @click="saveExam"
          >
            {{ isEdit ? 'Update Exam' : 'Save Exam' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Exam?</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedExam ? selectedExam.name : '' }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteExam"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'GovernmentExamsPage',

  data () {
    return {
      loading: false,
      saving: false,
      deleting: false,
      dialog: false,
      deleteDialog: false,
      isEdit: false,
      valid: false,
      search: '',

      categories: [],
      exams: [],
      filterCategory: null,
      selectedExam: null,

      headers: [
        { text: 'Exam Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Exam Type', value: 'exam_type' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ],

      form: {
        id: null,
        category_id: null,
        name: '',
        exam_type: '',
        description: '',
        is_active: true
      },

      rules: {
        required: value => !!value || 'This field is required'
      },

      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    }
  },

  mounted () {
    this.loadCategories()
  },

  methods: {
    notify (message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },

    async loadCategories () {
      try {
        const response = await this.$axios.get(
          '/admin/government-exam-categories'
        )

        const result = response.data.data

        this.categories = Array.isArray(result)
          ? result
          : (result.data || [])

        await this.loadExams()
      } catch (error) {
        console.error('Load categories error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to load categories',
          'error'
        )
      }
    },

    async loadExams () {
      this.loading = true

      try {
        const params = {}

        if (this.filterCategory) {
          params.category_id = this.filterCategory
        }

        const response = await this.$axios.get(
          '/admin/government-exams',
          { params }
        )

        const result = response.data.data

        this.exams = Array.isArray(result)
          ? result
          : (result.data || [])
      } catch (error) {
        console.error('Load exams error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to load exams',
          'error'
        )
      } finally {
        this.loading = false
      }
    },

    openCreateDialog () {
      this.isEdit = false
      this.resetForm()
      this.dialog = true
    },

    editExam (exam) {
      this.isEdit = true

      this.form = {
        id: exam.id,
        category_id: exam.category_id || exam.government_exam_category_id || (
          exam.category ? exam.category.id : null
        ),
        name: exam.name || '',
        exam_type: exam.exam_type || '',
        description: exam.description || '',
        is_active: Boolean(exam.is_active)
      }

      this.dialog = true
    },

    resetForm () {
      this.form = {
        id: null,
        category_id: null,
        name: '',
        exam_type: '',
        description: '',
        is_active: true
      }

      if (this.$refs.examForm) {
        this.$refs.examForm.resetValidation()
      }
    },

    async saveExam () {
      if (!this.$refs.examForm.validate()) { return }

      this.saving = true

      try {
        const payload = {
          category_id: this.form.category_id,
          name: this.form.name,
          exam_type: this.form.exam_type,
          description: this.form.description,
          is_active: this.form.is_active
        }

        if (this.isEdit) {
          await this.$axios.put(
            `/admin/government-exams/${this.form.id}`,
            payload
          )

          this.notify('Government exam updated successfully')
        } else {
          await this.$axios.post(
            '/admin/government-exams',
            payload
          )

          this.notify('Government exam created successfully')
        }

        this.dialog = false
        await this.loadExams()
      } catch (error) {
        console.error('Save exam error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to save exam',
          'error'
        )
      } finally {
        this.saving = false
      }
    },

    confirmDelete (exam) {
      this.selectedExam = exam
      this.deleteDialog = true
    },

    async deleteExam () {
      if (!this.selectedExam) { return }

      this.deleting = true

      try {
        await this.$axios.delete(
          `/admin/government-exams/${this.selectedExam.id}`
        )

        this.notify('Government exam deleted successfully')
        this.deleteDialog = false
        this.selectedExam = null

        await this.loadExams()
      } catch (error) {
        console.error('Delete exam error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to delete exam',
          'error'
        )
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>
