'use strict';
// Configurações e utilitários
const KEY = 'petsos-mvp-v1';
const paw = '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="10" cy="19" rx="6" ry="8" transform="rotate(-25 10 19)"/><ellipse cx="20" cy="10" rx="6" ry="8" transform="rotate(-8 20 10)"/><ellipse cx="33" cy="11" rx="6" ry="8" transform="rotate(12 33 11)"/><ellipse cx="41" cy="22" rx="5" ry="7" transform="rotate(29 41 22)"/><path d="M24 22c-7 0-10 7-15 13-4 6 2 12 8 10 4-1 5-3 8-3 4 0 7 4 12 2 6-2 6-8 2-12-4-5-8-10-15-10Z"/></svg>';
const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    triage: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M9 5V3h6v2M12 9v8M8 13h8"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>'
};
const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n] || ''}</svg>`;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const emailKey = s => s.trim().toLowerCase();
const date = s => new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const species = ['Cão', 'Gato', 'Ave', 'Coelho', 'Outro'];
const emoji = s => ({
    'Cão': '🐶',
    'Gato': '🐱',
    'Ave': '🐦',
    'Coelho': '🐰',
    'Outro': '🐾'
}[s] || '🐾');
const disclaimer = 'O PETSOS orienta, mas não substitui o diagnóstico veterinário e não prescreve medicação';
const academic = 'Simulação acadêmica por palavras-chave, sem validação veterinária. Não utilize para decidir se um atendimento real pode esperar.';
// Clínicas e resultados da triagem
const clinics = [
    {
        id: 'c1',
        name: 'Clínica Patinhas 24h (fictícia)',
        address: 'Rua Exemplo, 100 — endereço fictício',
        active: true
    },
    {
        id: 'c2',
        name: 'Clínica Mundo Pet (fictícia)',
        address: 'Avenida Modelo, 200 — endereço fictício',
        active: true
    },
    {
        id: 'c3',
        name: 'Clínica Amigo Animal (fictícia)',
        address: 'Rua Modelo, 300 — endereço fictício',
        active: false
    }
];
const results = {
    urgencia: {
        label: 'URGÊNCIA',
        icon: '🚨',
        title: 'Atendimento imediato',
        text: 'Procure atendimento veterinário presencial imediatamente. Entre em contato com uma clínica veterinária real e siga as orientações da equipe. Não ofereça medicamentos por conta própria.'
    },
    espera: {
        label: 'PODE ESPERAR',
        icon: '🟡',
        title: 'Atenção e acompanhamento',
        text: 'Neste cenário de demonstração, os sintomas foram classificados como moderados. Para um caso real, consulte um veterinário para confirmar a urgência. Observe alterações e procure atendimento imediato se houver piora ou sinais graves.'
    },
    casa: {
        label: 'CUIDADO EM CASA',
        icon: '🐾',
        title: 'Cuidados simples',
        text: 'Neste cenário de demonstração, o relato corresponde a um sintoma leve. Mantenha o ambiente limpo e observe o comportamento do pet. Consulte um veterinário sobre os cuidados adequados; não use produtos ou medicamentos sem orientação.'
    }
};
// Armazenamento local e sessão
let persistent = true;

function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const obj = JSON.parse(raw);
            if (Array.isArray(obj.tutors) && Array.isArray(obj.pets) && Array.isArray(obj.triages)) {
                return obj;
            }
        }
    } catch (e) {
        persistent = false;
    }
    return { tutors: [], pets: [], triages: [], session: null };
}
let db = load();

function save() {
    try {
        localStorage.setItem(KEY, JSON.stringify(db));
        persistent = true;
    } catch (e) {
        persistent = false;
    }
}

function current() {
    return db.tutors.find(t => t.id === db.session);
}

function pets() {
    return db.pets.filter(p => p.tutorId === current()?.id);
}

function ownPet(id) {
    return pets().find(p => p.id === id);
}

function ownTriages() {
    const ids = new Set(pets().map(p => p.id));
    return db.triages.filter(t => ids.has(t.petId));
}

function ownTriage(id) {
    return ownTriages().find(t => t.id === id);
}

function loginLocal(email) {
    const key = emailKey(email || '');
    let t = db.tutors.find(t => emailKey(t.email) === key);
    if (!t) {
        const name = key.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Tutor';
        t = { id: uid(), name, email: key, phone: '', password: '' };
        db.tutors.push(t);
    }
    db.session = t.id;
    save();
    return t;
}
// Estado da interface
let page = 'login';
let filter = '';
let flash = '';
let draft = { petId: '', symptoms: '' };

// Componentes da interface
function field(label, name, type = 'text', value = '', attrs = '') {
    return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
}

function button(text, action, style = '', extra = '') {
    return `<button type="button" class="btn ${style}" data-action="${action}" ${extra}>${text}</button>`;
}

function back(action = 'home', label = 'Voltar') {
    return `<button type="button" class="plain back" data-action="${action}">${icon('back')}${label}</button>`;
}

function intro(label, title, desc) {
    return `<div class="intro"><span class="eyebrow">${label}</span><h1>${title}</h1><p class="muted">${desc}</p></div>`;
}

function status(k) {
    return `<span class="status ${k}">${results[k].label}</span>`;
}

function message(text, type = 'alert') {
    const el = $('#form-message');
    if (el) {
        el.className = type;
        el.textContent = text;
        el.hidden = false;
    }
}

function errorBox() {
    return '<div id="form-message" class="alert" role="alert" hidden></div>';
}

function render(content, active = '') {
    const user = current();
    $('#logout').hidden = !user;
    $('#nav').hidden = !user;
    $('#nav').innerHTML = [['home', 'home', 'Início'], ['triage', 'triage', 'Nova triagem'], ['history', 'history', 'Histórico']].map(([a, i, l]) => `<button type="button" data-action="${a}" class="${a === active ? 'active' : ''}" ${a === active ? 'aria-current="page"' : ''}>${icon(i)}${l}</button>`).join('');
    $('#screen').innerHTML = (persistent ? '' : '<div class="notice toast">Armazenamento local indisponível. Os dados podem desaparecer ao fechar a página.</div>') + (flash ? `<div class="success toast" role="status">${esc(flash)}</div>` : '') + content;
    flash = '';
    $('#screen').scrollTop = 0;
    window.scrollTo(0, 0);
    $('#screen').focus({ preventScroll: true });
}

// Telas do aplicativo
function showLogin() {
    page = 'login';
    render([
        `<div class="auth-hero">`,
        `<div class="auth-symbol">`,
        `${paw}<span>+</span></div>`,
        `<div class="eyebrow">Cuidado em cada patinha</div>`,
        `<h1>Seu pet em<br>boas mãos.</h1>`,
        `<p>Assistente de primeiros socorros para pets.</p></div>`,
        `<div class="card stack">`,
        `<h2>Bem-vindo!</h2>`,
        `<form id="login-form" class="stack" novalidate>`,
        `${field('E-mail', 'email', 'email', '', 'placeholder="seu@email.com" autocomplete="email" maxlength="100"')}`,
        `${field('Senha', 'password', 'password', '', 'placeholder="Sua senha" autocomplete="current-password"')}`,
        `${errorBox()}`,
        `<button class="btn" type="submit">Entrar ${icon('arrow')}</button>`,
        `</form>`,
        `<p class="auth-foot">Ainda não tem conta? `,
        `<button class="plain" data-action="register">Criar conta</button></p>`,
        `</div>`,
        `<div class="stack" style="margin-top:18px">`,
        `<div class="hint">`,
        `${academic} Use apenas dados e senhas fictícios neste protótipo local.`,
        `</div></div>`
    ].join(''));
}

function showRegister() {
    page = 'register';
    render([
        `${back('login')}`,
        `${intro('Cadastro do tutor', 'Crie sua conta', 'Comece cadastrando seus dados de demonstração.')}`,
        `<form id="register-form" class="card stack" novalidate>`,
        `${field('Nome completo', 'name', 'text', '', 'required maxlength="100" placeholder="Seu nome"')}`,
        `${field('E-mail', 'email', 'email', '', 'required maxlength="100" placeholder="seu@email.com"')}`,
        `${field('Telefone', 'phone', 'tel', '', 'required maxlength="20" placeholder="(00) 00000-0000"')}`,
        `${field('Senha', 'password', 'password', '', 'required minlength="6" maxlength="100" autocomplete="new-password" placeholder="Mínimo de 6 caracteres"')}`,
        `${errorBox()}`,
        `<button class="btn" type="submit">Criar conta</button>`,
        `<p class="muted">Login simulado, dados locais sem criptografia de produção. Não use informações reais.`,
        `</p></form>`,
        `<p class="auth-foot" style="margin-top:15px">Já tem conta? `,
        `<button class="plain" data-action="login">Entrar</button></p>`
    ].join(''));
}

function showHome() {
    page = 'home';
    const user = current(), list = pets();
    render([
        `${intro('Área do tutor', `Olá, ${esc(user.name.trim().split(/\s+/)[0])}! 👋`, 'Como seu companheiro está hoje?')}`,
        `<div class="stack">`,
        `<section class="hero">`,
        `<div class="hero-art">`,
        `${paw}</div><span style="font-size:11px;font-weight:800;letter-spacing:1px;color:#bce5d5">TRIAGEM DE SINTOMAS`,
        `</span>`,
        `<h2>Precisando de ajuda com seu pet?</h2>`,
        `<p>Descreva o que está acontecendo e veja uma classificação de demonstração.`,
        `</p>`,
        `${button(`${icon('triage')} Nova triagem`, 'triage')}</section>`,
        `<div class="section-head">`,
        `<h2>Meus pets <span class="muted">(${list.length})</span></h2>`,
        `${button(`${icon('plus')} Adicionar`, 'add-pet', 'soft small')}</div>`,
        `${list.length ? list.map(p => [
            `<article class="card pet-card">`,
            `<div class="pet-row">`,
            `<div class="avatar" aria-hidden="true">`,
            `${emoji(p.species)}</div>`,
            `<div class="pet-info">`,
            `<h3>`,
            `${esc(p.name)}</h3>`,
            `<p>`,
            `${esc(p.species)} · ${esc(p.breed)} · ${esc(p.age)} ${Number(p.age) === 1 ? 'ano' : 'anos'} · ${esc(p.weight)} kg`,
            `</p></div></div>`,
            `<p class="muted">Condições: ${esc(p.conditions || 'Não informadas')}</p>`,
            `<div class="pet-actions">`,
            `<button class="plain" data-action="triage-pet" data-id="${esc(p.id)}">Fazer triagem`,
            `</button>`,
            `<div class="actions">`,
            `<button class="plain" data-action="edit-pet" data-id="${esc(p.id)}">Editar`,
            `</button>`,
            `<button class="plain danger" data-action="delete-pet" data-id="${esc(p.id)}">Excluir`,
            `</button></div></div></article>`
        ].join('')).join('') : [
            `<div class="card empty">`,
            `<div class="emoji">🐾</div>`,
            `<h3>Nenhum pet por aqui</h3>`,
            `<p>Cadastre seu primeiro companheiro para iniciar.</p>`,
            `${button('Cadastrar pet', 'add-pet', 'secondary')}</div>`
        ].join('')}`,
        `<section class="card pet-row">`,
        `<div class="avatar" style="font-size:22px">`,
        `${icon('history')}</div>`,
        `<div class="pet-info">`,
        `<h3>Histórico de triagens</h3>`,
        `<p>`,
        `${ownTriages().length} registro(s) salvo(s)</p></div>`,
        `<button class="plain" data-action="history" aria-label="Abrir histórico">`,
        `${icon('arrow')}</button></section>`,
        `<div class="hint">`,
        `${academic}</div></div>`
    ].join(''), 'home');
}

function showPet(id = '') {
    page = 'pet';
    const p = id ? ownPet(id) : null;
    if (id && !p) {
        return showHome();
    }
    render([
        `${back()}`,
        `${intro('Meus pets', p ? 'Editar pet' : 'Cadastrar pet', 'Preencha os dados do seu companheiro.')}`,
        `<form id="pet-form" data-id="${esc(id)}" class="card stack" novalidate>`,
        `<div class="avatar large" id="pet-avatar">`,
        `${emoji(p?.species || 'Cão')}</div>`,
        `<p class="muted" style="text-align:center">Avatar ilustrativo do pet`,
        `</p>`,
        `${field('Nome', 'name', 'text', p?.name, 'required maxlength="50" placeholder="Ex.: Thor"')}`,
        `<label class="field">Espécie`,
        `<select name="species" required>`,
        `${species.map(s => `<option ${s === (p?.species || 'Cão') ? 'selected' : ''}>${s}</option>`).join('')}</select></label>`,
        `${field('Raça', 'breed', 'text', p?.breed, 'required maxlength="60" placeholder="Ex.: Golden Retriever ou SRD"')}`,
        `<div class="two">`,
        `${field('Idade (anos)', 'age', 'number', p?.age, 'required min="0" max="99" step="1" placeholder="0"')}`,
        `${field('Peso (kg)', 'weight', 'number', p?.weight, 'required min="0.01" max="500" step="0.01" placeholder="0,0"')}</div>`,
        `<label class="field">Condições pré-existentes <span class="optional">(opcional)`,
        `</span>`,
        `<textarea name="conditions" maxlength="500" placeholder="Alergias, doenças ou outras condições conhecidas">`,
        `${esc(p?.conditions)}</textarea></label>`,
        `${errorBox()}`,
        `<button class="btn" type="submit">`,
        `${p ? 'Salvar alterações' : 'Cadastrar pet'}</button>`,
        `${button('Cancelar', 'home', 'secondary')}</form>`
    ].join(''), 'home');
}
const chips = ['Vômito', 'Apatia', 'Espirros', 'Pulgas', 'Diarreia', 'Engasgo', 'Tosse leve', 'Coceira'];

function showTriage(id = '', keep = false) {
    page = 'triage';
    const list = pets();
    if (!keep) {
        draft = { petId: id || list[0]?.id || '', symptoms: '' };
    }
    render([
        `${intro('Nova triagem', 'O que seu pet sente?', 'Informe os sintomas e há quanto tempo começaram.')}`,
        `<div class="stack">`,
        `<div class="notice">Protótipo de demonstração. Em uma emergência real, procure um veterinário imediatamente.`,
        `</div>`,
        `${!list.length ? [
            `<div class="card empty"><span class="emoji">🐾</span>`,
            `<h3>Cadastre um pet primeiro</h3>`,
            `<p>É necessário vincular a triagem a um pet.</p>`,
            `${button('Cadastrar pet', 'add-pet')}</div>`
        ].join('') : [
            `<form id="triage-form" class="card stack" novalidate>`,
            `<label class="field">Qual pet será avaliado?`,
            `<select name="petId" required>`,
            `${list.map(p => `<option value="${esc(p.id)}" ${p.id === draft.petId ? 'selected' : ''}>${emoji(p.species)} ${esc(p.name)}</option>`).join('')}</select></label>`,
            `<label class="field">Descreva os sintomas`,
            `<textarea name="symptoms" id="symptoms" maxlength="500" placeholder="Ex.: Meu cachorro está vomitando muito desde esta manhã...">`,
            `${esc(draft.symptoms)}</textarea><span class="count" id="char-count">`,
            `${draft.symptoms.length}/500</span></label>`,
            `<div class="tight">`,
            `<h3>Sintomas comuns</h3>`,
            `<p class="muted">Toque para adicionar ao relato.</p>`,
            `<div class="chips">`,
            `${chips.map(c => `<button type="button" class="chip" data-action="chip" data-value="${esc(c)}">+ ${c}</button>`).join('')}</div></div>`,
            `${errorBox()}`,
            `<button class="btn" type="submit">Enviar ${icon('arrow')}</button>`,
            `</form>`
        ].join('')}`,
        `<div class="hint">`,
        `${disclaimer}.</div></div>`
    ].join(''), 'triage');
}

// Regras de triagem
function classify(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Descrição inválida');
    }
    const s = normalize(text.trim());
    if (!s) {
        return { error: 'Descreva os sintomas do pet antes de enviar.' };
    }
    const urgent = /\b(vomitando\s+muito|vomitos?\s+(intensos?|repetidos?|constantes?)|apat[ia][a-z]*|convuls[a-z]*|sangue|sangramento|engasg[a-z]*|nao\s+(esta\s+)?respira[a-z]*|falta\s+de\s+ar|dificuldade\s+(para|de|em)\s+respirar|envenen[a-z]*|intoxic[a-z]*|desmai[a-z]*|atropel[a-z]*|inconsciente|sem\s+respirar)\b/;
    const moderate = /\b(espirr[a-z]*|tosse\s+leve|coc[a-z]*|pouco\s+apetite|apetite\s+reduzido)\b/;
    const mild = /\b(pulgas?|unhas?\s+grandes?|mau\s+halito\s+leve)\b/;
    if (urgent.test(s)) {
        return { key: 'urgencia' };
    }
    if (s.length < 12 || s.split(/\s+/).length < 3) {
        return {
            error: 'Precisamos de mais detalhes: descreva os sintomas, duração e intensidade.'
        };
    }
    if (moderate.test(s)) {
        return { key: 'espera' };
    }
    if (mild.test(s)) {
        return { key: 'casa' };
    }
    return {
        error: 'Não foi possível classificar o relato. Informe mais detalhes e procure um veterinário se tiver dúvidas.'
    };
}

function createTriage(petId, symptoms) {
    if (!ownPet(petId)) {
        throw new Error('Pet inválido');
    }
    const r = classify(symptoms);
    if (r.error) {
        return r;
    }
    const clinic = r.key === 'urgencia' ? clinics.find(c => c.active) : null;
    const t = {
        id: uid(),
        petId,
        symptoms: symptoms.trim(),
        classification: r.key,
        createdAt: new Date().toISOString(),
        referral: clinic ? {
            id: uid(),
            clinicId: clinic.id,
            status: 'Simulado',
            createdAt: new Date().toISOString()
        } : null,
        rating: null
    };
    db.triages.push(t);
    save();
    return { triage: t };
}

// Resultado, histórico e avaliação
function showResult(id, reveal = false) {
    page = 'result';
    const t = ownTriage(id);
    if (!t) {
        return showHistory();
    }
    const r = results[t.classification], p = ownPet(t.petId), c = clinics.find(c => c.id === t.referral?.clinicId && c.active);
    render([
        `${back('history', 'Histórico')}`,
        `${intro('Resultado da triagem', `Triagem de ${esc(p.name)}`, date(t.createdAt))}`,
        `<div class="stack">`,
        `<div class="card result ${t.classification}"><span class="result-icon" aria-hidden="true">`,
        `${r.icon}</span>`,
        `${status(t.classification)}`,
        `<h2>`,
        `${r.title}</h2>`,
        `<p>`,
        `${r.text}</p>`,
        `${t.classification === 'urgencia' ? [
            `<div class="alert" role="alert">Procure atendimento veterinário presencial imediato.`,
            `</div>`,
            `${button('Encontrar clínica próxima', 'clinic', 'red', `data-id="${esc(t.id)}"`)}`
        ].join('') : ''}</div>`,
        `${reveal && t.classification === 'urgencia' ? c ? [
            `<section class="clinic" role="status"><span class="eyebrow">Encaminhamento simulado · parceria ativa`,
            `</span>`,
            `<h3>🏥 ${esc(c.name)}</h3>`,
            `<p class="muted">`,
            `${esc(c.address)}</p>`,
            `<p class="muted">Clínica e endereço fictícios; não há cálculo de distância nem envio real. Procure uma clínica real em caso de urgência.`,
            `</p></section>`
        ].join('') : '<div class="alert">Nenhuma clínica parceira de demonstração ativa. Procure uma clínica veterinária real.</div>' : ''}`,
        `<div class="card tight">`,
        `<h3>Sintomas informados</h3>`,
        `<p style="white-space:pre-wrap">`,
        `${esc(t.symptoms)}</p></div>`,
        `<div class="hint"><strong>`,
        `${disclaimer}.</strong><br>`,
        `${academic}</div>`,
        `${t.rating ? [
            `<div class="card tight">`,
            `<h3>Sua avaliação: ${'★'.repeat(t.rating.stars)}`,
            `${'☆'.repeat(5 - t.rating.stars)}</h3>`,
            `<p>`,
            `${esc(t.rating.comment || 'Sem comentário')}</p></div>`
        ].join('') : ''}`,
        `${button(t.rating ? 'Editar avaliação' : 'Avaliar orientação', 'rate', '', `data-id="${esc(t.id)}"`)}`,
        `${button('Voltar para o início', 'home', 'secondary')}</div>`
    ].join(''), 'triage');
}

function showHistory() {
    page = 'history';
    const list = pets();
    if (filter && !ownPet(filter)) {
        filter = '';
    }
    const ts = ownTriages().filter(t => !filter || t.petId === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    render([
        `${intro('Acompanhamento', 'Histórico', 'Consulte as triagens dos seus pets, das mais recentes às antigas.')}`,
        `<div class="stack">`,
        `<label class="field">Filtrar por pet`,
        `<select id="history-filter"><option value="">Todos os pets</option>`,
        `${list.map(p => `<option value="${esc(p.id)}" ${filter === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>`,
        `<div class="section-head">`,
        `<h2>Triagens anteriores</h2><span class="muted">`,
        `${ts.length} registro(s)</span></div>`,
        `${ts.length ? ts.map(t => [
            `<article class="card history-card">`,
            `<div class="section-head">`,
            `<div class="tight">`,
            `<h3>`,
            `${emoji(ownPet(t.petId).species)} ${esc(ownPet(t.petId).name)}</h3><small>`,
            `${date(t.createdAt)}</small></div>`,
            `${status(t.classification)}</div>`,
            `<p class="snippet">`,
            `${esc(t.symptoms)}</p>`,
            `${t.rating ? `<small>Avaliação: ${'★'.repeat(t.rating.stars)}${'☆'.repeat(5 - t.rating.stars)}</small>` : ''}`,
            `<div class="pet-actions">`,
            `<button class="plain" data-action="result" data-id="${esc(t.id)}">Ver detalhes`,
            `</button>`,
            `<button class="plain danger" data-action="delete-triage" data-id="${esc(t.id)}">Excluir`,
            `</button></div></article>`
        ].join('')).join('') : [
            `<div class="card empty">`,
            `<div class="emoji">📋</div>`,
            `<h3>Nenhuma triagem encontrada</h3>`,
            `<p>Os resultados aparecerão aqui após a primeira triagem.</p>`,
            `${button('Nova triagem', 'triage', 'secondary')}</div>`
        ].join('')}</div>`
    ].join(''), 'history');
}

