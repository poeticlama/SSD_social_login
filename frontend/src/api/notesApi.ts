import { instance as axios } from "../axios.ts"
import type {
    CreateNoteRequest,
    CreateNoteResponse,
    DeleteNoteResponse,
    NotesResponse,
} from "../types.ts"

export const notesApi = {
    getNotes() {
        return axios.get<unknown, NotesResponse>("/notes")
    },

    createNote(payload: CreateNoteRequest) {
        return axios.post<unknown, CreateNoteResponse>("/notes", payload)
    },

    deleteNote(id: number) {
        return axios.delete<unknown, DeleteNoteResponse>(`/notes/${id}`)
    },
}