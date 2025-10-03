# Lista de Tarefas (To-Do List)

Uma aplicação moderna de lista de tarefas construída com React, Vite e Supabase, com design responsivo e autenticação segura.

## 🚀 Funcionalidades

### Autenticação
- ✅ **Login e Registro**: Sistema completo de autenticação
- ✅ **Confirmação de Email**: Obrigatória para login (segurança)
- ✅ **Reenvio de Confirmação**: Botão para reenviar email de confirmação
- ✅ **Mensagens em Português**: Tradução de erros de autenticação
- ✅ **Toggle Login/Registro**: Interface intuitiva com switch animado

### Interface
- ✅ **Design Moderno**: Layout glassmorphism com gradientes
- ✅ **Tema Claro/Escuro**: Alternância suave entre temas
- ✅ **Responsivo**: Otimizado para desktop e mobile
- ✅ **Animações Suaves**: Transições CSS com cubic-bezier
- ✅ **Dashboard Elegante**: Interface principal limpa e funcional

### Experiência do Usuário
- ✅ **Uma Tela**: Layout otimizado sem necessidade de scroll
- ✅ **Feedback Visual**: Estados de carregamento e erro
- ✅ **Persistência de Tema**: Tema salvo no localStorage
- ✅ **Validação de Formulários**: Campos obrigatórios e validação

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Estilo**: CSS Modules + CSS Variables
- **Backend**: Supabase (Auth + Database)
- **Build**: Vite com Hot Module Replacement
- **Linting**: ESLint com regras otimizadas

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd to-do-list
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env.local
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Execute o projeto:
```bash
npm run dev
```

## 🎨 Design System

### Cores (CSS Variables)
- **Modo Claro**: Tons suaves com gradientes azuis
- **Modo Escuro**: Background escuro com acentos coloridos
- **Glassmorphism**: Efeitos de vidro com backdrop-filter

### Componentes
- **Auth**: Formulário de autenticação com toggle
- **Dashboard**: Interface principal pós-login
- **Botão Tema**: Toggle circular para alternar temas

### Responsividade
- **Desktop**: Layout espaçoso com padding generoso
- **Mobile**: Compacto e otimizado para toque
- **Breakpoint**: 768px para mudança mobile/desktop

## 🔒 Segurança

- **Email Obrigatório**: Confirmação de email necessária
- **Validação Client-Side**: Campos obrigatórios validados
- **Supabase RLS**: Row Level Security no backend
- **Sanitização**: Inputs protegidos contra XSS

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ Telas de 320px até 4K
- ✅ Touch e mouse/teclado

## 🚧 Próximos Passos

- [ ] Implementar CRUD de tarefas
- [ ] Sistema de categorias
- [ ] Filtros e busca
- [ ] Sincronização offline
- [ ] Notificações push
- [ ] Compartilhamento de listas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando React + Vite + Supabase**
