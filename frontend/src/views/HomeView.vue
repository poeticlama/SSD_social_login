<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../api/authApi.ts";
import { notesApi } from "../api/notesApi.ts";
import type { AuthUser, LoginEvent, Note } from "../types.ts";

const router = useRouter();

const me = ref<AuthUser | null>(null);
const notes = ref<Note[]>([]);
const loginEvents = ref<LoginEvent[]>([]);
const isLoadingNotes = ref(false);
const isLoadingEvents = ref(false);
const notesError = ref<string | null>(null);
const eventsError = ref<string | null>(null);
const isAddingNote = ref(false);
const isSavingNote = ref(false);
const createNoteError = ref<string | null>(null);
const newNoteTitle = ref("");
const newNoteContent = ref("");

const formatDate = (value: string) => new Date(value).toLocaleString();

const loadNotes = async () => {
  isLoadingNotes.value = true;
  notesError.value = null;
  try {
    notes.value = (await notesApi.getNotes()).items;
  } catch {
    notesError.value = "Failed to load notes.";
  } finally {
    isLoadingNotes.value = false;
  }
};

const loadLoginEvents = async () => {
  isLoadingEvents.value = true;
  eventsError.value = null;
  try {
    loginEvents.value = (await authApi.getLoginEvents()).items;
  } catch {
    eventsError.value = "Failed to load login events.";
  } finally {
    isLoadingEvents.value = false;
  }
};

const resetNoteForm = () => {
  newNoteTitle.value = "";
  newNoteContent.value = "";
  createNoteError.value = null;
};

const handleCreateNote = async () => {
  const title = newNoteTitle.value.trim();
  const content = newNoteContent.value.trim();
  if (!title) {
    createNoteError.value = "Please enter a title.";
    return;
  }
  if (!content) {
    createNoteError.value = "Please enter a note.";
    return;
  }

  isSavingNote.value = true;
  createNoteError.value = null;
  try {
    await notesApi.createNote({
      title,
      content,
    });
    resetNoteForm();
    isAddingNote.value = false;
    await loadNotes();
  } catch {
    createNoteError.value = "Failed to add note.";
  } finally {
    isSavingNote.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authApi.logout();
  } catch {
    // Ignore network errors; redirect anyway.
  } finally {
    me.value = null;
    notes.value = [];
    loginEvents.value = [];
    await router.push("/login");
  }
};

onMounted(async () => {
  try {
    me.value = (await authApi.me()).user;
  } catch {
    await router.push("/login");
    return;
  }

  await Promise.all([loadNotes(), loadLoginEvents()]);
});
</script>

<template>
  <header>
    <h2>Hello, {{ me?.displayName ?? "there" }}!</h2>
    <div class="logout-container">
      <a class="logout" type="button" @click="handleLogout">Logout</a>
    </div>
  </header>
  <aside class="me-info">
    <div v-if="me" class="profile">
      <img :src="me?.avatarUrl" :alt="me?.displayName" />
      <div class="name">
        <h3>{{ me?.displayName }}</h3>
        <p>@{{ me?.username }}</p>
      </div>
    </div>
    <p v-else class="muted">Loading profile...</p>
  </aside>
  <main class="content">
    <section class="panel">
      <div class="panel-header">
        <h3>Notes</h3>
        <a
          class="secondary"
          type="button"
          @click="isAddingNote = !isAddingNote"
        >
          {{ isAddingNote ? "Hide" : "Add notes" }}
        </a>
      </div>
      <div v-if="isAddingNote" class="note-form">
        <input
          v-model="newNoteTitle"
          type="text"
          placeholder="Title"
        />
        <textarea
          v-model="newNoteContent"
          rows="4"
          placeholder="Write your note..."
        ></textarea>
        <div class="form-actions">
          <button
            class="primary"
            type="button"
            @click="handleCreateNote"
          >
            {{ isSavingNote ? "Saving..." : "Save note" }}
          </button>
          <button
            class="secondary"
            type="button"
            :disabled="isSavingNote"
            @click="resetNoteForm(); isAddingNote = false"
          >
            Cancel
          </button>
        </div>
        <p v-if="createNoteError" class="muted">{{ createNoteError }}</p>
      </div>
      <p v-if="isLoadingNotes" class="muted">Loading notes...</p>
      <p v-else-if="notesError" class="muted">{{ notesError }}</p>
      <ul v-else-if="notes.length" class="list">
        <li v-for="note in notes" :key="note.id" class="note-item">
          <div class="note-header">
            <h4>{{ note.title }}</h4>
            <time :datetime="note.createdAt">{{ formatDate(note.createdAt) }}</time>
          </div>
          <p class="note-content">{{ note.content }}</p>
        </li>
      </ul>
      <p v-else class="muted">No notes yet.</p>
    </section>

    <section class="panel">
      <h3 class="events-panel-header">Login events</h3>
      <p v-if="isLoadingEvents" class="muted">Loading login events...</p>
      <p v-else-if="eventsError" class="muted">{{ eventsError }}</p>
      <ul v-else-if="loginEvents.length" class="list">
        <li v-for="event in loginEvents" :key="event.id" class="event-item">
          <div class="event-header">
            <span class="event-status" :class="{ success: event.success, failure: !event.success }">
              {{ event.success ? "Success" : "Failed" }}
            </span>
            <time :datetime="event.createdAt">{{ formatDate(event.createdAt) }}</time>
          </div>
          <p class="event-meta">{{ event.provider }} · {{ event.reason }}</p>
        </li>
      </ul>
      <p v-else class="muted">No login events yet.</p>
    </section>
  </main>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5rem;
  margin-bottom: 3rem;
}

img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

a {
  cursor: pointer;
}

h3,
p {
  padding: 0;
  margin: 0;
}

.logout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.logout {
  cursor: pointer;
  border: 1px solid #99c4ef;
  background: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}

.logout:hover {
  color: #3a85d1;
  border-color: #3a85d1;
}

.me-info {
  margin-left: 3rem;
  margin-bottom: 2rem;
}

.profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.events-panel-header {
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 3rem 2rem;
}

.panel {
  padding: 1rem 1.2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.note-form {
  margin-top: 0.8rem;
  display: grid;
  gap: 0.6rem;
}

.note-form input,
.note-form textarea {
  width: 100%;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.note-form textarea {
  resize: vertical;
}

.note-item {
  border: 1px solid #b4d3f3;
  border-radius: 1rem;
  padding: 0.5rem 2rem 2rem;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
}

.primary,
.secondary {
  cursor: pointer;
  border: 1px solid #d0d7de;
  background: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}

.primary {
  background: #3a85d1;
  color: #ffffff;
  border-color: #3a85d1;
}

.primary:disabled,
.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary:hover {
  color: #3a85d1;
  border-color: #3a85d1;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0.8rem 0 0;
  display: grid;
  gap: 0.8rem;
}

.note-header,
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.note-content {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: #3879bc;
}

.event-meta {
  margin-top: 0.4rem;
  color: #3d3d3d;
}

.event-status {
  font-weight: 600;
}

.event-status.success {
  color: #1b7f2b;
}

.event-status.failure {
  color: #b42318;
}

.muted {
  color: #6a6a6a;
  margin-top: 1rem
}
</style>