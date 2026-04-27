<script setup lang="ts">
import TelegramLoginButton from "../components/TelegramLoginButton.vue";
const telegramLogin = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
</script>

<template>
  <div class="container">
    <h1 class="heading">Login</h1>
    <p class="description">You can login with Telegram</p>
    <TelegramLoginButton :telegram-login="telegramLogin" mode="" />
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
</style>