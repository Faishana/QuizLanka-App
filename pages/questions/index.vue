<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <h1 class="page-title">
          Questions Management
        </h1>
        <p class="page-subtitle">
          Browse, filter, and maintain the question bank.
        </p>
      </div>
    </div>

    <v-card class="panel-card mb-6" flat>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.grade_id"
              :items="grades"
              item-text="name"
              item-value="id"
              label="Grade"
              dense
              outlined
              clearable
              hide-details
              class="dark-field"
              @change="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.subject_id"
              :items="subjects"
              item-text="name"
              item-value="id"
              label="Subject"
              dense
              outlined
              clearable
              hide-details
              class="dark-field"
              @change="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.difficulty"
              :items="difficultyOptions"
              label="Difficulty"
              dense
              outlined
              clearable
              hide-details
              class="dark-field"
              @change="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search Questions"
              dense
              outlined
              hide-details
              class="dark-field"
              @input="onSearchInput"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="panel-card" flat>
      <v-card-title class="panel-title d-flex align-center">
        Questions List
        <v-spacer />
        <v-btn
          class="refresh-btn"
          small
          :loading="loading"
          @click="loadQuestions"
        >
          <v-icon left size="16">
            mdi-refresh
          </v-icon>
          Refresh
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="questions"
        :loading="loading"
        :server-items-length="totalQuestions"
        :options.sync="tableOptions"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100]
        }"
        class="dark-table"
      >
        <template #item.question_text="{ item }">
          <div class="question-cell">
            {{ item.question_text }}
          </div>
        </template>

        <template #item.correct_answer_display="{ item }">
          <v-chip small class="chip-neutral">
            {{ item.correct_answer }}.
            {{ item.correct_option_text || 'N/A' }}
          </v-chip>
        </template>

        <template #item.grade="{ item }">
          <v-chip small class="chip-cyan">
            {{ item.grade?.name || 'N/A' }}
          </v-chip>
        </template>

        <template #item.subject="{ item }">
          <v-chip small class="chip-violet">
            {{ item.subject?.name || 'N/A' }}
          </v-chip>
        </template>

        <template #item.difficulty="{ item }">
          <v-chip small :class="getDifficultyClass(item.difficulty)">
            {{ item.difficulty }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            small
            class="edit-btn mr-2"
            @click="editQuestion(item)"
          >
            <v-icon small left>
              mdi-pencil
            </v-icon>
            Edit
          </v-btn>

          <v-btn
            small
            class="delete-btn"
            @click="deleteQuestion(item)"
          >
            <v-icon small left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-8 empty-text">
            No questions found
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Question Dialog -->
    <v-dialog
      v-model="editDialog"
      max-width="900"
      scrollable
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Edit Question
        </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="editForm.question_text"
            label="Question"
            outlined
            rows="3"
            required
            class="dark-field mt-4"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.difficulty"
                :items="difficultyOptions"
                item-text="text"
                item-value="value"
                label="Difficulty"
                outlined
                dense
                class="dark-field"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.correct_answer"
                :items="['A', 'B', 'C', 'D']"
                label="Correct Answer"
                outlined
                dense
                required
                class="dark-field"
              />
            </v-col>
          </v-row>

          <h4 class="options-heading mt-2 mb-2">
            Options
          </h4>
          <v-row
            v-for="(option, index) in editForm.options"
            :key="option.id || index"
            class="mb-2"
          >
            <v-col cols="2">
              <v-text-field
                :value="option.option_key"
                readonly
                outlined
                dense
                label="Key"
                class="dark-field"
              />
            </v-col>

            <v-col cols="10">
              <v-text-field
                v-model="option.option_text"
                outlined
                dense
                :label="`Option ${option.option_key}`"
                class="dark-field"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="editForm.explanation"
            label="Explanation (Optional)"
            outlined
            rows="3"
            class="dark-field"
          />
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            text
            class="cancel-btn"
            @click="closeEditDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            class="save-btn"
            :loading="saving"
            @click="updateQuestion"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="480"
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-title dialog-title--danger">
          Delete Question
        </v-card-title>

        <v-card-text class="dialog-body">
          Are you sure you want to delete this question?
          <br>
          <strong class="delete-preview">"{{ truncateText(questionToDelete?.question_text, 100) }}"</strong>
          <br><br>
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            text
            class="cancel-btn"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="delete-confirm-btn"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
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
      deleting: false,

      questions: [],
      search: '',
      searchTimeout: null,

      // Filters
      filters: {
        grade_id: null,
        subject_id: null,
        difficulty: null
      },

      // Lookup data
      grades: [],
      subjects: [],

      // Pagination
      currentPage: 1,
      itemsPerPage: 20,
      totalQuestions: 0,
      tableOptions: {
        page: 1,
        itemsPerPage: 20,
        sortBy: ['id'],
        sortDesc: [false]
      },
      previousOptions: {},

      editDialog: false,
      deleteDialog: false,
      questionToDelete: null,

      difficultyOptions: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],

      editForm: {
        id: null,
        question_text: '',
        correct_answer: '',
        difficulty: 'medium',
        explanation: '',
        options: []
      },

      headers: [
        { text: 'ID', value: 'id', width: '80' },
        { text: 'Question', value: 'question_text', sortable: true },
        { text: 'Correct Answer', value: 'correct_answer_display', sortable: false, width: '150' },
        { text: 'Grade', value: 'grade', width: '100' },
        { text: 'Subject', value: 'subject', width: '120' },
        { text: 'Difficulty', value: 'difficulty', width: '100', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, width: '200' }
      ]
    }
  },

  watch: {
    // Watch for table pagination/sorting changes
    tableOptions: {
      handler (newOptions) {
        if (JSON.stringify(newOptions) !== JSON.stringify(this.previousOptions)) {
          this.previousOptions = { ...newOptions }
          this.loadQuestions()
        }
      },
      deep: true
    }
  },

  mounted () {
    this.loadLookupData()
    this.loadQuestions()
  },

  methods: {
    async loadLookupData () {
      try {
        // Changed to use public endpoints
        const gradesResponse = await this.$axios.get('/public/grades')
        if (gradesResponse.data.success) {
          this.grades = gradesResponse.data.data || []
        }

        const subjectsResponse = await this.$axios.get('/public/subjects')
        if (subjectsResponse.data.success) {
          this.subjects = subjectsResponse.data.data || []
        }
      } catch (error) {
        console.error('Failed to load lookup data:', error)
        if (this.$toast) {
          this.$toast.error('Failed to load grades and subjects')
        } else {
          alert('Failed to load grades and subjects')
        }
      }
    },

    async loadQuestions () {
      try {
        this.loading = true

        const params = {
          page: this.tableOptions.page || 1,
          per_page: this.tableOptions.itemsPerPage || 20
        }

        if (this.tableOptions.sortBy && this.tableOptions.sortBy.length > 0) {
          params.sort_by = this.tableOptions.sortBy[0]
          params.sort_order = this.tableOptions.sortDesc[0] ? 'desc' : 'asc'
        }

        if (this.search && this.search.trim()) {
          params.search = this.search.trim()
        }

        if (this.filters.grade_id) {
          params.grade_id = this.filters.grade_id
        }
        if (this.filters.subject_id) {
          params.subject_id = this.filters.subject_id
        }
        if (this.filters.difficulty) {
          params.difficulty = this.filters.difficulty
        }

        const response = await this.$axios.get('/admin/questions', { params })

        if (response.data.success) {
          const paginatedData = response.data.data

          this.questions = paginatedData.data || []
          this.totalQuestions = paginatedData.total || 0
          this.currentPage = paginatedData.current_page || 1
          this.itemsPerPage = paginatedData.per_page || 20
        } else {
          this.questions = []
          this.totalQuestions = 0
        }
      } catch (error) {
        console.error('Failed to load questions:', error)
        this.$toast?.error('Failed to load questions') || alert('Failed to load questions')
        this.questions = []
        this.totalQuestions = 0
      } finally {
        this.loading = false
      }
    },

    onSearchInput () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        if (this.tableOptions) {
          this.tableOptions.page = 1
        }
        this.loadQuestions()
      }, 500)
    },

    applyFilters () {
      this.currentPage = 1
      if (this.tableOptions) {
        this.tableOptions.page = 1
      }
      this.loadQuestions()
    },

    async editQuestion (question) {
      try {
        this.loading = true

        // Changed to use admin prefix
        const response = await this.$axios.get(`/admin/questions/${question.id}`)

        if (response.data.success) {
          const questionData = response.data.data

          this.editForm = {
            id: questionData.id,
            question_text: questionData.question_text || '',
            correct_answer: questionData.correct_answer || '',
            difficulty: questionData.difficulty || 'medium',
            explanation: questionData.explanation || '',
            options: questionData.options || []
          }

          if (this.editForm.options.length > 0) {
            this.editForm.options.sort((a, b) =>
              a.option_key.localeCompare(b.option_key)
            )
          }

          this.editDialog = true
        } else {
          throw new Error('Failed to load question details')
        }
      } catch (error) {
        console.error('Failed to load question details:', error)
        this.$toast?.error('Failed to load question details') || alert('Failed to load question details')
      } finally {
        this.loading = false
      }
    },

    async updateQuestion () {
      if (!this.editForm.question_text || !this.editForm.question_text.trim()) {
        this.$toast?.error('Question text is required') || alert('Question text is required')
        return
      }

      if (!this.editForm.correct_answer) {
        this.$toast?.error('Correct answer is required') || alert('Correct answer is required')
        return
      }

      if (this.editForm.options.length === 0) {
        this.$toast?.error('Options are required') || alert('Options are required')
        return
      }

      const hasEmptyOptions = this.editForm.options.some(
        option => !option.option_text || !option.option_text.trim()
      )

      if (hasEmptyOptions) {
        this.$toast?.error('All options must have text') || alert('All options must have text')
        return
      }

      this.saving = true

      try {
        const payload = {
          question_text: this.editForm.question_text,
          correct_answer: this.editForm.correct_answer,
          difficulty: this.editForm.difficulty,
          explanation: this.editForm.explanation || null,
          options: this.editForm.options.map(option => ({
            id: option.id,
            option_text: option.option_text
          }))
        }

        // Changed to use admin prefix
        const response = await this.$axios.put(
          `/admin/questions/${this.editForm.id}`,
          payload
        )

        if (response.data.success) {
          if (this.$toast) {
            this.$toast.success(response.data.message || 'Question updated successfully')
          } else {
            alert('Question updated successfully')
          }
          this.closeEditDialog()
          await this.loadQuestions()
        } else {
          throw new Error('Failed to update question')
        }
      } catch (error) {
        console.error('Failed to update question:', error)

        if (error.response?.data?.message) {
          if (this.$toast) {
            this.$toast.error(error.response.data.message)
          } else {
            alert(error.response.data.message)
          }
        } else if (this.$toast) {
          this.$toast.error('Failed to update question')
        } else {
          alert('Failed to update question')
        }
      } finally {
        this.saving = false
      }
    },

    deleteQuestion (question) {
      this.questionToDelete = question
      this.deleteDialog = true
    },

    async confirmDelete () {
      if (!this.questionToDelete) { return }

      this.deleting = true

      try {
        // Changed to use admin prefix
        const response = await this.$axios.delete(`/admin/questions/${this.questionToDelete.id}`)

        if (response.data.success) {
          this.$toast?.success(response.data.message || 'Question deleted successfully') ||
            alert('Question deleted successfully')
          this.deleteDialog = false
          this.questionToDelete = null
          await this.loadQuestions()
        } else {
          throw new Error('Failed to delete question')
        }
      } catch (error) {
        console.error('Failed to delete question:', error)

        if (error.response?.data?.message) {
          this.$toast?.error(error.response.data.message) || alert(error.response.data.message)
        } else {
          this.$toast?.error('Failed to delete question') || alert('Failed to delete question')
        }
      } finally {
        this.deleting = false
      }
    },

    closeEditDialog () {
      this.editDialog = false
      this.editForm = {
        id: null,
        question_text: '',
        correct_answer: '',
        difficulty: 'medium',
        explanation: '',
        options: []
      }
    },

    truncateText (text, length) {
      if (!text) { return '' }
      if (text.length <= length) { return text }
      return text.substring(0, length) + '...'
    },

    getDifficultyClass (difficulty) {
      switch (difficulty?.toLowerCase()) {
        case 'easy':
          return 'chip-green'
        case 'medium':
          return 'chip-amber'
        case 'hard':
          return 'chip-red'
        default:
          return 'chip-neutral'
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

.refresh-btn {
  background: rgba(34, 211, 238, 0.12) !important;
  color: #22D3EE !important;
  text-transform: none;
  font-weight: 600;
  box-shadow: none !important;
}

/* form fields */
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

/* data table */
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
.dark-table ::v-deep .v-data-footer__select .v-select__selection,
.dark-table ::v-deep .v-data-footer__icons-before .v-icon,
.dark-table ::v-deep .v-data-footer__icons-after .v-icon {
  color: #94A3B8 !important;
}

.question-cell {
  max-width: 460px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-text {
  color: #64748B;
}

/* chips */
.chip-neutral { background: rgba(148, 163, 184, 0.14) !important; color: #E2E8F0 !important; }
.chip-cyan { background: rgba(34, 211, 238, 0.14) !important; color: #22D3EE !important; }
.chip-violet { background: rgba(139, 92, 246, 0.16) !important; color: #A78BFA !important; }
.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-amber { background: rgba(245, 158, 11, 0.16) !important; color: #F59E0B !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }

/* action buttons */
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

/* dialogs */
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
.delete-preview {
  color: #F1F5F9;
}
.options-heading {
  color: #CBD5E1;
  font-family: 'Sora', 'Poppins', sans-serif;
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
.delete-confirm-btn {
  background: #F87171 !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
}
</style>
