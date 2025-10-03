import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth/Auth'
import Dashboard from './components/Dashboard/Dashboard'
import UpdatePassword from './UpdatePassword'
import './index.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Verificar se o usuário tem email confirmado
      if (session?.user && !session.user.email_confirmed_at) {
        console.log('User email not confirmed, signing out...')
        supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session)
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true)
        return
      }
      
      // Verificar se o usuário tem email confirmado
      if (session?.user && !session.user.email_confirmed_at) {
        console.log('User email not confirmed, signing out...')
        supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(session)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Carregando...
        </div>
      </div>
    )
  }

  // Se o usuário veio de um link de recuperação, mostra a tela de nova senha
  if (isRecovering) {
    return (
      <div className="app-container">
        <UpdatePassword onSuccess={() => setIsRecovering(false)} />
      </div>
    )
  }

  // Renderiza o Dashboard se o usuário estiver logado
  if (session?.user) {
    return <Dashboard session={session} />
  }

  // Renderiza a tela de autenticação se não houver sessão
  return (
    <div className="app-container">
      <Auth />
    </div>
  )
}

export default App
