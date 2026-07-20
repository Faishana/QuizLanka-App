export default function ({ store, redirect }) {
  const token = store.state.auth.token ||
    (process.client && (localStorage.getItem('token') || sessionStorage.getItem('token')))

  if (token) {
    return redirect('/dashboard')
  }
}
