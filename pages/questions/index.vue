<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <h1>Questions Management</h1>
      </v-col>

      <v-col cols="12" md="2">
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
          @change="applyFilters"
        />
      </v-col>

      <v-col cols="12" md="2">
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
          @change="applyFilters"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filters.difficulty"
          :items="difficultyOptions"
          label="Difficulty"
          dense
          outlined
          clearable
          hide-details
          @change="applyFilters"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search Questions"
          dense
          outlined
          hide-details
          @input="onSearchInput"
        />
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        Questions List
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          @click="loadQuestions"
        >
          <v-icon left>
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
        class="elevation-1"
      >
        <template #item.question_text="{ item }">
          <div
            style="
              max-width: 600px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ item.question_text }}
          </div>
        </template>

        <template #item.correct_answer_display="{ item }">
          <v-chip
            small
            color="blue-grey darken-2"
            text-color="white"
          >
            {{ item.correct_answer }}.
            {{ item.correct_option_text || 'N/A' }}
          </v-chip>
        </template>

        <template #item.grade="{ item }">
          <v-chip
            small
            color="info"
            dark
          >
            {{ item.grade?.name || 'N/A' }}
          </v-chip>
        </template>

        <template #item.subject="{ item }">
          <v-chip
            small
            color="primary"
            dark
          >
            {{ item.subject?.name || 'N/A' }}
          </v-chip>
        </template>

        <template #item.difficulty="{ item }">
          <v-chip
            small
            :color="getDifficultyColor(item.difficulty)"
            dark
          >
            {{ item.difficulty }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            small
            color="warning"
            class="mr-2"
            @click="editQuestion(item)"
          >
            <v-icon small left>
              mdi-pencil
            </v-icon>
            Edit
          </v-btn>

          <v-btn
            small
            color="error"
            @click="deleteQuestion(item)"
          >
            <v-icon small left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-4">
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
      <v-card>
        <v-card-title class="headline">
          Edit Question
        </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="editForm.question_text"
            label="Question"
            outlined
            rows="3"
            required
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.difficulty"
                :items="difficultyOptions"
                item-text="text"
                item-value="value"
                label="Difficulty"
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
              />
            </v-col>
          </v-row>

          <h4 class="mt-4 mb-2">
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
              />
            </v-col>

            <v-col cols="10">
              <v-text-field
                v-model="option.option_text"
                outlined
                dense
                :label="`Option ${option.option_key}`"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="editForm.explanation"
            label="Explanation (Optional)"
            outlined
            rows="3"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="closeEditDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
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
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline error--text">
          Delete Question
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete this question?
          <br>
          <strong>"{{ truncateText(questionToDelete?.question_text, 100) }}"</strong>
          <br><br>
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
        // Load grades for filter
        const gradesResponse = await this.$axios.get('/grades', {
          params: { per_page: 100 }
        })
        if (gradesResponse.data.success) {
          this.grades = gradesResponse.data.data || []
        }

        // Load subjects for filter
        const subjectsResponse = await this.$axios.get('/subjects', {
          params: { per_page: 100 }
        })
        if (subjectsResponse.data.success) {
          this.subjects = subjectsResponse.data.data || []
        }
      } catch (error) {
        console.error('Failed to load lookup data:', error)
      }
    },

    async loadQuestions () {
      try {
        this.loading = true

        // Build query parameters
        const params = {
          page: this.tableOptions.page || 1,
          per_page: this.tableOptions.itemsPerPage || 20
        }

        // Add sorting
        if (this.tableOptions.sortBy && this.tableOptions.sortBy.length > 0) {
          params.sort_by = this.tableOptions.sortBy[0]
          params.sort_order = this.tableOptions.sortDesc[0] ? 'desc' : 'asc'
        }

        // Add search if present
        if (this.search && this.search.trim()) {
          params.search = this.search.trim()
        }

        // Add filters
        if (this.filters.grade_id) {
          params.grade_id = this.filters.grade_id
        }
        if (this.filters.subject_id) {
          params.subject_id = this.filters.subject_id
        }
        if (this.filters.difficulty) {
          params.difficulty = this.filters.difficulty
        }

        const response = await this.$axios.get('/questions', { params })

        // Handle the response structure from backend
        if (response.data.success) {
          const paginatedData = response.data.data

          // Extract questions from paginated data
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

        const response = await this.$axios.get(`/questions/${question.id}`)

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

          // Sort options by option_key (A, B, C, D)
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
      // Validation
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

      // Check if all options have text
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

        const response = await this.$axios.put(
          `/questions/${this.editForm.id}`,
          payload
        )

        if (response.data.success) {
          this.$toast?.success(response.data.message || 'Question updated successfully') ||
            alert('Question updated successfully')
          this.closeEditDialog()
          await this.loadQuestions()
        } else {
          throw new Error('Failed to update question')
        }
      } catch (error) {
        console.error('Failed to update question:', error)

        if (error.response?.data?.message) {
          this.$toast?.error(error.response.data.message) || alert(error.response.data.message)
        } else {
          this.$toast?.error('Failed to update question') || alert('Failed to update question')
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
        const response = await this.$axios.delete(`/questions/${this.questionToDelete.id}`)

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

    getDifficultyColor (difficulty) {
      switch (difficulty?.toLowerCase()) {
        case 'easy':
          return 'success'
        case 'medium':
          return 'warning'
        case 'hard':
          return 'error'
        default:
          return 'grey'
      }
    }
  }
}
</script>

<style scoped>
.v-data-table >>> .v-data-table__wrapper {
  overflow-x: auto;
}
</style>
