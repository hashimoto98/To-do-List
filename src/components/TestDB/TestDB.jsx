import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import styles from './TestDB.module.css'

export default function TestDB({ session }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  // Preenche userId automaticamente se session.user.id existir
  const [userId, setUserId] = useState('')

  useEffect(() => {
    if (session && session.user && session.user.id) {
      setUserId(session.user.id)
    }
  }, [session])
  const [connResult, setConnResult] = useState(null)
  const [insertResult, setInsertResult] = useState(null)

  // Teste de conexão
  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setConnResult(null)
    try {
      const { error } = await supabase.from('tasks').select('id').limit(1)
      if (error) throw error
      setConnResult('Conexão OK!')
    } catch (err) {
      setConnResult('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Busca todas as tarefas do usuário informado
  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    setTasks([])
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Insere uma tarefa de teste
  const insertTask = async () => {
    setInsertResult(null)
    if (!userId) return setError('Preencha o user_id!')
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: 'Tarefa de teste ' + Date.now(), user_id: userId }])
        .select()
      if (error) throw error
      setInsertResult('Tarefa inserida: ' + (data && data[0] ? data[0].title : ''))
      fetchTasks()
    } catch (err) {
      setInsertResult('Erro: ' + err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Atualiza a primeira tarefa (marca como completa)
  const updateFirstTask = async () => {
    if (!tasks.length) return setError('Nenhuma tarefa para atualizar!')
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: true })
        .eq('id', tasks[0].id)
      if (error) throw error
      fetchTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Deleta a primeira tarefa
  const deleteFirstTask = async () => {
    if (!tasks.length) return setError('Nenhuma tarefa para deletar!')
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', tasks[0].id)
      if (error) throw error
      fetchTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>Teste de Banco de Dados (Supabase)</h2>
      <div className={styles.formRow}>
        <button onClick={testConnection} disabled={loading}>Testar conexão</button>
        {connResult && <span style={{marginLeft:8}}>{connResult}</span>}
      </div>
      <div className={styles.formRow}>
        <input
          type="text"
          placeholder="user_id do Supabase"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ background: session && session.user && session.user.id ? '#e6f7ff' : undefined }}
        />
        <button onClick={fetchTasks} disabled={loading}>Buscar todas as tarefas</button>
        {session && session.user && session.user.id && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
            (Preenchido automaticamente)
          </span>
        )}
      </div>
      <div className={styles.formRow}>
        <button onClick={insertTask} disabled={loading}>Inserir tarefa de teste</button>
        {insertResult && <span style={{marginLeft:8}}>{insertResult}</span>}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.tasksList}>
        <h3>Tarefas encontradas:</h3>
        {loading ? <div>Carregando...</div> : null}
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <strong>{task.title}</strong> | {task.is_complete ? 'Concluída' : 'Pendente'} | id: {task.id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
