<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
      class="admin-drawer"
    >
      <div class="drawer-brand d-flex align-center px-4 py-5">
        <div class="brand-mark-sm mr-2">
          <v-icon size="18" color="#22D3EE">
            mdi-brain
          </v-icon>
        </div>
        <span class="brand-text">QuizLanka <span class="accent">AI</span></span>
      </div>

      <v-divider class="drawer-divider" />

      <v-list dense nav class="pt-2">
        <template v-for="section in navSections">
          <v-subheader :key="section.title" class="section-heading">
            {{ section.title }}
          </v-subheader>

          <v-list-item
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            active-class="nav-item--active"
          >
            <v-list-item-icon class="mr-3">
              <v-icon size="20">
                {{ item.icon }}
              </v-icon>
            </v-list-item-icon>

            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>

          <v-divider :key="section.title + '-div'" class="drawer-divider my-2" />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat class="admin-appbar" height="64">
      <v-toolbar-title class="appbar-title">
        QuizLanka AI
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        text
        small
        class="admin-name-btn mr-4 d-none d-sm-flex"
        to="/profile"
      >
        <v-icon size="18" class="mr-2">
          mdi-account-circle-outline
        </v-icon>

        {{ adminName }}
      </v-btn>

      <v-btn
        text
        small
        class="logout-btn"
        @click="logout"
      >
        <v-icon size="16" class="mr-1">
          mdi-logout
        </v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <v-main class="admin-main">
      <v-container fluid class="pa-6">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {

  data () {
    return {
      drawer: true,
      navSections: [
        {
          title: 'MAIN',
          items: [
            { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard-outline' }
          ]
        },
        {
          title: 'EDUCATION',
          items: [
            { title: 'Grades', to: '/grades', icon: 'mdi-school-outline' },
            { title: 'Subjects', to: '/subjects', icon: 'mdi-book-open-page-variant-outline' }
          ]
        },
        {
          title: 'CONTENT',
          items: [
            { title: 'Materials', to: '/materials', icon: 'mdi-file-pdf-box' },
            { title: 'Questions', to: '/questions', icon: 'mdi-help-circle-outline' }
          ]
        },
        {
          title: 'QUIZZES',
          items: [
            { title: 'Quiz History', to: '/quiz-history', icon: 'mdi-history' }
          ]
        }
      ]
    }
  },

  computed: {
    adminName () {
      return this.$store.state.auth.user?.name || 'Admin'
    }
  },

  methods: {
    logout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')

      this.$store.commit('auth/LOGOUT')

      this.$router.push('/login')
    }
  }

}
</script>

<style scoped>
.admin-name-btn {
  color: #CBD5E1 !important;
  text-transform: none;
  letter-spacing: 0;
  font-size: 13px;
  font-weight: 600;
  min-width: auto !important;
  padding: 0 8px !important;
  border-radius: 8px;
  transition: all .2s ease;
}

.admin-name-btn:hover {
  background: rgba(34, 211, 238, 0.08) !important;
  color: #22D3EE !important;
}

.admin-name-btn .v-icon {
  color: inherit !important;
}

.admin-drawer {
  background: #0F1729 !important;
  border-right: 1px solid rgba(148, 163, 184, 0.12) !important;
}

.drawer-brand {
  background: #0B1120;
}
.brand-mark-sm {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(139, 92, 246, 0.18));
  border: 1px solid rgba(34, 211, 238, 0.35);
}
.brand-text {
  font-weight: 700;
  font-size: 15px;
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
}
.brand-text .accent {
  background: linear-gradient(90deg, #22D3EE, #8B5CF6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.drawer-divider {
  border-color: rgba(148, 163, 184, 0.12) !important;
}

.section-heading {
  font-size: 11px !important;
  letter-spacing: 0.6px;
  color: #64748B !important;
  height: 28px;
}

.nav-item {
  border-radius: 8px;
  margin: 2px 8px;
  color: #CBD5E1 !important;
}
.nav-item ::v-deep .v-list-item__title {
  font-size: 13.5px;
  font-weight: 500;
}
.nav-item ::v-deep .v-icon {
  color: #94A3B8;
}
.nav-item:hover {
  background: rgba(148, 163, 184, 0.08);
}
.nav-item--active {
  background: rgba(34, 211, 238, 0.1) !important;
  border-left: 2px solid #22D3EE;
}
.nav-item--active ::v-deep .v-list-item__title {
  color: #F1F5F9;
  font-weight: 700;
}
.nav-item--active ::v-deep .v-icon {
  color: #22D3EE !important;
}

.admin-appbar {
  background: #0B1120 !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
}
.appbar-title {
  color: #F1F5F9;
  font-weight: 600;
  font-size: 16px;
  font-family: 'Sora', 'Poppins', sans-serif;
}
.admin-name {
  color: #94A3B8;
  font-size: 13px;
}
.logout-btn {
  color: #E2E8F0 !important;
  letter-spacing: 0.3px;
  text-transform: none;
}
.logout-btn:hover {
  color: #22D3EE !important;
}

.admin-main {
  background: radial-gradient(circle at 15% 0%, #14213D 0%, #0B1120 60%, #060912 100%);
  min-height: 100vh;
}
</style>
