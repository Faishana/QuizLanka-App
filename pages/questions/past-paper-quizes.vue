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
      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <div class="summary-card">
          <div class="summary-icon cyan">
            <v-icon>
              mdi-file-document-multiple-outline
            </v-icon>
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

      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <div class="summary-card">
          <div class="summary-icon purple">
            <v-icon>
              mdi-help-circle-outline
            </v-icon>
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

      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <div class="summary-card">
          <div class="summary-icon green">
            <v-icon>
              mdi-image-multiple-outline
            </v-icon>
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

      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <div class="summary-card">
          <div class="summary-icon amber">
            <v-icon>
              mdi-calendar-range
            </v-icon>
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
    <v-card
      flat
      class="panel-card filter-card"
    >
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
          <!-- Grade -->
          <v-col
            cols="12"
            sm="6"
            md="3"
          >
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
              @change="loadPastPapers"
            />
          </v-col>

          <!-- Subject -->
          <v-col
            cols="12"
            sm="6"
            md="3"
          >
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
              @change="loadPastPapers"
            />
          </v-col>

          <!-- Year -->
          <v-col
            cols="12"
            sm="6"
            md="2"
          >
            <v-select
              v-model="filters.year"
              :items="years"
              label="Year"
              outlined
              dense
              clearable
              hide-details
              class="dark-field"
              @change="loadPastPapers"
            />
          </v-col>

          <!-- Medium -->
          <v-col
            cols="12"
            sm="6"
            md="2"
          >
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
              @change="loadPastPapers"
            />
          </v-col>

          <!-- Refresh -->
          <v-col
            cols="12"
            md="2"
            class="d-flex align-center justify-end"
          >
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
    <v-card
      v-if="loading"
      flat
      class="panel-card loading-card"
    >
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
         PAST PAPER LIST
    ====================================================== -->
    <div
      v-else
      class="papers-grid"
    >
      <div
        v-for="paper in pastPapers"
        :key="paper.id"
        class="paper-card"
      >
        <!-- Card Top -->
        <div class="paper-card-top">
          <div class="paper-year">
            {{ paper.year }}
          </div>

          <v-menu
            offset-y
            left
          >
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                class="menu-btn"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon size="20">
                  mdi-dots-vertical
                </v-icon>
              </v-btn>
            </template>

            <v-list
              dense
              dark
              class="action-menu"
            >
              <v-list-item
                @click="viewPaper(paper)"
              >
                <v-list-item-icon>
                  <v-icon color="#22D3EE">
                    mdi-eye-outline
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  View
                </v-list-item-title>
              </v-list-item>

              <v-list-item
                @click="editPaper(paper)"
              >
                <v-list-item-icon>
                  <v-icon color="#A78BFA">
                    mdi-pencil-outline
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Edit
                </v-list-item-title>
              </v-list-item>

              <v-list-item
                @click="confirmDelete(paper)"
              >
                <v-list-item-icon>
                  <v-icon color="#F87171">
                    mdi-delete-outline
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Paper Title -->
        <div class="paper-title">
          {{ paper.title }}
        </div>

        <!-- Grade / Subject -->
        <div class="paper-meta-row">
          <span class="meta-item">
            <v-icon
              left
              size="15"
            >
              mdi-school-outline
            </v-icon>

            {{
              paper.grade
                ? paper.grade.name
                : '-'
            }}
          </span>

          <span class="meta-item">
            <v-icon
              left
              size="15"
            >
              mdi-book-open-page-variant-outline
            </v-icon>

            {{
              paper.subject
                ? paper.subject.name
                : '-'
            }}
          </span>
        </div>

        <!-- Divider -->
        <div class="paper-divider" />

        <!-- Bottom Stats -->
        <div class="paper-stats">
          <div class="stat">
            <div class="stat-label">
              Medium
            </div>

            <div class="stat-value">
              {{ getMediumName(paper.medium) }}
            </div>
          </div>

          <div class="stat">
            <div class="stat-label">
              Questions
            </div>

            <div class="stat-value question-stat">
              {{ paper.total_questions || 0 }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="paper-actions">
          <v-btn
            text
            small
            class="view-btn"
            @click="viewPaper(paper)"
          >
            <v-icon left size="17">
              mdi-eye-outline
            </v-icon>

            View
          </v-btn>

          <v-btn
            text
            small
            class="edit-btn"
            @click="editPaper(paper)"
          >
            <v-icon left size="17">
              mdi-pencil-outline
            </v-icon>

            Edit
          </v-btn>

          <v-btn
            icon
            small
            class="delete-btn"
            @click="confirmDelete(paper)"
          >
            <v-icon size="18">
              mdi-delete-outline
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>

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
        <!-- Dialog Header -->
        <v-card-title class="dialog-header">
          <div
            v-if="selectedPaper"
            class="dialog-header-content"
          >
            <div class="dialog-eyebrow">
              PAST PAPER QUIZ
            </div>

            <div class="dialog-title">
              {{ selectedPaper.title }}
            </div>

            <div class="dialog-meta">
              {{
                selectedPaper.grade
                  ? selectedPaper.grade.name
                  : ''
              }}

              <span
                v-if="selectedPaper.subject"
              >
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
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="dialog-divider" />

        <!-- Dialog Body -->
        <v-card-text class="dialog-body">
          <!-- Loading -->
          <div
            v-if="loadingView"
            class="dialog-loading"
          >
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
              <!-- Question Header -->
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
                  :class="
                    getDifficultyClass(
                      question.difficulty
                    )
                  "
                >
                  {{ question.difficulty }}
                </v-chip>
              </div>

              <!-- Question Text -->
              <div class="question-text">
                {{ question.question_text }}
              </div>

              <!-- Question Image -->
              <div
                v-if="question.image_url"
                class="question-image"
              >
                <img
                  :src="question.image_url"
                  alt="Question image"
                  loading="lazy"
                >
              </div>

              <!-- Options -->
              <div class="options-grid">
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  :class="[
                    'quiz-option',
                    {
                      'correct-option':
                        option.option_key ===
                        question.correct_answer
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
                    v-if="
                      option.option_key ===
                        question.correct_answer
                    "
                    size="18"
                    color="#4ADE80"
                  >
                    mdi-check-circle
                  </v-icon>
                </div>
              </div>

              <!-- Explanation -->
              <div
                v-if="question.explanation"
                class="explanation-box"
              >
                <div class="explanation-heading">
                  <v-icon
                    left
                    size="17"
                  >
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
          <div
            v-else
            class="dialog-empty"
          >
            <v-icon size="46">
              mdi-help-circle-outline
            </v-icon>

            <div>
              No questions found for this paper.
            </div>
          </div>
        </v-card-text>

        <!-- Dialog Footer -->
        <v-card-actions class="dialog-footer">
          <div
            v-if="selectedPaper"
            class="footer-question-count"
          >
            {{ selectedPaper.questions
              ? selectedPaper.questions.length
              : 0
            }}
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
    <v-dialog
      v-model="deleteDialog"
      max-width="470"
    >
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
            {{
              paperToDelete
                ? paperToDelete.title
                : ''
            }}
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
        {
          text: 'Sinhala',
          value: 'si'
        },
        {
          text: 'English',
          value: 'en'
        },
        {
          text: 'Tamil',
          value: 'ta'
        }
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
        const response =
          await this.$axios.get(
            '/public/grades'
          )

        if (response.data.success) {
          this.grades =
            response.data.data || []
        }
      } catch (error) {
        console.error(
          'Unable to load grades:',
          error
        )
      }
    },

    // =====================================================
    // LOAD SUBJECTS
    // =====================================================
    async loadSubjects () {
      try {
        const response =
          await this.$axios.get(
            '/public/subjects'
          )

        if (response.data.success) {
          this.subjects =
            response.data.data || []
        }
      } catch (error) {
        console.error(
          'Unable to load subjects:',
          error
        )
      }
    },

    // =====================================================
    // LOAD PAST PAPERS
    // =====================================================
    async loadPastPapers () {
      this.loading = true

      try {
        const params = {
          page:
            this.pagination.currentPage
        }

        if (this.filters.grade_id) {
          params.grade_id =
            this.filters.grade_id
        }

        if (this.filters.subject_id) {
          params.subject_id =
            this.filters.subject_id
        }

        if (this.filters.year) {
          params.year =
            this.filters.year
        }

        if (this.filters.medium) {
          params.medium =
            this.filters.medium
        }

        const response =
          await this.$axios.get(
            '/admin/past-papers',
            {
              params
            }
          )

        const data =
          response.data

        if (!data.success) {
          throw new Error(
            data.message ||
            'Unable to load past papers.'
          )
        }

        const result =
          data.data || {}

        this.pastPapers =
          result.data || []

        this.totalPapers =
          result.total ||
          this.pastPapers.length

        this.totalQuestions =
          this.pastPapers.reduce(
            (total, paper) =>
              total +
              Number(
                paper.total_questions || 0
              ),
            0
          )

        this.pagination.currentPage =
          result.current_page ||
          1

        this.pagination.lastPage =
          result.last_page ||
          1

        this.pagination.perPage =
          result.per_page ||
          20

        this.pagination.total =
          result.total ||
          this.pastPapers.length
      } catch (error) {
        this.handleApiError(
          error,
          'Unable to load past papers.'
        )
      } finally {
        this.loading = false
      }
    },

    // =====================================================
    // VIEW PAPER
    // =====================================================
    async viewPaper (paper) {
      this.selectedPaper = null
      this.loadingView = true
      this.viewDialog = true

      try {
        const response =
          await this.$axios.get(
            `/admin/past-papers/${paper.id}`
          )

        const data =
          response.data

        if (!data.success) {
          throw new Error(
            data.message ||
            'Unable to load past paper.'
          )
        }

        this.selectedPaper =
          data.data
      } catch (error) {
        this.viewDialog = false

        this.handleApiError(
          error,
          'Unable to load past paper.'
        )
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

      const id =
        this.selectedPaper.id

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
        const response =
          await this.$axios.delete(
            `/admin/past-papers/${this.paperToDelete.id}`
          )

        const data =
          response.data

        if (!data.success) {
          throw new Error(
            data.message ||
            'Unable to delete past paper.'
          )
        }

        this.showSuccess(
          'Past paper deleted successfully.'
        )

        this.deleteDialog = false
        this.paperToDelete = null

        await this.loadPastPapers()
      } catch (error) {
        this.handleApiError(
          error,
          'Unable to delete past paper.'
        )
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
      const item =
        this.mediums.find(
          mediumItem =>
            mediumItem.value === medium
        )

      return item
        ? item.text
        : medium
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
    handleApiError (
      error,
      fallbackMessage
    ) {
      console.error(
        'Past Paper API Error:',
        error
      )

      if (
        error.response &&
        error.response.data
      ) {
        const responseData =
          error.response.data

        if (
          responseData.errors
        ) {
          const firstError =
            Object.values(
              responseData.errors
            )[0]

          if (
            Array.isArray(firstError) &&
            firstError.length
          ) {
            this.showError(
              firstError[0]
            )

            return
          }
        }

        if (
          responseData.message
        ) {
          this.showError(
            responseData.message
          )

          return
        }
      }

      this.showError(
        fallbackMessage
      )
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

.summary-icon.cyan {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
}

.summary-icon.purple {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
}

.summary-icon.green {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.summary-icon.amber {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

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

.dark-field >>> input {
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
   LOADING
========================================================= */

.loading-card {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

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

/* =========================================================
   EMPTY
========================================================= */

.empty-card {
  min-height: 330px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
   PAPER GRID
========================================================= */

.papers-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.paper-card {
  position: relative;
  min-width: 0;
  padding: 19px;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 14px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.paper-card:hover {
  transform: translateY(-2px);
  border-color: #334155;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.18);
}

.paper-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.menu-btn {
  color: #64748b !important;
}

.paper-title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  margin-top: 14px;
  min-height: 45px;
}

.paper-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 15px;
  margin-top: 11px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #94a3b8;
  font-size: 11px;
}

.meta-item >>> .v-icon {
  color: #64748b;
}

.paper-divider {
  height: 1px;
  background: #1f2937;
  margin: 17px 0;
}

.paper-stats {
  display: flex;
  align-items: center;
  gap: 38px;
}

.stat-label {
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-value {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  margin-top: 4px;
}

.question-stat {
  color: #22d3ee;
}

.paper-actions {
  display: flex;
  align-items: center;
  margin-top: 17px;
  padding-top: 13px;
  border-top: 1px solid #1f2937;
}

.view-btn {
  color: #22d3ee !important;
}

.edit-btn {
  color: #a78bfa !important;
}

.delete-btn {
  color: #64748b !important;
  margin-left: auto;
}

.delete-btn:hover {
  color: #f87171 !important;
}

.action-menu {
  min-width: 155px;
  background: #111827 !important;
  border: 1px solid #334155;
}

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

.difficulty-easy {
  background: rgba(34, 197, 94, 0.12) !important;
  color: #4ade80 !important;
}

.difficulty-medium {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #fbbf24 !important;
}

.difficulty-hard {
  background: rgba(239, 68, 68, 0.12) !important;
  color: #f87171 !important;
}

.difficulty-default {
  background: #1e293b !important;
  color: #94a3b8 !important;
}

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

@media (max-width: 1100px) {
  .papers-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

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

  .papers-grid {
    grid-template-columns: 1fr;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .filter-header {
    align-items: flex-start;
  }
}
</style>
