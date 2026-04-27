<template>
  <div ref='telegram'></div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref } from "vue"
import type {TelegramUser} from "../types.ts";

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator (value: string) { return ['callback', 'redirect'].includes(value) }
  },
  telegramLogin: {
    type: String,
    required: true,
    validator (value: string) { return value.endsWith('bot') || value.endsWith('Bot') }
  },
  redirectUrl: {
    type: String,
    default: ''
  },
  requestAccess: {
    type: String,
    default: 'read',
    validator (value: string) { return ['read', 'write'].includes(value) }
  },
  size: {
    type: String,
    default: 'large',
    validator (value: string) { return ['small', 'medium', 'large'].includes(value) }
  },
  userpic: {
    type: Boolean,
    default: true
  },
  radius: {
    type: String
  }
})

const emit = defineEmits(['callback', 'loaded'])
function onTelegramAuth (user: TelegramUser) {
  emit('callback', user)
}

const telegram = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const script = document.createElement("script")
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?23'

  script.setAttribute('data-size', props.size)
  script.setAttribute('data-userpic', String(props.userpic))
  script.setAttribute('data-telegram-login', props.telegramLogin)
  script.setAttribute('data-request-access', props.requestAccess)

  script.onload = () => {
    emit('loaded')
  }

  if (props.radius) script.setAttribute('data-radius', props.radius)

  if (props.mode === 'callback') {
    (window as any).onTelegramAuth = onTelegramAuth
    script.setAttribute('data-onauth', 'window.onTelegramAuth(user)')
  } else {
    script.setAttribute('data-auth-url', props.redirectUrl)
  }

  if (telegram.value) telegram.value.appendChild(script)
})

</script>