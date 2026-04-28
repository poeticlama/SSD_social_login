import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import TelegramLoginButton from "../TelegramLoginButton.vue"

const baseProps = {
  telegramLogin: "sampleBot",
  size: "large",
  userpic: true,
  requestAccess: "read",
  redirectUrl: "https://example.com/auth",
} as const

describe("TelegramLoginButton", () => {
  afterEach(() => {
    delete (window as { onTelegramAuth?: unknown }).onTelegramAuth
  })

  it("appends the script and emits loaded in callback mode", () => {
    const wrapper = mount(TelegramLoginButton, {
      props: {
        ...baseProps,
        mode: "callback",
      },
    })

    const script = wrapper.element.querySelector("script") as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script.getAttribute("data-telegram-login")).toBe("sampleBot")
    expect(script.getAttribute("data-request-access")).toBe("read")
    expect(script.getAttribute("data-onauth")).toBe("window.onTelegramAuth(user)")
    expect(typeof (window as { onTelegramAuth?: unknown }).onTelegramAuth).toBe("function")

    script.onload?.(new Event("load"))
    expect(wrapper.emitted("loaded")?.length).toBe(1)

    const user = {
      id: 42,
      first_name: "Ada",
      last_name: "Lovelace",
      username: "ada",
      photo_url: "https://example.com/avatar.png",
      auth_date: 123456,
      hash: "hash",
    }

    ;(window as { onTelegramAuth?: (payload: unknown) => void }).onTelegramAuth?.(user)
    expect(wrapper.emitted("callback")?.[0]).toEqual([user])

    wrapper.unmount()
  })

  it("uses the redirect URL when in redirect mode", () => {
    const wrapper = mount(TelegramLoginButton, {
      props: {
        ...baseProps,
        mode: "redirect",
      },
    })

    const script = wrapper.element.querySelector("script") as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script.getAttribute("data-auth-url")).toBe("https://example.com/auth")
    expect(script.getAttribute("data-onauth")).toBeNull()

    wrapper.unmount()
  })
})

