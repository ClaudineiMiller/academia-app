// ===== FIREBASE =====
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ===== CONFIGURAÇÕES =====
// Manter usuário logado
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Persistência LOCAL ativada');
    })
    .catch((error) => {
        console.error('❌ Erro ao definir persistência:', error);
    });

// ===== VARIÁVEIS GLOBAIS =====
let exercicios = [];
let exerciciosFiltrados = [];
let exercicioSelecionadoId = null;
let usuarioLogado = null;
let unsubscribeSnapshot = null; // Para cancelar o listener quando deslogar

// ===== AUTENTICAÇÃO =====
function fazerLogin(email, senha) {
    return auth.signInWithEmailAndPassword(email, senha);
}

function fazerCadastro(email, senha) {
    return auth.createUserWithEmailAndPassword(email, senha);
}

function fazerLogout() {
    // Cancelar o listener antes de deslogar
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }
    return auth.signOut();
}

// ===== CARREGAR DADOS =====
function carregarDados() {
    const usuario = auth.currentUser;

    if (!usuario) {
        console.warn('⚠️ Usuário não logado');
        document.getElementById('contador').textContent = '🔐 Faça login';
        document.getElementById('lista-exercicios').innerHTML = '';
        return;
    }

    console.log('📥 Carregando dados do usuário:', usuario.uid);
    console.log('📧 E-mail:', usuario.email);

    // Mostrar que está carregando
    document.getElementById('contador').textContent = '⏳ Carregando...';

    // Mostrar mensagem de carregamento na lista
    const lista = document.getElementById('lista-exercicios');
    lista.innerHTML = `
        <div style="text-align:center;padding:40px;color:#888;">
            <span style="font-size:32px;">⏳</span>
            <p>Carregando exercícios...</p>
        </div>
    `;

    // Cancelar listener anterior se existir
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }

    // Criar novo listener
    unsubscribeSnapshot = db.collection('exercicios')
        .where('usuarioId', '==', usuario.uid)
        .onSnapshot((snapshot) => {
            console.log('📦 Snapshot recebido!', snapshot.size, 'documentos');
            exercicios = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                exercicios.push({
                    id: doc.id,
                    nome: data.nome || 'Sem nome',
                    videoUrl: data.videoUrl || '',
                    categoria: data.categoria || ''
                });
            });

            // Ordenar localmente
            exercicios.sort((a, b) => a.nome.localeCompare(b.nome));

            console.log('✅ Dados carregados:', exercicios.length, 'exercícios');
            renderizarLista();
            document.getElementById('contador').textContent = `${exercicios.length} exercícios`;
        }, (error) => {
            console.error('❌ Erro ao carregar dados:', error);

            // Verificar se o erro é de permissão
            if (error.code === 'permission-denied') {
                console.warn('⚠️ Permissão negada - pode ser que o usuário tenha deslogado');
                // Se o usuário deslogou, limpar a lista
                if (!auth.currentUser) {
                    document.getElementById('lista-exercicios').innerHTML = '';
                    document.getElementById('contador').textContent = '🔐 Faça login';
                    return;
                }
            }

            // Mensagem amigável
            let mensagem = 'Erro ao carregar dados. ';
            let detalhe = '';

            if (error.code === 'permission-denied') {
                mensagem += 'Verifique as regras do Firestore.';
                detalhe = 'Permissão negada.';
            } else if (error.code === 'unavailable') {
                mensagem += 'Sem conexão com a internet.';
                detalhe = 'Serviço indisponível.';
            } else if (error.code === 'failed-precondition') {
                mensagem += 'Índice não criado ainda. Aguarde alguns minutos.';
                detalhe = 'Falha na pré-condição.';
            } else if (error.code === 'not-found') {
                mensagem += 'Nenhum exercício encontrado.';
                detalhe = 'Coleção vazia.';
            } else {
                mensagem += 'Tente novamente mais tarde.';
                detalhe = error.message;
            }

            document.getElementById('contador').textContent = '⚠️ Erro ao carregar';
            document.getElementById('lista-exercicios').innerHTML = `
                <div style="text-align:center;padding:40px;color:#ff6b6b;">
                    <span style="font-size:48px;">⚠️</span>
                    <p style="margin-top:12px;">${mensagem}</p>
                    <small style="color:#666;">${detalhe}</small>
                    <br>
                    <button onclick="if(auth.currentUser) carregarDados(); else alert('Faça login')" 
                            style="margin-top:16px;padding:12px 24px;background:#ff6b6b;color:#fff;border:none;border-radius:8px;cursor:pointer;">
                        🔄 Tentar novamente
                    </button>
                </div>
            `;
        });
}

