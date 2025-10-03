import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import styles from './Auth.module.css'

// Função para traduzir erros de autenticação para português
const translateAuthError = (error) => {
  const errorTranslations = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User not found': 'Usuário não encontrado',
    'Invalid email': 'Email inválido',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'User already registered': 'Este email já está cadastrado',
    'Signup requires a valid password': 'Cadastro requer uma senha válida',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'For security purposes, you can only request this once every 60 seconds': 'Por segurança, você só pode solicitar isso uma vez a cada 60 segundos',
    'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'Network request failed': 'Falha na conexão. Verifique sua internet.',
    'Email rate limit exceeded': 'Limite de emails excedido. Tente novamente mais tarde.',
    'Weak password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'Email already taken': 'Este email já está em uso.',
    'Invalid password': 'Senha inválida',
    'Email link is invalid or has expired': 'Link do email é inválido ou expirou',
    'Token has expired or is invalid': 'Token expirou ou é inválido',
    'Only an email address is required': 'Apenas um endereço de email é necessário',
  }

  // Verifica se há uma tradução específica
  for (const [englishError, portugueseError] of Object.entries(errorTranslations)) {
    if (error.includes(englishError)) {
      return portugueseError
    }
  }

  // Se não encontrar tradução específica, retorna a mensagem original
  return error
}
export default function Auth({ defaultMode = 'login' }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    setIsLogin(defaultMode === 'login')
  }, [defaultMode])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Verificar se o email foi confirmado
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login.')
      }
      
      console.log('Login successful:', data.user)
    } catch (error) {
      setError(translateAuthError(error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
      if (password !== confirmPassword) throw new Error('As senhas não coincidem.')
      if (!name.trim()) throw new Error('Preencha o nome completo.')
      if (!phone.trim()) throw new Error('Preencha o telefone.')
      if (!birthdate) throw new Error('Preencha a data de nascimento.')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, birthdate }
        }
      })
      if (error) throw error

      setShowEmailSent(true)
    } catch (error) {
      setError(translateAuthError(error.message))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordRecovery = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      if (!email.trim()) {
        throw new Error('Digite seu email para recuperar a senha.')
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      
      alert('Link de recuperação enviado! Verifique sua caixa de entrada.')
      setShowRecovery(false)
    } catch (error) {
      setError(translateAuthError(error.message))
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmationEmail = async () => {
    if (!email.trim()) {
      setError('Digite seu email para reenviar a confirmação.')
      return
    }
    
    setResendingEmail(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      if (error) throw error
      
      alert('Email de confirmação reenviado! Verifique sua caixa de entrada.')
    } catch (error) {
      setError(translateAuthError(error.message))
    } finally {
      setResendingEmail(false)
    }
  }

  if (showRecovery) {
    return (
      <div className={styles.container}>
        <form onSubmit={handlePasswordRecovery} className={styles.form}>
          <h1>Recuperar Senha</h1>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
          <button
            type="button"
            onClick={() => setShowRecovery(false)}
            className={styles.linkButton}
          >
            Voltar ao login
          </button>
        </form>
      </div>
    )
  }

  if (showEmailSent) {
    return (
      <div className={styles.container}>
        <div className={styles.popup}>
          <h2>📧 Email de confirmação enviado!</h2>
          <p>
            Enviamos um link de confirmação para <strong>{email}</strong>. 
            Clique no link recebido para ativar sua conta antes de fazer login.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            ⚠️ Verifique também a pasta de spam/lixo eletrônico.
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button onClick={() => { setShowEmailSent(false); setIsLogin(true); }} className={styles.submitButton}>
              Voltar ao login
            </button>
            <button 
              onClick={resendConfirmationEmail} 
              disabled={resendingEmail}
              className={styles.linkButton}
              style={{ marginTop: '0.5rem' }}
            >
              {resendingEmail ? 'Reenviando...' : 'Reenviar email de confirmação'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.authWrapper}>
        <button type="button" onClick={toggleTheme} className={styles.themeToggle}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <form onSubmit={isLogin ? handleLogin : handleSignUp} className={styles.form}>
          {/* Botão gangorra dentro do formulário */}
          <div className={styles.toggleSwitch}>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`${styles.toggleButton} ${isLogin ? styles.active : ''}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`${styles.toggleButton} ${!isLogin ? styles.active : ''}`}
            >
              Registrar
            </button>
          </div>

          <h1>{isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}</h1>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <>
              <input
                type="password"
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Data de nascimento"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                required
              />
            </>
          )}
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>

          {isLogin && (
            <>
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className={styles.linkButton}
              >
                Esqueceu sua senha?
              </button>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                textAlign: 'center',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'var(--button-bg)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}>
                💡 Lembre-se: é necessário confirmar seu email antes do primeiro login
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}