import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../axios", () => ({
  instance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { authApi } from "../authApi"
import { instance as axios } from "../../axios"

const mockAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("posts telegram login payload", async () => {
    mockAxios.post.mockResolvedValue({})

    const payload = {
      id: 1,
      first_name: "Ada",
      auth_date: 1234,
      hash: "hash",
    }

    await authApi.loginWithTelegram(payload)

    expect(mockAxios.post).toHaveBeenCalledWith("/auth/telegram", payload)
  })

  it("requests the current user", async () => {
    mockAxios.get.mockResolvedValue({})

    await authApi.me()

    expect(mockAxios.get).toHaveBeenCalledWith("/auth/me")
  })

  it("requests login events", async () => {
    mockAxios.get.mockResolvedValue({})

    await authApi.getLoginEvents()

    expect(mockAxios.get).toHaveBeenCalledWith("/auth/login-events")
  })

  it("posts logout", async () => {
    mockAxios.post.mockResolvedValue({})

    await authApi.logout()

    expect(mockAxios.post).toHaveBeenCalledWith("/auth/logout")
  })
})

