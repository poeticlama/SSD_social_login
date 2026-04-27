export type TelegramUser = {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
}

export type AuthProvider = "telegram"

export type AuthUser = {
    id: number
    displayName: string
    username?: string
    avatarUrl?: string
    provider: AuthProvider
    providerUserId: string
    lastLoginAt: string
}

export type AuthResponse = {
    user: AuthUser
    securityChecks: string[]
}

export type ApiErrorResponse = {
    error?: string
    message?: string
    code?: string
    details?: {
        field: string
        message: string
    }[]
}

export type LoginEvent = {
    id: number
    provider: AuthProvider
    success: boolean
    reason: "LOGIN_SUCCESS" | "INVALID_TELEGRAM_AUTH" | string
    createdAt: string
}

export type LoginEventsResponse = {
    items: LoginEvent[]
}

export type Note = {
    id: number
    title: string
    content: string
    createdAt: string
    updatedAt: string
}

export type NotesResponse = {
    items: Note[]
}

export type CreateNoteRequest = {
    title: string
    content: string
}

export type CreateNoteResponse = {
    item: Note
}

export type DeleteNoteResponse = {
    message: string
}

export type LogoutResponse = {
    message: string
}

export type HealthResponse = {
    status: "ok"
    service: string
}