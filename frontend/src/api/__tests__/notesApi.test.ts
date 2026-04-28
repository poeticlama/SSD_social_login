import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../axios", () => ({
  instance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { notesApi } from "../notesApi"
import { instance as axios } from "../../axios"

const mockAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe("notesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gets notes", async () => {
    mockAxios.get.mockResolvedValue({})

    await notesApi.getNotes()

    expect(mockAxios.get).toHaveBeenCalledWith("/notes")
  })

  it("creates a note", async () => {
    mockAxios.post.mockResolvedValue({})

    const payload = { title: "Hello", content: "World" }

    await notesApi.createNote(payload)

    expect(mockAxios.post).toHaveBeenCalledWith("/notes", payload)
  })

  it("deletes a note", async () => {
    mockAxios.delete.mockResolvedValue({})

    await notesApi.deleteNote(123)

    expect(mockAxios.delete).toHaveBeenCalledWith("/notes/123")
  })
})