// ===== CRUD =====
async function adicionarExercicio(nome, videoUrl, categoria) {
    const usuario = auth.currentUser;
    if (!usuario) {
        alert('Você precisa estar logado!');
        return false;
    }

    try {
        await db.collection('exercicios').add({
            nome: nome,
            videoUrl: videoUrl || '',
            categoria: categoria || '',
            usuarioId: usuario.uid,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Exercício adicionado!');
        return true;
    } catch (error) {
        console.error('Erro ao adicionar:', error);
        alert('Erro ao adicionar exercício.');
        return false;
    }
}

async function editarExercicioFirebase(id, nome, videoUrl, categoria) {
    try {
        await db.collection('exercicios').doc(id).update({
            nome: nome,
            videoUrl: videoUrl || '',
            categoria: categoria || '',
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✏️ Exercício editado!');
        return true;
    } catch (error) {
        console.error('Erro ao editar:', error);
        alert('Erro ao editar exercício.');
        return false;
    }
}

async function deletarExercicioFirebase(id) {
    try {
        await db.collection('exercicios').doc(id).delete();
        console.log('🗑️ Exercício deletado!');
        return true;
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar exercício.');
        return false;
    }
}

// ===== RENDERIZAR LISTA =====
function renderizarLista() {
    const lista = document.getElementById('lista-exercicios');
    const busca = document.getElementById('busca').value.toLowerCase().trim();

    exerciciosFiltrados = exercicios.filter(ex =>
        ex.nome.toLowerCase().includes(busca) ||
        (ex.categoria && ex.categoria.toLowerCase().includes(busca))
    );

    document.getElementById('contador').textContent =
        `${exerciciosFiltrados.length} exercícios`;

    if (exerciciosFiltrados.length === 0) {
        lista.innerHTML = `
            <div class="sem-resultados">
                <span>${busca ? '🔍' : '🏋️'}</span>
                ${busca ? 'Nenhum exercício encontrado' : 'Adicione seu primeiro exercício!'}
                <br>
                <small>${busca ? 'Tente outra busca' : 'Clique no botão + para começar'}</small>
            </div>
        `;
        return;
    }

    lista.innerHTML = exerciciosFiltrados.map(ex => `
        <div class="exercicio-item">
            <div class="exercicio-info" onclick="abrirVideo('${ex.id}')">
                <div class="exercicio-nome">${ex.nome}</div>
                ${ex.categoria ? `<div class="exercicio-categoria">${ex.categoria}</div>` : ''}
            </div>
            <div class="exercicio-actions">
                <button class="btn-play" onclick="event.stopPropagation(); abrirVideo('${ex.id}')">▶</button>
                <button class="btn-edit-item" onclick="event.stopPropagation(); editarExercicio('${ex.id}')">✏️</button>
                <button class="btn-delete-item" onclick="event.stopPropagation(); deletarExercicio('${ex.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ===== FUNÇÕES DE INTERAÇÃO =====
function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;

    let videoId = '';
    if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1];
        const questionIndex = videoId.indexOf('?');
        if (questionIndex !== -1) videoId = videoId.substring(0, questionIndex);
    } else if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1];
        const ampersandIndex = videoId.indexOf('&');
        if (ampersandIndex !== -1) videoId = videoId.substring(0, ampersandIndex);
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
        const questionIndex = videoId.indexOf('?');
        if (questionIndex !== -1) videoId = videoId.substring(0, questionIndex);
    } else if (url.length === 11) {
        videoId = url;
    } else {
        return url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
}

function abrirVideo(id) {
    const ex = exercicios.find(e => e.id === id);
    if (!ex) return;

    exercicioSelecionadoId = id;
    const modal = document.getElementById('modal-video');
    document.getElementById('titulo-video').textContent = ex.nome;

    const embedUrl = getYouTubeEmbedUrl(ex.videoUrl);

    if (embedUrl && embedUrl.includes('embed')) {
        document.getElementById('player-video').innerHTML = `
            <iframe 
                src="${embedUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1" 
                allow="autoplay; encrypted-media; fullscreen" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        document.getElementById('player-video').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111;color:#666;flex-direction:column;gap:10px;">
                <span style="font-size:48px;">⚠️</span>
                <p>Link do vídeo não disponível</p>
                <small>Clique em "Editar" para adicionar o link</small>
            </div>
        `;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function abrirFormNovo() {
    console.log('📝 Abrindo formulário');
    const modal = document.getElementById('modal-form');
    document.getElementById('modal-form-title').textContent = '➕ Novo Exercício';
    document.getElementById('edit-id').value = '';
    document.getElementById('nome-exercicio').value = '';
    document.getElementById('link-exercicio').value = '';
    document.getElementById('categoria-exercicio').value = '';
    modal.style.display = 'block';
    document.getElementById('nome-exercicio').focus();
}

function editarExercicio(id) {
    const ex = exercicios.find(e => e.id === id);
    if (!ex) return;

    fecharModalVideo();

    document.getElementById('modal-form-title').textContent = '✏️ Editar Exercício';
    document.getElementById('edit-id').value = id;
    document.getElementById('nome-exercicio').value = ex.nome;
    document.getElementById('link-exercicio').value = ex.videoUrl || '';
    document.getElementById('categoria-exercicio').value = ex.categoria || '';
    document.getElementById('modal-form').style.display = 'block';
    document.getElementById('nome-exercicio').focus();
}

function deletarExercicio(id) {
    const ex = exercicios.find(e => e.id === id);
    if (!ex) return;

    document.getElementById('confirmar-nome').textContent = ex.nome;
    document.getElementById('modal-confirmar').style.display = 'block';
    document.getElementById('modal-confirmar').dataset.deleteId = id;
}

// ===== SALVAR EXERCÍCIO =====
async function salvarExercicio(event) {
    event.preventDefault();
    console.log('💾 Salvando...');

    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('nome-exercicio').value.trim();
    const videoUrl = document.getElementById('link-exercicio').value.trim();
    const categoria = document.getElementById('categoria-exercicio').value;

    if (!nome) {
        alert('Digite o nome do exercício');
        return;
    }

    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = '⏳ Salvando...';

    try {
        let sucesso = false;
        if (id) {
            sucesso = await editarExercicioFirebase(id, nome, videoUrl, categoria);
        } else {
            sucesso = await adicionarExercicio(nome, videoUrl, categoria);
        }

        if (sucesso) {
            fecharModalForm();
        }
    } catch (error) {
        alert('Erro ao salvar. Tente novamente.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar';
    }
}

// ===== CONFIRMAR DELEÇÃO =====
async function confirmarDelecao() {
    const id = document.getElementById('modal-confirmar').dataset.deleteId;
    await deletarExercicioFirebase(id);
    fecharModalConfirmar();
    fecharModalVideo();
}

// ===== FECHAR MODAIS =====
function fecharModalForm() {
    document.getElementById('modal-form').style.display = 'none';
}

function fecharModalVideo() {
    document.getElementById('modal-video').style.display = 'none';
    document.getElementById('player-video').innerHTML = '';
    document.body.style.overflow = 'auto';
}

function fecharModalConfirmar() {
    document.getElementById('modal-confirmar').style.display = 'none';
}

// ===== INTERFACE DE LOGIN =====
function mostrarLogin() {
    console.log('🔐 Mostrando tela de login...');

    // Esconder elementos do app
    document.getElementById('btn-add').style.display = 'none';
    document.getElementById('busca').style.display = 'none';

    // Remover botão de logout se existir
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.remove();

    // Mostrar tela de login
    const loginHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <h2 style="color:#fff;margin-bottom:20px;">🔐 Faça login</h2>
            <form id="form-login" style="max-width:300px;margin:0 auto;">
                <div class="form-group">
                    <input type="email" id="login-email" placeholder="E-mail" style="width:100%;padding:12px;border-radius:8px;border:2px solid #2a2a2a;background:#1a1a1a;color:#fff;">
                </div>
                <div class="form-group">
                    <input type="password" id="login-senha" placeholder="Senha" style="width:100%;padding:12px;border-radius:8px;border:2px solid #2a2a2a;background:#1a1a1a;color:#fff;">
                </div>
                <button type="submit" style="width:100%;padding:14px;background:#ff6b6b;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Entrar</button>
                <p style="color:#888;margin-top:12px;">
                    <a href="#" id="link-cadastro" style="color:#ff6b6b;">Criar conta</a>
                </p>
            </form>
            <div id="mensagem-login" style="color:#ff6b6b;margin-top:12px;"></div>
        </div>
    `;

    document.getElementById('lista-exercicios').innerHTML = loginHTML;
    document.getElementById('contador').textContent = 'Faça login';

    // Event listeners do login
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const msgDiv = document.getElementById('mensagem-login');

        msgDiv.textContent = '⏳ Aguarde...';
        msgDiv.style.color = '#ffd93d';

        try {
            await fazerLogin(email, senha);
            msgDiv.textContent = '✅ Login realizado!';
            msgDiv.style.color = '#4CAF50';
        } catch (error) {
            msgDiv.textContent = '❌ ' + error.message;
            msgDiv.style.color = '#ff6b6b';
        }
    });

    document.getElementById('link-cadastro').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarCadastro();
    });
}

function mostrarCadastro() {
    console.log('📝 Mostrando tela de cadastro...');

    const cadastroHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <h2 style="color:#fff;margin-bottom:20px;">📝 Criar conta</h2>
            <form id="form-cadastro" style="max-width:300px;margin:0 auto;">
                <div class="form-group">
                    <input type="email" id="cadastro-email" placeholder="E-mail" style="width:100%;padding:12px;border-radius:8px;border:2px solid #2a2a2a;background:#1a1a1a;color:#fff;">
                </div>
                <div class="form-group">
                    <input type="password" id="cadastro-senha" placeholder="Senha (mínimo 6)" style="width:100%;padding:12px;border-radius:8px;border:2px solid #2a2a2a;background:#1a1a1a;color:#fff;">
                </div>
                <button type="submit" style="width:100%;padding:14px;background:#ff6b6b;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Criar conta</button>
                <p style="color:#888;margin-top:12px;">
                    <a href="#" id="link-login" style="color:#ff6b6b;">Já tenho conta</a>
                </p>
            </form>
            <div id="mensagem-cadastro" style="color:#ff6b6b;margin-top:12px;"></div>
        </div>
    `;

    document.getElementById('lista-exercicios').innerHTML = cadastroHTML;
    document.getElementById('contador').textContent = 'Criar conta';

    document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('cadastro-email').value;
        const senha = document.getElementById('cadastro-senha').value;
        const msgDiv = document.getElementById('mensagem-cadastro');

        if (senha.length < 6) {
            msgDiv.textContent = '❌ Senha deve ter pelo menos 6 caracteres';
            msgDiv.style.color = '#ff6b6b';
            return;
        }

        msgDiv.textContent = '⏳ Criando conta...';
        msgDiv.style.color = '#ffd93d';

        try {
            await fazerCadastro(email, senha);
            msgDiv.textContent = '✅ Conta criada! Faça login.';
            msgDiv.style.color = '#4CAF50';
            setTimeout(() => {
                mostrarLogin();
            }, 2000);
        } catch (error) {
            msgDiv.textContent = '❌ ' + error.message;
            msgDiv.style.color = '#ff6b6b';
        }
    });

    document.getElementById('link-login').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarLogin();
    });
}

function mostrarApp() {
    console.log('🔄 Mostrando app principal...');

    // Mostrar elementos do app
    const btnAdd = document.getElementById('btn-add');
    const busca = document.getElementById('busca');
    const contador = document.getElementById('contador');
    const lista = document.getElementById('lista-exercicios');

    btnAdd.style.display = 'flex';
    busca.style.display = 'block';
    contador.textContent = `${exercicios.length} exercícios`;

    // REMOVER a tela de login se existir
    if (lista.innerHTML.includes('form-login') || lista.innerHTML.includes('form-cadastro')) {
        console.log('🧹 Removendo tela de login...');
        lista.innerHTML = '';
    }

    // Garantir que o botão + funciona
    btnAdd.onclick = function (e) {
        e.preventDefault();
        console.log('➕ Botão clicado!');
        if (!auth.currentUser) {
            alert('Faça login primeiro!');
            return;
        }
        abrirFormNovo();
    };

    // Botão de logout (se não existir)
    const headerTop = document.querySelector('.header-top');
    if (!document.getElementById('btn-logout')) {
        const btnLogout = document.createElement('button');
        btnLogout.id = 'btn-logout';
        btnLogout.textContent = '🚪 Sair';
        btnLogout.style.cssText = `
            background: #2a2a2a;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            margin-left: 10px;
        `;
        btnLogout.addEventListener('click', () => {
            fazerLogout();
        });
        headerTop.appendChild(btnLogout);
    }

    // Carregar dados
    carregarDados();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App iniciando...');

    // Botão de recarregar
    document.getElementById('btn-reload').addEventListener('click', function () {
        console.log('🔄 Recarregando dados...');
        if (auth.currentUser) {
            carregarDados();
        } else {
            alert('🔐 Faça login primeiro!');
        }
    });

    // Botão + (fallback)
    document.getElementById('btn-add').addEventListener('click', function (e) {
        e.preventDefault();
        console.log('➕ Botão + clicado (event listener)');
        if (!auth.currentUser) {
            alert('Faça login primeiro!');
            return;
        }
        abrirFormNovo();
    });

    // Formulário
    document.getElementById('form-exercicio').addEventListener('submit', salvarExercicio);
    document.getElementById('btn-cancelar').addEventListener('click', fecharModalForm);

    // Fechar modal clicando fora
    document.getElementById('modal-form').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-form')) fecharModalForm();
    });

    // Vídeo
    document.querySelector('.fechar-video').addEventListener('click', fecharModalVideo);
    document.getElementById('btn-voltar').addEventListener('click', fecharModalVideo);
    document.getElementById('modal-video').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-video')) fecharModalVideo();
    });

    // Editar/Deletar pelo vídeo
    document.getElementById('btn-editar-video').addEventListener('click', () => {
        if (exercicioSelecionadoId) editarExercicio(exercicioSelecionadoId);
    });
    document.getElementById('btn-deletar-video').addEventListener('click', () => {
        if (exercicioSelecionadoId) deletarExercicio(exercicioSelecionadoId);
    });

    // Confirmar exclusão
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', confirmarDelecao);
    document.getElementById('btn-cancelar-exclusao').addEventListener('click', fecharModalConfirmar);
    document.getElementById('modal-confirmar').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-confirmar')) fecharModalConfirmar();
    });

    // Busca
    document.getElementById('busca').addEventListener('input', renderizarLista);

    // ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalForm();
            fecharModalVideo();
            fecharModalConfirmar();
        }
    });

    // Verificar conexão
    window.addEventListener('online', () => {
        console.log('🌐 Conexão restaurada!');
        if (auth.currentUser) {
            carregarDados();
        }
    });

    // Firebase Auth
    auth.onAuthStateChanged((user) => {
        console.log('🔔 Auth state changed:', user ? '✅ Logado' : '❌ Deslogado');

        if (user) {
            usuarioLogado = user;
            console.log('✅ Logado com:', user.email);
            // Verificar se o token é válido
            user.getIdToken().then((token) => {
                console.log('✅ Token válido');
            }).catch((error) => {
                console.error('❌ Token inválido:', error);
                auth.signOut();
            });
            mostrarApp();
        } else {
            usuarioLogado = null;
            console.log('❌ Deslogado');
            // Cancelar listener se existir
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }
            // Limpar dados
            exercicios = [];
            exerciciosFiltrados = [];
            // Limpar a lista antes de mostrar login
            document.getElementById('lista-exercicios').innerHTML = '';
            mostrarLogin();
        }
    });
});

console.log('🏋️ App com Firebase carregado!');