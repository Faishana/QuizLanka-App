<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center mb-5">
      <v-btn icon class="back-btn mr-3" @click="$router.push('/materials')">
        <v-icon color="#94A3B8">
          mdi-arrow-left
        </v-icon>
      </v-btn>
      <div>
        <h1 class="page-title">
          Generated Questions
        </h1>
        <p class="page-subtitle">
          Review the questions generated from this material.
        </p>
      </div>
      <v-spacer />
      <v-btn icon class="refresh-btn" :loading="refreshing" @click="loadQuestions(true)">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <div v-if="loading" class="pa-10 text-center">
      <v-progress-circular indeterminate color="#22D3EE" size="32" />
    </div>

    <div v-else-if="questions.length === 0" class="empty-panel">
      <v-icon size="40" color="#475569">
        mdi-help-circle-outline
      </v-icon>
      <p class="mt-3 mb-0">
        No questions have been generated for this material yet.
      </p>
    </div>

    <template v-else>
      <!-- Status filter with counts -->
      <v-tabs
        v-model="statusTab"
        background-color="transparent"
        class="status-tabs mb-4"
      >
        <v-tab v-for="t in statusTabs" :key="t.value || 'all'">
          {{ t.label }}
          <span class="tab-count">{{ countFor(t.value) }}</span>
        </v-tab>
      </v-tabs>

      <div v-if="visibleQuestions.length === 0" class="empty-panel">
        <p class="mb-0">
          No {{ statusTabs[statusTab].label.toLowerCase() }} questions.
        </p>
      </div>

      <!-- Question cards -->
      <v-card
        v-for="question in visibleQuestions"
        :key="question.id"
        class="question-card mb-4"
        flat
      >
        <div class="card-top">
          <div class="d-flex align-center flex-wrap">
            <v-chip small :class="statusClass(question.review_status)" class="mr-2">
              {{ statusLabel(question.review_status) }}
            </v-chip>
            <span class="difficulty mr-3" :class="difficultyClass(question.difficulty)">
              <span class="dot" />
              {{ capitalize(question.difficulty) }}
            </span>
            <span v-if="question.quiz_language" class="meta-text">
              {{ mediumLabel(question.quiz_language) }}
            </span>
          </div>
          <span class="meta-text">ID {{ question.id }}</span>
        </div>

        <div class="question-body">
          <div class="question-title">
            <span class="q-index">Q{{ questionNumber(question) }}</span>
            <span>{{ question.question_text }}</span>
          </div>

          <!-- Options: 2 columns on desktop, 1 on mobile -->
          <div class="options-grid">
            <div
              v-for="option in sortedOptions(question)"
              :key="option.id || option.option_key"
              class="option-item"
              :class="{ 'option-item--correct': option.option_key === question.correct_answer }"
            >
              <span class="option-key">{{ option.option_key }}</span>
              <span class="option-text">{{ option.option_text }}</span>
              <v-icon
                v-if="option.option_key === question.correct_answer"
                size="18"
                color="#34D399"
              >
                mdi-check-circle
              </v-icon>
            </div>
          </div>

          <div v-if="question.explanation" class="note-box">
            <div class="note-label">
              Explanation
            </div>
            <p class="note-text">
              {{ question.explanation }}
            </p>
          </div>

          <div
            v-if="question.review_status === 'rejected' && question.rejection_reason"
            class="note-box note-box--danger"
          >
            <div class="note-label">
              Rejection reason
            </div>
            <p class="note-text">
              {{ question.rejection_reason }}
            </p>
          </div>
        </div>

        <div class="card-actions">
          <v-btn small text class="edit-btn" @click="openEditDialog(question)">
            <v-icon small left>
              mdi-pencil
            </v-icon>
            Edit
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="question.review_status === 'rejected' || !question.review_status"
            small
            class="submit-confirm-btn"
            @click="openSubmitDialog(question)"
          >
            <v-icon small left>
              mdi-send
            </v-icon>
            Send for review
          </v-btn>
          <v-btn
            v-if="question.review_status !== 'rejected'"
            small
            outlined
            class="reject-outline-btn"
            @click="openRejectDialog(question)"
          >
            <v-icon small left>
              mdi-close
            </v-icon>
            Reject
          </v-btn>
          <v-btn
            v-if="question.review_status !== 'approved'"
            small
            class="approve-confirm-btn"
            @click="openApproveDialog(question)"
          >
            <v-icon small left>
              mdi-check
            </v-icon>
            Approve
          </v-btn>
        </div>
      </v-card>
    </template>

    <!-- Approve -->
    <v-dialog v-model="approveDialog" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Approve question
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="preview">"{{ truncate(approveTarget && approveTarget.question_text, 140) }}"</strong>
          <br><br>
          Students will be able to see this question once it's approved.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="approveDialog = false">
            Cancel
          </v-btn>
          <v-btn class="approve-confirm-btn" :loading="processing" @click="confirmApprove">
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
          <strong class="preview">"{{ truncate(rejectTarget && rejectTarget.question_text, 140) }}"</strong>
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
          <v-btn class="reject-confirm-btn" :loading="processing" @click="confirmReject">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Send for review -->
    <v-dialog v-model="submitDialog" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Send for review
        </v-card-title>
        <v-card-text class="dialog-body">
          <strong class="preview">"{{ truncate(submitTarget && submitTarget.question_text, 140) }}"</strong>
          <br><br>
          This question will go back to the pending review list.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn text class="cancel-btn" @click="submitDialog = false">
            Cancel
          </v-btn>
          <v-btn class="submit-confirm-btn" :loading="processing" @click="confirmSubmit">
            Send for review
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit -->
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
          <v-btn class="save-btn" :loading="saving" @click="saveEdit">
            Save changes
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
      refreshing: false,
      processing: false,
      saving: false,
      questions: [],

      statusTab: 0,
      statusTabs: [
        { label: 'All', value: null },
        { label: 'Pending review', value: 'pending_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
      ],

      approveDialog: false,
      rejectDialog: false,
      submitDialog: false,
      editDialog: false,
      approveTarget: null,
      rejectTarget: null,
      submitTarget: null,
      rejectReason: '',

      editForm: {
        id: null,
        question_text: '',
        correct_answer: '',
        medium: 'si',
        difficulty: 'medium',
        explanation: '',
        options: []
      },

      mediumOptions: [
        { text: 'Sinhala Medium', value: 'si' },
        { text: 'English Medium', value: 'en' },
        { text: 'Tamil Medium', value: 'ta' }
      ],
      difficultyOptions: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ]
    }
  },

  computed: {
    visibleQuestions () {
      const status = this.statusTabs[this.statusTab].value
      if (!status) { return this.questions }
      return this.questions.filter(q => q.review_status === status)
    }
  },

  mounted () {
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

    async loadQuestions (silent = false) {
      if (silent) {
        this.refreshing = true
      } else {
        this.loading = true
      }

      try {
        const { data } = await this.$axios.get(
          `/admin/materials/${this.$route.params.id}/questions`
        )
        this.questions = data.data || []
      } catch (error) {
        console.error('Failed to load generated questions:', error)
        this.notify('error', 'Failed to load generated questions')
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    /* ------------------------------ Review workflow ------------------------------ */
    /* Uses the same endpoints as the Questions Management page. */

    openApproveDialog (question) {
      this.approveTarget = question
      this.approveDialog = true
    },

    async confirmApprove () {
      if (!this.approveTarget) { return }
      this.processing = true
      try {
        const response = await this.$axios.post(`/admin/questions/${this.approveTarget.id}/approve`)
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question approved')
        this.approveDialog = false
        this.approveTarget = null
        await this.loadQuestions(true)
      } catch (error) {
        console.error('Failed to approve question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to approve question')
      } finally {
        this.processing = false
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

      this.processing = true
      try {
        const response = await this.$axios.post(
          `/admin/questions/${this.rejectTarget.id}/reject`,
          { rejection_reason: reason }
        )
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question rejected')
        this.closeRejectDialog()
        await this.loadQuestions(true)
      } catch (error) {
        console.error('Failed to reject question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to reject question')
      } finally {
        this.processing = false
      }
    },

    openSubmitDialog (question) {
      this.submitTarget = question
      this.submitDialog = true
    },

    async confirmSubmit () {
      if (!this.submitTarget) { return }
      this.processing = true
      try {
        const response = await this.$axios.post(`/admin/questions/${this.submitTarget.id}/submit-for-review`)
        if (!response.data.success) { throw new Error('Failed') }

        this.notify('success', response.data.message || 'Question sent for review')
        this.submitDialog = false
        this.submitTarget = null
        await this.loadQuestions(true)
      } catch (error) {
        console.error('Failed to submit for review:', error)
        this.notify('error', error.response?.data?.message || 'Failed to send for review')
      } finally {
        this.processing = false
      }
    },

    /* ----------------------------------- Edit ----------------------------------- */

    openEditDialog (question) {
      // Deep copy so changes don't touch the card until saved
      const options = JSON.parse(JSON.stringify(this.sortedOptions(question)))

      this.editForm = {
        id: question.id,
        question_text: question.question_text || '',
        correct_answer: question.correct_answer || '',
        medium: question.quiz_language || 'si',
        difficulty: question.difficulty || 'medium',
        explanation: question.explanation || '',
        options
      }
      this.editDialog = true
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

    async saveEdit () {
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
        try {
          await this.$axios.post(`/admin/questions/${f.id}/submit-for-review`)
        } catch (e) {
          console.warn('Auto submit-for-review after edit failed:', e?.response?.data?.message || e.message)
        }

        this.notify('success', response.data.message || 'Question updated and sent for review')
        this.closeEditDialog()
        await this.loadQuestions(true)
      } catch (error) {
        console.error('Failed to update question:', error)
        this.notify('error', error.response?.data?.message || 'Failed to update question')
      } finally {
        this.saving = false
      }
    },

    /* ---------------------------------- Helpers ---------------------------------- */

    countFor (status) {
      if (!status) { return this.questions.length }
      return this.questions.filter(q => q.review_status === status).length
    },

    // Keep the original numbering (Q1, Q2...) even when a tab filters the list
    questionNumber (question) {
      return this.questions.findIndex(q => q.id === question.id) + 1
    },

    sortedOptions (question) {
      return [...(question.options || [])].sort((a, b) => a.option_key.localeCompare(b.option_key))
    },

    mediumLabel (value) {
      const m = this.mediumOptions.find(o => o.value === value)
      return m ? m.text : value
    },

    capitalize (text) {
      return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A'
    },

    truncate (text, length) {
      if (!text) { return '' }
      return text.length <= length ? text : text.substring(0, length) + '...'
    },

    difficultyClass (difficulty) {
      switch (difficulty && difficulty.toLowerCase()) {
        case 'easy': return 'diff-easy'
        case 'medium': return 'diff-medium'
        case 'hard': return 'diff-hard'
        default: return ''
      }
    },

    statusLabel (status) {
      const labels = { pending_review: 'Pending review', approved: 'Approved', rejected: 'Rejected' }
      return labels[status] || status || 'Draft'
    },

    statusClass (status) {
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
.back-btn { background: rgba(148, 163, 184, 0.08) !important; }
.refresh-btn { color: #22D3EE !important; }

.page-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 22px;
  margin: 0;
}
.page-subtitle { color: #94A3B8; font-size: 13.5px; margin: 4px 0 0; }

.empty-panel {
  background: rgba(17, 25, 45, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 40px;
  text-align: center;
  color: #64748B;
}

/* tabs */
.status-tabs { border-bottom: 1px solid rgba(148, 163, 184, 0.12); }
.status-tabs ::v-deep .v-tab {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  font-size: 14px;
  color: #94A3B8 !important;
}
.status-tabs ::v-deep .v-tab--active { color: #22D3EE !important; }
.status-tabs ::v-deep .v-tabs-slider { background: #22D3EE; }
.tab-count {
  margin-left: 8px;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.14);
  font-size: 12px;
}

/* card */
.question-card {
  background: rgba(17, 25, 45, 0.72) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  overflow: hidden;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}
.meta-text { color: #64748B; font-size: 12.5px; }

.difficulty { display: inline-flex; align-items: center; gap: 6px; color: #CBD5E1; font-size: 13px; }
.difficulty .dot { width: 8px; height: 8px; border-radius: 50%; background: #64748B; }
.diff-easy .dot { background: #34D399; }
.diff-medium .dot { background: #F59E0B; }
.diff-hard .dot { background: #F87171; }

.question-body { padding: 18px 20px 6px; }
.question-title {
  display: flex;
  align-items: flex-start;
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15.5px;
  line-height: 1.55;
  margin-bottom: 16px;
}
.q-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 8px;
  margin: 2px 10px 0 0;
  border-radius: 6px;
  background: rgba(34, 211, 238, 0.14);
  color: #22D3EE;
  font-size: 12px;
  font-weight: 700;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 760px) {
  .options-grid { grid-template-columns: 1fr; }
}
.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  color: #CBD5E1;
  font-size: 14px;
}
.option-item--correct {
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(52, 211, 153, 0.08);
  color: #F1F5F9;
}
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
.option-item--correct .option-key,
.option-key--correct { background: #34D399; color: #0B1120; }

.note-box {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.06);
}
.note-box--danger { background: rgba(248, 113, 113, 0.08); }
.note-label { color: #94A3B8; font-size: 12.5px; font-weight: 600; margin-bottom: 4px; }
.note-box--danger .note-label { color: #F87171; }
.note-text { color: #CBD5E1; font-size: 13.5px; line-height: 1.55; margin: 0; }

.card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

/* chips */
.chip-neutral { background: rgba(148, 163, 184, 0.14) !important; color: #E2E8F0 !important; }
.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-amber { background: rgba(245, 158, 11, 0.16) !important; color: #F59E0B !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }

/* buttons */
.edit-btn { color: #F59E0B !important; text-transform: none; font-weight: 600; }
.reject-outline-btn { color: #F87171 !important; border-color: rgba(248, 113, 113, 0.5) !important; text-transform: none; font-weight: 600; }
.approve-confirm-btn { background: #34D399 !important; color: #0B1120 !important; font-weight: 700; text-transform: none; box-shadow: none !important; }
.reject-confirm-btn { background: #F87171 !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.submit-confirm-btn { background: #22D3EE !important; color: #0B1120 !important; font-weight: 700; text-transform: none; box-shadow: none !important; }
.save-btn { background: linear-gradient(90deg, #22D3EE, #6366F1) !important; color: #0B1120 !important; font-weight: 700; text-transform: none; }
.cancel-btn { color: #94A3B8 !important; text-transform: none; }

/* dialogs & fields */
.dialog-card { background: #0F1729 !important; border: 1px solid rgba(148, 163, 184, 0.16); }
.dialog-title { color: #F1F5F9; font-family: 'Sora', 'Poppins', sans-serif; font-weight: 700; }
.dialog-title--danger { color: #F87171; }
.dialog-body { color: #CBD5E1; }
.preview { color: #F1F5F9; }
.options-heading { color: #CBD5E1; font-family: 'Sora', 'Poppins', sans-serif; }
.edit-option { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.edit-option .dark-field { flex: 1; }
.hint-text { color: #94A3B8; font-size: 12.5px; margin: 4px 0 0; }
.dialog-actions { border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 12px; }

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
</style>
