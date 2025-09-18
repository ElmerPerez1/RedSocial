(() => {
  const API = location.origin + "/api"; // mismo host/puerto

  // Estado
  let token = localStorage.getItem("token") || null;
  let currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // UI refs
  const authView = document.getElementById("authView");
  const feedView = document.getElementById("feedView");
  const publishView = document.getElementById("publishView");
  const usersView = document.getElementById("usersView");
  const profileView = document.getElementById('profileView');
  const nav = document.getElementById("nav");
  const userInfo = document.getElementById('userInfo');
  const logoutBtn = document.getElementById("logoutBtn");

  // Forms
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const publishForm = document.getElementById("publishForm");

  // Lists
  const feedList = document.getElementById("feedList");
  const usersList = document.getElementById("usersList");
  const pager = document.getElementById("pager");
  const relations = document.getElementById('relations');
  const relationsTitle = document.getElementById('relationsTitle');
  const relationsList = document.getElementById('relationsList');
  const btnLoadUsers = document.getElementById('btnLoadUsers');
  const btnShowFollowing = document.getElementById('btnShowFollowing');
  const btnShowFollowers = document.getElementById('btnShowFollowers');

  // Utils
  const headers = () => token ? { 'Authorization': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  function setView(view){
    [authView, feedView, publishView, usersView, profileView].forEach(v => v.classList.add('hidden'));
    if (view === 'auth') authView.classList.remove('hidden');
    if (view === 'feed') feedView.classList.remove('hidden');
    if (view === 'publicar') publishView.classList.remove('hidden');
    if (view === 'usuarios') usersView.classList.remove('hidden');
    if (view === 'perfil') profileView.classList.remove('hidden');
  }

  function setAuthUI(){
    if (token) {
      nav.classList.remove('hidden');
      userInfo.classList.remove('hidden');
      userInfo.textContent = currentUser ? `${currentUser.name || ''} ${currentUser.nick ? '('+currentUser.nick+')' : ''}`.trim() : '';
      setView('feed');
      loadFeed();
    } else {
      nav.classList.add('hidden');
      userInfo.classList.add('hidden');
      setView('auth');
    }
  }

  async function api(path, options={}){
    const res = await fetch(API + path, options);
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (res.status === 401 || res.status === 403) {
      // auto logout en no autorizado
      token = null; currentUser = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthUI();
      throw new Error('Sesión expirada, vuelve a iniciar sesión');
    }
    if (!res.ok) throw new Error((data && data.message) || res.statusText);
    return data;
  }

  // Auth
  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    try {
      const body = { email: fd.get('email'), password: fd.get('password') };
      const data = await api('/login', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      token = data.token; currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      setAuthUI();
    } catch(err){ alert('Login: ' + err.message); }
  });

  if (registerForm) registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const body = {
      name: fd.get('name'),
      surname: fd.get('surname'),
      nick: fd.get('nick'),
      email: fd.get('email'),
      password: fd.get('password')
    };
    try {
      await api('/register', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      // Autologin tras registro
      const loginData = await api('/login', { method: 'POST', headers: headers(), body: JSON.stringify({ email: body.email, password: body.password }) });
      token = loginData.token; currentUser = loginData.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      setAuthUI();
    } catch(err){ alert('Registro: ' + err.message); }
  });

  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    token = null; currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUI();
    setView('auth');
  });

  // Feed
  async function loadFeed(){
    if (!token) return;
    try {
      const data = await api('/feed', { headers: headers() });
      renderPublications(data.publications || [], data.mode);
    } catch(err){ alert('Feed: ' + err.message); }
  }

  function renderPublications(list, mode){
    feedList.innerHTML = '';
    if (mode === 'global_fallback') {
      const info = document.createElement('div');
      info.className = 'item';
      info.style.background = 'rgba(255,255,255,0.05)';
      info.innerHTML = '<strong>Feed global:</strong> Aún no sigues a nadie. Mostrando publicaciones recientes de todos. Ve a la sección Usuarios para seguir a otros.';
      feedList.appendChild(info);
    }
    if (!list.length){
      const empty = document.createElement('div');
      empty.className = 'item';
      empty.textContent = 'No hay publicaciones aún';
      feedList.appendChild(empty);
      return;
    }
    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'item';
      const isMine = currentUser && p.user && (p.user._id === currentUser.id || p.user.id === currentUser.id);
      const user = p.user && (p.user.nick || p.user.name) ? (p.user.nick || p.user.name) : 'anónimo';
      div.innerHTML = `
        <div class="meta">${user}${isMine ? ' (tú)' : ''} — ${new Date(p.created_at).toLocaleString()}</div>
        <div class="text">${escapeHtml(p.text)}</div>
        ${p.file ? renderFile(p.file) : ''}
      `;
      feedList.appendChild(div);
    });
  }

  function renderFile(url){
    if (!url) return '';
    const lower = String(url).toLowerCase();
    if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/)) {
      return `<div><img src="${url}" alt="media" style="max-width:100%;border-radius:8px;border:1px solid #1f2937;margin-top:8px"/></div>`;
    }
    if (lower.match(/\.(mp4|webm|ogg)(\?|$)/)) {
      return `<div><video src="${url}" controls style="max-width:100%;border-radius:8px;border:1px solid #1f2937;margin-top:8px"></video></div>`;
    }
    return `<div><a href="${url}" target="_blank" rel="noopener">Archivo</a></div>`;
  }

  // Publicar
  if (publishForm) publishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) return alert('Debes iniciar sesión');
    const fd = new FormData(publishForm);
    // No fijar Content-Type; el navegador pondrá multipart con boundary
    try {
      const opts = { method: 'POST', headers: token ? { 'Authorization': token } : undefined, body: fd };
      await api('/publication', opts);
      publishForm.reset();
      setView('feed');
      await loadFeed();
    } catch(err){ alert('Publicar: ' + err.message); }
  });

  // Usuarios + follow
  async function loadUsers(page=1){
    try {
      const data = await api(`/users/${page}`, { headers: headers() });
      renderUsers(data.users || [], data.page, data.totalPages);
    } catch(err){ alert('Usuarios: ' + err.message); }
  }

  function renderUsers(list, page, totalPages){
    usersList.innerHTML = '';
    // Estado de seguidos
    const state = { followingIds: new Set() };
    const loadFollowing = (async () => {
      try {
        if (!currentUser) return;
        const data = await api(`/following/${currentUser.id}`, { headers: headers() });
        (data.following || []).forEach(f => state.followingIds.add(String(f.followed._id)));
      } catch(_) {}
    })();

    list.forEach(async (u) => {
      const div = document.createElement('div');
      div.className = 'item';
      const imgSrc = (u.image && typeof u.image === 'string' && u.image.startsWith('/uploads')) ? u.image : '/uploads/avatars/default.png';
      div.innerHTML = `
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${imgSrc}" alt="avatar" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid #1f2937;"/>
          <div style="flex:1">
            <div class="meta">${u.nick || u.name} — ${u.email} ${currentUser && u._id===currentUser.id ? '(tú)' : ''}</div>
            <div class="meta" data-counts="${u._id}">Cargando stats…</div>
            <div>
              <button data-follow="${u._id}">Follow</button>
              <button data-unfollow="${u._id}">Unfollow</button>
              <button data-pubs="${u._id}" data-nick="${u.nick || u.name}">Ver publicaciones</button>
            </div>
          </div>
        </div>
      `;
      usersList.appendChild(div);

      // traer conteos de seguidores/siguiendo para este usuario
      try {
        const [followersData, followingData] = await Promise.all([
          api(`/followers/${u._id}`, { headers: headers() }),
          api(`/following/${u._id}`, { headers: headers() })
        ]);
        const el = usersList.querySelector(`.meta[data-counts="${u._id}"]`);
        if (el) el.textContent = `Seguidores: ${(followersData.followers || []).length} | Siguiendo: ${(followingData.following || []).length}`;
      } catch(_err) {}
    });

    pager.innerHTML = '';
    const prev = document.createElement('button');
    prev.textContent = 'Anterior';
    prev.disabled = page <= 1;
    prev.onclick = () => loadUsers(page - 1);
    const next = document.createElement('button');
    next.textContent = 'Siguiente';
    next.disabled = page >= totalPages;
    next.onclick = () => loadUsers(page + 1);
    pager.append(prev, document.createTextNode(` Página ${page}/${totalPages} `), next);

    usersList.querySelectorAll('button[data-follow]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await follow(btn.dataset.follow);
        // Actualizar estado local tras seguir
        state.followingIds.add(String(btn.dataset.follow));
        markFollowState();
      });
    });
    usersList.querySelectorAll('button[data-unfollow]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await unfollow(btn.dataset.unfollow);
        // Actualizar estado local tras dejar de seguir
        state.followingIds.delete(String(btn.dataset.unfollow));
        markFollowState();
      });
    });
    const userPubs = document.getElementById('userPubs');
    const userPubsTitle = document.getElementById('userPubsTitle');
    const userPubsList = document.getElementById('userPubsList');
    usersList.querySelectorAll('button[data-pubs]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const uid = btn.dataset.pubs;
          const nick = btn.dataset.nick || 'usuario';
          const data = await api(`/publications/${uid}`, { headers: headers() });
          userPubs.classList.remove('hidden');
          userPubsTitle.textContent = `Publicaciones de ${nick}`;
          const pubs = data.publications || [];
          userPubsList.innerHTML = '';
          if (!pubs.length) { userPubsList.innerHTML = '<div class="item">Sin publicaciones</div>'; return; }
          pubs.forEach(p => {
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `
              <div class="meta">${new Date(p.created_at).toLocaleString()}</div>
              <div class="text">${escapeHtml(p.text)}</div>
              ${p.file ? renderFile(p.file) : ''}
            `;
            userPubsList.appendChild(div);
          });
        } catch(err){ alert('Publicaciones: ' + err.message); }
      });
    });

    // Marcar estado de follow al terminar de cargar
    loadFollowing.then(() => markFollowState());

    function markFollowState(){
      usersList.querySelectorAll('.item').forEach(item => {
        const followBtn = item.querySelector('button[data-follow]');
        const unfollowBtn = item.querySelector('button[data-unfollow]');
        if (!followBtn || !unfollowBtn) return;
        const uid = followBtn.dataset.follow;
        const isSelf = currentUser && uid === currentUser.id;
        const isFollowing = state.followingIds.has(String(uid));
        followBtn.disabled = isSelf || isFollowing;
        unfollowBtn.disabled = isSelf || !isFollowing;
        followBtn.textContent = isFollowing ? 'Siguiendo' : 'Follow';
      });
    }
  }

  async function follow(userId){
    try { await api(`/follow/${userId}`, { method: 'POST', headers: headers() }); alert('Ahora sigues a este usuario'); }
    catch(err){ alert('Follow: ' + err.message); }
  }
  async function unfollow(userId){
    try { await api(`/unfollow/${userId}`, { method: 'DELETE', headers: headers() }); alert('Dejaste de seguir a este usuario'); }
    catch(err){ alert('Unfollow: ' + err.message); }
  }

  // Seguidores / Siguiendo
  async function showFollowing(){
    if (!currentUser) return;
    try {
      const data = await api(`/following/${currentUser.id}`, { headers: headers() });
      relations.classList.remove('hidden');
      relationsTitle.textContent = 'Siguiendo';
      renderRelations((data.following || []).map(f => f.followed));
    } catch(err){ alert('Siguiendo: ' + err.message); }
  }
  async function showFollowers(){
    if (!currentUser) return;
    try {
      const data = await api(`/followers/${currentUser.id}`, { headers: headers() });
      relations.classList.remove('hidden');
      relationsTitle.textContent = 'Seguidores';
      renderRelations((data.followers || []).map(f => f.user));
    } catch(err){ alert('Seguidores: ' + err.message); }
  }
  function renderRelations(users){
    relationsList.innerHTML = '';
    if (!users.length) { relationsList.innerHTML = '<div class="item">Vacío</div>'; return; }
    users.forEach(u => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta">${(u && (u.nick||u.name)) || 'usuario'}</div>`;
      relationsList.appendChild(div);
    });
  }

  // Navegación
  document.querySelectorAll('nav button[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      setView(v);
      if (v === 'feed') loadFeed();
      if (v === 'usuarios') { loadUsers(1); relations.classList.add('hidden'); }
      if (v === 'perfil') loadProfile();
    });
  });

  btnLoadUsers?.addEventListener('click', () => { relations.classList.add('hidden'); loadUsers(1); });
  btnShowFollowing?.addEventListener('click', showFollowing);
  btnShowFollowers?.addEventListener('click', showFollowers);

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
  }

  // init
  setAuthUI();
  async function loadProfile(){
    if (!currentUser) return;
    const profileSummary = document.getElementById('profileSummary');
    const myPubsList = document.getElementById('myPubsList');
    const avatarImg = document.getElementById('avatarImg');
    const avatarForm = document.getElementById('avatarForm');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');
  const bioForm = document.getElementById('bioForm');
  const bioText = document.getElementById('bioText');
    try {
      // counts
      const [followersData, followingData, pubsData, profileData] = await Promise.all([
        api(`/followers/${currentUser.id}`, { headers: headers() }),
        api(`/following/${currentUser.id}`, { headers: headers() }),
        api(`/publications/${currentUser.id}`, { headers: headers() }),
        api(`/profile/${currentUser.id}`, { headers: headers() })
      ]);
      const followersCount = (followersData.followers || []).length;
      const followingCount = (followingData.following || []).length;
      profileSummary.textContent = `${currentUser.nick || currentUser.name} — Seguidores: ${followersCount} | Siguiendo: ${followingCount}`;
      // avatar
      const img = (profileData.user && profileData.user.image) ? profileData.user.image : 'default.png';
      avatarImg.src = img.startsWith('/uploads') ? img : '/uploads/avatars/default.png';
      // bio
      bioText.value = (profileData.user && profileData.user.bio) ? profileData.user.bio : '';
      if (bioForm && !bioForm._bound) {
        bioForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const bio = bioText.value || '';
          try {
            await api('/profile', { method: 'PATCH', headers: headers(), body: JSON.stringify({ bio }) });
            alert('Bio actualizada');
          } catch(err){ alert('Actualizar bio: ' + err.message); }
        });
        bioForm._bound = true;
      }
      // bind avatar form
      if (avatarForm && !avatarForm._bound) {
        avatarForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const fd = new FormData(avatarForm);
          if (!fd.get('avatar')) { alert('Selecciona una imagen'); return; }
          try {
            await api('/avatar', { method: 'POST', headers: token ? { 'Authorization': token } : undefined, body: fd });
            await loadProfile();
          } catch(err){ alert('Avatar: ' + err.message); }
        });
        avatarForm._bound = true;
      }
      if (removeAvatarBtn && !removeAvatarBtn._bound) {
        removeAvatarBtn.addEventListener('click', async () => {
          try { await api('/avatar', { method: 'DELETE', headers: headers() }); await loadProfile(); }
          catch(err){ alert('Eliminar avatar: ' + err.message); }
        });
        removeAvatarBtn._bound = true;
      }
      // pubs
      const pubs = pubsData.publications || [];
      myPubsList.innerHTML = '';
      if (!pubs.length) { myPubsList.innerHTML = '<div class="item">Aún no has publicado</div>'; return; }
      pubs.forEach(p => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div class="meta">${new Date(p.created_at).toLocaleString()}</div>
          <div class="text">${escapeHtml(p.text)}</div>
          ${p.file ? renderFile(p.file) : ''}
        `;
        myPubsList.appendChild(div);
      });
    } catch(err){ profileSummary.textContent = 'Error cargando perfil: ' + err.message; }
  }
})();
