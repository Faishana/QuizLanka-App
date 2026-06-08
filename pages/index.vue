<template>
  <div>
    <h1>Dashboard</h1>

    <pre>
{{ dashboard }}
  </pre>
  </div>
</template>

<script>
export default {

  middleware: 'auth',

  data () {
    return {
      dashboard: {}
    }
  },

  async mounted () {
    const response =
      await this.$axios.get('/dashboard')

    this.dashboard =
      response.data
  }
}
</script>
