<template>
  <div class="quiz-history">
    <div class="mb-6">
      <h1 class="page-title">
        Quiz History
      </h1>
      <p class="page-subtitle">
        Every quiz attempt across the platform, in one place.
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--cyan">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <line x1="18" y1="12" x2="18" y2="17" />
            <line x1="14" y1="12" x2="14" y2="17" />
            <line x1="10" y1="12" x2="10" y2="17" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">
            Total Quizzes
          </p>
          <p class="stat-value">
            {{ stats.total_quizzes || 0 }}
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">
            Completed Quizzes
          </p>
          <p class="stat-value">
            {{ stats.completed_quizzes || 0 }}
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--amber">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">
            Average Score
          </p>
          <p class="stat-value">
            {{ stats.average_score || 0 }}%
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--violet">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">
            Students Attempted
          </p>
          <p class="stat-value">
            {{ stats.unique_students || 0 }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="panel filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Student ID</label>
          <input
            v-model="filters.user_id"
            type="text"
            placeholder="Search by student ID..."
            @input="applyFilters"
          >
        </div>

        <div class="filter-group">
          <label>Grade</label>
          <select v-model="filters.grade_id" @change="applyFilters">
            <option value="">
              All Grades
            </option>
            <option v-for="grade in grades" :key="grade.id" :value="grade.id">
              {{ grade.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Subject</label>
          <select v-model="filters.subject_id" @change="applyFilters">
            <option value="">
              All Subjects
            </option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>&nbsp;</label>
          <button class="reset-btn" @click="resetFilters">
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Quiz Table -->
    <div class="panel table-container">
      <div class="table-header">
        <h2>Quiz Attempts</h2>
        <span class="record-count">{{ quizzes.length }} records</span>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <p>Loading quizzes...</p>
      </div>

      <div v-else-if="quizzes.length === 0" class="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
          <path d="M7 7h.01" />
        </svg>
        <p>No quizzes found</p>
      </div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Quiz ID</th>
              <th>Student</th>
              <th>Grade</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in quizzes" :key="quiz.id">
              <td><span class="badge">#{{ quiz.id }}</span></td>
              <td>
                <div class="student-info">
                  <strong>{{ quiz.user?.name || 'N/A' }}</strong>
                  <span class="email">{{ quiz.user?.email || '' }}</span>
                </div>
              </td>
              <td>{{ quiz.grade ? quiz.grade.name : 'N/A' }}</td>
              <td>{{ quiz.subject ? quiz.subject.name : 'N/A' }}</td>
              <td>{{ quiz.score || 0 }}</td>
              <td>
                <span class="percentage" :class="getPercentageClass(quiz.percentage)">
                  {{ quiz.percentage || 0 }}%
                </span>
              </td>
              <td>
                <span class="status-badge" :class="quiz.is_completed ? 'completed' : 'pending'">
                  {{ quiz.is_completed ? 'Completed' : 'In Progress' }}
                </span>
              </td>
              <td>{{ formatDate(quiz.started_at || quiz.created_at) }}</td>
              <td>
                <button class="view-btn" @click="viewQuiz(quiz.id)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="pagination">
        <button
          :disabled="!pagination.prev_page_url"
          class="page-btn"
          @click="changePage(pagination.current_page - 1)"
        >
          Previous
        </button>

        <span class="page-info">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>

        <button
          :disabled="!pagination.next_page_url"
          class="page-btn"
          @click="changePage(pagination.current_page + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Quiz Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Quiz Details</h3>
          <button class="close-btn" @click="closeModal">
            ×
          </button>
        </div>

        <div v-if="selectedQuiz" class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Student Name</label>
              <p>{{ selectedQuiz.user?.name || 'N/A' }}</p>
            </div>
            <div class="detail-item">
              <label>Email</label>
              <p>{{ selectedQuiz.user?.email || 'N/A' }}</p>
            </div>
            <div class="detail-item">
              <label>Grade</label>
              <p>{{ selectedQuiz.grade?.name || 'N/A' }}</p>
            </div>
            <div class="detail-item">
              <label>Subject</label>
              <p>{{ selectedQuiz.subject?.name || 'N/A' }}</p>
            </div>
            <div class="detail-item">
              <label>Score</label>
              <p>{{ selectedQuiz.score || 0 }}</p>
            </div>
            <div class="detail-item">
              <label>Percentage</label>
              <p class="percentage" :class="getPercentageClass(selectedQuiz.percentage)">
                {{ selectedQuiz.percentage || 0 }}%
              </p>
            </div>
            <div class="detail-item">
              <label>Correct Answers</label>
              <p>{{ selectedQuiz.correct_answers || 0 }}</p>
            </div>
            <div class="detail-item">
              <label>Wrong Answers</label>
              <p>{{ selectedQuiz.wrong_answers || 0 }}</p>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <p>
                {{ Math.floor((selectedQuiz.duration_seconds || 0) / 60) }} min
                <span v-if="(selectedQuiz.duration_seconds || 0) % 60 > 0">
                  {{ (selectedQuiz.duration_seconds || 0) % 60 }} sec
                </span>
              </p>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <p>
                <span class="status-badge" :class="selectedQuiz.is_completed ? 'completed' : 'pending'">
                  {{ selectedQuiz.is_completed ? 'Completed' : 'In Progress' }}
                </span>
              </p>
            </div>
            <div class="detail-item full-width">
              <label>Started At</label>
              <p>{{ formatDate(selectedQuiz.started_at) }}</p>
            </div>
            <div class="detail-item full-width">
              <label>Completed At</label>
              <p>{{ selectedQuiz.completed_at ? formatDate(selectedQuiz.completed_at) : 'Not yet completed' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizHistory',

  middleware: 'auth',

  data () {
    return {
      loading: false,
      quizzes: [],
      selectedQuiz: null,
      showModal: false,
      pagination: null,
      filters: {
        user_id: '',
        grade_id: '',
        subject_id: ''
      },
      stats: {
        total_quizzes: 0,
        completed_quizzes: 0,
        average_score: 0,
        unique_students: 0
      },
      grades: [],
      subjects: []
    }
  },

  mounted () {
    this.fetchStats()
    this.fetchQuizzes()
    this.fetchGrades()
    this.fetchSubjects()
  },

  methods: {
    async fetchStats () {
      try {
        const { data } = await this.$axios.get('/admin/quizzes/stats')

        if (data.success) {
          this.stats = {
            total_quizzes: data.total_quizzes,
            completed_quizzes: data.completed_quizzes,
            average_score: data.average_score,
            unique_students: data.unique_students
          }
        }
      } catch (error) {
        console.error('Failed to load quiz stats:', error)
      }
    },

    async fetchQuizzes (page = 1) {
      this.loading = true

      try {
        const params = {
          page,
          ...this.filters
        }

        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const { data } = await this.$axios.get('/admin/quizzes', { params })

        if (data.success) {
          this.quizzes = data.data.data

          this.pagination = {
            current_page: data.data.current_page,
            last_page: data.data.last_page,
            next_page_url: data.data.next_page_url,
            prev_page_url: data.data.prev_page_url
          }
        }
      } catch (error) {
        console.error('Failed to load quizzes:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchGrades () {
      try {
        const response = await this.$axios.get('/grades')
        this.grades = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load grades:', error)
      }
    },

    async fetchSubjects () {
      try {
        const response = await this.$axios.get('/subjects')
        this.subjects = response.data.data || response.data
      } catch (error) {
        console.error('Failed to load subjects:', error)
      }
    },

    async viewQuiz (id) {
      try {
        const { data } = await this.$axios.get(`/admin/quizzes/${id}`)

        if (data.success) {
          this.selectedQuiz = data.data
          this.showModal = true
        }
      } catch (error) {
        console.error('Failed to load quiz details:', error)
      }
    },

    applyFilters () {
      this.fetchQuizzes(1)
    },

    resetFilters () {
      this.filters = {
        user_id: '',
        grade_id: '',
        subject_id: ''
      }
      this.fetchQuizzes(1)
    },

    changePage (page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchQuizzes(page)
      }
    },

    formatDate (date) {
      if (!date) { return 'N/A' }
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getPercentageClass (percentage) {
      if (percentage >= 80) { return 'high' }
      if (percentage >= 60) { return 'medium' }
      return 'low'
    },

    closeModal () {
      this.showModal = false
      this.selectedQuiz = null
    }
  }
}
</script>

<style scoped>
.quiz-history {
  font-family: 'Sora', 'Poppins', sans-serif;
}

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
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(17, 25, 45, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon--cyan { background: rgba(34, 211, 238, 0.14); color: #22D3EE; }
.stat-icon--green { background: rgba(52, 211, 153, 0.14); color: #34D399; }
.stat-icon--amber { background: rgba(245, 158, 11, 0.14); color: #F59E0B; }
.stat-icon--violet { background: rgba(139, 92, 246, 0.16); color: #A78BFA; }

.stat-content { flex: 1; }
.stat-label {
  font-size: 12.5px;
  color: #94A3B8;
  margin: 0 0 4px 0;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: #F1F5F9;
}

/* Shared panel */
.panel {
  background: rgba(17, 25, 45, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 20px;
}

/* Filters */
.filters-section {
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12.5px;
  font-weight: 600;
  color: #94A3B8;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.filter-group input,
.filter-group select {
  padding: 9px 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  font-size: 13.5px;
  background: rgba(255, 255, 255, 0.03);
  color: #F1F5F9;
  transition: border-color 0.2s;
}
.filter-group select option {
  background: #0F1729;
  color: #F1F5F9;
}

.filter-group input::placeholder {
  color: #64748B;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #22D3EE;
}

.reset-btn {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 9px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
  color: #CBD5E1;
  transition: all 0.2s;
}
.reset-btn:hover {
  background: rgba(148, 163, 184, 0.15);
}

/* Table */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.table-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #F1F5F9;
}

.record-count {
  font-size: 13px;
  color: #64748B;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

thead {
  background: rgba(148, 163, 184, 0.05);
}

th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #94A3B8;
  font-size: 11.5px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: #E2E8F0;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.badge {
  background: rgba(148, 163, 184, 0.14);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #CBD5E1;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-info strong {
  font-weight: 600;
  color: #F1F5F9;
}

.email {
  font-size: 12px;
  color: #64748B;
}

.percentage {
  font-weight: 700;
}
.percentage.high { color: #34D399; }
.percentage.medium { color: #F59E0B; }
.percentage.low { color: #F87171; }

.status-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-block;
}
.status-badge.completed {
  background: rgba(52, 211, 153, 0.14);
  color: #34D399;
}
.status-badge.pending {
  background: rgba(245, 158, 11, 0.14);
  color: #F59E0B;
}

.view-btn {
  background: rgba(34, 211, 238, 0.12);
  border: none;
  color: #22D3EE;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}
.view-btn:hover {
  background: rgba(34, 211, 238, 0.22);
}

/* Loading & Empty State */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748B;
}

.spinner {
  border: 3px solid rgba(148, 163, 184, 0.15);
  border-top: 3px solid #22D3EE;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.page-btn {
  padding: 7px 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #CBD5E1;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.1);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #94A3B8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(6, 9, 18, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #0F1729;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #F1F5F9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: #64748B;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #F1F5F9;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.detail-item p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #F1F5F9;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
    margin: 10px;
  }
}
</style>
