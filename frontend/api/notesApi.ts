import { instance as axios } from "../src/axios"
import type {
    CreateNoteRequest,
    CreateNoteResponse,
    DeleteNoteResponse,
    NotesResponse,
} from "../src/types"

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