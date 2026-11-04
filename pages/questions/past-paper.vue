<template>
  <div class="past-paper-page">
    <!-- =========================
         PAGE HEADER
    ========================== -->
    <div class="d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <h1 class="page-title">
          {{ editMode ? 'Edit Past Paper' : 'Past Paper Entry' }}
        </h1>

        <p class="page-subtitle">
          {{
            editMode
              ? 'Edit the manually entered past paper, questions and answers.'
              : 'Manually enter MCQs and answers from a past paper.'
          }}
        </p>
      </div>

      <div class="d-flex align-center">
        <v-btn
          outlined
          class="view-papers-btn mr-3"
          @click="$router.push('/questions/past-paper-quizes')"
        >
          <v-icon left size="18">
            mdi-file-document-multiple-outline
          </v-icon>

          View Past Papers
        </v-btn>

        <v-btn
          outlined
          class="back-btn"
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
    <v-card
      v-if="loadingPaper"
      class="panel-card mb-6"
      flat
    >
      <v-card-text class="text-center py-10">
        <v-progress-circular
          indeterminate
          color="#22D3EE"
          size="42"
        />

        <div class="loading-text mt-4">
          Loading past paper...
        </div>
      </v-card-text>
    </v-card>

    <template v-else>
      <!-- =========================
           PAST PAPER INFORMATION
      ========================== -->
      <v-card
        class="panel-card mb-6"
        flat
      >
        <v-card-title class="panel-title">
          <v-icon
            left
            color="#22D3EE"
            size="22"
          >
            mdi-file-document-outline
          </v-icon>

          Past Paper Information
        </v-card-title>

        <v-card-text>
          <v-row>
            <!-- Grade -->
            <v-col
              cols="12"
              md="3"
            >
              <v-select
                v-model="paper.grade_id"
                :items="grades"
                item-text="name"
                item-value="id"
                label="Grade"
                outlined
                dense
                hide-details
                class="dark-field"
                :loading="loadingGrades"
              />
            </v-col>

            <!-- Stream (only for A/L) -->
            <v-col
              v-if="isAlGrade"
              cols="12"
              md="3"
            >
              <v-select
                v-model="paper.al_stream"
                :items="streamOptions"
                item-text="text"
                item-value="value"
                label="A/L Stream"
                outlined
                dense
                hide-details
                class="dark-field"
              >
                <template #prepend-inner>
                  <v-icon
                    small
                    color="#8B5CF6"
                    class="mr-1"
                  >
                    mdi-source-branch
                  </v-icon>
                </template>
              </v-select>
            </v-col>

            <!-- Subject -->
            <v-col
              cols="12"
              md="3"
            >
              <v-select
                v-model="paper.subject_id"
                :items="filteredSubjects"
                item-text="name"
                item-value="id"
                label="Subject"
                outlined
                dense
                hide-details
                class="dark-field"
                :loading="loadingSubjects"
                :disabled="!canSelectSubject"
                :hint="subjectHint"
                :persistent-hint="!canSelectSubject"
              />
            </v-col>

            <!-- Year -->
            <v-col
              cols="12"
              md="3"
            >
              <v-select
                v-model="paper.year"
                :items="years"
                label="Paper Year"
                outlined
                dense
                hide-details
                class="dark-field"
              />
            </v-col>

            <!-- Medium -->
            <v-col
              cols="12"
              :md="isAlGrade ? 4 : 3"
            >
              <v-select
                v-model="paper.medium"
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

            <!-- Paper Name -->
            <v-col
              cols="12"
              :md="isAlGrade ? 8 : 9"
            >
              <v-text-field
                v-model="paper.title"
                label="Paper Name"
                placeholder="Example: GCE O/L Mathematics 2024"
                outlined
                dense
                hide-details
                class="dark-field"
              />
            </v-col>

            <!-- Paper Number -->
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model.number="paper.paper_number"
                type="number"
                label="Paper Number"
                placeholder="Example: 1"
                outlined
                dense
                hide-details
                class="dark-field"
                min="1"
              />
            </v-col>

            <!-- Total Questions -->
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model.number="paper.total_questions"
                type="number"
                label="Total Questions in Paper"
                placeholder="Example: 40"
                outlined
                dense
                hide-details
                class="dark-field"
                min="1"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- =========================
           PROGRESS
      ========================== -->
      <v-card
        class="progress-card mb-6"
        flat
      >
        <v-card-text>
          <div class="d-flex align-center justify-space-between mb-2">
            <div>
              <div class="progress-label">
                Questions Entered
              </div>

              <div class="progress-count">
                {{ questions.length }}

                <span v-if="paper.total_questions">
                  / {{ paper.total_questions }}
                </span>
              </div>
            </div>

            <v-chip
              small
              class="progress-chip"
            >
              {{ progressPercentage }}%
            </v-chip>
          </div>

          <v-progress-linear
            :value="progressPercentage"
            height="7"
            rounded
            class="question-progress"
          />
        </v-card-text>
      </v-card>

      <!-- =========================
           QUESTION ENTRY
      ========================== -->
      <v-card
        class="panel-card"
        flat
      >
        <v-card-title class="panel-title d-flex align-center">
          <div>
            <v-icon
              left
              color="#8B5CF6"
              size="22"
            >
              mdi-help-circle-outline
            </v-icon>

            Question {{ currentQuestionNumber }}
          </div>

          <v-spacer />

          <v-chip
            small
            class="question-number-chip"
          >
            {{ currentQuestionNumber }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <!-- =========================
               QUESTION TEXT
          ========================== -->
          <div class="field-label">
            Question
            <span class="required">*</span>
          </div>

          <v-textarea
            v-model="currentQuestion.question_text"
            outlined
            rows="4"
            auto-grow
            placeholder="Enter the question here..."
            class="dark-field question-textarea"
            hide-details
          />

          <!-- =========================
               QUESTION IMAGE
          ========================== -->
          <div class="field-label image-field-label">
            Question Image
            <span class="optional">
              Optional
            </span>
          </div>

          <div class="question-image-section">
            <!-- Image Preview -->
            <div
              v-if="currentQuestion.image_url"
              class="question-image-preview"
            >
              <img
                :src="currentQuestion.image_url"
                alt="Question image"
              >

              <div class="image-preview-actions">
                <v-btn
                  small
                  icon
                  class="remove-image-btn"
                  @click="removeQuestionImage"
                >
                  <v-icon size="20">
                    mdi-close
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Upload Area -->
            <div
              v-else
              class="question-image-upload"
              @click="openImagePicker"
            >
              <v-icon
                size="34"
                color="#22D3EE"
              >
                mdi-cloud-upload-outline
              </v-icon>

              <div class="upload-title">
                Upload Question Image
              </div>

              <div class="upload-subtitle">
                JPG, JPEG, PNG or WEBP · Maximum 5MB
              </div>

              <v-btn
                small
                outlined
                class="upload-image-btn mt-3"
                :loading="uploadingImage"
                @click.stop="openImagePicker"
              >
                <v-icon left size="17">
                  mdi-image-plus-outline
                </v-icon>

                Choose Image
              </v-btn>
            </div>

            <input
              ref="questionImageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="d-none"
              @change="handleImageSelected"
            >
          </div>

          <!-- Upload Progress -->
          <div
            v-if="uploadingImage"
            class="image-upload-progress"
          >
            <v-progress-linear
              indeterminate
              height="4"
              rounded
            />

            <span>
              Uploading image to Cloudflare R2...
            </span>
          </div>

          <!-- =========================
               OPTIONS
          ========================== -->
          <div class="options-heading">
            Options
            <span class="required">*</span>
          </div>

          <v-row>
            <!-- Option A -->
            <v-col cols="12" md="6">
              <div class="option-wrapper">
                <div class="option-label">
                  <span class="option-letter">A</span>
                  <span>Option A</span>
                </div>

                <v-text-field
                  v-model="currentQuestion.options.A"
                  outlined
                  dense
                  placeholder="Enter option A"
                  class="dark-field"
                  hide-details
                />
              </div>
            </v-col>

            <!-- Option B -->
            <v-col cols="12" md="6">
              <div class="option-wrapper">
                <div class="option-label">
                  <span class="option-letter">B</span>
                  <span>Option B</span>
                </div>

                <v-text-field
                  v-model="currentQuestion.options.B"
                  outlined
                  dense
                  placeholder="Enter option B"
                  class="dark-field"
                  hide-details
                />
              </div>
            </v-col>

            <!-- Option C -->
            <v-col cols="12" md="6">
              <div class="option-wrapper">
                <div class="option-label">
                  <span class="option-letter">C</span>
                  <span>Option C</span>
                </div>

                <v-text-field
                  v-model="currentQuestion.options.C"
                  outlined
                  dense
                  placeholder="Enter option C"
                  class="dark-field"
                  hide-details
                />
              </div>
            </v-col>

            <!-- Option D -->
            <v-col cols="12" md="6">
              <div class="option-wrapper">
                <div class="option-label">
                  <span class="option-letter">D</span>
                  <span>Option D</span>
                </div>

                <v-text-field
                  v-model="currentQuestion.options.D"
                  outlined
                  dense
                  placeholder="Enter option D"
                  class="dark-field"
                  hide-details
                />
              </div>
            </v-col>
          </v-row>

          <!-- =========================
               CORRECT ANSWER + DIFFICULTY
          ========================== -->
          <v-row class="mt-2">
            <!-- Correct Answer -->
            <v-col cols="12" md="4">
              <div class="field-label">
                Correct Answer
                <span class="required">*</span>
              </div>

              <v-select
                v-model="currentQuestion.correct_answer"
                :items="answerOptions"
                outlined
                dense
                placeholder="Select correct answer"
                class="dark-field"
                hide-details
              >
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <span class="answer-badge">{{ item }}</span>
                    <span class="ml-2">Option {{ item }}</span>
                  </div>
                </template>

                <template #item="{ item }">
                  <div class="d-flex align-center">
                    <span class="answer-badge">{{ item }}</span>
                    <span class="ml-2">Option {{ item }}</span>
                  </div>
                </template>
              </v-select>
            </v-col>

            <!-- Difficulty -->
            <v-col cols="12" md="4">
              <div class="field-label">
                Difficulty
              </div>

              <v-select
                v-model="currentQuestion.difficulty"
                :items="difficultyOptions"
                item-text="text"
                item-value="value"
                outlined
                dense
                class="dark-field"
                hide-details
              />
            </v-col>
          </v-row>

          <!-- =========================
               EXPLANATION
          ========================== -->
          <div class="field-label explanation-label">
            Explanation
            <span class="optional">Optional</span>
          </div>

          <v-textarea
            v-model="currentQuestion.explanation"
            outlined
            rows="3"
            auto-grow
            placeholder="Enter an explanation for the correct answer..."
            class="dark-field"
            hide-details
          />
        </v-card-text>

        <!-- =========================
             ACTIONS
        ========================== -->
        <v-card-actions class="question-actions">
          <v-btn
            text
            class="clear-btn"
            :disabled="saving || uploadingImage"
            @click="clearCurrentQuestion"
          >
            <v-icon left size="18">
              mdi-refresh
            </v-icon>
            Clear
          </v-btn>

          <v-spacer />

          <v-btn
            outlined
            class="save-finish-btn"
            :disabled="saving || uploadingImage"
            @click="saveAndFinish"
          >
            <v-icon left size="18">
              mdi-content-save-outline
            </v-icon>
            Save & Finish
          </v-btn>

          <v-btn
            class="save-next-btn"
            :loading="saving"
            :disabled="uploadingImage"
            @click="saveAndNext"
          >
            <v-icon left size="18">
              mdi-arrow-right
            </v-icon>
            Save & Add Next
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- =========================
           ENTERED QUESTIONS
      ========================== -->
      <v-card
        v-if="questions.length > 0"
        class="panel-card mt-6"
        flat
      >
        <v-card-title class="panel-title">
          <v-icon left color="#22D3EE" size="22">
            mdi-format-list-numbered
          </v-icon>

          Entered Questions

          <v-spacer />

          <v-chip small class="count-chip">
            {{ questions.length }} Questions
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-0">
          <div
            v-for="(question, index) in questions"
            :key="question.temp_id"
            class="entered-question"
          >
            <div class="entered-question-number">
              {{ index + 1 }}
            </div>

            <div class="entered-question-content">
              <div class="entered-question-text">
                {{ question.question_text }}
              </div>

              <div class="entered-question-meta">
                <v-chip
                  v-if="question.image_url"
                  x-small
                  class="image-chip"
                >
                  <v-icon left size="13">
                    mdi-image-outline
                  </v-icon>
                  Image
                </v-chip>

                <v-chip x-small class="answer-chip">
                  Answer: {{ question.correct_answer }}
                </v-chip>

                <v-chip
                  x-small
                  :class="getDifficultyClass(question.difficulty)"
                >
                  {{ question.difficulty }}
                </v-chip>
              </div>
            </div>

            <v-btn
              icon
              small
              class="edit-question-btn"
              :disabled="saving"
              @click="editQuestion(index)"
            >
              <v-icon size="18">
                mdi-pencil-outline
              </v-icon>
            </v-btn>

            <v-btn
              icon
              small
              class="remove-question-btn"
              :disabled="saving"
              @click="removeQuestion(index)"
            >
              <v-icon size="18">
                mdi-delete-outline
              </v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script>
export default {
  middleware: 'auth',

  data () {
    return {
      saving: false,

      editMode: false,
      editingPaperId: null,
      loadingPaper: false,

      loadingGrades: false,
      loadingSubjects: false,

      uploadingImage: false,

      grades: [],
      subjects: [],

      paper: {
        grade_id: null,
        subject_id: null,
        al_stream: null,
        year: null,
        medium: 'si',
        title: '',
        paper_number: null,
        total_questions: 40
      },

      years: Array.from(
        { length: 30 },
        (_, index) => 2026 - index
      ),

      mediums: [
        { text: 'Sinhala Medium', value: 'si' },
        { text: 'English Medium', value: 'en' },
        { text: 'Tamil Medium', value: 'ta' }
      ],

      // A/L stream options — values match backend const AL_STREAMS
      streamOptions: [
        { text: 'Biological Science', value: 'bio' },
        { text: 'Physical Science', value: 'maths' },
        { text: 'Technology', value: 'technology' },
        { text: 'Arts', value: 'arts' },
        { text: 'Commerce', value: 'commerce' }
      ],

      answerOptions: ['A', 'B', 'C', 'D'],

      difficultyOptions: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],

      questions: [],

      currentQuestion: {
        question_text: '',
        image_url: null,
        options: { A: '', B: '', C: '', D: '' },
        correct_answer: '',
        difficulty: 'medium',
        explanation: ''
      }
    }
  },

  computed: {
    /**
     * Detect if the selected grade is A/L.
     */
    isAlGrade () {
      if (!this.paper.grade_id) {
        return false
      }

      const grade = this.grades.find(
        g => g.id === this.paper.grade_id
      )

      return grade && grade.category === 'al'
    },

    /**
     * Subject dropdown should only be enabled once
     * a grade is selected AND (for A/L) a stream is chosen.
     */
    canSelectSubject () {
      if (!this.paper.grade_id) {
        return false
      }

      if (this.isAlGrade) {
        return !!this.paper.al_stream
      }

      return true
    },

    /**
     * Helper hint shown under disabled Subject select.
     */
    subjectHint () {
      if (!this.paper.grade_id) {
        return 'Select a grade first'
      }

      if (this.isAlGrade && !this.paper.al_stream) {
        return 'Select an A/L stream first'
      }

      return ''
    },

    currentQuestionNumber () {
      return this.questions.length + 1
    },

    progressPercentage () {
      if (!this.paper.total_questions) {
        return 0
      }

      const percentage =
        (this.questions.length / this.paper.total_questions) * 100

      return Math.min(Math.round(percentage), 100)
    },

    /**
     * Subjects are filtered by the backend already,
     * so we just pass them through. This computed is
     * kept as a central place for any extra filtering.
     */
    filteredSubjects () {
      return this.subjects
    }
  },

  watch: {
    /**
     * When grade changes:
     * - reset subject + stream
     * - reload subjects filtered by grade
     */
    'paper.grade_id' (newValue, oldValue) {
      if (this.editMode && this.loadingPaper) {
        return
      }

      if (newValue === oldValue) {
        return
      }

      this.paper.subject_id = null
      this.paper.al_stream = null

      if (newValue) {
        this.loadSubjects()
      } else {
        this.subjects = []
      }
    },

    /**
     * When A/L stream changes:
     * - reset subject
     * - reload subjects filtered by grade + stream
     */
    'paper.al_stream' (newValue, oldValue) {
      if (this.editMode && this.loadingPaper) {
        return
      }

      if (newValue === oldValue) {
        return
      }

      this.paper.subject_id = null

      if (this.paper.grade_id && this.isAlGrade) {
        this.loadSubjects()
      }
    }
  },

  async mounted () {
    await this.loadGrades()

    // Initial state: no grade selected → no subjects
    // We don't load subjects until a grade is chosen.

    const editId = this.$route.query.edit

    if (editId) {
      this.editMode = true
      this.editingPaperId = Number(editId)
      await this.loadPastPaper(this.editingPaperId)
    }
  },

  methods: {
    // =====================================================
    // LOAD GRADES
    // =====================================================
    async loadGrades () {
      this.loadingGrades = true

      try {
        const response = await this.$axios.get('/public/grades')
        const data = response.data

        if (data.success) {
          this.grades = data.data || []
        } else {
          this.showError(data.message || 'Unable to load grades.')
        }
      } catch (error) {
        this.handleApiError(error, 'Unable to load grades.')
      } finally {
        this.loadingGrades = false
      }
    },

    // =====================================================
    // LOAD SUBJECTS (filtered by grade + stream)
    // =====================================================
    async loadSubjects () {
      if (!this.paper.grade_id) {
        this.subjects = []
        return
      }

      this.loadingSubjects = true

      try {
        const params = {
          grade_id: this.paper.grade_id
        }

        // Only send al_stream for A/L grades
        if (this.isAlGrade && this.paper.al_stream) {
          params.al_stream = this.paper.al_stream
        }

        const response = await this.$axios.get('/public/subjects', {
          params
        })

        const data = response.data

        if (data.success) {
          this.subjects = data.data || []
        } else {
          this.subjects = []
          this.showError(data.message || 'Unable to load subjects.')
        }
      } catch (error) {
        this.subjects = []
        this.handleApiError(error, 'Unable to load subjects.')
      } finally {
        this.loadingSubjects = false
      }
    },

    // =====================================================
    // LOAD PAST PAPER (EDIT MODE)
    // =====================================================
    async loadPastPaper (id) {
      this.loadingPaper = true

      try {
        const response = await this.$axios.get(`/admin/past-papers/${id}`)
        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Unable to load past paper.')
        }

        const pastPaper = data.data

        // Set paper info (grade + stream first, so isAlGrade is correct)
        this.paper = {
          grade_id: pastPaper.grade_id,
          subject_id: pastPaper.subject_id,
          al_stream: pastPaper.al_stream || null,
          year: pastPaper.year,
          medium: pastPaper.medium,
          title: pastPaper.title,
          paper_number: pastPaper.paper_number ?? null,
          total_questions: pastPaper.total_questions
        }

        // Load the correct subject list BEFORE clearing loadingPaper,
        // so watchers don't fire during the load.
        await this.loadSubjects()

        // Load questions
        this.questions = (pastPaper.questions || []).map(question => ({
          temp_id: `existing-${question.id}`,
          id: question.id,
          question_number: question.question_number,
          question_text: question.question_text,
          image_url: question.image_url || null,
          options: {
            A: this.getOptionText(question, 'A'),
            B: this.getOptionText(question, 'B'),
            C: this.getOptionText(question, 'C'),
            D: this.getOptionText(question, 'D')
          },
          correct_answer: question.correct_answer,
          difficulty: question.difficulty || 'medium',
          explanation: question.explanation || ''
        }))

        this.clearCurrentQuestion()
      } catch (error) {
        this.handleApiError(error, 'Unable to load past paper.')
        this.$router.push('/questions/past-paper-quizes')
      } finally {
        this.loadingPaper = false
      }
    },

    // =====================================================
    // GET OPTION TEXT
    // =====================================================
    getOptionText (question, key) {
      const option = (question.options || []).find(
        item => item.option_key === key
      )
      return option ? option.option_text : ''
    },

    // =====================================================
    // OPEN IMAGE PICKER
    // =====================================================
    openImagePicker () {
      if (this.uploadingImage) {
        return
      }
      this.$refs.questionImageInput.click()
    },

    // =====================================================
    // IMAGE SELECTED
    // =====================================================
    async handleImageSelected (event) {
      const files = event.target.files
      if (!files || !files.length) {
        return
      }

      const file = files[0]

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        this.showError('Please select a JPG, PNG or WEBP image.')
        this.resetImageInput()
        return
      }

      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.showError('Image size must be 5MB or less.')
        this.resetImageInput()
        return
      }

      await this.uploadQuestionImage(file)
    },

    // =====================================================
    // UPLOAD QUESTION IMAGE
    // =====================================================
    async uploadQuestionImage (file) {
      this.uploadingImage = true

      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await this.$axios.post(
          '/admin/past-papers/upload-image',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        const data = response.data
        if (!data.success) {
          throw new Error(data.message || 'Image upload failed.')
        }

        this.currentQuestion.image_url = data.data.image_url
        this.showSuccess('Question image uploaded successfully.')
      } catch (error) {
        this.handleApiError(error, 'Unable to upload question image.')
      } finally {
        this.uploadingImage = false
        this.resetImageInput()
      }
    },

    // =====================================================
    // REMOVE QUESTION IMAGE
    // =====================================================
    removeQuestionImage () {
      this.currentQuestion.image_url = null
      this.resetImageInput()
    },

    // =====================================================
    // RESET FILE INPUT
    // =====================================================
    resetImageInput () {
      if (this.$refs.questionImageInput) {
        this.$refs.questionImageInput.value = ''
      }
    },

    // =====================================================
    // VALIDATE PAPER
    // =====================================================
    validatePaper () {
      if (!this.paper.grade_id) {
        this.showError('Please select a grade.')
        return false
      }

      if (this.isAlGrade && !this.paper.al_stream) {
        this.showError('Please select the A/L stream.')
        return false
      }

      if (!this.paper.subject_id) {
        this.showError('Please select a subject.')
        return false
      }

      if (!this.paper.year) {
        this.showError('Please select the paper year.')
        return false
      }

      if (!this.paper.medium) {
        this.showError('Please select the medium.')
        return false
      }

      if (!this.paper.title || !this.paper.title.trim()) {
        this.showError('Please enter the paper name.')
        return false
      }

      if (!this.paper.total_questions || Number(this.paper.total_questions) < 1) {
        this.showError('Please enter the total number of questions.')
        return false
      }

      return true
    },

    // =====================================================
    // VALIDATE QUESTION
    // =====================================================
    validateQuestion () {
      if (!this.currentQuestion.question_text ||
          !this.currentQuestion.question_text.trim()) {
        this.showError('Please enter the question.')
        return false
      }

      const optionKeys = ['A', 'B', 'C', 'D']
      for (const key of optionKeys) {
        if (!this.currentQuestion.options[key] ||
            !this.currentQuestion.options[key].trim()) {
          this.showError(`Please enter Option ${key}.`)
          return false
        }
      }

      if (!this.currentQuestion.correct_answer) {
        this.showError('Please select the correct answer.')
        return false
      }

      return true
    },

    // =====================================================
    // BUILD QUESTION
    // =====================================================
    buildQuestionObject (questionNumber) {
      return {
        temp_id: Date.now() + Math.random(),
        question_number: questionNumber,
        question_text: this.currentQuestion.question_text.trim(),
        image_url: this.currentQuestion.image_url || null,
        options: {
          A: this.currentQuestion.options.A.trim(),
          B: this.currentQuestion.options.B.trim(),
          C: this.currentQuestion.options.C.trim(),
          D: this.currentQuestion.options.D.trim()
        },
        correct_answer: this.currentQuestion.correct_answer,
        difficulty: this.currentQuestion.difficulty || 'medium',
        explanation: this.currentQuestion.explanation
          ? this.currentQuestion.explanation.trim()
          : null
      }
    },

    // =====================================================
    // EDIT ENTERED QUESTION
    // =====================================================
    editQuestion (index) {
      const question = this.questions[index]

      this.currentQuestion = {
        question_text: question.question_text,
        image_url: question.image_url || null,
        options: {
          A: question.options.A || '',
          B: question.options.B || '',
          C: question.options.C || '',
          D: question.options.D || ''
        },
        correct_answer: question.correct_answer,
        difficulty: question.difficulty || 'medium',
        explanation: question.explanation || ''
      }

      this.questions.splice(index, 1)
      this.showSuccess('Question loaded for editing.')

      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    // =====================================================
    // SAVE & ADD NEXT
    // =====================================================
    saveAndNext () {
      if (!this.validatePaper()) { return }
      if (!this.validateQuestion()) { return }

      if (this.uploadingImage) {
        this.showError('Please wait until the image upload finishes.')
        return
      }

      if (this.questions.length >= Number(this.paper.total_questions)) {
        this.showError('All questions for this paper have already been entered.')
        return
      }

      const question = this.buildQuestionObject(this.questions.length + 1)
      this.questions.push(question)

      this.showSuccess('Question added successfully.')
      this.clearCurrentQuestion()
    },

    // =====================================================
    // SAVE & FINISH
    // =====================================================
    async saveAndFinish () {
      if (!this.validatePaper()) { return }

      if (this.uploadingImage) {
        this.showError('Please wait until the image upload finishes.')
        return
      }

      const hasCurrentQuestion =
        this.currentQuestion.question_text.trim() ||
        this.currentQuestion.options.A.trim() ||
        this.currentQuestion.options.B.trim() ||
        this.currentQuestion.options.C.trim() ||
        this.currentQuestion.options.D.trim() ||
        this.currentQuestion.image_url

      if (hasCurrentQuestion) {
        if (!this.validateQuestion()) { return }

        const question = this.buildQuestionObject(this.questions.length + 1)
        this.questions.push(question)
        this.clearCurrentQuestion()
      }

      if (this.questions.length === 0) {
        this.showError('Please enter at least one question.')
        return
      }

      await this.submitPastPaper()
    },

    // =====================================================
    // SUBMIT COMPLETE PAST PAPER
    // =====================================================

    async submitPastPaper () {
      if (this.saving) { return }

      this.saving = true

      try {
        const payload = {
          grade_id: this.paper.grade_id,
          subject_id: this.paper.subject_id,

          al_stream: this.isAlGrade
            ? this.paper.al_stream
            : null,

          year: Number(this.paper.year),
          medium: this.paper.medium,
          title: this.paper.title.trim(),

          paper_number: this.paper.paper_number
            ? Number(this.paper.paper_number)
            : null,

          total_questions: Number(this.paper.total_questions),

          questions: this.questions.map((question, index) => ({
            question_number: index + 1,
            question_text: question.question_text,
            image_url: question.image_url || null,
            correct_answer: question.correct_answer,
            difficulty: question.difficulty || 'medium',
            explanation: question.explanation || null,

            options: {
              A: question.options.A,
              B: question.options.B,
              C: question.options.C,
              D: question.options.D
            }
          }))
        }

        let response

        if (this.editMode) {
          response = await this.$axios.put(
        `/admin/past-papers/${this.editingPaperId}`,
        payload
          )
        } else {
          response = await this.$axios.post(
            '/admin/past-papers',
            payload
          )
        }

        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Unable to save past paper.')
        }

        this.showSuccess(
          this.editMode
            ? 'Past paper updated successfully.'
            : 'Past paper saved successfully.'
        )

        // Navigate to the actual View Past Papers page
        setTimeout(() => {
          this.$router.push('/questions/past-paper-quizes')
        }, 700)
      } catch (error) {
        this.handleApiError(error, 'Unable to save past paper.')
      } finally {
        this.saving = false
      }
    },

    // =====================================================
    // CLEAR CURRENT QUESTION
    // =====================================================
    clearCurrentQuestion () {
      this.currentQuestion = {
        question_text: '',
        image_url: null,
        options: { A: '', B: '', C: '', D: '' },
        correct_answer: '',
        difficulty: 'medium',
        explanation: ''
      }
      this.resetImageInput()
    },

    // =====================================================
    // REMOVE ENTERED QUESTION
    // =====================================================
    removeQuestion (index) {
      this.questions.splice(index, 1)

      this.questions.forEach((question, questionIndex) => {
        question.question_number = questionIndex + 1
      })

      this.showSuccess('Question removed.')
    },

    // =====================================================
    // DIFFICULTY CLASS
    // =====================================================
    getDifficultyClass (difficulty) {
      switch (difficulty) {
        case 'easy': return 'chip-green'
        case 'medium': return 'chip-amber'
        case 'hard': return 'chip-red'
        default: return 'chip-neutral'
      }
    },

    // =====================================================
    // API ERROR HANDLER
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
    // SUCCESS MESSAGE
    // =====================================================
    showSuccess (message) {
      if (this.$toast) {
        this.$toast.success(message)
      } else {
        alert(message)
      }
    },

    // =====================================================
    // ERROR MESSAGE
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
.past-paper-page {
  padding-bottom: 40px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 6px;
}

