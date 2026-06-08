<template>
  <div>
    <h1>Generated Questions</h1>

    <v-card
      v-for="(question, index) in questions"
      :key="question.id"
      class="mb-4"
    >
      <v-card-title>
        Question {{ index + 1 }}
      </v-card-title>

      <div>
        Total Questions:
        {{ questions.length }}
      </div>

      <v-card-text>
        <h3>
          {{ question.question_text }}
        </h3>

        <v-list dense>
          <v-list-item
            v-for="option in question.options"
            :key="option.id"
          >
            <v-list-item-content>
              <strong>
                {{ option.option_key }}
              </strong>
              -
              {{ option.option_text }}
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-chip
          small
          color="warning"
          class="mr-2"
        >
          {{ question.difficulty }}
        </v-chip>

        <v-chip
          small
          color="success"
        >
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
      questions: []
    }
  },

  mounted () {
    this.loadQuestions()
  },

  methods: {
    async loadQuestions () {
      try {
        const response = await this.$axios.get(
          `/materials/${this.$route.params.id}/questions`
        )

        this.questions = response.data.data
      } catch (error) {
        alert(error.message)
      }
    }
  }
}
</script>
