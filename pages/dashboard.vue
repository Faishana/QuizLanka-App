<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title">
          {{ greeting }}, {{ adminName }}
        </h1>
        <p class="page-subtitle">
          Here's what's happening on QuizLanka AI today.
        </p>
      </div>
      <div class="today-chip">
        <v-icon size="16" color="#22D3EE" class="mr-1">
          mdi-calendar-blank-outline
        </v-icon>
        {{ todayLabel }}
      </div>
    </div>

    <v-alert
      v-if="loadError"
      type="error"
      dense
      text
      class="mb-6"
    >
      Couldn't load dashboard stats. {{ loadError }}
      <a href="#" class="retry-link" @click.prevent="loadDashboard">Retry</a>
    </v-alert>

    <v-row>
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="stat-card" :class="'stat-card--' + card.accent" flat @click="$router.push(card.to)">
          <v-card-text class="d-flex align-start justify-space-between">
            <div>
              <div class="stat-label">
                {{ card.label }}
              </div>

              <div v-if="loading" class="stat-skeleton" />
              <div v-else class="stat-value">
                {{ formatNumber(stats[card.key]) }}
              </div>
            </div>

            <div class="stat-icon">
              <v-icon size="22" :color="card.color">
                {{ card.icon }}
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card class="panel-card" flat>
          <v-card-title class="panel-title">
            Content Overview
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="pa-6 text-center">
              <v-progress-circular indeterminate color="#22D3EE" size="28" />
            </div>
            <div v-else class="content-bars">
              <div v-for="card in statCards" :key="card.key + '-bar'" class="content-bar-row">
                <div class="bar-label">
                  <v-icon size="15" :color="card.color" class="mr-2">
                    {{ card.icon }}
                  </v-icon>
                  {{ card.label }}
                  <span class="bar-value">{{ formatNumber(stats[card.key]) }}</span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{ width: barWidth(card.key) + '%', background: card.color }"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="panel-card" flat>
          <v-card-title class="panel-title">
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-list dense class="quick-actions" color="transparent">
              <v-list-item
                v-for="action in quickActions"
                :key="action.to"
                :to="action.to"
                class="quick-action-item"
              >
                <v-list-item-icon class="mr-3">
                  <v-icon size="18" color="#22D3EE">
                    {{ action.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title>
                  {{ action.label }}
                </v-list-item-title>
                <v-icon size="16" color="#475569">
                  mdi-chevron-right
                </v-icon>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {

  middleware: 'auth',

  data () {
    return {
      loading: true,
      loadError: '',
      stats: {
        grades: 0,
        subjects: 0,
        materials: 0,
        questions: 0
      },
      statCards: [
        { key: 'grades', label: 'Grades', icon: 'mdi-school-outline', color: '#22D3EE', accent: 'cyan', to: '/grades' },
        { key: 'subjects', label: 'Subjects', icon: 'mdi-book-open-page-variant-outline', color: '#8B5CF6', accent: 'violet', to: '/subjects' },
        { key: 'materials', label: 'Materials', icon: 'mdi-file-pdf-box', color: '#34D399', accent: 'green', to: '/materials' },
        { key: 'questions', label: 'Questions', icon: 'mdi-help-circle-outline', color: '#F59E0B', accent: 'amber', to: '/questions' }
      ],
      quickActions: [
        { label: 'Add a new question', icon: 'mdi-plus-circle-outline', to: '/questions' },
        { label: 'Upload study material', icon: 'mdi-cloud-upload-outline', to: '/materials' },
        { label: 'Manage subjects', icon: 'mdi-book-open-page-variant-outline', to: '/subjects' },
        { label: 'View quiz history', icon: 'mdi-history', to: '/quiz-history' }
      ]
    }
  },

  computed: {
    adminName () {
      return this.$store.state.auth.user?.name || 'Admin'
    },

    greeting () {
      const hour = new Date().getHours()
      if (hour < 12) { return 'Good morning' }
      if (hour < 18) { return 'Good afternoon' }
      return 'Good evening'
    },

    todayLabel () {
      return new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    },

    maxStat () {
      return Math.max(1, ...Object.values(this.stats))
    }
  },

  mounted () {
    this.loadDashboard()
  },

  methods: {
    async loadDashboard () {
      this.loading = true
      this.loadError = ''

      try {
        const response = await this.$axios.get('/admin/dashboard')
        this.stats = { ...this.stats, ...response.data.stats }
      } catch (error) {
        this.loadError = error.response?.data?.message || 'Please try again.'
      } finally {
        this.loading = false
      }
    },

    formatNumber (value) {
      return new Intl.NumberFormat().format(value || 0)
    },

    barWidth (key) {
      return Math.round((this.stats[key] / this.maxStat) * 100)
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

.today-chip {
  display: flex;
  align-items: center;
  font-size: 12.5px;
  color: #CBD5E1;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 999px;
  padding: 6px 14px;
}

.retry-link {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  margin-left: 6px;
}

.stat-card {
  background: rgba(17, 25, 45, 0.72) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-top: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-card--cyan { border-top-color: #22D3EE; }
.stat-card--violet { border-top-color: #8B5CF6; }
.stat-card--green { border-top-color: #34D399; }
.stat-card--amber { border-top-color: #F59E0B; }

.stat-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #94A3B8;
  text-transform: uppercase;
}
.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  margin-top: 4px;
}
.stat-skeleton {
  width: 60px;
  height: 30px;
  margin-top: 6px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(148,163,184,0.08) 25%, rgba(148,163,184,0.18) 37%, rgba(148,163,184,0.08) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.08);
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

.content-bar-row {
  margin-bottom: 16px;
}
.content-bar-row:last-child {
  margin-bottom: 0;
}
.bar-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #CBD5E1;
  margin-bottom: 6px;
}
.bar-value {
  margin-left: auto;
  font-weight: 700;
  color: #F1F5F9;
}
.bar-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.1);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.quick-actions {
  background: transparent !important;
}
.quick-action-item {
  border-radius: 10px;
  margin-bottom: 4px;
  color: #E2E8F0 !important;
}
.quick-action-item ::v-deep .v-list-item__title {
  font-size: 13.5px;
  font-weight: 500;
}
.quick-action-item:hover {
  background: rgba(34, 211, 238, 0.08);
}
</style>
