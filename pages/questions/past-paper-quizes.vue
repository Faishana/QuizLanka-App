<template>
  <div class="past-paper-quizes-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <div class="page-header">
      <div>
        <div class="page-eyebrow">
          QUIZ MANAGEMENT
        </div>

        <h1 class="page-title">
          Past Paper Quizzes
        </h1>

        <p class="page-subtitle">
          Manage manually entered past papers and their questions.
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          outlined
          class="header-btn"
          @click="$router.push('/questions')"
        >
          <v-icon left size="18">
            mdi-arrow-left
          </v-icon>
          Question Bank
        </v-btn>

        <v-btn
          class="add-btn"
          @click="$router.push('/questions/past-paper')"
        >
          <v-icon left size="18">
            mdi-plus
          </v-icon>
          Add Past Paper
        </v-btn>
      </div>
    </div>

    <!-- =====================================================
         SUMMARY CARDS
    ====================================================== -->
    <v-row class="summary-row">
      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div class="summary-icon cyan">
            <v-icon>mdi-file-document-multiple-outline</v-icon>
          </div>
          <div>
            <div class="summary-label">
              Total Papers
            </div>
            <div class="summary-value">
              {{ totalPapers }}
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div class="summary-icon purple">
            <v-icon>mdi-help-circle-outline</v-icon>
          </div>
          <div>
            <div class="summary-label">
              Total Questions
            </div>
            <div class="summary-value">
              {{ totalQuestions }}
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div class="summary-icon green">
            <v-icon>mdi-image-multiple-outline</v-icon>
          </div>
          <div>
            <div class="summary-label">
              Papers Loaded
            </div>
            <div class="summary-value">
              {{ pastPapers.length }}
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div class="summary-icon amber">
            <v-icon>mdi-calendar-range</v-icon>
          </div>
          <div>
            <div class="summary-label">
              Latest Year
            </div>
            <div class="summary-value">
              {{ latestYear || '-' }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- =====================================================
         FILTER CARD
    ====================================================== -->
    <v-card flat class="panel-card filter-card">
      <v-card-text>
        <div class="filter-header">
          <div>
            <div class="filter-title">
              Filter Past Papers
            </div>
            <div class="filter-subtitle">
              Find papers by grade, subject, year or medium.
            </div>
          </div>

          <v-btn
            text
            small
            class="clear-filter-btn"
            @click="clearFilters"
          >
            Clear Filters
          </v-btn>
        </div>

        <v-row class="mt-3">
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.grade_id"
              :items="grades"
              item-text="name"
              item-value="id"
              label="Grade"
              outlined
              dense
              clearable
              hide-details
              class="dark-field"
              @change="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.subject_id"
              :items="subjects"
              item-text="name"
              item-value="id"
              label="Subject"
              outlined
              dense
              clearable
              hide-details
              class="dark-field"
              @change="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.year"
              :items="years"
              label="Year"
              outlined
              dense
              clearable
              hide-details
              class="dark-field"
              @change="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.medium"
              :items="mediums"
              item-text="text"
              item-value="value"
              label="Medium"
              outlined
              dense
              clearable
              hide-details
              class="dark-field"
              @change="onFilterChange"
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center justify-end">
            <v-btn
              outlined
              class="refresh-btn"
              :loading="loading"
              @click="loadPastPapers"
            >
              <v-icon left size="18">
                mdi-refresh
              </v-icon>
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- =====================================================
         LOADING
    ====================================================== -->
    <v-card v-if="loading" flat class="panel-card loading-card">
      <v-card-text>
        <v-progress-circular
          indeterminate
          size="38"
          width="3"
          color="#22D3EE"
        />

        <div class="loading-title">
          Loading past papers...
        </div>

        <div class="loading-subtitle">
          Please wait while we load the manually entered quizzes.
        </div>
      </v-card-text>
    </v-card>

    <!-- =====================================================
         EMPTY
    ====================================================== -->
    <v-card
      v-else-if="pastPapers.length === 0"
      flat
      class="panel-card empty-card"
    >
      <v-card-text>
        <div class="empty-icon">
          <v-icon size="48">
            mdi-file-document-off-outline
          </v-icon>
        </div>

        <div class="empty-title">
          No Past Papers Found
        </div>

        <div class="empty-subtitle">
          There are no past papers matching your current filters.
        </div>

        <v-btn
          class="add-btn mt-5"
          @click="$router.push('/questions/past-paper')"
        >
          <v-icon left size="18">
            mdi-plus
          </v-icon>
          Add Past Paper
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- =====================================================
         PAST PAPER LIST VIEW
    ====================================================== -->
    <v-card v-else flat class="panel-card list-card">
      <!-- Column headers -->
      <div class="list-head">
        <div>Year</div>
        <div>Paper</div>
        <div class="col-grade">
          Grade
        </div>
        <div class="col-subject">
          Subject
        </div>
        <div class="col-medium">
          Medium
        </div>
        <div class="col-questions">
          Questions
        </div>
        <div class="col-actions">
          Actions
        </div>
      </div>

      <!-- Rows -->
      <div
        v-for="paper in pastPapers"
        :key="paper.id"
        class="list-row"
        tabindex="0"
        role="button"
        @click="viewPaper(paper)"
        @keyup.enter="viewPaper(paper)"
      >
        <div>
          <span class="paper-year">{{ paper.year }}</span>
        </div>

        <div class="col-title">
          <div class="paper-title">
            {{ paper.title }}
          </div>

          <!-- Shown only on small screens, where the columns are hidden -->
          <div class="row-meta">
            {{ paper.grade ? paper.grade.name : '-' }}
            · {{ paper.subject ? paper.subject.name : '-' }}
            · {{ getMediumName(paper.medium) }}
            · {{ paper.total_questions || 0 }} questions
          </div>
        </div>

        <div class="col-grade">
          <v-chip x-small class="chip-cyan">
            {{ paper.grade ? paper.grade.name : '-' }}
          </v-chip>
        </div>

        <div class="col-subject">
          <v-chip x-small class="chip-violet">
            {{ paper.subject ? paper.subject.name : '-' }}
          </v-chip>
        </div>

        <div class="col-medium">
          <v-chip x-small class="chip-green">
            {{ getMediumName(paper.medium) }}
          </v-chip>
        </div>

        <div class="col-questions question-stat">
          {{ paper.total_questions || 0 }}
        </div>

        <div class="col-actions row-actions">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-view"
                v-on="on"
                @click.stop="viewPaper(paper)"
              >
                <v-icon size="19">
                  mdi-eye-outline
                </v-icon>
              </v-btn>
            </template>
            View
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-edit"
                v-on="on"
                @click.stop="editPaper(paper)"
              >
                <v-icon size="19">
                  mdi-pencil-outline
                </v-icon>
              </v-btn>
            </template>
            Edit
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-delete"
                v-on="on"
                @click.stop="confirmDelete(paper)"
              >
                <v-icon size="19">
                  mdi-delete-outline
                </v-icon>
              </v-btn>
            </template>
            Delete
          </v-tooltip>
        </div>
      </div>
    </v-card>

    <!-- =====================================================
         PAGINATION
    ====================================================== -->
    <div
      v-if="pagination.lastPage > 1"
      class="pagination-wrapper"
    >
      <v-pagination
        v-model="pagination.currentPage"
        :length="pagination.lastPage"
        total-visible="7"
        color="#22D3EE"
        dark
        @input="loadPastPapers"
      />
    </div>

    <!-- =====================================================
         VIEW DIALOG
    ====================================================== -->
    <v-dialog
      v-model="viewDialog"
      max-width="1050"
      scrollable
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-header">
          <div v-if="selectedPaper" class="dialog-header-content">
            <div class="dialog-eyebrow">
              PAST PAPER QUIZ
            </div>

            <div class="dialog-title">
              {{ selectedPaper.title }}
            </div>

            <div class="dialog-meta">
              {{ selectedPaper.grade ? selectedPaper.grade.name : '' }}

              <span v-if="selectedPaper.subject">
                · {{ selectedPaper.subject.name }}
              </span>

              <span>
                · {{ selectedPaper.year }}
              </span>

              <span>
                · {{ getMediumName(selectedPaper.medium) }}
              </span>
            </div>
          </div>

          <v-spacer />

          <v-btn
            icon
            class="close-dialog-btn"
            @click="viewDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="dialog-divider" />

        <v-card-text class="dialog-body">
          <!-- Loading -->
          <div v-if="loadingView" class="dialog-loading">
            <v-progress-circular
              indeterminate
              color="#22D3EE"
              size="38"
            />
            <div>
              Loading questions...
            </div>
          </div>

          <!-- Questions -->
          <div
            v-else-if="
              selectedPaper &&
                selectedPaper.questions &&
                selectedPaper.questions.length
            "
          >
            <div
              v-for="question in selectedPaper.questions"
              :key="question.id"
              class="quiz-question"
            >
              <div class="question-header">
                <div class="question-number">
                  {{ question.question_number }}
                </div>

                <div class="question-heading">
                  Question {{ question.question_number }}
                </div>

                <v-spacer />

                <v-chip
                  x-small
                  :class="getDifficultyClass(question.difficulty)"
                >
                  {{ question.difficulty }}
                </v-chip>
              </div>

              <div class="question-text">
                {{ question.question_text }}
              </div>

              <div v-if="question.image_url" class="question-image">
                <img
                  :src="question.image_url"
                  alt="Question image"
                  loading="lazy"
                >
              </div>

              <div class="options-grid">
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  :class="[
                    'quiz-option',
                    {
                      'correct-option':
                        option.option_key === question.correct_answer
                    }
                  ]"
                >
                  <div class="option-key">
                    {{ option.option_key }}
                  </div>

                  <div class="option-text">
                    {{ option.option_text }}
                  </div>

                  <v-icon
                    v-if="option.option_key === question.correct_answer"
                    size="18"
                    color="#4ADE80"
                  >
                    mdi-check-circle
                  </v-icon>
                </div>
              </div>

              <div v-if="question.explanation" class="explanation-box">
                <div class="explanation-heading">
                  <v-icon left size="17">
                    mdi-lightbulb-outline
                  </v-icon>
                  Explanation
                </div>

                <div class="explanation-text">
                  {{ question.explanation }}
                </div>
              </div>
            </div>
          </div>

          <!-- No Questions -->
          <div v-else class="dialog-empty">
            <v-icon size="46">
              mdi-help-circle-outline
            </v-icon>
            <div>
              No questions found for this paper.
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-footer">
          <div v-if="selectedPaper" class="footer-question-count">
            {{ selectedPaper.questions ? selectedPaper.questions.length : 0 }}
            Questions
          </div>

          <v-spacer />

          <v-btn
            outlined
            class="dialog-close"
            @click="viewDialog = false"
          >
            Close
          </v-btn>

          <v-btn
            class="dialog-edit"
            :disabled="!selectedPaper"
            @click="editSelectedPaper"
          >
            <v-icon left size="17">
              mdi-pencil-outline
            </v-icon>
            Edit Paper
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- =====================================================
         DELETE DIALOG
    ====================================================== -->
    <v-dialog v-model="deleteDialog" max-width="470">
      <v-card class="dialog-card">
        <v-card-text class="delete-dialog-body">
          <div class="delete-icon">
            <v-icon size="48">
              mdi-delete-alert-outline
            </v-icon>
          </div>

          <div class="delete-title">
            Delete Past Paper?
          </div>

          <div class="delete-paper-name">
            {{ paperToDelete ? paperToDelete.title : '' }}
          </div>

          <div class="delete-message">
            This will permanently delete the paper,
            all its questions and all answer options.
          </div>
        </v-card-text>

        <v-card-actions class="dialog-footer">
          <v-spacer />

          <v-btn
            text
            class="cancel-btn"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            class="confirm-delete-btn"
            :loading="deleting"
            @click="deletePaper"
          >
            <v-icon left size="17">
              mdi-delete-outline
            </v-icon>
            Delete Paper
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
      loadingView: false,
      deleting: false,

      grades: [],
      subjects: [],

      pastPapers: [],

      totalPapers: 0,
      totalQuestions: 0,

      filters: {
        grade_id: null,
        subject_id: null,
        year: null,
        medium: null
      },

      years: Array.from(
        { length: 30 },
        (_, index) => 2026 - index
      ),

      mediums: [
        { text: 'Sinhala', value: 'si' },
        { text: 'English', value: 'en' },
        { text: 'Tamil', value: 'ta' }
      ],

      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0
      },

      selectedPaper: null,
      viewDialog: false,

      deleteDialog: false,
      paperToDelete: null
    }
  },

  computed: {
    latestYear () {
      if (!this.pastPapers.length) {
        return null
      }

      const years = this.pastPapers
        .map(paper => Number(paper.year))
        .filter(year => year)

      if (!years.length) {
        return null
      }

      return Math.max(...years)
    }
  },

  async mounted () {
    await Promise.all([
      this.loadGrades(),
      this.loadSubjects()
    ])

    await this.loadPastPapers()
  },

  methods: {
    // =====================================================
    // LOAD GRADES
    // =====================================================
    async loadGrades () {
      try {
        const response = await this.$axios.get('/public/grades')

        if (response.data.success) {
          this.grades = response.data.data || []
        }
      } catch (error) {
        console.error('Unable to load grades:', error)
      }
    },

    // =====================================================
    // LOAD SUBJECTS
    // =====================================================
    async loadSubjects () {
      try {
        const response = await this.$axios.get('/public/subjects')

        if (response.data.success) {
          this.subjects = response.data.data || []
        }
      } catch (error) {
        console.error('Unable to load subjects:', error)
      }
    },

    // =====================================================
    // LOAD PAST PAPERS
    // =====================================================
    async loadPastPapers () {
      this.loading = true

      try {
        const params = {
          page: this.pagination.currentPage
        }

        if (this.filters.grade_id) {
          params.grade_id = this.filters.grade_id
        }

        if (this.filters.subject_id) {
          params.subject_id = this.filters.subject_id
        }

        if (this.filters.year) {
          params.year = this.filters.year
        }

        if (this.filters.medium) {
          params.medium = this.filters.medium
        }

        const response = await this.$axios.get('/admin/past-papers', {
          params
        })

        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Unable to load past papers.')
        }

        const result = data.data || {}

        this.pastPapers = result.data || []

        this.totalPapers = result.total || this.pastPapers.length

        this.totalQuestions = this.pastPapers.reduce(
          (total, paper) => total + Number(paper.total_questions || 0),
          0
        )

        this.pagination.currentPage = result.current_page || 1
        this.pagination.lastPage = result.last_page || 1
        this.pagination.perPage = result.per_page || 20
        this.pagination.total = result.total || this.pastPapers.length
      } catch (error) {
        this.handleApiError(error, 'Unable to load past papers.')
      } finally {
        this.loading = false
      }
    },

    // =====================================================
    // FILTER CHANGED (go back to page 1, then reload)
    // =====================================================
    onFilterChange () {
      this.pagination.currentPage = 1
      this.loadPastPapers()
    },

    // =====================================================
    // VIEW PAPER
    // =====================================================
    async viewPaper (paper) {
      this.selectedPaper = null
      this.loadingView = true
      this.viewDialog = true

      try {
        const response = await this.$axios.get(
          `/admin/past-papers/${paper.id}`
        )

        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Unable to load past paper.')
        }

        this.selectedPaper = data.data
      } catch (error) {
        this.viewDialog = false

        this.handleApiError(error, 'Unable to load past paper.')
      } finally {
        this.loadingView = false
      }
    },

    // =====================================================
    // EDIT PAPER
    // =====================================================
    editPaper (paper) {
      this.$router.push({
        path: '/questions/past-paper',
        query: {
          edit: paper.id
        }
      })
    },

    // =====================================================
    // EDIT SELECTED PAPER
    // =====================================================
    editSelectedPaper () {
      if (!this.selectedPaper) {
        return
      }

      const id = this.selectedPaper.id

      this.viewDialog = false

      this.$router.push({
        path: '/questions/past-paper',
        query: {
          edit: id
        }
      })
    },

    // =====================================================
    // CONFIRM DELETE
    // =====================================================
    confirmDelete (paper) {
      this.paperToDelete = paper
      this.deleteDialog = true
    },

    // =====================================================
    // DELETE PAPER
    // =====================================================
    async deletePaper () {
      if (!this.paperToDelete) {
        return
      }

      this.deleting = true

      try {
        const response = await this.$axios.delete(
          `/admin/past-papers/${this.paperToDelete.id}`
        )

        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Unable to delete past paper.')
        }

        this.showSuccess('Past paper deleted successfully.')

        this.deleteDialog = false
        this.paperToDelete = null

        await this.loadPastPapers()
      } catch (error) {
        this.handleApiError(error, 'Unable to delete past paper.')
      } finally {
        this.deleting = false
      }
    },

    // =====================================================
    // CLEAR FILTERS
    // =====================================================
    async clearFilters () {
      this.filters = {
        grade_id: null,
        subject_id: null,
        year: null,
        medium: null
      }

      this.pagination.currentPage = 1

      await this.loadPastPapers()
    },

    // =====================================================
    // MEDIUM NAME
    // =====================================================
    getMediumName (medium) {
      const item = this.mediums.find(
        mediumItem => mediumItem.value === medium
      )

      return item ? item.text : medium
    },

    // =====================================================
    // DIFFICULTY CLASS
    // =====================================================
    getDifficultyClass (difficulty) {
      switch (difficulty) {
        case 'easy':
          return 'difficulty-easy'

        case 'medium':
          return 'difficulty-medium'

        case 'hard':
          return 'difficulty-hard'

        default:
          return 'difficulty-default'
      }
    },

    // =====================================================
    // API ERROR
    // =====================================================
    handleApiError (error, fallbackMessage) {
      console.error('Past Paper API Error:', error)

      if (error.response && error.response.data) {
        const responseData = error.response.data

        if (responseData.errors) {
          const firstError = Object.values(responseData.errors)[0]

          if (Array.isArray(firstError) && firstError.length) {
            this.showError(firstError[0])

            return
          }
        }

        if (responseData.message) {
          this.showError(responseData.message)

          return
        }
      }

      this.showError(fallbackMessage)
    },

    // =====================================================
    // SUCCESS
    // =====================================================
    showSuccess (message) {
      if (this.$toast) {
        this.$toast.success(message)
      } else {
        alert(message)
      }
    },

    // =====================================================
    // ERROR
    // =====================================================
    showError (message) {
      if (this.$toast) {
        this.$toast.error(message)
      } else {
        alert(message)
      }
    }
  }
}
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.past-paper-quizes-page {
  padding-bottom: 50px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.page-eyebrow {
  color: #22d3ee;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 7px;
}

.page-title {
  color: #f8fafc;
  font-size: 29px;
  line-height: 1.2;
  font-weight: 800;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 7px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.header-btn {
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

.add-btn {
  background: #22d3ee !important;
  color: #082f49 !important;
  font-weight: 800 !important;
}

/* =========================================================
   SUMMARY
========================================================= */

.summary-row {
  margin-bottom: 8px;
}

.summary-card {
  min-height: 92px;
  padding: 18px;
  border-radius: 14px;
  background: #111827;
  border: 1px solid #1f2937;
  display: flex;
  align-items: center;
  gap: 13px;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon.cyan { background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
.summary-icon.purple { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
.summary-icon.green { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.summary-icon.amber { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

.summary-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 3px;
}

.summary-value {
  color: #f8fafc;
  font-size: 23px;
  font-weight: 800;
}

/* =========================================================
   FILTER
========================================================= */

.panel-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 14px !important;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-title {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 800;
}

.filter-subtitle {
  color: #64748b;
  font-size: 11px;
  margin-top: 3px;
}

.clear-filter-btn {
  color: #64748b !important;
}

.clear-filter-btn:hover {
  color: #22d3ee !important;
}

.dark-field >>> .v-input__slot {
  background: #0f172a !important;
}

.dark-field >>> fieldset {
  border-color: #334155 !important;
}

.dark-field >>> input,
.dark-field >>> .v-select__selection {
  color: #f8fafc !important;
}

.dark-field >>> label {
  color: #64748b !important;
}

.refresh-btn {
  border-color: #334155 !important;
  color: #22d3ee !important;
}

/* =========================================================
   LOADING / EMPTY
========================================================= */

.loading-card,
.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-card { min-height: 300px; }
.empty-card { min-height: 330px; }

.loading-title {
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 700;
  margin-top: 15px;
}

.loading-subtitle {
  color: #64748b;
  font-size: 12px;
  margin-top: 5px;
}

.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 20px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #475569;
}

.empty-title {
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 800;
  margin-top: 18px;
}

.empty-subtitle {
  color: #64748b;
  font-size: 12px;
  margin-top: 6px;
}

/* =========================================================
   LIST VIEW
========================================================= */

.list-card {
  overflow: hidden;
}

/* Shared column layout for the header and every row */
.list-head,
.list-row {
  display: grid;
  grid-template-columns:
    72px
    minmax(220px, 1fr)
    110px
    150px
    100px
    90px
    120px;
  align-items: center;
  column-gap: 16px;
  padding: 0 20px;
}

.list-head {
  min-height: 46px;
  background: rgba(148, 163, 184, 0.05);
  border-bottom: 1px solid #1f2937;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.list-head .col-questions,
.list-head .col-actions,
.list-row .col-questions,
.list-row .col-actions {
  text-align: right;
}

.list-row {
  min-height: 68px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1f2937;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:hover,
.list-row:focus-visible {
  background: rgba(34, 211, 238, 0.045);
  border-left-color: #22d3ee;
  outline: none;
}

.paper-year {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  height: 28px;
  padding: 0 9px;
  border-radius: 7px;
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  font-size: 11px;
  font-weight: 800;
}

.col-title {
  min-width: 0;
}

.paper-title {
  color: #f8fafc;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row-meta {
  display: none;
  color: #64748b;
  font-size: 11.5px;
  margin-top: 3px;
}

.chip-cyan { background: rgba(34, 211, 238, 0.12) !important; color: #22d3ee !important; }
.chip-violet { background: rgba(139, 92, 246, 0.14) !important; color: #a78bfa !important; }
.chip-green { background: rgba(52, 211, 153, 0.14) !important; color: #34d399 !important; }

.question-stat {
  color: #22d3ee;
  font-size: 14px;
  font-weight: 800;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.act-view { color: #22d3ee !important; }
.act-edit { color: #a78bfa !important; }
.act-delete { color: #64748b !important; }
.act-delete:hover { color: #f87171 !important; }

/* =========================================================
   PAGINATION
========================================================= */

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

/* =========================================================
   DIALOG
========================================================= */

.dialog-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  padding: 20px 22px !important;
}

.dialog-header-content {
  min-width: 0;
}

.dialog-eyebrow {
  color: #22d3ee;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.dialog-title {
  color: #f8fafc;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.4;
  margin-top: 4px;
}

.dialog-meta {
  color: #64748b;
  font-size: 11px;
  margin-top: 5px;
}

.close-dialog-btn {
  color: #64748b !important;
}

.dialog-divider {
  border-color: #1f2937 !important;
}

.dialog-body {
  max-height: 72vh;
  padding: 8px 22px 25px !important;
}

.dialog-loading {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #64748b;
  font-size: 12px;
}

.quiz-question {
  padding: 21px 0;
  border-bottom: 1px solid #1f2937;
}

.quiz-question:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-number {
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
  font-size: 11px;
  font-weight: 800;
}

.question-heading {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 800;
}

.question-text {
  color: #f8fafc;
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  margin-top: 13px;
}

.question-image {
  max-width: 680px;
  margin-top: 15px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #0f172a;
}

.question-image img {
  display: block;
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 17px;
}

.quiz-option {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  border: 1px solid #1f2937;
  background: #0f172a;
}

.correct-option {
  border-color: rgba(74, 222, 128, 0.35);
  background: rgba(34, 197, 94, 0.05);
}

.option-key {
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #1e293b;
  color: #22d3ee;
  font-size: 11px;
  font-weight: 800;
}

.option-text {
  flex: 1;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.5;
}

.explanation-box {
  margin-top: 16px;
  padding: 12px 14px;
  border-left: 3px solid #22d3ee;
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.045);
}

.explanation-heading {
  color: #22d3ee;
  font-size: 11px;
  font-weight: 800;
}

.explanation-text {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.65;
  margin-top: 5px;
  white-space: pre-wrap;
}

.dialog-empty {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 12px;
}

.dialog-footer {
  min-height: 65px;
  padding: 12px 20px !important;
  border-top: 1px solid #1f2937;
}

.footer-question-count {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.dialog-close {
  border-color: #334155 !important;
  color: #94a3b8 !important;
}

.dialog-edit {
  background: #8b5cf6 !important;
  color: #ffffff !important;
  font-weight: 700;
}

/* =========================================================
   DIFFICULTY
========================================================= */

.difficulty-easy { background: rgba(34, 197, 94, 0.12) !important; color: #4ade80 !important; }
.difficulty-medium { background: rgba(245, 158, 11, 0.12) !important; color: #fbbf24 !important; }
.difficulty-hard { background: rgba(239, 68, 68, 0.12) !important; color: #f87171 !important; }
.difficulty-default { background: #1e293b !important; color: #94a3b8 !important; }

/* =========================================================
   DELETE DIALOG
========================================================= */

.delete-dialog-body {
  text-align: center;
  padding: 32px 28px 20px !important;
}

.delete-icon {
  width: 72px;
  height: 72px;
  margin: auto;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
}

.delete-title {
  color: #f8fafc;
  font-size: 19px;
  font-weight: 800;
  margin-top: 17px;
}

.delete-paper-name {
  color: #f87171;
  font-size: 13px;
  font-weight: 700;
  margin-top: 6px;
}

.delete-message {
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
  margin-top: 13px;
}

.cancel-btn {
  color: #94a3b8 !important;
}

.confirm-delete-btn {
  background: #ef4444 !important;
  color: #ffffff !important;
  font-weight: 700;
}

/* =========================================================
   RESPONSIVE
========================================================= */

/* Medium screens: drop the Subject and Medium columns, keep the rest */
@media (max-width: 1100px) {
  .list-head,
  .list-row {
    grid-template-columns:
      72px
      minmax(180px, 1fr)
      110px
      90px
      110px;
  }

  .col-subject,
  .col-medium {
    display: none;
  }

  .row-meta {
    display: block;
  }
}

/* Small screens: year, title (with meta line) and actions only */
@media (max-width: 760px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn {
    flex: 1;
  }

  .filter-header {
    align-items: flex-start;
  }

  .list-head {
    display: none;
  }

  .list-row {
    grid-template-columns: 60px minmax(0, 1fr) auto;
    column-gap: 12px;
    padding-left: 14px;
    padding-right: 10px;
  }

  .col-grade,
  .col-questions {
    display: none;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
