<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">
        Grades
      </h1>
      <p class="page-subtitle">
        Manage the grade levels available across the platform.
      </p>
    </div>

    <v-card class="panel-card" flat>
      <v-card-title class="panel-title d-flex align-center flex-wrap">
        Grades List

        <v-spacer />

        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search Grades"
          outlined
          dense
          hide-details
          class="dark-field mr-4"
          style="max-width: 280px"
        />

        <v-btn class="create-btn" @click="openCreateDialog">
          <v-icon left size="18">
            mdi-plus
          </v-icon>
          Add Grade
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="grades"
        :search="search"
        :loading="loading"
        class="dark-table"
      >
        <template #item.is_active="{ item }">
          <v-chip small :class="item.is_active ? 'chip-green' : 'chip-red'">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn small class="subjects-btn mr-2" @click="viewSubjects(item)">
            Subjects
          </v-btn>

          <v-btn small class="edit-btn mr-2" @click="editGrade(item)">
            Edit
          </v-btn>

          <v-btn small class="delete-btn" @click="deleteGrade(item)">
            Delete
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-8 empty-text">
            No grades found
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="createDialog" max-width="600">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          {{ form.id ? 'Edit Grade' : 'Create Grade' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Grade Name"
            outlined
            required
            class="dark-field mt-4"
          />

          <v-select
            v-model="form.category"
            :items="categoryOptions"
            label="Category"
            outlined
            required
            class="dark-field"
          />

          <v-text-field
            v-model.number="form.sort_order"
            type="number"
            label="Sort Order"
            outlined
            class="dark-field"
          />

          <v-switch
            v-model="form.is_active"
            label="Active"
            color="#22D3EE"
            class="dark-switch"
          />
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn text class="cancel-btn" @click="createDialog = false">
            Cancel
          </v-btn>

          <v-btn class="save-btn" :loading="saving" @click="saveGrade">
            Save
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
      createDialog: false,

      grades: [],
      search: '',

      categoryOptions: [
        'Primary',
        'O/L',
        'A/L',
        'Government exam'
      ],

      form: {
        id: null,
        name: '',
        category: '',
        sort_order: 0,
        is_active: true
      },

      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Sort Order', value: 'sort_order' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },

  mounted () {
    this.loadGrades()
  },

  methods: {
    async loadGrades () {
      try {
        this.loading = true

        const response = await this.$axios.get('/admin/grades')

        this.grades = response.data.data
      } catch (error) {
        console.error('Failed to load grades:', error)
        alert('Failed to load grades')
      } finally {
        this.loading = false
      }
    },

    viewSubjects (grade) {
      this.$router.push(`/subjects?grade=${grade.id}`)
    },

    openCreateDialog () {
      this.form = {
        id: null,
        name: '',
        category: '',
        sort_order: 0,
        is_active: true
      }
      this.createDialog = true
    },

    editGrade (grade) {
      this.form = {
        id: grade.id,
        name: grade.name,
        category: grade.category,
        sort_order: grade.sort_order,
        is_active: !!grade.is_active
      }
      this.createDialog = true
    },

    async saveGrade () {
      if (!this.form.name || !this.form.name.trim()) {
        alert('Grade name is required')
        return
      }

      if (!this.form.category) {
        alert('Category is required')
        return
      }

      this.saving = true

      try {
        if (this.form.id) {
          await this.$axios.put(
            `/grades/${this.form.id}`,
            this.form
          )
          alert('Grade updated successfully')
        } else {
          await this.$axios.post(
            '/grades',
            this.form
          )
          alert('Grade created successfully')
        }

        this.createDialog = false
        await this.loadGrades()
      } catch (error) {
        console.error('Failed to save grade:', error)

        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to save grade')
        }
      } finally {
        this.saving = false
      }
    },

    async deleteGrade (grade) {
      if (!window.confirm(`Are you sure you want to delete "${grade.name}"?`)) {
        return
      }

      try {
        await this.$axios.delete(`/grades/${grade.id}`)
        alert('Grade deleted successfully')
        await this.loadGrades()
      } catch (error) {
        console.error('Failed to delete grade:', error)

        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to delete grade')
        }
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
}
.panel-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15px;
}

.create-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
  box-shadow: none !important;
}

.dark-field ::v-deep .v-input__control .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px;
}
.dark-field ::v-deep fieldset {
  border-color: rgba(148, 163, 184, 0.25) !important;
}
.dark-field ::v-deep input,
.dark-field ::v-deep .v-select__selection
{
  color: #F1F5F9 !important;
}
.dark-field ::v-deep .v-label {
  color: #94A3B8 !important;
}
.dark-field.v-input--is-focused ::v-deep fieldset {
  border-color: #22D3EE !important;
}
.dark-field ::v-deep .v-icon {
  color: #64748B !important;
}

.dark-switch ::v-deep label {
  color: #CBD5E1 !important;
}

.dark-table {
  background: transparent !important;
}
.dark-table ::v-deep table {
  background: transparent;
}
.dark-table ::v-deep th {
  background: rgba(148, 163, 184, 0.05) !important;
  color: #94A3B8 !important;
  font-size: 11.5px !important;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14) !important;
}
.dark-table ::v-deep td {
  color: #E2E8F0 !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08) !important;
  font-size: 13.5px;
}
.dark-table ::v-deep tbody tr:hover {
  background: rgba(255, 255, 255, 0.03) !important;
}
.dark-table ::v-deep .v-data-footer {
  color: #94A3B8 !important;
  border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
}

.empty-text {
  color: #64748B;
}

.chip-green { background: rgba(52, 211, 153, 0.16) !important; color: #34D399 !important; }
.chip-red { background: rgba(248, 113, 113, 0.16) !important; color: #F87171 !important; }

.subjects-btn {
  background: rgba(34, 211, 238, 0.12) !important;
  color: #22D3EE !important;
  text-transform: none;
  box-shadow: none !important;
}
.edit-btn {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #F59E0B !important;
  text-transform: none;
  box-shadow: none !important;
}
.delete-btn {
  background: rgba(248, 113, 113, 0.12) !important;
  color: #F87171 !important;
  text-transform: none;
  box-shadow: none !important;
}

.dialog-card {
  background: #0F1729 !important;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.dialog-title {
  color: #F1F5F9;
  font-family: 'Sora', 'Poppins', sans-serif;
  font-weight: 700;
}
.dialog-actions {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 12px;
}
.cancel-btn {
  color: #94A3B8 !important;
  text-transform: none;
}
.save-btn {
  background: linear-gradient(90deg, #22D3EE, #6366F1) !important;
  color: #0B1120 !important;
  font-weight: 700;
  text-transform: none;
}
</style>