function showRating(id) {
    page = 'rating';
    const t = ownTriage(id);
    if (!t) {
        return showHistory();
    }
    const n = t.rating?.stars || 0;
    render([
        `<button class="plain back" data-action="result" data-id="${esc(id)}">`,
        `${icon('back')} Voltar ao resultado</button>`,
        `${intro('Sua opinião', 'Avalie a orientação', 'Ajude a melhorar o PETSOS com seu feedback.')}`,
        `<form id="rating-form" data-id="${esc(id)}" class="card stack" novalidate>`,
        `<div style="text-align:center" class="tight">`,
        `<div style="font-size:40px">💚</div>`,
        `<h2>Como foi sua experiência?</h2>`,
        `<p class="muted">Triagem de ${esc(ownPet(t.petId).name)}</p></div>`,
        `<input type="hidden" name="stars" value="${n}">`,
        `<div class="stars" role="group" aria-label="Nota de 1 a 5 estrelas">`,
        `${[1, 2, 3, 4, 5].map(i => [
            `<button type="button" data-action="star" data-value="${i}" aria-label="${i} ${i === 1 ? 'estrela' : 'estrelas'}" aria-pressed="${i === n}" class="${i <= n ? 'filled' : ''}">`,
            `${i <= n ? '★' : '☆'}</button>`
        ].join('')).join('')}</div>`,
        `<p id="rating-label" class="muted" style="text-align:center">`,
        `${n ? n + ' de 5 estrelas' : 'Selecione uma nota'}</p>`,
        `<label class="field">Comentário <span class="optional">(opcional)</span>`,
        `<textarea name="comment" maxlength="500" placeholder="Conte como foi a orientação recebida">`,
        `${esc(t.rating?.comment)}</textarea></label>`,
        `${errorBox()}`,
        `<button class="btn" type="submit">Salvar avaliação</button></form>`
    ].join(''), 'triage');
}

