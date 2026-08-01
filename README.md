# 🏋️ Meus Exercícios - Fitness App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

## 📱 Sobre o App
<a href="https://claudineimiller.github.io/academia-app/" target="_blank" rel="noopener noreferrer">academia-app.com</a>

Um aplicativo web progressivo (PWA) para gerenciar sua biblioteca pessoal de exercícios físicos. Desenvolvido para ajudar você a consultar rapidamente a execução correta dos exercícios, especialmente em dias de academia lotada quando o personal trainer não pode dar atenção individualizada.

### 🎯 Motivação

Iniciei na academia há alguns meses e percebi que, em dias de muito movimento, o personal não consegue acompanhar todos os alunos. Precisava de uma forma rápida e prática de consultar a execução correta dos exercícios sem precisar ficar procurando no YouTube ou perguntando toda hora.

**Este app resolveu meu problema e pode resolver o seu também!**

---

## ✨ Funcionalidades

### 📋 Gerenciamento Completo
- ✅ **CRUD completo** de exercícios (Criar, Ler, Atualizar, Deletar)
- ✅ **Busca em tempo real** por nome ou categoria
- ✅ **Categorização** por grupo muscular (Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Abdômen)
- ✅ **Ordenação alfabética** dos exercícios
- ✅ **Contagem de exercícios** em tempo real

### 🎥 Visualização de Vídeos
- ✅ **Reprodução de vídeos do YouTube** diretamente no app
- ✅ **Suporte a YouTube Shorts** 
- ✅ **Player em tela cheia** com experiência imersiva
- ✅ **Links personalizáveis** para cada exercício
- ✅ **Fallback visual** para links inválidos

### ☁️ Sincronização em Nuvem
- ✅ **Firebase Authentication** para login seguro
- ✅ **Firestore Database** para armazenamento em tempo real
- ✅ **Sincronização automática** entre dispositivos
- ✅ **Persistência local** para acesso offline
- ✅ **Dados seguros** - cada usuário vê apenas seus próprios exercícios

### 🎨 Design Moderno
- ✅ **Tema escuro** otimizado para uso na academia
- ✅ **Interface responsiva** adaptada para dispositivos móveis
- ✅ **Animações suaves** e feedback visual
- ✅ **Botões de ação rápida** para operações comuns
- ✅ **Modais elegantes** para formulários e vídeos

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | Estrutura do app |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | Estilização e responsividade |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | Lógica e interatividade |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) | Backend (Auth + Firestore) |
| ![Github-Pages](https://img.shields.io/badge/GitHub-Pages-222222?style=flat&logo=githubpages&logoColor=white) | Hospedagem |
| ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white) | Aplicativo progressivo |

---

## 📦 Pré-requisitos

- 🌐 Navegador moderno (Chrome, Firefox, Edge, Safari)
- 📡 Conexão com internet (para carregar vídeos e sincronizar)
- 📧 Conta Google (para usar o Firebase)
- 📱 Celular ou computador com acesso à web

---

## 🚀 Como Executar

### Opção 1: Acessar Online (Recomendado)
O app está disponível em: <a href="https://claudineimiller.github.io/academia-app/" target="_blank" rel="noopener noreferrer">academia-app.com</a>


### Opção 2: Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/academia-app.git

# Entre na pasta
cd academia-app

# Inicie um servidor local (Node.js)
npx serve .

# Ou com Python
python -m http.server 8000

# Acesse no navegador
http://localhost:3000

# Estrutura do projeto

academia-app/
├── index.html              # Página principal
├── style.css              # Estilos CSS (tema escuro)
├── script.js              # Lógica completa do app
├── firebase-config.js     # Configuração do Firebase
├── capacitor.config.json  # Configuração do Capacitor
├── package.json          # Dependências e scripts
└── README.md             # Documentação
