<script setup lang="ts">
import type { AxiosError } from "axios";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../api/authApi";
import TelegramLoginButton from "../components/TelegramLoginButton.vue";
import type { ApiErrorResponse, TelegramUser } from "../types";

const telegramLogin = import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? "";
const isTelegramConfigMissing = !telegramLogin;
const isLoading = ref(false);
const isAuthChecking = ref(true);
const errorMessage = ref("");
const router = useRouter();

const extractErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const apiError = axiosError.response?.data;

  return apiError?.message ?? apiError?.error ?? "Login failed. Please try again.";
};

const handleTelegramLogin = async (payload: TelegramUser) => {
  if (isLoading.value) {
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  try {
    await authApi.loginWithTelegram(payload);
    await router.push("/");
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    await authApi.me();
    await router.replace("/");
  } catch {
    // Expected for guests (401): stay on /login.
  } finally {
    isAuthChecking.value = false;
  }
});
</script>

<template>
  <div class="container">
    <h1 class="heading">Login</h1>
    <p class="description">You can login with Telegram</p>
    <p v-if="isAuthChecking" class="status">Checking your session...</p>
    <p v-if="isLoading" class="status">Signing you in...</p>
    <p v-if="errorMessage" class="status status-error">{{ errorMessage }}</p>
    <p v-if="isTelegramConfigMissing" class="status status-error">
      Telegram login is not configured. Set <code>VITE_TELEGRAM_BOT_TOKEN</code>.
    </p>
    <TelegramLoginButton
      v-if="!isTelegramConfigMissing && !isAuthChecking"
      :telegram-login="telegramLogin"
      mode="callback"
      @callback="handleTelegramLogin"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 7vw;
}

.heading {
  margin: 0;
  font-size: 2.5vw;
}

.description {
  font-size: 1.1vw;
  margin-top: 4vw;
  margin-bottom: 2vw;
}

.status {
  margin-top: 0;
  margin-bottom: 1vw;
  font-size: 1vw;
}

.status-error {
  color: #d90429;
}
</style>