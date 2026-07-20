<template>
  <div>
    <div class="d-flex align-center mb-6">
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
          Questions generated from this material.
        </p>
      </div>
    </div>

    <div v-if="loading" class="pa-10 text-center">
      <v-progress-circular indeterminate color="#22D3EE" size="32" />
    </div>

    <div v-else-if="questions.length === 0" class="empty-panel">
      <v-icon size="40" color="#475569">
        mdi-help-circle-outline
      </v-icon>
      <p class="mt-3">
        No questions have been generated for this material yet.
      </p>
    </div>

    <v-card
      v-for="(question, index) in questions"
      :key="question.id"
      class="question-card mb-4"
      flat
    >
      <v-card-title class="question-card-title">
        <span class="q-index">Q{{ index + 1 }}</span>
        {{ question.question_text }}
      </v-card-title>

      <v-card-text>
        <v-list dense class="options-list" color="transparent">
          <v-list-item
            v-for="option in question.options"
            :key="option.id"
            class="option-item"
            :class="{ 'option-item--correct': option.option_key === question.correct_answer }"
          >
            <v-list-item-content>
              <span class="option-key">{{ option.option_key }}</span>
              {{ option.option_text }}
              <v-icon
                v-if="option.option_key === question.correct_answer"
                size="16"
                color="#34D399"
                class="ml-2"
              >
                mdi-check-circle
              </v-icon>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-chip small class="chip-amber mr-2">
          {{ question.difficulty }}
        </v-chip>

        <v-chip small class="chip-green">
          {{ question.status }}
        </v-chip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  middleware: 'auth',

  data () {
    return {
      loading: false,
      questions: []
    }
  },

  mounted () {
    this.loadQuestions()
  },

  methods: {
    async loadQuestions () {
      this.loading = true

      try {
        const { data } = await this.$axios.get(
          `/admin/materials/${this.$route.params.id}/questions`
        )

        this.questions = data.data || []
      } catch (error) {
        console.error('Failed to load generated questions:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.back-btn {
  background: rgba(148, 163, 184, 0.08) !important;
}

.page-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 22px;
  margin: 0;
}
.page-subtitle {
  color: #94A3B8;
  font-size: 13.5px;
  margin: 4px 0 0;
}

.empty-panel {
  background: rgba(17, 25, 45, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 48px;
  text-align: center;
  color: #64748B;
}

.question-card {
  background: rgba(17, 25, 45, 0.72) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
}
.question-card-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15.5px;
  align-items: flex-start;
}
.q-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 8px;
  margin-right: 10px;
  border-radius: 6px;
  background: rgba(34, 211, 238, 0.14);
  color: #22D3EE;
  font-size: 12px;
  font-weight: 700;
}

.options-list {
  background: transparent !important;
}
.option-item {
  border-radius: 8px;
  color: #CBD5E1 !important;
  font-size: 13.5px;
}
.option-item--correct {
  background: rgba(52, 211, 153, 0.08);
}
.option-key {
  font-weight: 700;
  color: #94A3B8;
  margin-right: 6px;
}
.option-item--correct .option-key {
  color: #34D399;
}

.chip-amber { background: rgba(245, 158, 11, 0.16) !important; color: #F59E0B !important; }
.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
</style>
