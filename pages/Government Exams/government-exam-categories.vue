
<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="7">
        <h2 class="text-h5 font-weight-bold">
          Government Exam Categories
        </h2>
        <p class="grey--text mb-0">
          Manage categories for government examinations.
        </p>
      </v-col>

      <v-col cols="12" md="5" class="text-md-right">
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>
            mdi-plus
          </v-icon>
          Add Category
        </v-btn>
      </v-col>
    </v-row>

    <!-- Categories Table -->
    <v-card outlined>
      <v-card-title>
        Categories
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search categories"
          single-line
          hide-details
          dense
          outlined
          style="max-width: 280px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="categories"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-medium">
            {{ item.name }}
          </div>
          <small class="grey--text">{{ item.slug }}</small>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip
            small
            :color="item.is_active ? 'success' : 'grey'"
            text-color="white"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                v-bind="attrs"
                v-on="on"
                @click="editCategory(item)"
              >
                <v-icon small>
                  mdi-pencil
                </v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="error"
                v-bind="attrs"
                v-on="on"
                @click="confirmDelete(item)"
              >
                <v-icon small>
                  mdi-delete
                </v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>

        <template v-slot:no-data>
          <div class="pa-6 text-center grey--text">
            No government exam categories found.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="550">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Edit Category' : 'Add Government Exam Category' }}
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-5">
          <v-form ref="categoryForm" v-model="valid">
            <v-text-field
              v-model="form.name"
              label="Category Name"
              outlined
              dense
              :rules="[rules.required]"
              required
            />

            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              dense
              rows="3"
              auto-grow
            />

            <v-switch
              v-model="form.is_active"
              label="Active"
              color="success"
              inset
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!valid || saving"
            @click="saveCategory"
          >
            {{ isEdit ? 'Update' : 'Save Category' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Category?</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedCategory ? selectedCategory.name : '' }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteCategory"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'GovernmentExamCategoriesPage',

  data () {
    return {
      loading: false,
      saving: false,
      deleting: false,
      dialog: false,
      deleteDialog: false,
      isEdit: false,
      valid: false,
      search: '',

      categories: [],
      selectedCategory: null,

      headers: [
        { text: 'Category', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Status', value: 'is_active' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ],

      form: {
        id: null,
        name: '',
        description: '',
        is_active: true
      },

      rules: {
        required: value => !!(value && value.trim()) || 'Category name is required'
      },

      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    }
  },

  mounted () {
    this.loadCategories()
  },

  methods: {
    notify (message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },

    async loadCategories () {
      this.loading = true

      try {
        const response = await this.$axios.get('/admin/government-exam-categories')
        const result = response.data.data

        this.categories = Array.isArray(result)
          ? result
          : (result.data || [])
      } catch (error) {
        console.error('Load categories error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to load categories',
          'error'
        )
      } finally {
        this.loading = false
      }
    },

    openCreateDialog () {
      this.isEdit = false
      this.resetForm()
      this.dialog = true
    },

    editCategory (category) {
      this.isEdit = true

      this.form = {
        id: category.id,
        name: category.name || '',
        description: category.description || '',
        is_active: Boolean(category.is_active)
      }

      this.dialog = true
    },

    resetForm () {
      this.form = {
        id: null,
        name: '',
        description: '',
        is_active: true
      }

      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.resetValidation()
      }
    },

    async saveCategory () {
      const isValid = this.$refs.categoryForm.validate()

      if (!isValid) { return }

      this.saving = true

      try {
        const payload = {
          name: this.form.name,
          description: this.form.description,
          is_active: this.form.is_active
        }

        if (this.isEdit) {
          await this.$axios.put(
            `/admin/government-exam-categories/${this.form.id}`,
            payload
          )

          this.notify('Category updated successfully')
        } else {
          await this.$axios.post(
            '/admin/government-exam-categories',
            payload
          )

          this.notify('Category created successfully')
        }

        this.dialog = false
        await this.loadCategories()
      } catch (error) {
        console.error('Save category error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to save category',
          'error'
        )
      } finally {
        this.saving = false
      }
    },

    confirmDelete (category) {
      this.selectedCategory = category
      this.deleteDialog = true
    },

    async deleteCategory () {
      if (!this.selectedCategory) { return }

      this.deleting = true

      try {
        await this.$axios.delete(
          `/admin/government-exam-categories/${this.selectedCategory.id}`
        )

        this.notify('Category deleted successfully')
        this.deleteDialog = false
        this.selectedCategory = null

        await this.loadCategories()
      } catch (error) {
        console.error('Delete category error:', error)
        this.notify(
          error.response?.data?.message || 'Failed to delete category',
          'error'
        )
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>
