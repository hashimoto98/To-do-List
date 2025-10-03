import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import styles from './Dashboard.module.css'

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingTasks, setDeletingTasks] = useState(new Set())
  const [updatingTasks, setUpdatingTasks] = useState(new Set())
  const [successMessage, setSuccessMessage] = useState('')
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    fetchTasks()
  }, [filter, session])

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccessMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, successMessage])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err)
      setError('Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    const trimmedTask = newTask.trim()
    
    // Validações
    if (!trimmedTask) {
      setError('Digite uma tarefa válida')
      return
    }
    
    if (trimmedTask.length < 3) {
      setError('A tarefa deve ter pelo menos 3 caracteres')
      return
    }
    
    if (trimmedTask.length > 100) {
      setError('A tarefa deve ter no máximo 100 caracteres')
      return
    }

    // Verificar duplicatas
    if (tasks.some(task => task.title.toLowerCase() === trimmedTask.toLowerCase())) {
      setError('Esta tarefa já existe')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: trimmedTask,
            user_id: session.user.id,
            is_complete: false
          }
        ])
        .select()

      if (error) throw error
      
      setTasks([data[0], ...tasks])
      setNewTask('')
      setSuccessMessage('Tarefa adicionada com sucesso!')
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err)
      setError('Erro ao adicionar tarefa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTask = async (taskId, isComplete) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: !isComplete })
        .eq('id', taskId)
        .eq('user_id', session.user.id)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_complete: !isComplete } : task
      ))
      
      setSuccessMessage(!isComplete ? 'Tarefa concluída!' : 'Tarefa reaberta!')
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err)
      setError('Erro ao atualizar tarefa')
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      return
    }

    setDeletingTasks(prev => new Set(prev).add(taskId))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', session.user.id)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
      setSuccessMessage('Tarefa deletada!')
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err)
      setError('Erro ao deletar tarefa')
    } finally {
      setDeletingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.is_complete).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, pending, completionRate }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.is_complete
    if (filter === 'pending') return !task.is_complete
    return true
  })

  const stats = getTaskStats()

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        {/* Header com gradiente */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              <h1 className={styles.title}>✨ Minhas Tarefas</h1>
              <p className={styles.welcomeText}>
                Olá, {session.user.email?.split('@')[0] || 'Usuário'}!
              </p>
            </div>
            <div className={styles.headerActions}>
              <button 
                onClick={toggleTheme}
                className={styles.themeToggle}
                title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className={styles.signOutButton}
              >
                <span>👋</span> Sair
              </button>
            </div>
          </div>
        </header>

        {/* Cards de estatísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>{stats.total}</h3>
              <p>Total de Tarefas</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>{stats.completed}</h3>
              <p>Concluídas</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <h3>{stats.pending}</h3>
              <p>Pendentes</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statContent}>
              <h3>{stats.completionRate}%</h3>
              <p>Progresso</p>
            </div>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <span>⚠️</span> {error}
          </div>
        )}
        
        {successMessage && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            <span>✅</span> {successMessage}
          </div>
        )}

        {/* Formulário de nova tarefa */}
        <div className={styles.addTaskSection}>
          <form onSubmit={addTask} className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Digite uma nova tarefa... (min. 3 caracteres)"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className={styles.input}
                maxLength="100"
                disabled={isSubmitting}
              />
              <div className={styles.charCount}>
                {newTask.length}/100
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.addButton}
              disabled={isSubmitting || !newTask.trim()}
            >
              {isSubmitting ? (
                <><span className={styles.spinner}></span> Adicionando...</>
              ) : (
                <><span>➕</span> Adicionar</>
              )}
            </button>
          </form>
        </div>

        {/* Filtros */}
        <div className={styles.filtersSection}>
          <div className={styles.filters}>
            <button 
              onClick={() => setFilter('all')}
              className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
            >
              <span>📋</span> Todas ({stats.total})
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`${styles.filterButton} ${filter === 'pending' ? styles.activeFilter : ''}`}
            >
              <span>⏳</span> Pendentes ({stats.pending})
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`${styles.filterButton} ${filter === 'completed' ? styles.activeFilter : ''}`}
            >
              <span>✅</span> Concluídas ({stats.completed})
            </button>
          </div>
        </div>

        {/* Lista de tarefas */}
        <div className={styles.tasksSection}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando suas tarefas...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {filter === 'completed' ? '🎉' : filter === 'pending' ? '📝' : '📄'}
              </div>
              <h3>
                {filter === 'completed' 
                  ? 'Nenhuma tarefa concluída ainda' 
                  : filter === 'pending' 
                  ? 'Nenhuma tarefa pendente' 
                  : 'Nenhuma tarefa encontrada'
                }
              </h3>
              <p>
                {filter === 'all' && 'Que tal adicionar sua primeira tarefa?'}
                {filter === 'pending' && 'Parabéns! Você está em dia com suas tarefas.'}
                {filter === 'completed' && 'Complete algumas tarefas para vê-las aqui!'}
              </p>
            </div>
          ) : (
            <div className={styles.tasksList}>
              {filteredTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`${styles.taskItem} ${task.is_complete ? styles.completed : ''} ${
                    deletingTasks.has(task.id) ? styles.deleting : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.taskContent}>
                    <label className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => toggleTask(task.id, task.is_complete)}
                        disabled={updatingTasks.has(task.id)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkmark}></span>
                    </label>
                    
                    <div className={styles.taskText}>
                      <span className={styles.taskTitle}>
                        {task.title}
                      </span>
                      <span className={styles.taskDate}>
                        {new Date(task.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.taskActions}>
                    {updatingTasks.has(task.id) && (
                      <div className={styles.taskSpinner}></div>
                    )}
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className={styles.deleteButton}
                      disabled={deletingTasks.has(task.id)}
                      title="Deletar tarefa"
                    >
                      {deletingTasks.has(task.id) ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra de progresso */}
        {stats.total > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Progresso Geral</span>
              <span>{stats.completionRate}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