// Eventos da interface
document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b) {
        return;
    }
    const a = b.dataset.action, id = b.dataset.id;
    if (!current() && !['login', 'register'].includes(a)) {
        return showLogin();
    }
    switch (a) {
        case 'login':
            showLogin();
            break;
        case 'register':
            showRegister();
            break;
        case 'home':
            showHome();
            break;
        case 'add-pet':
            showPet();
            break;
        case 'edit-pet':
            showPet(id);
            break;
        case 'delete-pet': {
            const p = ownPet(id);
            if (p && confirm(`Excluir ${p.name} e todas as suas triagens e avaliações?`)) {
                db.pets = db.pets.filter(x => x.id !== id);
                db.triages = db.triages.filter(x => x.petId !== id);
                save();
                flash = 'Pet excluído.';
                showHome();
            }
            break;
        }
        case 'triage':
            showTriage();
            break;
        case 'triage-pet':
            showTriage(id);
            break;
        case 'chip': {
            const el = $('#symptoms');
            if (el) {
                const prefix = el.value.trim() ? el.value.trim() + ', ' : '';
                el.value = (prefix + b.dataset.value.toLowerCase()).slice(0, 500);
                $('#char-count').textContent = el.value.length + '/500';
                el.focus();
            }
            break;
        }
        case 'history':
            showHistory();
            break;
        case 'result':
            showResult(id);
            break;
        case 'clinic':
            showResult(id, true);
            break;
        case 'delete-triage':
            if (ownTriage(id) && confirm('Excluir esta triagem, incluindo avaliação e encaminhamento?')) {
                db.triages = db.triages.filter(t => t.id !== id);
                save();
                flash = 'Triagem excluída.';
                showHistory();
            }
            break;
        case 'rate':
            showRating(id);
            break;
        case 'star': {
            const n = Number(b.dataset.value);
            $('input[name="stars"]').value = n;
            document.querySelectorAll('[data-action="star"]').forEach(x => {
                const v = Number(x.dataset.value);
                x.classList.toggle('filled', v <= n);
                x.textContent = v <= n ? '★' : '☆';
                x.setAttribute('aria-pressed', String(v === n));
            });
            $('#rating-label').textContent = n + ' de 5 estrelas';
            break;
        }
    }
});

