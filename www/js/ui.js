document.addEventListener('DOMContentLoaded', () => {
  const views = {
    login: document.getElementById('view-login'),
    home: document.getElementById('view-home'),
    profile: document.getElementById('view-profile')
  };

  const navHomeButtons = Array.from(document.querySelectorAll('#nav-home, #nav-home2'));
  const navAddButtons = Array.from(document.querySelectorAll('#nav-add, #nav-add2'));
  const navProfileButtons = Array.from(document.querySelectorAll('#nav-profile, #nav-profile2'));

  function showView(name) {
    Object.values(views).forEach(v => v.style.display = 'none');
    views[name].style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (name === 'home') document.getElementById('nav-home').classList.add('active');
    if (name === 'profile') document.getElementById('nav-profile2').classList.add('active');
  }

  navHomeButtons.forEach(b => b.addEventListener('click', () => showView('home')));
  navAddButtons.forEach(b => {
    b.addEventListener('click', () => openAddModal());
  });
  navProfileButtons.forEach(b => b.addEventListener('click', () => showView('profile')));

  document.getElementById('btnLogout').addEventListener('click', () => auth.signOut());
  document.getElementById('btnLogoutTop').addEventListener('click', () => auth.signOut());

  auth.onAuthStateChanged(user => {
    if (user) {
      showView('home');
      document.getElementById('profileEmail').innerText = user.email || '';
      document.getElementById('profileUid').innerText = user.uid || '';
      loadMembers(); 
    } else {
      showView('login');
    }
  });

  const addModal = document.getElementById('addModal');
  document.getElementById('btnCancelCreate').addEventListener('click', closeAddModal);
  async function openAddModal() {
    await loadMembers();
    addModal.setAttribute('aria-hidden','false');
  }
  function closeAddModal() {
    addModal.setAttribute('aria-hidden','true');

    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'baja';
    document.querySelectorAll('.member-chip').forEach(el => el.classList.remove('selected'));
  }

  async function loadMembers() {
    const list = document.getElementById('membersList');
    if (!list) return;
    list.innerHTML = 'Cargando...';
    try {
      const snap = await db.collection('users').get();
      list.innerHTML = '';
      snap.forEach(doc => {
        const data = doc.data();
        const chip = document.createElement('div');
        chip.className = 'member-chip';
        chip.dataset.uid = doc.id;
        chip.innerText = data.displayName || data.email || doc.id;
        chip.addEventListener('click', () => chip.classList.toggle('selected'));
        list.appendChild(chip);
      });
      if (snap.empty) list.innerHTML = '<small>No hay miembros registrados</small>';
    } catch (e) {
      console.error('Error cargando miembros:', e);
      list.innerHTML = '<small>Error cargando miembros</small>';
    }
  }

  document.getElementById('btnCreateTask').addEventListener('click', async () => {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return alert('La tarea requiere título');
    const desc = document.getElementById('taskDesc').value.trim();
    const dueDate = document.getElementById('taskDueDate').value || null;
    const priority = document.getElementById('taskPriority').value || 'baja';
    const selected = Array.from(document.querySelectorAll('.member-chip.selected')).map(c => c.dataset.uid);
    const currentUser = auth.currentUser;
    const task = {
      title, desc, dueDate, priority,
      assignees: selected,
      status:'todo',
      createdBy: currentUser ? currentUser.uid : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      notifyOnAssign: true
    };

    try {
      await addTask(task);
      closeAddModal();
    } catch (e) {
      console.error('Error creando tarea:', e);
      alert('Error creando tarea: ' + e.message);
    }
  });

  document.getElementById('filterStatus').addEventListener('change', applyFilters);
  document.getElementById('filterPriority').addEventListener('change', applyFilters);

  let currentFilter = {status:'all', priority:'all'};
  function applyFilters() {
    currentFilter.status = document.getElementById('filterStatus').value;
    currentFilter.priority = document.getElementById('filterPriority').value;

    renderTasksCache();
  }

  window.tasksCache = [];
  window.renderTasksCache = function() {
    const list = document.getElementById('tasksList');
    list.innerHTML = '';
    const filtered = window.tasksCache.filter(item => {
      if (currentFilter.status !== 'all' && item.status !== currentFilter.status) return false;
      if (currentFilter.priority !== 'all' && item.priority !== currentFilter.priority) return false;
      return true;
    });
    if (filtered.length === 0) {
      list.innerHTML = '<li class="card center">No hay tareas que mostrar</li>';
      return;
    }
    filtered.forEach(t => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.className = 'task-meta';
      left.innerHTML = `<div class="task-title">${escapeHtml(t.title)}</div>
                        <div class="task-sub">${escapeHtml(t.dueDate || '')} · ${escapeHtml(t.priority || '')}</div>
                        <div class="task-sub">Asignados: ${t.assigneesNames ? escapeHtml(t.assigneesNames.join(', ')) : '-'}</div>`;
      const right = document.createElement('div');
      right.className = 'task-actions';
      const doneBtn = document.createElement('button');
      doneBtn.className='btn small';
      doneBtn.innerText = t.status === 'done' ? 'Deshacer' : 'Completar';
      doneBtn.addEventListener('click', () => toggleDone(t.id, t.status));
      const editBtn = document.createElement('button');
      editBtn.className='btn small outline';
      editBtn.innerText='Editar';
      editBtn.addEventListener('click', () => editPrompt(t.id, t.title));
      const delBtn = document.createElement('button');
      delBtn.className='btn small';
      delBtn.style.background='#e74c3c'; delBtn.style.color='#fff';
      delBtn.innerText='Borrar';
      delBtn.addEventListener('click', () => {
        if (confirm('¿Borrar tarea?')) removeTask(t.id);
      });
      right.appendChild(doneBtn); right.appendChild(editBtn); right.appendChild(delBtn);
      li.appendChild(left); li.appendChild(right);
      list.appendChild(li);
    });
  };

  window.toggleDone = async function(id, status){ await updateTask(id, { status: status === 'done' ? 'todo' : 'done' }); };
  window.editPrompt = async function(id, currentTitle){
    const newT = prompt('Nuevo título:', currentTitle);
    if (newT) await updateTask(id, { title: newT });
  };

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
        "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
      })[s];
    });
  }
});
