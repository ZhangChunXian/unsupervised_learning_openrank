<template>
    <div class="container">
        <div class="header">
            <div class="header__title">ChatGPT</div>
            <div class="header__subtitle">
                基于 OpenAI 的 ChatGPT 自然语言模型人工智能对话
            </div>
            <!-- <div class="header__config" @click="clickConfig">设置</div> -->
        </div>

        <div class="chat-list" ref="chatListDom">
            <div
                class="message-item"
                v-for="item in filteredMessages"
                :key="item.content"
            >
                <div class="message-item__header">
                    <div class="message-item__role">
                        {{ roleAlias[item.role] }}：
                    </div>
                    <Copy class="message-item__copy" :content="item.content" />
                </div>
                <div class="message-item__content">
                    <div
                        class="markdown-content"
                        v-if="item.content"
                        v-html="md.render(item.content)"
                    ></div>
                    <Loding v-else />
                </div>
            </div>
        </div>

        <div class="input-area">
            <!-- <div class="input-area__hint" v-if="isConfig">
        请输入 API Key：
      </div> -->
            <div class="input-area__container">
                <input
                    class="input-area__input"
                    :type="isConfig ? 'password' : 'text'"
                    :placeholder="isConfig ? 'sk-xxxxxxxxxx' : '请输入'"
                    v-model="messageContent"
                    @keydown.enter="!isTalking && sendOrSave()"
                />
                <button
                    class="input-area__button"
                    :disabled="isTalking"
                    @click="sendOrSave"
                >
                    {{ isConfig ? "保存" : "发送" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { chat } from "../utils/gpt";
import cryptoJS from "crypto-js";
import Loading from "../components/repoAI/Loading.vue";
import Copy from "../components/repoAI/Copy.vue";
import { md } from "../utils/markdown";

export default {
    components: {
        Loading,
        Copy,
    },
    data() {
        return {
            apiKey: "sk-kimDNLus4PpfufGKy23OTq2njyTQIaAtBsH3winVYZGgYQQ6",
            isConfig: true,
            isTalking: false,
            messageContent: "",
            decoder: new TextDecoder("utf-8"),
            roleAlias: { user: "ME", assistant: "ChatGPT", system: "System" },
            messageList: [
                {
                    role: "system",
                    content:
                        "你是 ChatGPT，OpenAI 训练的大型语言模型，尽可能简洁地回答。",
                },
                {
                    role: "assistant",
                    content: `你好，我是AI语言模型...`, // 保持原有的欢迎信息
                },
            ],
        };
    },
    computed: {
        filteredMessages() {
            return this.messageList.filter((v) => v.role !== "system");
        },
    },
    // ... 其余方法保持不变，只需要把 const 改为 methods 中的方法
    methods: {
        sendChatMessage(content) {
            content = content || this.messageContent;
            // 方法实现保持不变...
        },
        readStream(reader, status) {
            // 方法实现保持不变...
        },
        // ... 其他方法
    },
    mounted() {
        if (this.getAPIKey()) {
            this.switchConfigStatus();
        }
    },
    watch: {
        messageList: {
            handler() {
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            },
            deep: true,
        },
    },
};
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.header {
    position: fixed;
    width: 100%;
    top: 0;
    display: flex;
    flex-wrap: nowrap;
    align-items: baseline;
    padding: 1rem 1.5rem;
    background-color: #f3f4f6;

    &__title {
        font-size: 1.5rem;
        font-weight: bold;
    }

    &__subtitle {
        margin-left: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    &__config {
        margin-left: auto;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: pointer;
        border-radius: 0.375rem;

        &:hover {
            background-color: white;
        }
    }
}

.chat-list {
    flex: 1;
    margin: 5rem 0.5rem 0.5rem;
}

.message-item {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    &:hover {
        background-color: #f8fafc;
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    &__role {
        font-weight: bold;
    }

    &__copy {
        visibility: hidden;
        .message-item:hover & {
            visibility: visible;
        }
    }

    &__content {
        font-size: 0.875rem;
        color: #475569;
        line-height: 1.75;
    }
}

.input-area {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 1.5rem;
    padding-bottom: 2rem;
    background-color: #f3f4f6;

    &__container {
        display: flex;
    }

    &__input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        margin-right: 0.5rem;

        &:focus {
            outline: none;
            border-color: #3b82f6;
        }
    }

    &__button {
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border-radius: 0.375rem;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &:not(:disabled):hover {
            background-color: #2563eb;
        }
    }
}

pre {
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
        "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC",
        "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC",
        "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei",
        "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp",
        sans-serif;
}
</style>