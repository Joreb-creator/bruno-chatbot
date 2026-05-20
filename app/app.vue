<template>
  <div
    class="bg-repeat bg-cover w-full min-h-screen font-sans"
    style="background-image: url(/bg.png)"
  >
    <main class="min-h-screen flex items-center justify-center p-6">
      <section class="bg-white/90 border border-slate-200 rounded-xl shadow-lg p-8 max-w-xl text-center">
        <img src="/bruno.svg" class="w-32 h-32 mx-auto rounded-full" />

        <h1 class="text-3xl font-bold mt-4">Bruno Customer Support</h1>

        <p class="text-slate-600 mt-3">
          Click the Bruno chat button in the bottom-right corner to start a conversation.
        </p>
      </section>
    </main>

    <!-- Floating Chat Panel -->
    <Transition name="chat-panel">
  <div
    v-if="isChatOpen"
    class="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] z-50"
  >
      <div class="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50">
          <div class="flex items-center gap-3">
            <img
              src="/bruno.svg"
              class="w-11 h-11 rounded-full border-2 border-slate-200"
            />

            <div>
              <div class="font-semibold">Bruno</div>
              <div class="text-sm text-slate-500">Customer Support Agent</div>
            </div>
          </div>

          <button
            type="button"
            class="text-slate-500 hover:text-slate-800 text-xl"
            @click="isChatOpen = false"
          >
            ×
          </button>
        </div>

        <!-- Start Screen -->
        <section v-if="!chatStarted" class="p-5 flex flex-col gap-4">
          <h2 class="font-bold text-xl text-center">Start a New Chat</h2>

          <form class="flex flex-col gap-2" @submit.prevent="startChat">
            <input
              v-model="userName"
              type="text"
              placeholder="Your name"
              class="w-full transition p-2 text-sm border border-slate-300/60 shadow-sm placeholder:text-slate-400/90 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 pr-16 rounded-xl"
            />

            <small v-if="!nameError" class="text-slate-500 italic">
              Please provide a name so Bruno knows who he's talking to.
            </small>

            <small v-else class="text-red-500 italic">
              {{ nameError }}
            </small>

            <button
              type="submit"
              class="transition w-full bg-blue-950 text-slate-300 font-medium py-2 px-3 rounded hover:bg-opacity-90"
            >
              Start Chat
            </button>
          </form>
        </section>

        <!-- Chat Screen -->
        <section v-else class="flex flex-col">
          <div
            ref="messagesContainer"
            class="flex flex-col gap-3.5 py-5 px-3 overflow-y-scroll h-[420px]"
          >
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex items-end gap-3',
                message.role === 'user' ? 'flex-row-reverse' : '',
              ]"
            >
              <img
                v-if="message.role === 'assistant'"
                class="block w-10 h-10 overflow-hidden rounded-full border-2 border-slate-200/70"
                src="/bruno.svg"
              />

              <div
                v-else
                class="flex uppercase items-center justify-center text-sm text-center text-white font-bold bg-gradient-to-t from-sky-500 to-emerald-500 w-10 h-10 overflow-hidden rounded-full border-2 border-slate-200/70"
              >
                {{ initials }}
              </div>

              <div
                class="w-3/5 flex flex-col gap-2 border px-4 pt-3 pb-4 rounded-xl bg-slate-50/80 border-slate-200/80 text-sm"
              >
                <div>{{ message.content }}</div>
                <div class="text-xs text-slate-500/70">
                  {{ message.time }}
                </div>
              </div>
            </div>

            <div v-if="isLoading" class="text-sm text-slate-500 italic">
              Bruno is typing...
            </div>
          </div>

          <form class="relative p-3 border-t border-slate-200" @submit.prevent="sendMessage">
            <textarea
              v-model="newMessage"
              class="transition p-4 w-full text-sm border border-slate-300/60 shadow-sm placeholder:text-slate-400/90 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 pr-16 rounded-xl resize-none"
              placeholder="Enter your message..."
              rows="2"
              @keydown.enter.prevent="sendMessage"
            ></textarea>

            <button
              type="submit"
              :disabled="isLoading || !newMessage.trim()"
              class="absolute top-5 right-5 h-10 w-10 flex items-center justify-center bg-gradient-to-t from-sky-500 to-emerald-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
        </section>
      </div>
    </div>
    </Transition>

    <!-- Floating Button -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-white border border-slate-200 shadow-2xl flex items-center justify-center hover:scale-105 transition"
      @click="isChatOpen = !isChatOpen"
    >
      <img
  src="/bruno.svg"
  class="w-12 h-12 rounded-full animate-float"
/>
    </button>
  </div>
</template>

<script setup lang="ts">
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const userName = ref("");
const nameError = ref("");
const chatStarted = ref(false);
const newMessage = ref("");
const isLoading = ref(false);
const isChatOpen = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const messages = ref<ChatMessage[]>([]);

const initials = computed(() => {
  return userName.value.trim().slice(0, 2).toUpperCase() || "JS";
});

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function scrollToBottom() {
  await nextTick();

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function startChat() {
  if (!userName.value.trim()) {
    nameError.value = "Please enter your name before starting the chat.";
    return;
  }

  nameError.value = "";
  chatStarted.value = true;

  messages.value.push({
    id: Date.now(),
    role: "assistant",
    content: `Hi ${userName.value}! I'm Bruno. How can I help you today?`,
    time: getCurrentTime(),
  });

  scrollToBottom();
}

async function sendMessage() {
  const text = newMessage.value.trim();

  if (!text || isLoading.value) return;

  messages.value.push({
    id: Date.now(),
    role: "user",
    content: text,
    time: getCurrentTime(),
  });

  newMessage.value = "";
  isLoading.value = true;

  await scrollToBottom();

  try {
    const response = await Promise.race([
  $fetch<{ reply: string }>("/api/chat", {
    method: "POST",
    body: {
      message: text,
    },
  }),

  new Promise<{ reply: string }>((_, reject) =>
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, 20000)
  ),
]);

    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: response.reply,
      time: getCurrentTime(),
    });

    await scrollToBottom();
  } catch (error) {
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: "Sorry, Bruno had trouble answering that.",
      time: getCurrentTime(),
    });

    await scrollToBottom();
  } finally {
    isLoading.value = false;
  }
}
</script>
<style>
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.25s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-panel-enter-to,
.chat-panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>