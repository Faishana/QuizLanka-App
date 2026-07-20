<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-8 flex-wrap">
      <div>
        <h1 class="page-title">
          My Profile
        </h1>

        <p class="page-subtitle">
          Manage your administrator profile.
        </p>
      </div>

      <v-btn
        class="save-btn"
        depressed
        :loading="saving"
        @click="updateProfile"
      >
        <v-icon left size="18">
          mdi-content-save-outline
        </v-icon>

        Save Changes
      </v-btn>
    </div>

    <v-alert
      v-if="error"
      type="error"
      dense
      text
      class="mb-5"
    >
      {{ error }}
    </v-alert>

    <v-row>
      <!-- LEFT -->

      <v-col
        cols="12"
        md="4"
      >
        <v-card
          class="panel-card"
          flat
        >
          <v-card-text class="text-center pa-8">
            <v-avatar
              size="110"
              color="#22D3EE"
            >
              <span class="avatar-text">
                {{ initials }}
              </span>
            </v-avatar>

            <div class="profile-name mt-5">
              {{ form.name }}
            </div>

            <div class="profile-email">
              {{ form.email }}
            </div>

            <v-chip
              small
              class="admin-chip mt-4"
            >
              Administrator
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT -->

      <v-col
        cols="12"
        md="8"
      >
        <v-card
          class="panel-card"
          flat
        >
          <v-card-title class="panel-title">
            <v-icon
              left
              color="#22D3EE"
            >
              mdi-account-outline
            </v-icon>

            Personal Information
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  outlined
                  dense
                  class="dark-field"
                  label="Full Name"
                  prepend-inner-icon="mdi-account-outline"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  outlined
                  dense
                  type="email"
                  class="dark-field"
                  label="Email Address"
                  prepend-inner-icon="mdi-email-outline"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Change Password Card -->
        <v-card
          class="panel-card mt-6"
          flat
        >
          <v-card-title class="panel-title">
            <v-icon
              left
              color="#22D3EE"
            >
              mdi-lock-reset
            </v-icon>

            Change Password
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="passwordForm.current_password"
                  outlined
                  dense
                  class="dark-field"
                  type="password"
                  label="Current Password"
                  prepend-inner-icon="mdi-lock-outline"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="passwordForm.password"
                  outlined
                  dense
                  class="dark-field"
                  type="password"
                  label="New Password"
                  prepend-inner-icon="mdi-lock-plus-outline"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="passwordForm.password_confirmation"
                  outlined
                  dense
                  class="dark-field"
                  type="password"
                  label="Confirm Password"
                  prepend-inner-icon="mdi-lock-check-outline"
                />
              </v-col>

              <v-col cols="12">
                <v-btn
                  class="change-password-btn"
                  depressed
                  :loading="changingPassword"
                  @click="changePassword"
                >
                  <v-icon left size="18">
                    mdi-lock-reset
                  </v-icon>

                  Change Password
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      color="success"
      timeout="2500"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
export default {

  middleware: 'auth',

  data () {
    return {

      loading: false,

      saving: false,

      changingPassword: false,

      snackbar: false,

      snackbarText: '',

      error: '',

      form: {
        id: null,
        name: '',
        email: ''
      },

      passwordForm: {
        current_password: '',
        password: '',
        password_confirmation: ''
      }

    }
  },

  computed: {

    initials () {
      return this.form.name
        ? this.form.name
          .split(' ')
          .map(x => x[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
        : 'A'
    }

  },

  mounted () {
    this.loadProfile()
  },

  methods: {

    async loadProfile () {
      this.loading = true
      this.error = ''

      try {
        const response = await this.$axios.get('/admin/profile')

        const user = response.data.user

        this.form = {
          id: user.id,
          name: user.name,
          email: user.email
        }
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'Unable to load profile.'
      } finally {
        this.loading = false
      }
    },

    async updateProfile () {
      this.saving = true
      this.error = ''

      try {
        const response = await this.$axios.put('/admin/profile', {
          name: this.form.name,
          email: this.form.email
        })

        this.snackbarText = response.data.message
        this.snackbar = true
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'Unable to save changes.'
      } finally {
        this.saving = false
      }
    },

    async changePassword () {
      this.changingPassword = true

      try {
        const response = await this.$axios.put('/admin/profile/password', this.passwordForm)

        this.snackbarText = response.data.message
        this.snackbar = true

        this.passwordForm = {
          current_password: '',
          password: '',
          password_confirmation: ''
        }
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'Unable to change password.'
      } finally {
        this.changingPassword = false
      }
    }

  }

}
</script>

<style scoped>

.page-title {
  color: #F1F5F9;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Sora', 'Poppins', sans-serif;
  margin: 0;
}

.page-subtitle {
  color: #94A3B8;
  margin-top: 4px;
  font-size: 13.5px;
}

.save-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
  box-shadow: none !important;
}

.save-btn:hover {
  opacity: .95;
}

.change-password-btn {
  background: rgba(34, 211, 238, 0.12) !important;
  color: #22D3EE !important;
  font-weight: 600;
  text-transform: none;
  box-shadow: none !important;
}

.change-password-btn:hover {
  background: rgba(34, 211, 238, 0.18) !important;
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

.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
}

.profile-email {
  color: #94A3B8;
  font-size: 13px;
  margin-top: 6px;
}

.avatar-text {
  font-size: 36px;
  font-weight: 700;
  color: #0B1120;
}

.admin-chip {
  background: rgba(34, 211, 238, 0.15) !important;
  color: #22D3EE !important;
  font-weight: 600;
}

/* ==========================================
   TEXT FIELDS
========================================== */

.dark-field ::v-deep .v-input__control {
  background: transparent !important;
}

.dark-field ::v-deep .v-input__slot {
  background: rgba(15, 23, 41, 0.55) !important;
  border-radius: 10px;
}

.dark-field ::v-deep fieldset {
  border-color: rgba(148, 163, 184, 0.18) !important;
  transition: border-color .2s ease;
}

.dark-field.v-input--is-focused ::v-deep fieldset {
  border-color: #22D3EE !important;
}

.dark-field ::v-deep input {
  color: #F8FAFC !important;
  caret-color: #22D3EE !important;
}

.dark-field ::v-deep .v-label {
  color: #94A3B8 !important;
}

.dark-field ::v-deep .v-icon {
  color: #64748B !important;
}

.dark-field.v-input--is-focused ::v-deep .v-icon {
  color: #22D3EE !important;
}

/* ==========================================
   CHROME AUTOFILL FIX
========================================== */

.dark-field ::v-deep input:-webkit-autofill,
.dark-field ::v-deep input:-webkit-autofill:hover,
.dark-field ::v-deep input:-webkit-autofill:focus,
.dark-field ::v-deep textarea:-webkit-autofill,
.dark-field ::v-deep select:-webkit-autofill {

  -webkit-text-fill-color: #F8FAFC !important;

  caret-color: #22D3EE !important;

  -webkit-box-shadow: 0 0 0 1000px rgba(15, 23, 41, 0.55) inset !important;
  box-shadow: 0 0 0 1000px rgba(15, 23, 41, 0.55) inset !important;

  transition: background-color 9999s ease-in-out 0s;
}

/* ==========================================
   READONLY FIELD
========================================== */

.dark-field.v-input--is-disabled ::v-deep .v-input__slot,
.dark-field input[readonly] {
  opacity: 1 !important;
}

.dark-field input[readonly] {
  color: #CBD5E1 !important;
}

</style>