$('#logout').addEventListener('click', () => {
    db.session = null;
    filter = '';
    draft = { petId: '', symptoms: '' };
    save();
    showLogin();
});

document.addEventListener('input', e => {
    if (e.target.id === 'symptoms') {
        $('#char-count').textContent = e.target.value.length + '/500';
    }
});

document.addEventListener('change', e => {
    if (e.target.id === 'history-filter') {
        filter = e.target.value;
        showHistory();
    }
    if (e.target.name === 'species' && $('#pet-avatar')) {
        $('#pet-avatar').textContent = emoji(e.target.value);
    }
});

document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const v = Object.fromEntries(new FormData(f));
    if (f.id === 'login-form') {
        loginLocal(v.email);
        showHome();
        return;
    }
    if (f.id === 'register-form') {
        const name = v.name.trim(), email = emailKey(v.email), phone = v.phone.trim();
        if (!name || !email || !phone || !v.password) {
            return message('Preencha todos os campos.');
        }
        if (!f.elements.email.validity.valid || email.length > 100) {
            return message('Informe um e-mail válido.');
        }
        if (db.tutors.some(t => emailKey(t.email) === email)) {
            return message('Este e-mail já está cadastrado.');
        }
        if (phone.replace(/\D/g, '').length < 8) {
            return message('Informe um telefone válido.');
        }
        if (v.password.length < 6) {
            return message('A senha deve ter pelo menos 6 caracteres.');
        }
        const t = { id: uid(), name, email, phone, password: v.password };
        db.tutors.push(t);
        db.session = t.id;
        save();
        flash = 'Conta criada com sucesso!';
        showHome();
        return;
    }
    if (!current()) {
        return showLogin();
    }
    if (f.id === 'pet-form') {
        const id = f.dataset.id, p = id ? ownPet(id) : null;
        if (id && !p) {
            return showHome();
        }
        if (!v.name.trim() || !v.breed.trim() || !species.includes(v.species) || !v.age.trim() || !v.weight.trim() || !f.checkValidity()) {
            return message('Preencha nome, espécie, raça, idade válida e peso maior que zero.');
        }
        const data = {
            name: v.name.trim(),
            species: v.species,
            breed: v.breed.trim(),
            age: Number(v.age),
            weight: Number(v.weight),
            conditions: v.conditions.trim()
        };
        if (p) {
            Object.assign(p, data);
        } else {
            db.pets.push({ id: uid(), tutorId: current().id, ...data });
        }
        save();
        flash = p ? 'Pet atualizado!' : 'Pet cadastrado!';
        showHome();
        return;
    }
    if (f.id === 'triage-form') {
        draft = { petId: v.petId, symptoms: v.symptoms };
        if (!ownPet(v.petId)) {
            return message('Selecione um pet cadastrado.');
        }
        if (!v.symptoms.trim()) {
            return message('Descreva os sintomas do pet antes de enviar.');
        }
        try {
            const result = createTriage(v.petId, v.symptoms);
            if (result.error) {
                return message(result.error);
            }
            draft = { petId: '', symptoms: '' };
            showResult(result.triage.id);
        } catch (err) {
            message('Não foi possível realizar a classificação. Entre em contato diretamente com um veterinário.');
            console.error(err);
        }
        return;
    }
    if (f.id === 'rating-form') {
        const t = ownTriage(f.dataset.id), stars = Number(v.stars);
        if (!t) {
            return showHistory();
        }
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
            return message('Selecione uma nota de 1 a 5 estrelas.');
        }
        t.rating = {
            id: t.rating?.id || uid(),
            stars,
            comment: v.comment.trim(),
            createdAt: new Date().toISOString()
        };
        save();
        flash = 'Avaliação salva. Obrigado!';
        showResult(t.id);
    }
});
$('#brand-icon').innerHTML = paw;
if (current()) {
    showHome();
} else {
    showLogin();
}
