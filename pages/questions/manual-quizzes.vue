<template>
  <div class="manual-quizzes-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Manual Quizzes
        </h1>
        <p class="page-subtitle">
          Manage manually created quizzes.
        </p>
      </div>

      <div class="header-actions">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              class="refresh-btn"
              :loading="loading"
              v-on="on"
              @click="loadQuizzes"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </template>
          Refresh
        </v-tooltip>

        <v-btn class="primary-btn" to="/questions/quiz-entry">
          <v-icon left size="18">
            mdi-plus
          </v-icon>
          Create Quiz
        </v-btn>
      </div>
    </div>

    <v-row class="summary-row">
      <v-col v-for="card in summaryCards" :key="card.label" cols="6" md="3">
        <div class="summary-card">
          <div class="summary-icon" :class="card.tone">
            <v-icon>{{ card.icon }}</v-icon>
          </div>
          <div>
            <div class="summary-label">
              {{ card.label }}
            </div>
            <div class="summary-value">
              {{ card.value }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-card
      v-if="loading && !quizzes.length"
      flat
      class="panel-card state-card"
    >
      <v-progress-circular indeterminate size="36" width="3" color="#22D3EE" />
      <div class="state-title">
        Loading quizzes...
      </div>
    </v-card>

    <v-card
      v-else-if="!quizzes.length"
      flat
      class="panel-card state-card"
    >
      <div class="state-icon">
        <v-icon size="40">
          mdi-clipboard-text-off-outline
        </v-icon>
      </div>
      <div class="state-title">
        No quizzes available
      </div>
      <div class="state-subtitle">
        Create your first manual quiz to get started.
      </div>
      <v-btn class="primary-btn mt-4" to="/questions/quiz-entry">
        <v-icon left size="18">
          mdi-plus
        </v-icon>
        Create Quiz
      </v-btn>
    </v-card>

    <v-card v-else flat class="panel-card list-card">
      <div class="list-toolbar">
        <span class="list-title">Quiz List</span>
        <v-chip small class="chip-cyan">
          {{ total }} {{ total === 1 ? 'Quiz' : 'Quizzes' }}
        </v-chip>
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="16"
          width="2"
          color="#22D3EE"
          class="ml-3"
        />
      </div>

      <div class="list-head">
        <div>Quiz</div>
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
        <div class="col-time">
          Time
        </div>
        <div class="col-status">
          Status
        </div>
        <div class="col-created">
          Created
        </div>
        <div class="col-actions">
          Actions
        </div>
      </div>

      <div
        v-for="quiz in quizzes"
        :key="quiz.id"
        class="list-row"
        tabindex="0"
        role="button"
        @click="viewQuiz(quiz)"
        @keyup.enter="viewQuiz(quiz)"
      >
        <div class="col-title">
          <div class="quiz-title">
            {{ quiz.title }}
          </div>
          <div class="quiz-topic">
            {{ quiz.topic || 'No topic' }}
          </div>
          <div class="row-meta">
            {{ gradeName(quiz) }} · {{ subjectName(quiz) }} · {{ mediumLabel(quiz.medium) }}
            · {{ questionCount(quiz) }} questions
            <span v-if="quiz.time_limit_minutes"> · {{ quiz.time_limit_minutes }} min</span>
            · {{ quiz.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="col-grade">
          <v-chip x-small class="chip-cyan">
            {{ gradeName(quiz) }}
          </v-chip>
        </div>

        <div class="col-subject">
          <v-chip x-small class="chip-violet">
            {{ subjectName(quiz) }}
          </v-chip>
        </div>

        <div class="col-medium">
          <v-chip x-small class="chip-green">
            {{ mediumLabel(quiz.medium) }}
          </v-chip>
        </div>

        <div class="col-questions question-stat">
          {{ questionCount(quiz) }}
        </div>

        <div class="col-time cell-muted">
          {{ quiz.time_limit_minutes ? quiz.time_limit_minutes + ' min' : '-' }}
        </div>

        <div class="col-status">
          <span
            class="status-pill"
            :class="quiz.is_active ? 'status-pill--active' : 'status-pill--inactive'"
          >
            <span class="status-dot" />
            {{ quiz.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="col-created cell-muted">
          {{ formatDate(quiz.created_at) }}
        </div>

        <div class="col-actions row-actions">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-view"
                v-on="on"
                @click.stop="viewQuiz(quiz)"
              >
                <v-icon size="19">
                  mdi-eye-outline
                </v-icon>
              </v-btn>
            </template>
            View quiz
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-edit"
                v-on="on"
                @click.stop="editQuiz(quiz)"
              >
                <v-icon size="19">
                  mdi-pencil-outline
                </v-icon>
              </v-btn>
            </template>
            Edit quiz
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                class="act-delete"
                v-on="on"
                @click.stop="confirmDelete(quiz)"
              >
                <v-icon size="19">
                  mdi-delete-outline
                </v-icon>
              </v-btn>
            </template>
            Delete quiz
          </v-tooltip>
        </div>
      </div>

      <div class="list-footer">
        <div class="per-page">
          <span>Rows per page</span>
          <v-select
            v-model="perPage"
            :items="perPageOptions"
            dense
            outlined
            hide-details
            class="dark-field per-page-select"
            @change="onPerPageChange"
          />
        </div>

        <div class="range-text">
          {{ rangeText }}
        </div>

        <v-pagination
          v-if="lastPage > 1"
          v-model="page"
          :length="lastPage"
          :total-visible="7"
          color="#22D3EE"
          dark
          class="list-pagination"
          @input="loadQuizzes"
        />
      </div>
    </v-card>

    <!-- VIEW QUIZ DIALOG -->
    <v-dialog v-model="viewDialog" max-width="900" scrollable>
      <v-card class="dialog-card">
        <v-card-title class="dialog-header">
          <div v-if="selectedQuiz" class="dialog-header-content">
            <div class="dialog-title">
              {{ selectedQuiz.title }}
            </div>
            <div class="dialog-meta">
              {{ selectedQuiz.topic || 'No topic' }}
            </div>
          </div>
          <v-spacer />
          <v-btn icon class="close-btn" @click="viewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="dialog-divider" />

        <v-card-text class="dialog-body">
          <div v-if="!selectedQuiz" class="dialog-loading">
            <v-progress-circular indeterminate color="#22D3EE" size="36" />
            <div>Loading quiz...</div>
          </div>

          <template v-else>
            <div class="detail-tiles">
              <div class="detail-tile">
                <div class="tile-label">
                  {{ selectedQuiz.government_exam_subject_id ? 'Government Exam' : 'Grade' }}
                </div>
                <div class="tile-value">
                  {{ gradeName(selectedQuiz) }}
                </div>
              </div>
              <div class="detail-tile">
                <div class="tile-label">
                  Subject
                </div>
                <div class="tile-value">
                  {{ subjectName(selectedQuiz) }}
                </div>
              </div>
              <div class="detail-tile">
                <div class="tile-label">
                  Medium
                </div>
                <div class="tile-value">
                  {{ mediumLabel(selectedQuiz.medium) }}
                </div>
              </div>
              <div class="detail-tile">
                <div class="tile-label">
                  Time limit
                </div>
                <div class="tile-value">
                  {{ selectedQuiz.time_limit_minutes ? selectedQuiz.time_limit_minutes + ' minutes' : '-' }}
                </div>
              </div>
            </div>

            <div class="detail-description">
              <div class="tile-label">
                Description
              </div>
              <div class="description-text">
                {{ selectedQuiz.description || 'No description provided' }}
              </div>
            </div>

            <div class="questions-heading">
              Questions ({{ questionList.length }})
            </div>

            <div
              v-for="(question, index) in questionList"
              :key="question.id || index"
              class="quiz-question"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-text">{{ question.question_text }}</span>
              </div>

              <div class="options-grid">
                <div
                  v-for="option in sortedOptions(question)"
                  :key="option.id || option.option_key"
                  class="quiz-option"
                  :class="{ 'quiz-option--correct': isCorrect(question, option) }"
                >
                  <span class="option-key">{{ option.option_key }}</span>
                  <span class="option-text">{{ option.option_text }}</span>
                  <v-icon v-if="isCorrect(question, option)" size="18" color="#4ADE80">
                    mdi-check-circle
                  </v-icon>
                </div>
              </div>

              <div v-if="question.explanation" class="explanation-box">
                <div class="explanation-heading">
                  Explanation
                </div>
                <div class="explanation-text">
                  {{ question.explanation }}
                </div>
              </div>
            </div>

            <div v-if="!questionList.length" class="dialog-empty">
              No questions found in this quiz.
            </div>
          </template>
        </v-card-text>

        <v-divider class="dialog-divider" />

        <v-card-actions class="dialog-footer">
          <v-btn
            v-if="selectedQuiz"
            outlined
            class="edit-dialog-btn"
            @click="editSelectedQuiz"
          >
            <v-icon left size="17">
              mdi-pencil-outline
            </v-icon>
            Edit
          </v-btn>
          <v-spacer />
          <v-btn text class="clear-btn" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="deleteDialog" max-width="440">
      <v-card class="dialog-card">
        <v-card-text class="delete-body">
          <div class="delete-icon">
            <v-icon size="40">
              mdi-delete-alert-outline
            </v-icon>
          </div>
          <div class="delete-title">
            Delete Manual Quiz?
          </div>
          <div class="delete-name">
            {{ quizToDelete ? quizToDelete.title : '' }}
          </div>
          <div class="delete-message">
            Are you sure you want to delete this quiz? This action cannot be undone.
          </div>
        </v-card-text>
        <v-card-actions class="dialog-footer">
          <v-spacer />
          <v-btn text class="clear-btn" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn class="danger-btn" :loading="deleting" @click="deleteQuiz">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
      bottom
    >
      {{ snackbar.message }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'ManualQuizzesPage',
  middleware: 'auth',

  data () {
    return {
      loading: false,
      deleting: false,
      requestId: 0,

      quizzes: [],
      total: 0,

      page: 1,
      perPage: 20,
      perPageOptions: [10, 20, 50],

      viewDialog: false,
      selectedQuiz: null,

      deleteDialog: false,
      quizToDelete: null,

      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    }
  },

  computed: {
    lastPage () {
      return Math.max(1, Math.ceil(this.total / this.perPage))
    },

    rangeText () {
      if (!this.total) { return '' }
      const start = (this.page - 1) * this.perPage + 1
      const end = Math.min(start + this.quizzes.length - 1, this.total)
      return `${start}-${end} of ${this.total}`
    },

    questionList () {
      return (this.selectedQuiz && this.selectedQuiz.questions) || []
    },

    summaryCards () {
      const questions = this.quizzes.reduce((sum, quiz) => sum + this.questionCount(quiz), 0)
      const active = this.quizzes.filter(quiz => quiz.is_active).length
      const timed = this.quizzes.filter(quiz => Number(quiz.time_limit_minutes) > 0)
      const avgTime = timed.length
        ? Math.round(timed.reduce((sum, quiz) => sum + Number(quiz.time_limit_minutes), 0) / timed.length)
        : 0

      return [
        { label: 'Total quizzes', value: this.total, icon: 'mdi-clipboard-text-multiple-outline', tone: 'cyan' },
        { label: 'Questions on page', value: questions, icon: 'mdi-help-circle-outline', tone: 'purple' },
        { label: 'Active on page', value: active, icon: 'mdi-check-circle-outline', tone: 'green' },
        { label: 'Avg. time on page', value: avgTime ? avgTime + ' min' : '-', icon: 'mdi-clock-outline', tone: 'amber' }
      ]
    }
  },

  mounted () {
    this.loadQuizzes()
  },

  methods: {
    async loadQuizzes () {
      const myRequest = ++this.requestId

      try {
        this.loading = true

        const response = await this.$axios.$get(
          '/admin/manual-quizzes',
          { params: { page: this.page, per_page: this.perPage } }
        )

        if (myRequest !== this.requestId) { return }

        const pagination = response.data || {}
        this.quizzes = pagination.data || []
        this.total = pagination.total || 0
      } catch (error) {
        if (myRequest !== this.requestId) { return }
        console.error('Load manual quizzes error:', error)
        this.showMessage('Unable to load manual quizzes.', 'error')
      } finally {
        if (myRequest === this.requestId) { this.loading = false }
      }
    },

    onPerPageChange () {
      this.page = 1
      this.loadQuizzes()
    },

    async viewQuiz (item) {
      try {
        this.selectedQuiz = null
        this.viewDialog = true

        const response = await this.$axios.$get(
          `/admin/manual-quizzes/${item.id}`
        )

        this.selectedQuiz = response.data || response
      } catch (error) {
        console.error('View manual quiz error:', error)
        this.viewDialog = false
        this.showMessage('Unable to load quiz details.', 'error')
      }
    },

    /* ------------------------------ Edit ------------------------------ */

    editQuiz (quiz) {
      if (!quiz || !quiz.id) { return }

      this.$router.push({
        path: '/questions/quiz-entry',
        query: { edit: quiz.id }
      })
    },

    editSelectedQuiz () {
      const quiz = this.selectedQuiz
      if (!quiz || !quiz.id) { return }

      this.viewDialog = false

      this.$router.push({
        path: '/questions/quiz-entry',
        query: { edit: quiz.id }
      })
    },

    /* ------------------------------ Delete ------------------------------ */

    confirmDelete (item) {
      this.quizToDelete = item
      this.deleteDialog = true
    },

    async deleteQuiz () {
      if (!this.quizToDelete) { return }

      try {
        this.deleting = true

        await this.$axios.$delete(
          `/admin/manual-quizzes/${this.quizToDelete.id}`
        )

        this.deleteDialog = false
        this.quizToDelete = null

        this.showMessage('Quiz deleted successfully.', 'success')

        if (this.quizzes.length === 1 && this.page > 1) {
          this.page--
        }

        await this.loadQuizzes()
      } catch (error) {
        console.error('Delete manual quiz error:', error)

        const message =
          error.response?.data?.message ||
          'Unable to delete quiz. It may contain answers from students.'

        this.showMessage(message, 'error')
      } finally {
        this.deleting = false
      }
    },

    /* ------------------------------ Helpers ------------------------------ */

    questionCount (quiz) {
      return quiz.questions_count || quiz.total_questions || 0
    },

    gradeName (quiz) {
      if (quiz && quiz.government_exam_subject_id) {
        return quiz.government_exam_subject?.exam?.name || 'Government Exam'
      }

      return quiz && quiz.grade ? quiz.grade.name : '-'
    },

    subjectName (quiz) {
      if (quiz && quiz.government_exam_subject_id) {
        return quiz.government_exam_subject?.name || '-'
      }

      return quiz && quiz.subject ? quiz.subject.name : '-'
    },

    sortedOptions (question) {
      return [...(question.options || [])].sort((a, b) =>
        String(a.option_key).localeCompare(String(b.option_key))
      )
    },

    isCorrect (question, option) {
      return !!question.correct_answer && option.option_key === question.correct_answer
    },

    mediumLabel (value) {
      const labels = { si: 'Sinhala', en: 'English', ta: 'Tamil' }
      return labels[value] || value || '-'
    },

    formatDate (value) {
      if (!value) { return '-' }
      return new Date(value).toLocaleDateString('en-GB')
    },

    showMessage (message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    }
  }
}
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.manual-quizzes-page { padding-bottom: 40px; }

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}
.page-title { font-size: 28px; font-weight: 800; color: #f8fafc; margin: 0; }
.page-subtitle { color: #94a3b8; font-size: 14px; margin: 6px 0 0; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.refresh-btn { color: #22d3ee !important; }

.primary-btn {
  background: #22d3ee !important;
  color: #082f49 !important;
  font-weight: 700;
  text-transform: none;
  box-shadow: none !important;
}
.danger-btn {
  background: #ef4444 !important;
  color: #ffffff !important;
  font-weight: 700;
  text-transform: none;
}
.clear-btn { color: #94a3b8 !important; text-transform: none; font-weight: 600; }

.edit-dialog-btn {
  border-color: #f59e0b !important;
  color: #f59e0b !important;
  text-transform: none;
  font-weight: 700;
}

.panel-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 14px !important;
}

/* =========================================================
   SUMMARY
========================================================= */
.summary-row { margin-bottom: 8px; }
.summary-card {
  min-height: 86px;
  padding: 16px;
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
.summary-label { color: #64748b; font-size: 11px; font-weight: 600; margin-bottom: 3px; }
.summary-value { color: #f8fafc; font-size: 22px; font-weight: 800; }

/* =========================================================
   STATES
========================================================= */
.state-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
}
.state-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #475569;
}
.state-title { color: #e2e8f0; font-size: 17px; font-weight: 800; margin-top: 16px; }
.state-subtitle { color: #64748b; font-size: 13px; margin-top: 6px; }

/* =========================================================
   LIST VIEW
========================================================= */
.list-card { overflow: hidden; }

.list-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #1f2937;
}
.list-title { color: #f8fafc; font-size: 16px; font-weight: 700; }

.list-head,
.list-row {
  display: grid;
  grid-template-columns:
    minmax(220px, 1fr)
    100px
    140px
    90px
    90px
    80px
    100px
    100px
    124px;
  align-items: center;
  column-gap: 14px;
  padding: 0 20px;
}

.list-head {
  min-height: 44px;
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
.list-row .col-actions { text-align: right; }

.list-row {
  min-height: 68px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1f2937;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.list-row:hover,
.list-row:focus-visible {
  background: rgba(34, 211, 238, 0.045);
  border-left-color: #22d3ee;
  outline: none;
}

.col-title { min-width: 0; }
.quiz-title {
  color: #f8fafc;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.quiz-topic { color: #64748b; font-size: 12px; margin-top: 2px; }
.row-meta { display: none; color: #64748b; font-size: 11.5px; margin-top: 4px; }

.cell-muted { color: #94a3b8; font-size: 13px; }

.chip-cyan { background: rgba(34, 211, 238, 0.12) !important; color: #22d3ee !important; }
.chip-violet { background: rgba(139, 92, 246, 0.14) !important; color: #a78bfa !important; }
.chip-green { background: rgba(52, 211, 153, 0.14) !important; color: #34d399 !important; }

.question-stat { color: #22d3ee; font-size: 14px; font-weight: 800; }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
}
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.status-pill--active { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.status-pill--inactive { background: rgba(148, 163, 184, 0.14); color: #94a3b8; }

.row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 2px; }
.act-view { color: #22d3ee !important; }
.act-edit { color: #f59e0b !important; }
.act-edit:hover { color: #fbbf24 !important; }
.act-delete { color: #64748b !important; }
.act-delete:hover { color: #f87171 !important; }

/* footer */
.list-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid #1f2937;
}
.per-page { display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 12.5px; }
.per-page-select { width: 82px; }
.range-text { color: #94a3b8; font-size: 12.5px; }
.list-pagination { margin-left: auto; }

.dark-field ::v-deep .v-input__slot { background: #0f172a !important; min-height: 34px !important; }
.dark-field ::v-deep fieldset { border-color: #334155 !important; }
.dark-field ::v-deep .v-select__selection { color: #f8fafc !important; }
.dark-field ::v-deep .v-icon { color: #64748b !important; }

/* =========================================================
   DIALOGS
========================================================= */
.dialog-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 16px !important;
}
.dialog-header { display: flex; align-items: flex-start; padding: 20px 22px !important; }
.dialog-header-content { min-width: 0; }
.dialog-title { color: #f8fafc; font-size: 19px; font-weight: 800; line-height: 1.4; }
.dialog-meta { color: #64748b; font-size: 12px; margin-top: 4px; }
.close-btn { color: #64748b !important; }
.dialog-divider { border-color: #1f2937 !important; }
.dialog-body { max-height: 70vh; padding: 20px 22px 24px !important; }
.dialog-footer { padding: 12px 20px !important; }

.dialog-loading {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #64748b;
  font-size: 13px;
}
.dialog-empty { padding: 32px; text-align: center; color: #64748b; font-size: 13px; }

.detail-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.detail-tile { padding: 12px 14px; border-radius: 10px; background: #0f172a; border: 1px solid #1f2937; }
.tile-label { color: #64748b; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.tile-value { color: #e2e8f0; font-size: 13.5px; font-weight: 700; margin-top: 4px; }

.detail-description { margin-top: 18px; }
.description-text { color: #94a3b8; font-size: 13.5px; line-height: 1.6; margin-top: 4px; }

.questions-heading {
  color: #f8fafc;
  font-size: 15px;
  font-weight: 800;
  margin: 24px 0 4px;
  padding-top: 18px;
  border-top: 1px solid #1f2937;
}

.quiz-question { padding: 18px 0; border-bottom: 1px solid #1f2937; }
.quiz-question:last-child { border-bottom: none; }
.question-header { display: flex; align-items: flex-start; gap: 12px; }
.question-number {
  min-width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
  font-size: 12px;
  font-weight: 800;
}
.question-text { color: #f8fafc; font-size: 14.5px; line-height: 1.6; padding-top: 3px; white-space: pre-wrap; }

.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 14px; }
.quiz-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  border: 1px solid #1f2937;
  background: #0f172a;
}
.quiz-option--correct { border-color: rgba(74, 222, 128, 0.4); background: rgba(34, 197, 94, 0.06); }
.option-key {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #1e293b;
  color: #22d3ee;
  font-size: 11px;
  font-weight: 800;
}
.quiz-option--correct .option-key { background: #4ade80; color: #052e16; }
.option-text { flex: 1; color: #cbd5e1; font-size: 13px; line-height: 1.5; }

.explanation-box {
  margin-top: 14px;
  padding: 11px 14px;
  border-left: 3px solid #22d3ee;
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.045);
}
.explanation-heading { color: #22d3ee; font-size: 11.5px; font-weight: 800; }
.explanation-text { color: #94a3b8; font-size: 12.5px; line-height: 1.65; margin-top: 4px; white-space: pre-wrap; }

.delete-body { text-align: center; padding: 30px 28px 14px !important; }
.delete-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
}
.delete-title { color: #f8fafc; font-size: 19px; font-weight: 800; margin-top: 16px; }
.delete-name { color: #f87171; font-size: 13.5px; font-weight: 700; margin-top: 6px; }
.delete-message { color: #64748b; font-size: 12.5px; line-height: 1.6; margin-top: 12px; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1350px) {
  .list-head,
  .list-row {
    grid-template-columns: minmax(200px, 1fr) 100px 140px 90px 90px 100px 124px;
  }
  .col-time,
  .col-created { display: none; }
}

@media (max-width: 1050px) {
  .list-head,
  .list-row {
    grid-template-columns: minmax(180px, 1fr) 90px 100px 124px;
  }
  .col-grade,
  .col-subject,
  .col-medium { display: none; }
  .row-meta { display: block; }
}

@media (max-width: 700px) {
  .list-head { display: none; }
  .list-row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-left: 14px;
    padding-right: 10px;
  }
  .col-questions,
  .col-status { display: none; }
  .options-grid { grid-template-columns: 1fr; }
  .detail-tiles { grid-template-columns: 1fr 1fr; }
  .list-pagination { margin-left: 0; }
}
</style>
