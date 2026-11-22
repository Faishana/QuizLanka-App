<template>
  <div>
    <!-- Header -->
    <div class="mb-5">
      <h1 class="page-title">
        Questions
      </h1>
      <p class="page-subtitle">
        Review, edit and manage the question bank.
      </p>
    </div>

    <v-card class="panel-card" flat>
      <!-- Status tabs: the main way to move through the review workflow -->
      <v-tabs
        v-model="statusTab"
        background-color="transparent"
        class="status-tabs"
        @change="onTabChange"
      >
        <v-tab v-for="t in statusTabs" :key="t.label">
          {{ t.label }}
        </v-tab>
      </v-tabs>

      <!-- One compact filter row -->
      <div class="filter-bar">
        <v-text-field
          v-model="search"
          class="dark-field filter-search"
          prepend-inner-icon="mdi-magnify"
          label="Search questions"
          dense
          outlined
          clearable
          hide-details
          @input="onSearchInput"
        />
        <v-select
          v-model="filters.grade_id"
          class="dark-field filter-select"
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
        <v-select
          v-model="filters.subject_id"
          class="dark-field filter-select"
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
        <v-select
          v-model="filters.medium"
          class="dark-field filter-select"
          :items="mediumOptions"
          item-text="text"
          item-value="value"
          label="Medium"
          dense
          outlined
          clearable
          hide-details
          @change="applyFilters"
        />
        <v-select
          v-model="filters.difficulty"
          class="dark-field filter-select"
          :items="difficultyOptions"
          item-text="text"
          item-value="value"
          label="Difficulty"
          dense
          outlined
          clearable
          hide-details
          @change="applyFilters"
        />
        <v-btn
          v-if="hasActiveFilters"
          text
          small
          class="clear-btn"
          @click="clearFilters"
        >
          Clear filters
        </v-btn>
        <v-spacer />
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn icon class="refresh-btn" :loading="loading" v-on="on" @click="loadQuestions">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </template>
          Refresh
        </v-tooltip>
      </div>

      <!-- Table: no horizontal scrolling, click a row to open details -->
      <v-data-table
        :headers="headers"
        :items="questions"
        :loading="loading"
        :server-items-length="totalQuestions"
        :options.sync="tableOptions"
        :footer-props="{ 'items-per-page-options': [10, 20, 50, 100] }"
        class="dark-table"
        @click:row="openDetail"
      >
        <template #item.question_text="{ item }">
          <div class="question-cell">
            <div class="question-text">
              {{ item.question_text }}
            </div>
            <div class="answer-line">
              <v-icon x-small color="#34D399">
                mdi-check-circle
              </v-icon>
              {{ item.correct_answer }}. {{ item.correct_option_text || 'N/A' }}
            </div>
          </div>
        </template>

        <template #item.grade_subject="{ item }">
          <div class="grade-subject">
            <span class="grade-name">{{ item.grade?.name || 'N/A' }}</span>
            <span class="subject-name">{{ item.subject?.name || 'N/A' }}</span>
          </div>
        </template>

        <template #item.medium="{ item }">
          <span class="medium-text">{{ getMediumShort(item.quiz_language) }}</span>
        </template>

        <template #item.difficulty="{ item }">
          <span class="difficulty" :class="getDifficultyClass(item.difficulty)">
            <span class="dot" />
            {{ capitalize(item.difficulty) }}
          </span>
        </template>

        <template #item.review_status="{ item }">
          <v-chip small :class="getReviewStatusClass(item.review_status)">
            {{ getReviewStatusLabel(item.review_status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="row-actions">
            <v-tooltip v-if="item.review_status !== 'approved'" bottom>
              <template #activator="{ on }">
                <v-btn icon small class="act-approve" v-on="on" @click.stop="openApproveDialog(item)">
                  <v-icon small>
                    mdi-check
                  </v-icon>
                </v-btn>
              </template>
              Approve
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn icon small class="act-edit" v-on="on" @click.stop="editQuestion(item)">
                  <v-icon small>
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>
              Edit
            </v-tooltip>

            <v-menu left offset-y>
              <template #activator="{ on }">
                <v-btn icon small class="act-more" v-on="on" @click.stop>
                  <v-icon small>
                    mdi-dots-vertical
                  </v-icon>
                </v-btn>
              </template>
              <v-list dense class="menu-list">
                <v-list-item
                  v-if="item.review_status !== 'rejected'"
                  @click="openRejectDialog(item)"
                >
                  <v-list-item-icon class="mr-3">
                    <v-icon small color="#F87171">
                      mdi-close
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Reject</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="item.review_status === 'rejected' || !item.review_status"
                  @click="openSubmitForReviewDialog(item)"
                >
                  <v-list-item-icon class="mr-3">
                    <v-icon small color="#22D3EE">
                      mdi-send
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Send for review</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteQuestion(item)">
                  <v-list-item-icon class="mr-3">
                    <v-icon small color="#F87171">
                      mdi-delete
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-10 empty-text">
            <v-icon size="36" color="#475569">
              mdi-text-box-search-outline
            </v-icon>
            <div class="mt-2">
              No questions match these filters.
            </div>
            <v-btn
              v-if="hasActiveFilters"
              text
              small
              class="clear-btn mt-2"
              @click="clearFilters"
            >
              Clear filters
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Detail drawer: read the whole question and act on it in one place -->
    <v-navigation-drawer
      v-model="detailDrawer"
      right
      fixed
      temporary
      width="480"
      class="detail-drawer"
    >
      <div v-if="detailLoading" class="pa-10 text-center">
        <v-progress-circular indeterminate color="#22D3EE" />
      </div>

      <div v-else-if="detail" class="drawer-inner">
        <div class="drawer-head">
          <div>
            <v-chip small :class="getReviewStatusClass(detail.review_status)">
              {{ getReviewStatusLabel(detail.review_status) }}
            </v-chip>
            <span class="drawer-id">#{{ detail.id }}</span>
          </div>
          <v-btn icon small class="act-more" @click="detailDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-body">
          <div class="drawer-meta">
            {{ detail.grade?.name || 'N/A' }}
            <span class="sep">/</span>
            {{ detail.subject?.name || 'N/A' }}
            <span class="sep">/</span>
            {{ getMediumLabel(detail.quiz_language) }}
            <span class="sep">/</span>
            {{ capitalize(detail.difficulty) }}
          </div>

          <p class="drawer-question">
            {{ detail.question_text }}
          </p>

          <div
            v-for="opt in sortedDetailOptions"
            :key="opt.id || opt.option_key"
            class="option-row"
            :class="{ 'option-row--correct': opt.option_key === detail.correct_answer }"
          >
            <span class="option-key">{{ opt.option_key }}</span>
            <span class="option-text">{{ opt.option_text }}</span>
            <v-icon
              v-if="opt.option_key === detail.correct_answer"
              small
              color="#34D399"
            >
              mdi-check-circle
            </v-icon>
          </div>

          <div v-if="detail.explanation" class="drawer-section">
            <div class="section-label">
              Explanation
            </div>
            <p class="section-text">
              {{ detail.explanation }}
            </p>
          </div>

          <div v-if="detail.review_status === 'rejected' && detail.rejection_reason" class="drawer-section reject-note">
            <div class="section-label">
              Rejection reason
            </div>
            <p class="section-text">
              {{ detail.rejection_reason }}
            </p>
          </div>
        </div>

        <div class="drawer-footer">
          <v-btn
            v-if="detail.review_status !== 'approved'"
            class="approve-confirm-btn"
            @click="openApproveDialog(detail)"
          >
            <v-icon small left>
              mdi-check
            </v-icon>
            Approve
          </v-btn>
          <v-btn
            v-if="detail.review_status === 'rejected' || !detail.review_status"
            class="submit-confirm-btn"
            @click="openSubmitForReviewDialog(detail)"
          >
            <v-icon small left>
              mdi-send
            </v-icon>
            Send for review
          </v-btn>
          <v-btn
            v-if="detail.review_status !== 'rejected'"
            outlined
            class="reject-outline-btn"
            @click="openRejectDialog(detail)"
          >
            Reject
          </v-btn>
          <v-spacer />
          <v-btn icon class="act-edit" @click="editQuestion(detail)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon class="act-delete" @click="deleteQuestion(detail)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Edit Question Dialog -->
    <v-dialog v-model="editDialog" max-width="820" scrollable>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Edit question
        </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="editForm.question_text"
            label="Question"
            outlined
            rows="3"
            class="dark-field mt-4"
          />

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="editForm.medium"
                :items="mediumOptions"
                item-text="text"
                item-value="value"
                label="Medium"
                outlined
                dense
                class="dark-field"
              />
            </v-col>
            <v-col cols="12" md="4">
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
            <v-col cols="12" md="4">
              <v-select
                v-model="editForm.correct_answer"
                :items="['A', 'B', 'C', 'D']"
                label="Correct answer"
                outlined
                dense
                class="dark-field"
              />
            </v-col>
          </v-row>

          <h4 class="options-heading mb-3">
            Options
          </h4>
          <div
            v-for="(option, index) in editForm.options"
            :key="option.id || index"
            class="edit-option"
          >
            <span
              class="option-key"
              :class="{ 'option-key--correct': option.option_key === editForm.correct_answer }"
            >{{ option.option_key }}</span>
            <v-text-field
              v-model="option.option_text"
              outlined
              dense
              hide-details
              :label="`Option ${option.option_key}`"
              class="dark-field"
            />
          </div>

          <v-textarea
            v-model="editForm.explanation"
            label="Explanation (optional)"
            outlined
            rows="3"
            class="dark-field mt-4"
          />
          <p class="hint-text">
            Saving sends this question back for review.
          </p>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="closeEditDialog">
            Cancel
          </v-btn>
          <v-btn class="save-btn" :loading="saving" @click="updateQuestion">
            Save changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete -->
    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title dialog-title--danger">
          Delete question
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="delete-preview">"{{ truncateText(questionToDelete && questionToDelete.question_text, 100) }}"</strong>
          <br><br>
          This will permanently remove the question. This can't be undone.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn class="delete-confirm-btn" :loading="deleting" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Approve -->
    <v-dialog v-model="approveDialog" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Approve question
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="delete-preview">"{{ truncateText(approveTarget && approveTarget.question_text, 140) }}"</strong>
          <br><br>
          Students will be able to see this question once it's approved.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="approveDialog = false">
            Cancel
          </v-btn>
          <v-btn class="approve-confirm-btn" :loading="processingReview" @click="confirmApprove">
            Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject -->
    <v-dialog v-model="rejectDialog" max-width="560">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title dialog-title--danger">
          Reject question
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="delete-preview">"{{ truncateText(rejectTarget && rejectTarget.question_text, 140) }}"</strong>
          <v-textarea
            v-model="rejectReason"
            label="Why is it being rejected?"
            outlined
            rows="3"
            class="dark-field mt-4"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="closeRejectDialog">
            Cancel
          </v-btn>
          <v-btn class="reject-confirm-btn" :loading="processingReview" @click="confirmReject">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Submit for review -->
    <v-dialog v-model="submitForReviewDialog" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Send for review
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="delete-preview">"{{ truncateText(submitTarget && submitTarget.question_text, 140) }}"</strong>
          <br><br>
          This question will go back to the pending review list.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="submitForReviewDialog = false">
            Cancel
          </v-btn>
          <v-btn class="submit-confirm-btn" :loading="processingReview" @click="confirmSubmitForReview">
            Send for review
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
      processingReview: false,
      requestId: 0,

      questions: [],
      search: '',
      searchTimeout: null,

      // Status tabs (replace the Review Status dropdown)
      statusTab: 0,
      statusTabs: [
        { label: 'All', value: null },
        { label: 'Pending review', value: 'pending_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
      ],

      filters: {
        grade_id: null,
        subject_id: null,
        medium: null,
        difficulty: null,
        review_status: null
      },

      grades: [],
      subjects: [],

      totalQuestions: 0,
      tableOptions: {
        page: 1,
        itemsPerPage: 20,
        sortBy: ['id'],
        sortDesc: [false]
      },
      previousOptions: {},

      // Detail drawer
      detailDrawer: false,
      detailLoading: false,
      detail: null,

      editDialog: false,
      deleteDialog: false,
      questionToDelete: null,

      approveDialog: false,
      rejectDialog: false,
      submitForReviewDialog: false,
      approveTarget: null,
      rejectTarget: null,
      submitTarget: null,
      rejectReason: '',

      mediumOptions: [
        { text: 'Sinhala Medium', value: 'si' },
        { text: 'English Medium', value: 'en' },
        { text: 'Tamil Medium', value: 'ta' }
      ],
      difficultyOptions: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],

      editForm: {
        id: null,
        question_text: '',
        correct_answer: '',
        medium: 'si',
        difficulty: 'medium',
        explanation: '',
        options: []
      },

      headers: [
        { text: 'ID', value: 'id', width: '64' },
        { text: 'Question', value: 'question_text' },
        { text: 'Grade / Subject', value: 'grade_subject', sortable: false, width: '150' },
        { text: 'Medium', value: 'medium', sortable: false, width: '90' },
        { text: 'Difficulty', value: 'difficulty', width: '110' },
        { text: 'Status', value: 'review_status', width: '140' },
        { text: '', value: 'actions', sortable: false, align: 'end', width: '130' }
      ]
    }
  },

  computed: {
    hasActiveFilters () {
      const f = this.filters
      return !!(f.grade_id || f.subject_id || f.medium || f.difficulty || f.review_status || (this.search && this.search.trim()))
    },
    sortedDetailOptions () {
      if (!this.detail || !this.detail.options) { return [] }
      return [...this.detail.options].sort((a, b) => a.option_key.localeCompare(b.option_key))
    }
  },

  watch: {
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
    notify (type, message) {
      if (this.$toast) {
        this.$toast[type](message)
      } else {
        alert(message)
      }
    },

    async loadLookupData () {
      try {
        const [g, s] = await Promise.all([
          this.$axios.get('/public/grades'),
          this.$axios.get('/public/subjects')
        ])
        if (g.data.success) { this.grades = g.data.data || [] }
        if (s.data.success) { this.subjects = s.data.data || [] }
      } catch (error) {
        console.error('Failed to load lookup data:', error)
        this.notify('error', 'Failed to load grades and subjects')
      }
    },

    async loadQuestions () {
      const myRequest = ++this.requestId
      this.loading = true

      try {
        const params = {
          page: this.tableOptions.page || 1,
          per_page: this.tableOptions.itemsPerPage || 20
        }

        if (this.tableOptions.sortBy && this.tableOptions.sortBy.length > 0) {
          params.sort_by = this.tableOptions.sortBy[0]
          params.sort_order = this.tableOptions.sortDesc[0] ? 'desc' : 'asc'
        }
        if (this.search && this.search.trim()) { params.search = this.search.trim() }

        Object.keys(this.filters).forEach((key) => {
          if (this.filters[key]) { params[key] = this.filters[key] }
        })

        const response = await this.$axios.get('/admin/questions', { params })

        // Ignore out-of-date responses
        if (myRequest !== this.requestId) { return }

        if (response.data.success) {
          const paginated = response.data.data
          this.questions = paginated.data || []
          this.totalQuestions = paginated.total || 0
        } else {
          this.questions = []
          this.totalQuestions = 0
        }
      } catch (error) {
        if (myRequest !== this.requestId) { return }
        console.error('Failed to load questions:', error)
        this.notify('error', 'Failed to load questions')
        this.questions = []
        this.totalQuestions = 0
      } finally {
        if (myRequest === this.requestId) { this.loading = false }
      }
    },

    onSearchInput () {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => this.applyFilters(), 500)
    },

    // Go to page 1; if already there, reload directly (otherwise the watcher reloads)
    applyFilters () {
      if (this.tableOptions.page !== 1) {
        this.tableOptions.page = 1
      } else {
        this.loadQuestions()
      }
    },

    onTabChange (index) {
      this.filters.review_status = this.statusTabs[index].value
      this.applyFilters()
    },

    clearFilters () {
      this.filters = {
        grade_id: null,
        subject_id: null,
        medium: null,
        difficulty: null,
        review_status: null
      }
      this.search = ''
      this.statusTab = 0
      this.applyFilters()
    },

    /* ----------------------------- Detail drawer ---------------------------- */

    async openDetail (row) {
      this.detail = null
      this.detailDrawer = true
      await this.fetchDetail(row.id)
    },

    async fetchDetail (id) {
      this.detailLoading = true
      try {
        const response = await this.$axios.get(`/admin/questions/${id}`)
        if (response.data.success) {
          this.detail = response.data.data
        } else {
          throw new Error('Failed')
        }
      } catch (error) {
        console.error('Failed to load question details:', error)
        this.notify('error', 'Failed to load question details')
        this.detailDrawer = false
      } finally {
        this.detailLoading = false
      }
    },

    /* --------------------------------- Edit --------------------------------- */

    async editQuestion (question) {
      try {
        this.loading = true
        const response = await this.$axios.get(`/admin/questions/${question.id}`)

        if (!response.data.success) { throw new Error('Failed') }

        const q = response.data.data
        this.editForm = {
          id: q.id,
          question_text: q.question_text || '',
          correct_answer: q.correct_answer || '',
          medium: q.quiz_language || 'si',
          difficulty: q.difficulty || 'medium',
          explanation: q.explanation || '',
          options: (q.options || []).slice().sort((a, b) => a.option_key.localeCompare(b.option_key))
        }
        this.editDialog = true
      } catch (error) {
        console.error('Failed to load question details:', error)
        this.notify('error', 'Failed to load question details')
      } finally {
        this.loading = false
      }
    },

    async updateQuestion () {
      const f = this.editForm

      if (!f.question_text || !f.question_text.trim()) { return this.notify('error', 'Question text is required') }
      if (!f.correct_answer) { return this.notify('error', 'Correct answer is required') }
      if (f.options.length === 0) { return this.notify('error', 'Options are required') }
      if (f.options.some(o => !o.option_text || !o.option_text.trim())) {
        return this.notify('error', 'All options must have text')
      }

      this.saving = true
      try {
        const response = await this.$axios.put(`/admin/questions/${f.id}`, {
          question_text: f.question_text,
          correct_answer: f.correct_answer,
          quiz_language: f.medium,
          difficulty: f.difficulty,
          explanation: f.explanation || null,
          options: f.options.map(o => ({ id: o.id, option_text: o.option_text }))
        })

        if (!response.data.success) { throw new Error('Failed') }

        // Edited questions must be reviewed again
        await this.trySubmitForReviewAfterEdit(f.id)

        this.notify('success', response.data.message || 'Question updated and sent for review')

        const editedId = f.id
        this.closeEditDialog()
        await this.loadQuestions()
        if (this.detailDrawer && this.detail && this.detail.id === editedId) {
          await this.fetchDetail(editedId)
        }
      } catch (error) {
        console.error('Failed to update question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to update question')
      } finally {
        this.saving = false
      }
    },

    async trySubmitForReviewAfterEdit (questionId) {
      try {
        await this.$axios.post(`/admin/questions/${questionId}/submit-for-review`)
      } catch (error) {
        console.warn('Auto submit-for-review after edit failed:', error?.response?.data?.message || error.message)
      }
    },

    closeEditDialog () {
      this.editDialog = false
      this.editForm = {
        id: null,
        question_text: '',
        correct_answer: '',
        medium: 'si',
        difficulty: 'medium',
        explanation: '',
        options: []
      }
    },

    /* -------------------------------- Delete -------------------------------- */

    deleteQuestion (question) {
      this.questionToDelete = question
      this.deleteDialog = true
    },

    async confirmDelete () {
      if (!this.questionToDelete) { return }
      this.deleting = true
      try {
        const response = await this.$axios.delete(`/admin/questions/${this.questionToDelete.id}`)
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question deleted')
        this.deleteDialog = false
        this.questionToDelete = null
        this.detailDrawer = false
        await this.loadQuestions()
      } catch (error) {
        console.error('Failed to delete question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to delete question')
      } finally {
        this.deleting = false
      }
    },

    /* ----------------------------- Review workflow ----------------------------- */

    async afterReviewAction (targetId) {
      await this.loadQuestions()
      if (this.detailDrawer && this.detail && this.detail.id === targetId) {
        await this.fetchDetail(targetId)
      }
    },

    openApproveDialog (question) {
      this.approveTarget = question
      this.approveDialog = true
    },

    async confirmApprove () {
      if (!this.approveTarget) { return }
      const id = this.approveTarget.id
      this.processingReview = true
      try {
        const response = await this.$axios.post(`/admin/questions/${id}/approve`)
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question approved')
        this.approveDialog = false
        this.approveTarget = null
        await this.afterReviewAction(id)
      } catch (error) {
        console.error('Failed to approve question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to approve question')
      } finally {
        this.processingReview = false
      }
    },

    openRejectDialog (question) {
      this.rejectTarget = question
      this.rejectReason = ''
      this.rejectDialog = true
    },

    closeRejectDialog () {
      this.rejectDialog = false
      this.rejectTarget = null
      this.rejectReason = ''
    },

    async confirmReject () {
      if (!this.rejectTarget) { return }

      const reason = (this.rejectReason || '').trim()
      if (!reason) { return this.notify('error', 'Add a reason so the author knows what to fix') }

      const id = this.rejectTarget.id
      this.processingReview = true
      try {
        const response = await this.$axios.post(`/admin/questions/${id}/reject`, { rejection_reason: reason })
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question rejected')
        this.closeRejectDialog()
        await this.afterReviewAction(id)
      } catch (error) {
        console.error('Failed to reject question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to reject question')
      } finally {
        this.processingReview = false
      }
    },

    openSubmitForReviewDialog (question) {
      this.submitTarget = question
      this.submitForReviewDialog = true
    },

    async confirmSubmitForReview () {
      if (!this.submitTarget) { return }
      const id = this.submitTarget.id
      this.processingReview = true
      try {
        const response = await this.$axios.post(`/admin/questions/${id}/submit-for-review`)
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question sent for review')
        this.submitForReviewDialog = false
        this.submitTarget = null
        await this.afterReviewAction(id)
      } catch (error) {
        console.error('Failed to submit for review:', error)
        this.notify('error', error.response?.data?.message || 'Failed to send for review')
      } finally {
        this.processingReview = false
      }
    },

    /* --------------------------------- Helpers --------------------------------- */

    getMediumLabel (value) {
      const m = this.mediumOptions.find(o => o.value === value)
      return m ? m.text : value || 'N/A'
    },

    getMediumShort (value) {
      return this.getMediumLabel(value).replace(' Medium', '')
    },

    capitalize (text) {
      return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A'
    },

    truncateText (text, length) {
      if (!text) { return '' }
      return text.length <= length ? text : text.substring(0, length) + '...'
    },

    getDifficultyClass (difficulty) {
      switch (difficulty && difficulty.toLowerCase()) {
        case 'easy': return 'diff-easy'
        case 'medium': return 'diff-medium'
        case 'hard': return 'diff-hard'
        default: return ''
      }
    },

    getReviewStatusLabel (status) {
      const labels = { pending_review: 'Pending review', approved: 'Approved', rejected: 'Rejected' }
      return labels[status] || status || 'Draft'
    },

    getReviewStatusClass (status) {
      switch (status) {
        case 'approved': return 'chip-green'
        case 'rejected': return 'chip-red'
        case 'pending_review': return 'chip-amber'
        default: return 'chip-neutral'
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
  overflow: hidden;
}

/* status tabs */
.status-tabs {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  padding: 0 12px;
}
.status-tabs ::v-deep .v-tab {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  font-size: 14px;
  color: #94A3B8 !important;
}
.status-tabs ::v-deep .v-tab--active {
  color: #22D3EE !important;
}
.status-tabs ::v-deep .v-tabs-slider {
  background: #22D3EE;
}

/* filter bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
}
.filter-search { flex: 1 1 240px; max-width: 320px; }
.filter-select { flex: 0 1 150px; min-width: 130px; }
.clear-btn { color: #22D3EE !important; text-transform: none; font-weight: 600; }
.refresh-btn { color: #22D3EE !important; }

/* form fields */
.dark-field ::v-deep .v-input__control .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px;
}
.dark-field ::v-deep fieldset { border-color: rgba(148, 163, 184, 0.25) !important; }
.dark-field ::v-deep input,
.dark-field ::v-deep textarea,
.dark-field ::v-deep .v-select__selection { color: #F1F5F9 !important; }
.dark-field ::v-deep .v-label { color: #94A3B8 !important; }
.dark-field.v-input--is-focused ::v-deep fieldset { border-color: #22D3EE !important; }
.dark-field ::v-deep .v-icon { color: #64748B !important; }

/* data table */
.dark-table { background: transparent !important; }
.dark-table ::v-deep table { background: transparent; table-layout: auto; }
.dark-table ::v-deep th {
  background: rgba(148, 163, 184, 0.05) !important;
  color: #94A3B8 !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14) !important;
  white-space: nowrap;
}
.dark-table ::v-deep td {
  color: #E2E8F0 !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08) !important;
  font-size: 13.5px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.dark-table ::v-deep tbody tr { cursor: pointer; }
.dark-table ::v-deep tbody tr:hover { background: rgba(34, 211, 238, 0.05) !important; }
.dark-table ::v-deep .v-data-footer {
  color: #94A3B8 !important;
  border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
}
.dark-table ::v-deep .v-data-footer__select .v-select__selection,
.dark-table ::v-deep .v-data-footer__icons-before .v-icon,
.dark-table ::v-deep .v-data-footer__icons-after .v-icon { color: #94A3B8 !important; }

/* cells */
.question-cell { max-width: 520px; min-width: 220px; }
.question-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  color: #F1F5F9;
}
.answer-line {
  margin-top: 4px;
  font-size: 12px;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.grade-subject { display: flex; flex-direction: column; line-height: 1.35; }
.grade-name { color: #F1F5F9; font-weight: 600; }
.subject-name { color: #94A3B8; font-size: 12px; }
.medium-text { color: #CBD5E1; }

.difficulty { display: inline-flex; align-items: center; gap: 6px; }
.difficulty .dot { width: 8px; height: 8px; border-radius: 50%; background: #64748B; }
.diff-easy .dot { background: #34D399; }
.diff-medium .dot { background: #F59E0B; }
.diff-hard .dot { background: #F87171; }

.empty-text { color: #64748B; }

/* chips */
.chip-neutral { background: rgba(148, 163, 184, 0.14) !important; color: #E2E8F0 !important; }
.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-amber { background: rgba(245, 158, 11, 0.16) !important; color: #F59E0B !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }

/* row actions: 3 compact icons instead of 5 wide buttons */
.row-actions { display: flex; justify-content: flex-end; align-items: center; gap: 2px; }
.act-approve { color: #34D399 !important; }
.act-edit { color: #F59E0B !important; }
.act-delete { color: #F87171 !important; }
.act-more { color: #94A3B8 !important; }
.menu-list { background: #0F1729 !important; border: 1px solid rgba(148, 163, 184, 0.16); }
.menu-list ::v-deep .v-list-item__title { color: #E2E8F0; font-size: 13.5px; }

/* detail drawer */
.detail-drawer { background: #0F1729 !important; border-left: 1px solid rgba(148, 163, 184, 0.16); }
.drawer-inner { display: flex; flex-direction: column; height: 100%; }
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.drawer-id { color: #64748B; margin-left: 10px; font-size: 13px; }
.drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
.drawer-meta { color: #94A3B8; font-size: 12.5px; margin-bottom: 14px; }
.drawer-meta .sep { color: #475569; margin: 0 4px; }
.drawer-question { color: #F1F5F9; font-size: 16px; line-height: 1.55; margin-bottom: 18px; }

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  color: #E2E8F0;
}
.option-row--correct { border-color: rgba(52, 211, 153, 0.55); background: rgba(52, 211, 153, 0.08); }
.option-text { flex: 1; }
.option-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.16);
  color: #E2E8F0;
  font-size: 12px;
  font-weight: 700;
}
.option-row--correct .option-key,
.option-key--correct { background: #34D399; color: #0B1120; }

.drawer-section { margin-top: 20px; }
.section-label { color: #94A3B8; font-size: 12.5px; font-weight: 600; margin-bottom: 4px; }
.section-text { color: #CBD5E1; font-size: 14px; line-height: 1.55; margin: 0; }
.reject-note { padding: 12px; border-radius: 10px; background: rgba(248, 113, 113, 0.08); }
.reject-note .section-label { color: #F87171; }

.drawer-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}
.reject-outline-btn { color: #F87171 !important; border-color: rgba(248, 113, 113, 0.5) !important; text-transform: none; font-weight: 600; }

/* dialogs */
.dialog-card { background: #0F1729 !important; border: 1px solid rgba(148, 163, 184, 0.16); }
.dialog-title { color: #F1F5F9; font-family: 'Sora', 'Poppins', sans-serif; font-weight: 700; }
.dialog-title--danger { color: #F87171; }
.dialog-body { color: #CBD5E1; }
.delete-preview { color: #F1F5F9; }
.options-heading { color: #CBD5E1; font-family: 'Sora', 'Poppins', sans-serif; }
.edit-option { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.edit-option .dark-field { flex: 1; }
.hint-text { color: #94A3B8; font-size: 12.5px; margin: 4px 0 0; }
.dialog-actions { border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 12px; }
.cancel-btn { color: #94A3B8 !important; text-transform: none; }
.save-btn { background: linear-gradient(90deg, #22D3EE, #6366F1) !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.delete-confirm-btn { background: #F87171 !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.approve-confirm-btn { background: #34D399 !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.reject-confirm-btn { background: #F87171 !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.submit-confirm-btn { background: #22D3EE !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
</style>
