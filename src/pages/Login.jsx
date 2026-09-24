import { supabase } from '../supabase'
import './Login.css'

function Login() {
  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Email o contraseña incorrectos.')
      return
    }

    window.location.href = '/admin/dashboard'
  }

  return (
    <main className="login-page">

      <div className="login-background-grid"></div>

      <div className="login-decoration login-decoration-one"></div>
      <div className="login-decoration login-decoration-two"></div>

      <section className="login-card">

        <div className="login-brand">

          <div className="login-brand-mark">
            <span></span>
            <span></span>
          </div>

          <div>
            <strong>LEGADO MATERO</strong>
            <small>ADMINISTRATION</small>
          </div>

        </div>

        <div className="login-header">

          <span className="login-eyebrow">
            ACCESO PRIVADO
          </span>

          <h1>
            Bienvenido
            <span> de nuevo.</span>
          </h1>

          <p>
            Ingresá tus credenciales para acceder al
            panel de administración.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <label>
            <span>Email</span>

            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
          </label>

          <label>
            <span>Contraseña</span>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </label>

          <div className="login-options">

            <label className="login-checkbox">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>

            <button
              type="button"
              className="login-forgot"
            >
              ¿Olvidaste tu contraseña?
            </button>

          </div>

          <button
            type="submit"
            className="login-button"
          >
            Ingresar al panel
            <span>↗</span>
          </button>

        </form>

        <div className="login-footer">

          <span>
            LEGADO MATERO
          </span>

          <span>
            ÁREA DE ADMINISTRACIÓN
          </span>

        </div>

      </section>

      <a
        href="/"
        className="login-back"
      >
        ← Volver al sitio
      </a>

    </main>
  )
}

export default Login