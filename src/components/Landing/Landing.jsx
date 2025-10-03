import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import styles from './Landing.module.css'

export default function Landing() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
        if (password !== confirmPassword) throw new Error('As senhas não coincidem.')
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Cadastro realizado! Verifique seu e-mail para confirmação.')
        setConfirmPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async () => {
    if (!email) return setError('Informe seu email para recuperar a senha.')
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      alert('Enviamos o link de recuperação para seu e-mail.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.topSwitch}>
          <button
            className={`${styles.switchBtn} ${mode === 'login' ? styles.active : ''}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            className={`${styles.switchBtn} ${mode === 'signup' ? styles.active : ''}`}
            onClick={() => setMode('signup')}
          >
            Registrar
          </button>
        </div>

        <h1>{mode === 'login' ? 'Faça seu login' : 'Crie sua conta'}</h1>
        <p className={styles.subtitle}>Gerencie suas tarefas de forma rápida e segura.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.primary}>
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Registrar'}
          </button>

          {mode === 'login' ? (
            <button type="button" className={styles.link} onClick={handleRecovery} disabled={loading}>
              Esqueceu a senha?
            </button>
          ) : null}
        </form>
        {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1') && (
          <div className={styles.devRow}>
            <button
              type="button"
              className={styles.devButton}
              onClick={async () => {
                const fake = { user: { id: '00000000-0000-0000-0000-000000000000', email: 'dev@local' }, expires_at: Date.now() + 86400000 }
                window.dispatchEvent(new CustomEvent('authSimulated', { detail: fake }))
                if (onSimulate) onSimulate(fake)
              }}
            >
              Simular Login (dev)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}