<template>
  <div class="quiz-entry-page">
    <!-- =========================
         PAGE HEADER
    ========================== -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          {{ editMode ? 'Edit Quiz' : 'Quiz Entry' }}
        </h1>
        <p class="page-subtitle">
          {{
            editMode
              ? 'Edit the quiz, questions and options.'
              : 'Create a general quiz by entering its questions manually.'
          }}
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          outlined
          class="header-btn header-btn--accent"
          @click="$router.push('/questions/manual-quizzes')"
        >
          <v-icon left size="18">
            mdi-file-document-edit-outline
          </v-icon>
          Manual Quizzes
        </v-btn>

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
      </div>
    </div>

    <!-- =========================
         LOADING STATE
    ========================== -->
    <v-card v-if="loadingQuiz" class="panel-card mb-6" flat>
      <v-card-text class="text-center py-10">
        <v-progress-circular
          indeterminate
          color="#22D3EE"
          size="42"
        />
        <div class="loading-text mt-4">
          Loading quiz...
        </div>
      </v-card-text>
    </v-card>

    <v-row v-else>
      <!-- =========================================================
           MAIN COLUMN
      ========================================================== -->
      <v-col cols="12" lg="8">
        <!-- ================= QUIZ DETAILS ================= -->
        <v-card class="panel-card mb-6" flat>
          <v-card-title class="panel-title">
            <v-icon left color="#22D3EE" size="22">
              mdi-clipboard-text-outline
            </v-icon>
            Quiz Details
          </v-card-title>

          <v-card-text class="pt-5">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="quiz.title"
                  label="Quiz title"
                  placeholder="Example: Chemical Bonding Practice Quiz"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="quiz.topic"
                  label="Topic / Lesson (optional)"
                  placeholder="Example: Unit 4"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <!-- Grade -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="quiz.grade_id"
                  :items="grades"
                  item-text="name"
                  item-value="id"
                  label="Grade"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                  :loading="loadingGrades"
                  :disabled="loadingGrades"
                />
              </v-col>

              <!-- A/L Stream -->
              <v-col v-if="isAlGrade && !isGovGrade" cols="12" md="3">
                <v-select
                  v-model="quiz.al_stream"
                  :items="streamOptions"
                  item-text="text"
                  item-value="value"
                  label="A/L stream"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <!-- Government Exam Type -->
              <v-col v-if="isGovGrade" cols="12" md="4">
                <v-select
                  v-model="quiz.government_exam_id"
                  :items="governmentExams"
                  item-text="name"
                  item-value="id"
                  label="Government Exam Type"
                  placeholder="Select exam type"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                  :loading="loadingGovernmentExams"
                  :disabled="loadingGovernmentExams"
                />
              </v-col>

              <!-- Government Exam Subject -->
              <v-col v-if="isGovGrade" cols="12" md="5">
                <v-select
                  v-model="quiz.government_exam_subject_id"
                  :items="governmentExamSubjects"
                  item-text="name"
                  item-value="id"
                  label="Government Exam Subject"
                  placeholder="Select exam subject"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                  :loading="loadingGovernmentSubjects"
                  :disabled="!quiz.government_exam_id || loadingGovernmentSubjects"
                />
              </v-col>

              <!-- Normal School Subject -->
              <v-col v-if="quiz.grade_id && !isGovGrade" cols="12" :md="isAlGrade ? 3 : 5">
                <v-select
                  v-model="quiz.subject_id"
                  :items="filteredSubjects"
                  item-text="name"
                  item-value="id"
                  label="Subject"
                  outlined
                  dense
                  class="dark-field"
                  :disabled="!canSelectSubject || loadingSubjects"
                  :loading="loadingSubjects"
                  :hint="subjectHint"
                  :persistent-hint="!canSelectSubject || !subjects.length"
                  :hide-details="canSelectSubject && subjects.length > 0"
                />
              </v-col>

              <v-col cols="12" :md="isAlGrade ? 3 : 4">
                <v-select
                  v-model="quiz.medium"
                  :items="mediums"
                  item-text="text"
                  item-value="value"
                  label="Medium"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="quiz.time_limit_minutes"
                  type="number"
                  min="1"
                  max="600"
                  label="Time limit"
                  suffix="minutes"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="quiz.target_questions"
                  type="number"
                  min="1"
                  label="Planned number of questions"
                  outlined
                  dense
                  hide-details
                  class="dark-field"
                />
              </v-col>

              <v-col cols="12" md="4" class="d-flex align-center">
                <v-switch
                  v-model="quiz.shuffle_questions"
                  label="Shuffle questions"
                  dense
                  hide-details
                  inset
                  class="dark-switch mt-0"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="quiz.description"
                  label="Description (optional)"
                  placeholder="A short note students see before they start the quiz."
                  outlined
                  dense
                  rows="2"
                  auto-grow
                  hide-details
                  class="dark-field"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- ================= QUESTION ENTRY ================= -->
        <v-card ref="entryCard" class="panel-card" flat>
          <v-card-title class="panel-title">
            <v-icon left color="#8B5CF6" size="22">
              mdi-help-circle-outline
            </v-icon>

            <span v-if="editingIndex === null">
              Question {{ questions.length + 1 }}
            </span>
            <span v-else>
              Editing question {{ editingIndex + 1 }}
            </span>

            <v-spacer />

            <v-btn
              v-if="editingIndex !== null"
              small
              text
              class="clear-btn"
              @click="cancelEdit"
            >
              Cancel editing
            </v-btn>
          </v-card-title>

          <v-card-text class="pt-5">
            <div class="field-label">
              Question <span class="required">*</span>
            </div>
            <v-textarea
              v-model="current.question_text"
              outlined
              rows="3"
              auto-grow
              placeholder="Type the question here..."
              hide-details
              class="dark-field"
            />

            <div class="field-label mt-5">
              Question image <span class="optional">Optional</span>
            </div>

            <div v-if="current.image_url" class="image-preview">
              <img :src="current.image_url" alt="Question image">
              <v-btn
                icon
                small
                class="image-remove-btn"
                @click="removeImage"
              >
                <v-icon size="20">
                  mdi-close
                </v-icon>
              </v-btn>
            </div>

            <div v-else class="image-upload" @click="openImagePicker">
              <v-icon size="30" color="#22D3EE">
                mdi-image-plus-outline
              </v-icon>
              <div class="upload-title">
                Add an image
              </div>
              <div class="upload-subtitle">
                JPG, PNG or WEBP, up to 5MB
              </div>
            </div>

            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="d-none"
              @change="onImageSelected"
            >

            <div class="options-head mt-6">
              <div class="field-label mb-0">
                Options <span class="required">*</span>
              </div>
              <div class="options-hint">
                Click a letter to mark the correct answer
              </div>
            </div>

            <div
              v-for="key in optionKeys"
              :key="key"
              class="option-row"
              :class="{ 'option-row--correct': current.correct_answer === key }"
            >
              <button
                type="button"
                class="option-badge"
                :aria-pressed="current.correct_answer === key"
                :title="`Mark ${key} as the correct answer`"
                @click="current.correct_answer = key"
              >
                {{ key }}
              </button>

              <v-text-field
                v-model="current.options[key]"
                outlined
                dense
                hide-details
                :placeholder="`Option ${key}`"
                class="dark-field option-input"
              />

              <v-icon
                v-if="current.correct_answer === key"
                size="20"
                color="#4ADE80"
              >
                mdi-check-circle
              </v-icon>
            </div>

            <div class="field-label mt-6">
              Difficulty
            </div>
            <div class="segmented">
              <button
                v-for="d in difficultyOptions"
                :key="d.value"
                type="button"
                class="segment"
                :class="[`segment--${d.value}`, { 'segment--active': current.difficulty === d.value }]"
                @click="current.difficulty = d.value"
              >
                {{ d.text }}
              </button>
            </div>

            <div class="field-label mt-6">
              Explanation <span class="optional">Optional</span>
            </div>
            <v-textarea
              v-model="current.explanation"
              outlined
              rows="2"
              auto-grow
              placeholder="Why is this the correct answer? Students see this after they answer."
              hide-details
              class="dark-field"
            />
          </v-card-text>

          <v-card-actions class="entry-actions">
            <v-btn text class="clear-btn" @click="resetCurrent">
              <v-icon left size="18">
                mdi-refresh
              </v-icon>
              Clear
            </v-btn>

            <v-spacer />

            <v-btn class="primary-btn" @click="saveQuestion">
              <v-icon left size="18">
                {{ editingIndex === null ? 'mdi-plus' : 'mdi-check' }}
              </v-icon>
              {{ editingIndex === null ? 'Add question' : 'Update question' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- =========================================================
           SIDEBAR
      ========================================================== -->
      <v-col cols="12" lg="4">
        <div class="sidebar">
          <v-card class="panel-card" flat>
            <v-card-text>
              <div class="summary-title">
                {{ quiz.title || 'Untitled quiz' }}
              </div>

              <div class="summary-meta">
                <v-chip v-if="gradeName" x-small class="meta-chip chip-cyan">
                  {{ gradeName }}
                </v-chip>
                <v-chip
                  v-if="isGovGrade && selectedGovernmentExamName"
                  x-small
                  class="meta-chip chip-cyan"
                >
                  {{ selectedGovernmentExamName }}
                </v-chip>
                <v-chip v-if="subjectName" x-small class="meta-chip chip-violet">
                  {{ subjectName }}
                </v-chip>
                <v-chip v-if="quiz.medium" x-small class="meta-chip chip-green">
                  {{ mediumName }}
                </v-chip>
                <v-chip v-if="quiz.time_limit_minutes" x-small class="meta-chip chip-neutral">
                  <v-icon left x-small>
                    mdi-clock-outline
                  </v-icon>
                  {{ quiz.time_limit_minutes }} min
                </v-chip>
              </div>

              <div class="progress-row">
                <div class="progress-count">
                  {{ questions.length }}
                  <span v-if="quiz.target_questions">/ {{ quiz.target_questions }}</span>
                  <small>questions</small>
                </div>
                <span class="progress-percent">{{ progressPercentage }}%</span>
              </div>

              <v-progress-linear
                :value="progressPercentage"
                height="6"
                rounded
                color="#22D3EE"
                class="question-progress"
              />
            </v-card-text>

            <div v-if="questions.length" class="entered-list">
              <div
                v-for="(q, index) in questions"
                :key="q.temp_id"
                class="entered-item"
                :class="{ 'entered-item--editing': editingIndex === index }"
              >
                <div class="entered-number">
                  {{ index + 1 }}
                </div>

                <div class="entered-content" @click="editQuestion(index)">
                  <div class="entered-text">
                    {{ q.question_text }}
                  </div>
                  <div class="entered-meta">
                    <span class="answer-tag">Answer {{ q.correct_answer }}</span>
                    <span class="difficulty-dot" :class="`dot--${q.difficulty}`" />
                    <span>{{ capitalize(q.difficulty) }}</span>
                    <v-icon v-if="q.image_url" x-small class="ml-1">
                      mdi-image-outline
                    </v-icon>
                  </div>
                </div>

                <v-menu left offset-y>
                  <template #activator="{ on }">
                    <v-btn icon x-small class="item-menu-btn" v-on="on">
                      <v-icon size="18">
                        mdi-dots-vertical
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-list dense class="action-menu">
                    <v-list-item @click="editQuestion(index)">
                      <v-list-item-icon class="mr-3">
                        <v-icon small color="#A78BFA">
                          mdi-pencil-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="duplicateQuestion(index)">
                      <v-list-item-icon class="mr-3">
                        <v-icon small color="#22D3EE">
                          mdi-content-copy
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Duplicate</v-list-item-title>
                    </v-list-item>
                    <v-list-item :disabled="index === 0" @click="moveQuestion(index, -1)">
                      <v-list-item-icon class="mr-3">
                        <v-icon small>
                          mdi-arrow-up
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Move up</v-list-item-title>
                    </v-list-item>
                    <v-list-item :disabled="index === questions.length - 1" @click="moveQuestion(index, 1)">
                      <v-list-item-icon class="mr-3">
                        <v-icon small>
                          mdi-arrow-down
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Move down</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeQuestion(index)">
                      <v-list-item-icon class="mr-3">
                        <v-icon small color="#F87171">
                          mdi-delete-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <div v-else class="entered-empty">
              Questions you add will appear here.
            </div>

            <div class="sidebar-actions">
              <v-btn
                block
                class="primary-btn"
                :loading="saving"
                @click="saveQuiz"
              >
                <v-icon left size="18">
                  mdi-content-save-outline
                </v-icon>
                {{ editMode ? 'Update quiz' : 'Save quiz' }}
              </v-btn>

              <v-btn
                v-if="editMode"
                block
                text
                class="clear-btn mt-2"
                :disabled="saving"
                @click="cancelEditMode"
              >
                Cancel edit
              </v-btn>

              <v-btn
                v-else
                block
                text
                class="clear-btn mt-2"
                :disabled="saving"
                @click="resetEverything(false)"
              >
                Start over
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- =========================
         SAVED DIALOG
    ========================== -->
    <v-dialog v-model="savedDialog" max-width="460">
      <v-card class="dialog-card">
        <v-card-text class="saved-body">
          <div class="saved-icon">
            <v-icon size="42">
              mdi-check-bold
            </v-icon>
          </div>
          <div class="saved-title">
            {{ editMode ? 'Quiz updated' : 'Quiz saved' }}
          </div>
          <div class="saved-name">
            {{ savedSummary.title }}
          </div>
          <div class="saved-message">
            {{ savedSummary.count }} questions {{ editMode ? 'updated' : 'saved' }} successfully.
            <span v-if="savedSummary.id">
              Quiz ID: {{ savedSummary.id }}
            </span>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-footer">
          <v-spacer />

          <template v-if="editMode">
            <v-btn text class="clear-btn" @click="savedDialog = false">
              Keep editing
            </v-btn>
            <v-btn class="primary-btn" @click="goToQuizzes">
              Back to Quizzes
            </v-btn>
          </template>

          <template v-else>
            <v-btn text class="clear-btn" @click="savedDialog = false">
              Keep editing
            </v-btn>
            <v-btn class="primary-btn" @click="startNewQuiz">
              Create another quiz
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snack.show"
      :color="snack.color"
      :timeout="2800"
      bottom
    >
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script>
const emptyQuestion = () => ({
  question_text: '',
  image_url: null,
  options: { A: '', B: '', C: '', D: '' },
  correct_answer: '',
  difficulty: 'medium',
  explanation: ''
})

const emptyQuiz = () => ({
  title: '',
  topic: '',
  description: '',
  grade_id: null,
  al_stream: null,
  subject_id: null,
  government_exam_id: null,
  government_exam_subject_id: null,
  medium: 'si',
  time_limit_minutes: 30,
  target_questions: 10,
  shuffle_questions: true
})

export default {
  middleware: 'auth',

  data () {
    return {
      saving: false,
      loadingGrades: false,
      loadingSubjects: false,
      loadingGovernmentExams: false,
      loadingGovernmentSubjects: false,

      // Edit mode
      editMode: false,
      editingQuizId: null,
      loadingQuiz: false,

      savedDialog: false,
      savedSummary: { id: null, title: '', count: 0 },

      snack: { show: true, text: '', color: 'success' },

      grades: [],
      subjects: [],
      governmentExams: [],
      governmentExamSubjects: [],

      streamOptions: [
        { text: 'Biological Science', value: 'bio' },
        { text: 'Physical Science / Maths', value: 'maths' },
        { text: 'Technology', value: 'technology' },
        { text: 'Arts', value: 'arts' },
        { text: 'Commerce', value: 'commerce' }
      ],

      mediums: [
        { text: 'Sinhala Medium', value: 'si' },
        { text: 'English Medium', value: 'en' },
        { text: 'Tamil Medium', value: 'ta' }
      ],

      difficultyOptions: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],

      optionKeys: ['A', 'B', 'C', 'D'],

      quiz: emptyQuiz(),
      questions: [],
      current: emptyQuestion(),
      editingIndex: null
    }
  },

  computed: {
    isAlGrade () {
      const grade = this.grades.find(
        g => String(g.id) === String(this.quiz.grade_id)
      )
      if (!grade) { return false }

      const category = String(
        grade.category || grade.type || grade.level || ''
      ).toLowerCase()

      if (category.includes('al') || category.includes('advanced')) {
        return true
      }

      return /grade\s*(12|13)\b/i.test(grade.name || '')
    },

    isGovGrade () {
      const grade = this.grades.find(
        item => Number(item.id) === Number(this.quiz.grade_id)
      )
      if (!grade) { return false }

      const category = String(grade.category || '').toLowerCase()
      const slug = String(grade.slug || '').toLowerCase()

      return (
        category === 'government exam' ||
        category === 'gov' ||
        slug === 'gov'
      )
    },

    canSelectSubject () {
      if (!this.quiz.grade_id || this.isGovGrade) { return false }
      if (this.isAlGrade) { return !!this.quiz.al_stream }
      return true
    },

    subjectHint () {
      if (!this.quiz.grade_id) { return 'Select a grade first' }
      if (this.isGovGrade) { return '' }
      if (this.isAlGrade && !this.quiz.al_stream) {
        return 'Select a stream first'
      }
      if (this.loadingSubjects) { return 'Loading subjects...' }
      if (!this.subjects.length) {
        return 'No subjects available for this grade'
      }
      return ''
    },

    filteredSubjects () {
      if (!this.canSelectSubject) { return [] }
      return this.subjects
    },

    gradeName () {
      const grade = this.grades.find(
        item => String(item.id) === String(this.quiz.grade_id)
      )
      return grade ? grade.name : ''
    },

    selectedGovernmentExamName () {
      const exam = this.governmentExams.find(
        item => String(item.id) === String(this.quiz.government_exam_id)
      )
      return exam ? exam.name : ''
    },

    subjectName () {
      if (this.isGovGrade) {
        const subject = this.governmentExamSubjects.find(
          item =>
            String(item.id) === String(this.quiz.government_exam_subject_id)
        )
        return subject ? subject.name : ''
      }

      const subject = this.subjects.find(
        item => String(item.id) === String(this.quiz.subject_id)
      )
      return subject ? subject.name : ''
    },

    mediumName () {
      const medium = this.mediums.find(
        item => item.value === this.quiz.medium
      )
      return medium ? medium.text.replace(' Medium', '') : ''
    },

    progressPercentage () {
      const target = Number(this.quiz.target_questions)
      if (!target || target < 1) { return 0 }

      return Math.min(
        Math.round((this.questions.length / target) * 100),
        100
      )
    }
  },

  watch: {
    'quiz.grade_id' (newValue, oldValue) {
      if (String(newValue) === String(oldValue)) { return }
      if (this.loadingQuiz) { return }

      this.quiz.al_stream = null
      this.quiz.subject_id = null
      this.quiz.government_exam_id = null
      this.quiz.government_exam_subject_id = null

      this.subjects = []
      this.governmentExams = []
      this.governmentExamSubjects = []

      if (!newValue) { return }

      this.$nextTick(() => {
        if (this.isGovGrade) {
          this.loadGovernmentExams()
        } else {
          this.loadSubjects(newValue)
        }
      })
    },

    'quiz.government_exam_id' (newValue, oldValue) {
      if (String(newValue) === String(oldValue)) { return }
      if (this.loadingQuiz) { return }

      this.quiz.government_exam_subject_id = null
      this.governmentExamSubjects = []

      if (newValue) {
        this.loadGovernmentExamSubjects(newValue)
      }
    },

    'quiz.al_stream' (newValue, oldValue) {
      if (newValue === oldValue) { return }
      if (this.loadingQuiz) { return }

      this.quiz.subject_id = null
    }
  },

  async mounted () {
    await this.loadGrades()

    const editId = this.$route.query.edit

    if (editId) {
      this.editMode = true
      this.editingQuizId = Number(editId)
      await this.loadQuiz(this.editingQuizId)
    }
  },

  beforeDestroy () {
    this.questions.forEach(q => this.revokeImage(q.image_url))
    this.revokeImage(this.current.image_url)
  },

  methods: {
    /* -------------------------------- API Helpers -------------------------------- */

    extractRows (response) {
      let result = response

      if (result && result.data !== undefined) { result = result.data }
      if (Array.isArray(result)) { return result }
      if (result && result.data && Array.isArray(result.data.data)) {
        return result.data.data
      }
      if (result && Array.isArray(result.data)) { return result.data }
      return []
    },

    async loadGrades () {
      this.loadingGrades = true
      try {
        const response = await this.$axios.$get('/admin/grades')
        this.grades = this.extractRows(response)

        if (!this.grades.length) {
          this.notify('No grades found. Please check the grade API.', 'error')
        }
      } catch (error) {
        this.handleApiError(error, 'Unable to load grades.')
      } finally {
        this.loadingGrades = false
      }
    },

    async loadSubjects (gradeId) {
      if (!gradeId) {
        this.subjects = []
        if (!this.loadingQuiz) { this.quiz.subject_id = null }
        return
      }

      if (this.isGovGrade) {
        this.subjects = []
        return
      }

      try {
        this.loadingSubjects = true

        const response = await this.$axios.$get(
          `/admin/subjects/grade/${gradeId}`
        )

        this.subjects = response.data || []

        if (!this.loadingQuiz) {
          this.quiz.subject_id = null
        }
      } catch (error) {
        console.error('Load subjects error:', error)
        this.subjects = []
        this.showMessage('Unable to load subjects.', 'error')
      } finally {
        this.loadingSubjects = false
      }
    },

    async loadGovernmentExams () {
      try {
        this.loadingGovernmentExams = true

        const response = await this.$axios.$get(
          '/admin/government-exams',
          {
            params: { is_active: 1, per_page: 100 }
          }
        )

        this.governmentExams = this.extractRows(response)
      } catch (error) {
        console.error('Load government exams error:', error)
        this.governmentExams = []
        this.notify('Unable to load government exams.', 'error')
      } finally {
        this.loadingGovernmentExams = false
      }
    },

    async loadGovernmentExamSubjects (examId) {
      if (!examId) {
        this.governmentExamSubjects = []
        return
      }

      try {
        this.loadingGovernmentSubjects = true

        const response = await this.$axios.$get(
          '/admin/government-exam-subjects',
          {
            params: {
              government_exam_id: examId,
              is_active: 1,
              per_page: 100
            }
          }
        )

        this.governmentExamSubjects = this.extractRows(response)
      } catch (error) {
        console.error('Load government exam subjects error:', error)
        this.governmentExamSubjects = []
        this.notify('Unable to load government exam subjects.', 'error')
      } finally {
        this.loadingGovernmentSubjects = false
      }
    },

    /**
     * Load an existing quiz for edit mode.
     */
    async loadQuiz (id) {
      this.loadingQuiz = true

      try {
        const response = await this.$axios.$get(
          `/admin/manual-quizzes/${id}`
        )

        if (!response || response.success !== true || !response.data) {
          throw new Error(
            (response && response.message) || 'Unable to load quiz.'
          )
        }

        const quizData = response.data
        const govSubject = quizData.government_exam_subject || null

        // Load basic quiz details first.
        this.quiz = {
          title: quizData.title || '',
          topic: quizData.topic || '',
          description: quizData.description || '',

          grade_id: quizData.grade_id || null,
          subject_id: quizData.subject_id || null,

          government_exam_id: govSubject
            ? govSubject.government_exam_id
            : null,

          government_exam_subject_id:
            quizData.government_exam_subject_id ||
            (govSubject ? govSubject.id : null),

          al_stream: quizData.al_stream || null,
          medium: quizData.medium || 'si',
          time_limit_minutes: Number(quizData.time_limit_minutes || 30),

          target_questions: Number(
            quizData.total_questions ||
            (quizData.questions ? quizData.questions.length : 10)
          ),

          shuffle_questions: Boolean(quizData.shuffle_questions)
        }

        // Load questions.
        this.questions = (quizData.questions || []).map((question) => {
          const optionsMap = { A: '', B: '', C: '', D: '' }

          ;(question.options || []).forEach((opt) => {
            if (optionsMap[opt.option_key] !== undefined) {
              optionsMap[opt.option_key] = opt.option_text || ''
            }
          })

          return {
            temp_id: `existing-${question.id}`,
            id: question.id,
            question_text: question.question_text || '',
            image_url: question.image_url || null,
            options: optionsMap,
            correct_answer: question.correct_answer || '',
            difficulty: question.difficulty || 'medium',
            explanation: question.explanation || ''
          }
        })

        // Load dependent dropdowns.
        if (this.isGovGrade) {
          await this.loadGovernmentExams()

          if (this.quiz.government_exam_id) {
            await this.loadGovernmentExamSubjects(
              this.quiz.government_exam_id
            )
          }
        } else if (this.quiz.grade_id) {
          await this.loadSubjects(this.quiz.grade_id)
        }

        this.editingIndex = null
        this.current = emptyQuestion()
        this.resetImageInput()
      } catch (error) {
        console.error('Load quiz error:', error)
        this.handleApiError(error, 'Unable to load quiz.')
        this.$router.replace('/questions/manual-quizzes')
      } finally {
        this.loadingQuiz = false
      }
    },

    handleApiError (error, defaultMessage) {
      const response = error && error.response ? error.response : null
      const data = response && response.data ? response.data : null

      if (response && response.status === 422 && data && data.errors) {
        const messages = Object.values(data.errors).flat()
        this.notify(messages.join(' '), 'error')
        return
      }

      if (!response) {
        this.notify((error && error.message) || defaultMessage, 'error')
        return
      }

      const message = data && data.message ? data.message : defaultMessage
      this.notify(message, 'error')
    },

    /* -------------------------------- Feedback -------------------------------- */

    notify (text, color = 'success') {
      this.snack = { show: true, text, color }
    },

    showMessage (text, color = 'success') {
      this.notify(text, color)
    },

    capitalize (text) {
      return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
    },

    /* -------------------------------- Images -------------------------------- */

    openImagePicker () {
      if (this.$refs.imageInput) {
        this.$refs.imageInput.click()
      }
    },

    onImageSelected (event) {
      const file = event.target.files && event.target.files[0]
      if (!file) { return }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.notify('Please choose a JPG, PNG or WEBP image.', 'error')
        return this.resetImageInput()
      }

      if (file.size > 5 * 1024 * 1024) {
        this.notify('Image must be 5MB or smaller.', 'error')
        return this.resetImageInput()
      }

      this.revokeImage(this.current.image_url)
      this.current.image_url = URL.createObjectURL(file)
      this.resetImageInput()
    },

    removeImage () {
      this.revokeImage(this.current.image_url)
      this.current.image_url = null
      this.resetImageInput()
    },

    revokeImage (url) {
      if (url && String(url).startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    },

    sanitizeImageUrl (url) {
      if (!url) { return null }
      return String(url).startsWith('blob:') ? null : url
    },

    resetImageInput () {
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = ''
      }
    },

    /* ------------------------------ Questions ------------------------------ */

    validateQuestion () {
      const question = this.current

      if (!question.question_text || !question.question_text.trim()) {
        this.notify('Enter the question text.', 'error')
        return false
      }

      for (const key of this.optionKeys) {
        if (!question.options[key] || !question.options[key].trim()) {
          this.notify(`Enter Option ${key}.`, 'error')
          return false
        }
      }

      if (!question.correct_answer) {
        this.notify('Click a letter to mark the correct answer.', 'error')
        return false
      }

      return true
    },

    saveQuestion () {
      if (!this.validateQuestion()) { return }

      const question = this.current

      const built = {
        temp_id: this.editingIndex === null
          ? `q-${Date.now()}-${Math.random()}`
          : this.questions[this.editingIndex].temp_id,

        id: this.editingIndex === null
          ? null
          : (this.questions[this.editingIndex].id || null),

        question_text: question.question_text.trim(),
        image_url: this.sanitizeImageUrl(question.image_url),

        options: {
          A: question.options.A.trim(),
          B: question.options.B.trim(),
          C: question.options.C.trim(),
          D: question.options.D.trim()
        },

        correct_answer: question.correct_answer,
        difficulty: question.difficulty || 'medium',
        explanation: question.explanation
          ? question.explanation.trim()
          : ''
      }

      if (this.editingIndex === null) {
        this.questions.push(built)
        this.notify('Question added.')
      } else {
        const previousPreview = this.questions[this.editingIndex].image_url
        built.image_url = built.image_url || previousPreview

        this.$set(this.questions, this.editingIndex, built)
        this.notify('Question updated.')
      }

      this.editingIndex = null
      this.current = emptyQuestion()
      this.resetImageInput()
    },

    editQuestion (index) {
      const question = this.questions[index]

      this.current = {
        question_text: question.question_text,
        image_url: question.image_url,
        options: { ...question.options },
        correct_answer: question.correct_answer,
        difficulty: question.difficulty,
        explanation: question.explanation || ''
      }

      this.editingIndex = index

      const element = this.$refs.entryCard && this.$refs.entryCard.$el

      if (element && element.scrollIntoView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },

    cancelEdit () {
      this.editingIndex = null
      this.current = emptyQuestion()
      this.resetImageInput()
    },

    resetCurrent () {
      if (this.editingIndex === null) {
        this.revokeImage(this.current.image_url)
      }

      this.current = emptyQuestion()

      if (this.editingIndex !== null) {
        const saved = this.questions[this.editingIndex]
        this.current.image_url = saved ? saved.image_url : null
      }

      this.resetImageInput()
    },

    duplicateQuestion (index) {
      const question = this.questions[index]

      const copy = {
        ...question,
        id: null,
        temp_id: `q-${Date.now()}-${Math.random()}`,
        options: { ...question.options }
      }

      this.questions.splice(index + 1, 0, copy)

      if (this.editingIndex !== null && this.editingIndex > index) {
        this.editingIndex += 1
      }

      this.notify('Question duplicated.')
    },

    moveQuestion (index, direction) {
      const target = index + direction
      if (target < 0 || target >= this.questions.length) { return }

      const moved = this.questions.splice(index, 1)[0]
      this.questions.splice(target, 0, moved)

      if (this.editingIndex === index) {
        this.editingIndex = target
      } else if (this.editingIndex === target) {
        this.editingIndex = index
      }
    },

    removeQuestion (index) {
      const removed = this.questions.splice(index, 1)[0]
      this.revokeImage(removed.image_url)

      if (this.editingIndex === index) {
        this.cancelEdit()
      } else if (this.editingIndex !== null && this.editingIndex > index) {
        this.editingIndex -= 1
      }

      this.notify('Question deleted.')
    },

    /* --------------------------------- Quiz --------------------------------- */

    validateQuiz () {
      const quiz = this.quiz

      if (!quiz.title || !quiz.title.trim()) {
        return this.fail('Enter the quiz title.')
      }

      if (!quiz.grade_id) {
        return this.fail('Select a grade.')
      }

      if (this.isGovGrade) {
        if (!quiz.government_exam_id) {
          return this.fail('Select a Government Exam Type.')
        }
        if (!quiz.government_exam_subject_id) {
          return this.fail('Select a Government Exam Subject.')
        }
      } else {
        if (this.isAlGrade && !quiz.al_stream) {
          return this.fail('Select the A/L stream.')
        }
        if (!quiz.subject_id) {
          return this.fail('Select a subject.')
        }
      }

      if (!quiz.medium) {
        return this.fail('Select the medium.')
      }

      const minutes = Number(quiz.time_limit_minutes)
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
        return this.fail('Time limit must be between 1 and 600 minutes.')
      }

      if (!this.questions.length) {
        return this.fail('Add at least one question.')
      }

      if (this.editingIndex !== null) {
        return this.fail('Finish updating the question you are editing first.')
      }

      if (
        this.loadingGrades ||
        this.loadingSubjects ||
        this.loadingGovernmentExams ||
        this.loadingGovernmentSubjects
      ) {
        return this.fail('Please wait until the data finishes loading.')
      }

      return true
    },

    fail (message) {
      this.notify(message, 'error')
      return false
    },

    buildPayload () {
      return {
        title: this.quiz.title.trim(),
        topic: this.quiz.topic ? this.quiz.topic.trim() : null,
        description: this.quiz.description
          ? this.quiz.description.trim()
          : null,

        grade_id: this.isGovGrade ? null : Number(this.quiz.grade_id),
        subject_id: this.isGovGrade ? null : Number(this.quiz.subject_id),

        government_exam_subject_id: this.isGovGrade
          ? Number(this.quiz.government_exam_subject_id)
          : null,

        al_stream: this.isAlGrade && !this.isGovGrade
          ? this.quiz.al_stream
          : null,

        medium: this.quiz.medium,
        time_limit_minutes: Number(this.quiz.time_limit_minutes),
        shuffle_questions: Boolean(this.quiz.shuffle_questions),

        questions: this.questions.map(question => ({
          question_text: question.question_text,
          image_url: this.sanitizeImageUrl(question.image_url),
          correct_answer: question.correct_answer,
          difficulty: question.difficulty,
          explanation: question.explanation || null,
          options: {
            A: question.options.A,
            B: question.options.B,
            C: question.options.C,
            D: question.options.D
          }
        }))
      }
    },

    async saveQuiz () {
      if (this.saving || !this.validateQuiz()) { return }

      this.saving = true
      const payload = this.buildPayload()

      try {
        let response

        if (this.editMode) {
          response = await this.$axios.$put(
            `/admin/manual-quizzes/${this.editingQuizId}`,
            payload
          )
        } else {
          response = await this.$axios.$post(
            '/admin/manual-quizzes',
            payload
          )
        }

        if (!response || response.success !== true) {
          throw new Error(
            (response && response.message) || 'Unable to save the quiz.'
          )
        }

        const savedQuiz = response.data || {}

        this.savedSummary = {
          id: savedQuiz.id || null,
          title: savedQuiz.title || payload.title,
          count: savedQuiz.total_questions || payload.questions.length
        }

        this.savedDialog = true

        this.notify(
          this.editMode
            ? 'Manual quiz updated successfully.'
            : 'Manual quiz saved successfully.'
        )
      } catch (error) {
        if (error.response) {
          this.handleApiError(error, 'Unable to save the quiz.')
        } else {
          this.notify(
            error.message || 'Something went wrong while saving.',
            'error'
          )
        }
      } finally {
        this.saving = false
      }
    },

    goToQuizzes () {
      this.savedDialog = false
      this.$router.push('/questions/manual-quizzes')
    },

    cancelEditMode () {
      this.$router.push('/questions/manual-quizzes')
    },

    startNewQuiz () {
      this.savedDialog = false
      this.resetEverything(true)
    },

    resetEverything (silent = false) {
      this.questions.forEach(q => this.revokeImage(q.image_url))
      this.revokeImage(this.current.image_url)

      this.quiz = emptyQuiz()
      this.questions = []
      this.current = emptyQuestion()
      this.editingIndex = null

      this.subjects = []
      this.governmentExams = []
      this.governmentExamSubjects = []

      this.savedSummary = { id: null, title: '', count: 0 }
      this.resetImageInput()

      if (silent !== true) {
        this.notify('Cleared. Ready for a new quiz.', 'info')
      }
    }
  }
}
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.quiz-entry-page { padding-bottom: 40px; }

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.page-title { font-size: 28px; font-weight: 800; color: #f8fafc; margin: 0; }
.page-subtitle { color: #94a3b8; font-size: 14px; margin: 6px 0 0; }

.header-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.header-btn { border-color: #334155 !important; color: #cbd5e1 !important; text-transform: none; }
.header-btn--accent { border-color: #22d3ee !important; color: #22d3ee !important; }

.panel-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 14px !important;
}
.panel-title {
  color: #f8fafc;
  font-size: 17px;
  font-weight: 700;
  border-bottom: 1px solid #1f2937;
}

.loading-text {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}

/* =========================================================
   FIELDS
========================================================= */
.dark-field ::v-deep .v-input__slot { background: #0f172a !important; }
.dark-field ::v-deep fieldset { border-color: #334155 !important; }
.dark-field ::v-deep input,
.dark-field ::v-deep textarea,
.dark-field ::v-deep .v-select__selection { color: #f8fafc !important; }
.dark-field ::v-deep label,
.dark-field ::v-deep .v-text-field__suffix { color: #94a3b8 !important; }
.dark-field.v-input--is-focused ::v-deep fieldset { border-color: #22d3ee !important; }
.dark-switch ::v-deep label { color: #cbd5e1 !important; font-size: 14px; }

.field-label { color: #cbd5e1; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.required { color: #ef4444; }
.optional { color: #64748b; font-size: 11px; font-weight: 500; margin-left: 5px; }

/* =========================================================
   IMAGE
========================================================= */
.image-upload {
  min-height: 130px;
  border: 1px dashed #334155;
  border-radius: 12px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.image-upload:hover { border-color: #22d3ee; }
.upload-title { color: #e2e8f0; font-size: 14px; font-weight: 700; margin-top: 6px; }
.upload-subtitle { color: #64748b; font-size: 11px; margin-top: 3px; }

.image-preview {
  position: relative;
  max-width: 520px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #334155;
}
.image-preview img { display: block; width: 100%; max-height: 300px; object-fit: contain; }
.image-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.85) !important;
  color: #f87171 !important;
}

/* =========================================================
   OPTIONS
========================================================= */
.options-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.options-hint { color: #64748b; font-size: 12px; }

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 8px;
  margin-bottom: 10px;
  border: 1px solid #1f2937;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.option-row--correct {
  border-color: rgba(74, 222, 128, 0.5);
  background: rgba(34, 197, 94, 0.06);
}
.option-input { flex: 1; }
.option-row ::v-deep .v-input__slot { background: transparent !important; }
.option-row ::v-deep fieldset { border-color: transparent !important; }

.option-badge {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 9px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #22d3ee;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.option-badge:hover { border-color: #4ade80; }
.option-badge:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }
.option-row--correct .option-badge {
  background: #4ade80;
  border-color: #4ade80;
  color: #052e16;
}

/* =========================================================
   DIFFICULTY (segmented)
========================================================= */
.segmented {
  display: inline-flex;
  padding: 4px;
  border: 1px solid #1f2937;
  border-radius: 10px;
  background: #0f172a;
  gap: 4px;
}
.segment {
  min-width: 92px;
  padding: 8px 16px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.segment:hover { color: #e2e8f0; }
.segment:focus-visible { outline: 2px solid #22d3ee; outline-offset: 1px; }
.segment--easy.segment--active { background: rgba(34, 197, 94, 0.16); color: #4ade80; }
.segment--medium.segment--active { background: rgba(245, 158, 11, 0.16); color: #fbbf24; }
.segment--hard.segment--active { background: rgba(239, 68, 68, 0.16); color: #f87171; }

/* =========================================================
   ACTIONS
========================================================= */
.entry-actions { border-top: 1px solid #1f2937; padding: 16px 20px; }
.clear-btn { color: #94a3b8 !important; text-transform: none; }
.primary-btn {
  background: #22d3ee !important;
  color: #082f49 !important;
  font-weight: 700;
  text-transform: none;
  box-shadow: none !important;
}

/* =========================================================
   SIDEBAR
========================================================= */
.sidebar { position: sticky; top: 84px; }

.summary-title {
  color: #f8fafc;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}
.summary-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 18px; min-height: 22px; }
.meta-chip { font-weight: 600; }
.chip-cyan { background: rgba(34, 211, 238, 0.12) !important; color: #22d3ee !important; }
.chip-violet { background: rgba(139, 92, 246, 0.14) !important; color: #a78bfa !important; }
.chip-green { background: rgba(52, 211, 153, 0.14) !important; color: #34d399 !important; }
.chip-neutral { background: rgba(148, 163, 184, 0.14) !important; color: #cbd5e1 !important; }

.progress-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.progress-count { color: #f8fafc; font-size: 24px; font-weight: 800; }
.progress-count span { color: #64748b; font-size: 16px; font-weight: 700; }
.progress-count small { color: #64748b; font-size: 12px; font-weight: 600; margin-left: 6px; }
.progress-percent { color: #22d3ee; font-size: 13px; font-weight: 700; }
.question-progress ::v-deep .v-progress-linear__background { background-color: #1e293b !important; opacity: 1 !important; }

.entered-list {
  max-height: 380px;
  overflow-y: auto;
  border-top: 1px solid #1f2937;
}
.entered-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #1f2937;
  border-left: 3px solid transparent;
}
.entered-item--editing { background: rgba(139, 92, 246, 0.08); border-left-color: #8b5cf6; }
.entered-number {
  min-width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(139, 92, 246, 0.14);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}
.entered-content { flex: 1; min-width: 0; cursor: pointer; }
.entered-text {
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.entered-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11.5px;
}
.answer-tag {
  padding: 1px 7px;
  border-radius: 5px;
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  font-weight: 700;
}
.difficulty-dot { width: 7px; height: 7px; border-radius: 50%; background: #64748b; margin-left: 4px; }
.dot--easy { background: #4ade80; }
.dot--medium { background: #fbbf24; }
.dot--hard { background: #f87171; }

.item-menu-btn { color: #64748b !important; }
.action-menu { background: #111827 !important; border: 1px solid #334155; }
.action-menu ::v-deep .v-list-item__title { color: #e2e8f0; font-size: 13.5px; }

.entered-empty {
  padding: 26px 20px;
  border-top: 1px solid #1f2937;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}
.sidebar-actions { padding: 16px; border-top: 1px solid #1f2937; }

/* =========================================================
   DIALOG
========================================================= */
.dialog-card {
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 16px !important;
}
.saved-body { text-align: center; padding: 32px 28px 16px !important; }
.saved-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}
.saved-title { color: #f8fafc; font-size: 20px; font-weight: 800; margin-top: 16px; }
.saved-name { color: #22d3ee; font-size: 14px; font-weight: 700; margin-top: 6px; }
.saved-message { color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 12px; }
.dialog-footer { padding: 12px 20px 18px !important; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1263px) {
  .sidebar { position: static; }
}
@media (max-width: 600px) {
  .segment { min-width: 0; flex: 1; padding: 8px 10px; }
  .segmented { display: flex; }
}
</style>
