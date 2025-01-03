<template>
    <div class="home">
        <div class="header">
            <div class="title">ChatGPT</div>
            <div class="subtitle">
                基于 OpenAI 的 ChatGPT 自然语言模型人工智能对话
            </div>
            <!-- <div class="settings" @click="clickConfig()">
        设置
      </div> -->
        </div>

        <div class="chat-list" ref="chatListDom">
            <div
                class="message-item"
                v-for="item in messageList.filter((v) => v.role !== 'system')"
            >
                <div class="message-header">
                    <div class="role">{{ roleAlias[item.role] }}：</div>
                    <Copy class="copy-btn" :content="item.content" />
                </div>
                <div class="message-content">
                    <div
                        class="content"
                        v-if="item.content"
                        v-html="md.render(item.content)"
                    ></div>
                    <Loding v-else />
                </div>
            </div>
        </div>

        <div class="input-area">
            <!-- <div class="api-key-tip" v-if="isConfig">
        请输入 API Key：
      </div> -->
            <div class="input-wrapper">
                <input
                    class="input"
                    :type="isConfig ? 'password' : 'text'"
                    :placeholder="isConfig ? 'sk-xxxxxxxxxx' : '请输入'"
                    v-model="messageContent"
                    @keydown.enter="isTalking || sendOrSave()"
                />
                <button
                    class="send-btn"
                    :disabled="isTalking"
                    @click="sendOrSave()"
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
import Loding from "../components/repoAI/Loading.vue";
import Copy from "../components/repoAI/Copy.vue";
import { md } from "../utils/markdown";

export default {
    name: "Home",
    components: {
        Loding,
        Copy,
    },
    data() {
        return {
            md,
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
                    content: `你好，我是AI语言模型，我可以提供一些常用服务和信息，例如：

1. 翻译：我可以把中文翻译成英文，英文翻译成中文，还有其他一些语言翻译，比如法语、日语、西班牙语等。

2. 咨询服务：如果你有任何问题需要咨询，例如健康、法律、投资等方面，我可以尽可能为你提供帮助。

3. 闲聊：如果你感到寂寞或无聊，我们可以聊一些有趣的话题，以减轻你的压力。

请告诉我你需要哪方面的帮助，我会根据你的需求给你提供相应的信息和建议。`,
                },
            ],
        };
    },
    computed: {
        filteredMessageList() {
            return this.messageList.filter((v) => v.role !== "system");
        },
    },
    mounted() {
        if (this.getAPIKey()) {
            this.switchConfigStatus();
        }
    },
    watch: {
        messageList: {
            handler() {
                this.$nextTick(() => this.scrollToBottom());
            },
            deep: true,
        },
    },
    methods: {
        async sendChatMessage(content) {
            try {
                this.isTalking = true;
                const messageContent = content || this.messageContent;

                if (this.messageList.length === 2) {
                    this.messageList.pop();
                }
                this.messageList.push({
                    role: "user",
                    content: messageContent,
                });
                this.clearMessageContent();
                this.messageList.push({ role: "assistant", content: "" });

                const { body, status } = await chat(
                    this.messageList,
                    this.getAPIKey()
                );
                if (body) {
                    const reader = body.getReader();
                    await this.readStream(reader, status);
                }
            } catch (error) {
                this.appendLastMessageContent(error);
            } finally {
                this.isTalking = false;
            }
        },

        async readStream(reader, status) {
            let partialLine = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const decodedText = this.decoder.decode(value, {
                    stream: true,
                });

                if (status !== 200) {
                    const json = JSON.parse(decodedText);
                    const content = json.error.message ?? decodedText;
                    this.appendLastMessageContent(content);
                    return;
                }

                const chunk = partialLine + decodedText;
                const newLines = chunk.split(/\r?\n/);

                partialLine = newLines.pop() ?? "";

                for (const line of newLines) {
                    if (line.length === 0) continue;
                    if (line.startsWith(":")) continue;
                    if (line === "data: [DONE]") return;

                    const json = JSON.parse(line.substring(6));
                    const content =
                        status === 200
                            ? json.choices[0].delta.content ?? ""
                            : json.error.message;
                    this.appendLastMessageContent(content);
                }
            }
        },

        appendLastMessageContent(content) {
            const lastMessage = this.messageList[this.messageList.length - 1];
            this.$set(lastMessage, "content", lastMessage.content + content);
        },

        sendOrSave() {
            if (!this.messageContent.length) return;
            if (this.isConfig) {
                if (this.saveAPIKey(this.messageContent.trim())) {
                    this.switchConfigStatus();
                }
                this.clearMessageContent();
            } else {
                this.sendChatMessage();
            }
        },

        clickConfig() {
            if (!this.isConfig) {
                this.messageContent = this.getAPIKey();
            } else {
                this.clearMessageContent();
            }
            this.switchConfigStatus();
        },

        getSecretKey() {
            return "lianginx";
        },

        saveAPIKey(apiKey) {
            if (apiKey.slice(0, 3) !== "sk-" || apiKey.length !== 51) {
                alert("API Key 错误，请检查后重新输入！");
                return false;
            }
            const aesAPIKey = cryptoJS.AES.encrypt(
                apiKey,
                this.getSecretKey()
            ).toString();
            localStorage.setItem("apiKey", aesAPIKey);
            return true;
        },

        getAPIKey() {
            if (this.apiKey) return this.apiKey;
            const aesAPIKey = localStorage.getItem("apiKey") ?? "";
            this.apiKey = cryptoJS.AES.decrypt(
                aesAPIKey,
                this.getSecretKey()
            ).toString(cryptoJS.enc.Utf8);
            return this.apiKey;
        },

        switchConfigStatus() {
            this.isConfig = !this.isConfig;
        },

        clearMessageContent() {
            this.messageContent = "";
        },

        scrollToBottom() {
            if (!this.$refs.chatListDom) return;
            window.scrollTo(0, this.$refs.chatListDom.scrollHeight);
        },

        renderedContent(content) {
            return md.render(content);
        },
    },
};
</script>