.page-subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 14px;
}

.panel-card,
.progress-card {
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

.back-btn {
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

.view-papers-btn {
  border-color: #22d3ee !important;
  color: #22d3ee !important;
}

.dark-field >>> .v-input__slot {
  background: #0f172a !important;
}

.dark-field >>> fieldset {
  border-color: #334155 !important;
}

.dark-field >>> input,
.dark-field >>> textarea {
  color: #f8fafc !important;
}

.dark-field >>> label {
  color: #94a3b8 !important;
}

.field-label,
.options-heading {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.optional {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  margin-left: 5px;
}

.explanation-label {
  margin-top: 18px;
}

.image-field-label {
  margin-top: 20px;
}

.progress-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.progress-count {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 800;
}

.progress-chip,
.count-chip {
  background: rgba(34, 211, 238, 0.12) !important;
  color: #22d3ee !important;
}

.question-progress >>> .v-progress-linear__background {
  background-color: #1e293b !important;
}

.question-number-chip {
  background: rgba(139, 92, 246, 0.14) !important;
  color: #a78bfa !important;
}

.option-wrapper {
  margin-bottom: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 7px;
}

.option-letter,
.answer-badge {
  width: 27px;
  height: 27px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #22d3ee;
  font-size: 12px;
  font-weight: 800;
}

.answer-badge {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
}

.question-image-section {
  margin-bottom: 22px;
}

.question-image-upload {
  min-height: 170px;
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

.question-image-upload:hover {
  border-color: #22d3ee;
}

.upload-title {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 700;
  margin-top: 8px;
}

.upload-subtitle {
  color: #64748b;
  font-size: 11px;
  margin-top: 4px;
}

.upload-image-btn {
  border-color: #334155 !important;
  color: #22d3ee !important;
}

.question-image-preview {
  position: relative;
  width: 100%;
  max-width: 520px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #334155;
}

.question-image-preview img {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: contain;
}

.image-preview-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

.remove-image-btn {
  background: rgba(15, 23, 42, 0.85) !important;
  color: #f87171 !important;
}

.image-upload-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: -12px;
  margin-bottom: 18px;
}

.image-upload-progress span {
  color: #64748b;
  font-size: 11px;
}

.question-actions {
  border-top: 1px solid #1f2937;
  padding: 16px 20px;
}

.clear-btn {
  color: #94a3b8 !important;
}

.save-finish-btn {
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

.save-next-btn {
  background: #22d3ee !important;
  color: #082f49 !important;
  font-weight: 700;
}

.entered-question {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #1f2937;
}

.entered-question:last-child {
  border-bottom: none;
}

.entered-question-number {
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.14);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.entered-question-content {
  flex: 1;
  min-width: 0;
}

.entered-question-text {
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.entered-question-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.answer-chip {
  background: rgba(34, 211, 238, 0.1) !important;
  color: #22d3ee !important;
}

.image-chip {
  background: rgba(139, 92, 246, 0.12) !important;
  color: #a78bfa !important;
}

.chip-green {
  background: rgba(34, 197, 94, 0.12) !important;
  color: #4ade80 !important;
}

.chip-amber {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #fbbf24 !important;
}

.chip-red {
  background: rgba(239, 68, 68, 0.12) !important;
  color: #f87171 !important;
}

.chip-neutral {
  background: #1e293b !important;
  color: #94a3b8 !important;
}

.remove-question-btn {
  color: #64748b !important;
}

.remove-question-btn:hover {
  color: #f87171 !important;
}

.edit-question-btn {
  color: #64748b !important;
}

.edit-question-btn:hover {
  color: #22d3ee !important;
}

.loading-text {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}
</style>
