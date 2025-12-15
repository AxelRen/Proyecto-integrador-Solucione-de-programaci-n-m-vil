let tasksUnsubscribe = null;
window.tasksCache = []; 

async function addTask(task) {
  try {
    task.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('tasks').add(task);

    if (task.assignees && task.assignees.length && task.notifyOnAssign) {
      await db.collection('pendingNotifications').add({
        taskId: docRef.id,
        assignees: task.assignees,
        title: task.title,
        body: `Se te asignó la tarea "${task.title}"`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    return docRef;
  } catch (e) {
    console.error('Error addTask:', e);
    throw e;
  }
}

async function updateTask(taskId, updates) {
  try {
    updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('tasks').doc(taskId).update(updates);
  } catch (e) {
    console.error('Error updateTask:', e);
    throw e;
  }
}

async function deleteTask(taskId) {
  try {
    await db.collection('tasks').doc(taskId).delete();
  } catch (e) {
    console.error('Error deleteTask:', e);
    throw e;
  }
}

function tasksStartListener(userId) {
  tasksUnsubscribe = db.collection('tasks').orderBy('createdAt','desc')
    .onSnapshot(async snapshot => {
      const arr = [];
      const assigneeIds = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        arr.push({ id: doc.id, ...data });
        if (data.assignees && Array.isArray(data.assignees)) {
          data.assignees.forEach(a => assigneeIds.add(a));
        }
      });

      const ids = Array.from(assigneeIds);
      const namesMap = {};
      if (ids.length) {
        try {
          const chunks = [];
          for (let i=0;i<ids.length;i+=10) chunks.push(ids.slice(i,i+10));
          for (const c of chunks) {
            const snap = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', c).get();
            snap.forEach(d => {
              const ud = d.data();
              namesMap[d.id] = ud.displayName || ud.email || d.id;
            });
          }
        } catch (e) {
          console.warn('No se pudieron resolver nombres de assignees:', e);
        }
      }

      const enriched = arr.map(t => {
        const assigneesNames = (t.assignees || []).map(id => namesMap[id] || id);
        return { ...t, assigneesNames };
      });

      window.tasksCache = enriched;
      if (typeof renderTasksCache === 'function') renderTasksCache();
    }, err => {
      console.error("Error snapshot tasks:", err);
    });
}

function tasksStopListener() {
  if (tasksUnsubscribe) {
    tasksUnsubscribe();
    tasksUnsubscribe = null;
  }
}

window.addTask = addTask;
window.updateTask = updateTask;
window.removeTask = deleteTask;
window.tasksStartListener = tasksStartListener;
window.tasksStopListener = tasksStopListener;