<style lang="scss" scoped>
.home {
    display: flex;
    flex-direction: column;
    height: 100vh;

    .header {
        display: flex;
        flex-wrap: nowrap;
        position: fixed;
        width: 100%;
        align-items: baseline;
        top: 0;
        padding: 1rem 1.5rem;
        background-color: #f3f4f6;

        .title {
            font-size: 1.5rem;
            font-weight: bold;
        }

        .subtitle {
            margin-left: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
        }

        .settings {
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

        .message-item {
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;

            &:hover {
                background-color: #f8f9fa;
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;

                .role {
                    font-weight: bold;
                }

                .copy-btn {
                    visibility: hidden;
                }
            }

            &:hover .copy-btn {
                visibility: visible;
            }

            .message-content {
                .content {
                    font-size: 0.875rem;
                    color: #4b5563;
                    line-height: 1.625;
                }
            }
        }
    }

    .input-area {
        position: sticky;
        bottom: 0;
        width: 100%;
        padding: 1.5rem;
        padding-bottom: 2rem;
        background-color: #f3f4f6;

        .api-key-tip {
            margin-top: -0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
        }

        .input-wrapper {
            display: flex;

            .input {
                flex-grow: 1;
                padding: 0.5rem 1rem;
                margin-right: 0.5rem;
                color: #374151;
                background-color: white;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;

                &:focus {
                    outline: none;
                    border-color: #60a5fa;
                    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
                }
            }

            .send-btn {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: white;
                background-color: #1d4ed8;
                border-radius: 0.375rem;
                white-space: nowrap;
                transition: background-color 0.3s;

                &:hover {
                    background-color: #2563eb;
                }

                &:focus {
                    outline: none;
                    background-color: #2563eb;
                }

                &:disabled {
                    background-color: #93c5fd;
                }
            }
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