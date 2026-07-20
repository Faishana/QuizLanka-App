<template>
  <v-container fluid class="auth-screen d-flex align-center justify-center">
    <div class="glow glow--cyan" />
    <div class="glow glow--violet" />

    <v-card class="auth-card" elevation="0">
      <div class="text-center brand-block">
        <div class="brand-mark">
          <v-icon size="26" color="#22D3EE">
            mdi-brain
          </v-icon>
        </div>
        <h1 class="brand-title">
          QuizLanka <span class="accent">AI</span>
        </h1>
        <p class="brand-subtitle">
          Create your admin account
        </p>
      </div>

      <v-form ref="form" autocomplete="off" @submit.prevent="register">
        <label class="field-label">
          <v-icon size="16" color="#22D3EE" class="mr-1">
            mdi-account-outline
          </v-icon>
          Full Name
        </label>
        <v-text-field
          v-model="name"
          placeholder="John Doe"
          autocomplete="name"
          dense
          outlined
          hide-details="auto"
          class="auth-field mb-4"
          :rules="[rules.required]"
        />

        <label class="field-label">
          <v-icon size="16" color="#22D3EE" class="mr-1">
            mdi-email-outline
          </v-icon>
          Email
        </label>
        <v-text-field
          v-model="email"
          placeholder="admin@quizlanka.ai"
          type="email"
          autocomplete="username"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off"
          dense
          outlined
          hide-details="auto"
          class="auth-field mb-4"
          :rules="[rules.required, rules.email]"
        />

        <label class="field-label">
          <v-icon size="16" color="#22D3EE" class="mr-1">
            mdi-lock-outline
          </v-icon>
          Password
        </label>
        <v-text-field
          v-model="password"
          placeholder="At least 8 characters"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          dense
          outlined
          hide-details="auto"
          class="auth-field mb-4"
          :rules="[rules.required, rules.minLen]"
          @click:append="showPassword = !showPassword"
        />

        <label class="field-label">
          <v-icon size="16" color="#22D3EE" class="mr-1">
            mdi-lock-check-outline
          </v-icon>
          Confirm Password
        </label>
        <v-text-field
          v-model="passwordConfirmation"
          placeholder="Re-enter your password"
          :type="showConfirm ? 'text' : 'password'"
          autocomplete="new-password"
          :append-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          dense
          outlined
          hide-details="auto"
          class="auth-field mb-2"
          :rules="[rules.required, rules.match]"
          @click:append="showConfirm = !showConfirm"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          dense
          text
          class="mt-4 mb-2"
        >
          {{ errorMessage }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          dense
          text
          class="mt-4 mb-2"
        >
          {{ successMessage }}
        </v-alert>

        <v-btn
          block
          large
          depressed
          class="sign-in-btn mt-4"
          :loading="loading"
          type="submit"
        >
          Create Account
        </v-btn>
      </v-form>

      <div class="text-center mt-6 register-hint">
        Already have an account?
        <nuxt-link to="/login">
          Sign In
        </nuxt-link>
      </div>

      <div class="text-center footer-note">
        <v-icon size="14" color="#64748B" class="mr-1">
          mdi-shield-lock-outline
        </v-icon>
        Secure Admin Portal
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {

  layout: 'auth',

  data () {
    return {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      showPassword: false,
      showConfirm: false,
      loading: false,
      errorMessage: '',
      successMessage: '',
      rules: {
        required: v => !!v || 'This field is required',
        email: v => /.+@.+\..+/.test(v) || 'Enter a valid email',
        minLen: v => (v && v.length >= 8) || 'Minimum 8 characters',
        match: v => v === this.password || 'Passwords do not match'
      }
    }
  },

  methods: {

    async register () {
      this.errorMessage = ''
      this.successMessage = ''

      if (this.$refs.form && !this.$refs.form.validate()) {
        return
      }

      this.loading = true

      try {
        const res = await this.$axios.post('/auth/admin-register', {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation
        })

        if (res.data.success) {
          this.successMessage = res.data.message || 'Admin registered successfully'

          setTimeout(() => {
            this.$router.push('/login')
          }, 1200)
        }
      } catch (error) {
        const errors = error.response?.data?.errors

        if (errors) {
          // Laravel validation errors: { field: [messages] }
          this.errorMessage = Object.values(errors)
            .map(msgs => msgs[0])
            .join(' ')
        } else {
          this.errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
        }
      } finally {
        this.loading = false
      }
    }

  }

}
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, #14213D 0%, #0B1120 55%, #060912 100%);
  font-family: 'Sora', 'Poppins', 'Segoe UI', sans-serif;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  pointer-events: none;
}
.glow--cyan {
  width: 380px;
  height: 380px;
  background: #22D3EE;
  top: -120px;
  left: -100px;
}
.glow--violet {
  width: 420px;
  height: 420px;
  background: #8B5CF6;
  bottom: -140px;
  right: -120px;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 40px 36px 28px;
  border-radius: 20px;
  background: rgba(17, 25, 45, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.brand-block {
  margin-bottom: 28px;
}

.brand-mark {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(139, 92, 246, 0.18));
  border: 1px solid rgba(34, 211, 238, 0.35);
}

.brand-title {
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.3px;
  color: #F1F5F9;
  margin: 0;
}
.brand-title .accent {
  background: linear-gradient(90deg, #22D3EE, #8B5CF6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-subtitle {
  font-size: 13px;
  color: #94A3B8;
  margin: 4px 0 0;
  letter-spacing: 0.4px;
}

.field-label {
  display: flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #CBD5E1;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
}

/* ===========================
   AUTH FIELD
=========================== */

.auth-field ::v-deep .v-input__slot {
  background: rgba(255,255,255,.03) !important;
  border-radius: 10px;
}

.auth-field ::v-deep fieldset {
  border-color: rgba(148,163,184,.25) !important;
}

.auth-field.v-input--is-focused ::v-deep fieldset {
  border-color: #22D3EE !important;
}

.auth-field ::v-deep input {
  color: #F1F5F9 !important;
  caret-color: #22D3EE !important;
}

.auth-field ::v-deep input::placeholder {
  color: #64748B !important;
}

.auth-field ::v-deep .v-label {
  color: #94A3B8 !important;
}

.auth-field ::v-deep .v-icon {
  color: #94A3B8 !important;
}

/* ===========================
   REMOVE CHROME AUTOFILL
=========================== */

.auth-field ::v-deep input:-webkit-autofill,
.auth-field ::v-deep input:-webkit-autofill:hover,
.auth-field ::v-deep input:-webkit-autofill:focus,
.auth-field ::v-deep input:-webkit-autofill:active {
  -webkit-text-fill-color: #F1F5F9 !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,.03) inset !important;
  box-shadow: 0 0 0px 1000px rgba(255,255,255,.03) inset !important;
  background-color: transparent !important;
  transition: background-color 999999s ease-in-out 0s;
}

/* Firefox */

.auth-field ::v-deep input:-moz-autofill {
  box-shadow: 0 0 0px 1000px rgba(255,255,255,.03) inset !important;
  -moz-text-fill-color: #F1F5F9 !important;
}

.sign-in-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 10px;
  height: 46px;
  text-transform: none;
  box-shadow: 0 10px 24px rgba(34, 211, 238, 0.25);
}

.register-hint {
  font-size: 13px;
  color: #94A3B8;
}
.register-hint a {
  color: #22D3EE;
  text-decoration: none;
  font-weight: 600;
}

.footer-note {
  margin-top: 18px;
  font-size: 11.5px;
  color: #64748B;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
</style>
