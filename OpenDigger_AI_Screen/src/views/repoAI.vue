<template>
    <div class="home">
        <div class="header">
            <div class="title">RepoAI</div>
            <div class="subtitle">基于大模型与RAG技术的仓库分析助手</div>
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
            roleAlias: { user: "ME", assistant: "RepoAI", system: "System" },
            messageList: [
                {
                    role: "system",
                    content:
                        "你是 ChatGPT，OpenAI 训练的大型语言模型，尽可能简洁地回答。",
                },
                {
                    role: "assistant",
                    content: `你好，我是基于大模型和RAG的仓库分析助手，我可以提供以下常用服务和功能，例如：

1.代码解析与解读：我可以帮助你快速理解代码仓库的结构、功能模块和关键代码逻辑，并生成详尽的文档或摘要。

2.知识检索：通过RAG（检索增强生成）技术，我能够从仓库中提取有价值的信息，例如API文档、注释、历史变更记录等，帮助你快速找到所需内容。

3.问题诊断与优化建议：如果你在仓库中遇到性能问题、代码错误或技术难题，我可以分析代码并提供解决方案或优化建议, 同时我也会总结仓库的issue和pull request, 并给出优化建议。

4.版本控制与协作分析：我可以解析Git历史记录，帮助你了解代码变更的背景、贡献者和协作模式，为团队管理提供支持。

请告诉我你需要哪方面的帮助，我会根据你的需求给出最合适的分析和建议！`,
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
    background-color: #121212;
    color: #ffffff;

    .header {
        display: flex;
        flex-wrap: nowrap;
        position: fixed;
        width: 100%;
        align-items: baseline;
        top: 0;
        padding: 1rem 1.5rem;
        background-color: #1e1e1e;
        border-bottom: 1px solid #333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

        .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a9eff;
        }

        .subtitle {
            margin-left: 1rem;
            font-size: 0.875rem;
            color: #888;
        }

        .settings {
            margin-left: auto;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            cursor: pointer;
            border-radius: 0.375rem;
            color: #000;

            &:hover {
                background-color: #333;
            }
        }
    }

    .chat-list {
        flex: 1;
        margin: 5rem 0.5rem 0.5rem;

        .message-item {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            background-color: #1e1e1e;
            border: 1px solid #333;
            transition: all 0.3s ease;

            &:hover {
                background-color: #252525;
                border-color: #4a9eff;
                box-shadow: 0 2px 12px rgba(74, 158, 255, 0.1);
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;

                .role {
                    font-weight: bold;
                    color: #4a9eff;
                }

                .copy-btn {
                    visibility: hidden;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
            }

            &:hover .copy-btn {
                visibility: visible;
                opacity: 1;
            }

            .message-content {
                .content {
                    font-size: 0.875rem;
                    color: #ddd;
                    line-height: 1.625;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    overflow-wrap: break-word;

                    :deep(.markdown-ol) {
                        list-style-type: decimal;
                        padding-left: 1.5em;
                        margin: 1em 0;

                        li {
                            margin-bottom: 0.5em;
                            white-space: normal;
                        }
                    }
                }
            }
        }
    }

    .input-area {
        position: sticky;
        bottom: 0;
        width: 100%;
        padding: 1.5rem;
        background-color: #1e1e1e;
        border-top: 1px solid #333;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);

        .api-key-tip {
            margin-top: -0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: #888;
        }

        .input-wrapper {
            display: flex;
            gap: 0.75rem;

            .input {
                flex-grow: 1;
                padding: 0.75rem 1rem;
                color: #fff;
                background-color: #2a2a2a;
                border: 1px solid #333;
                border-radius: 0.5rem;
                transition: all 0.3s ease;

                &:focus {
                    outline: none;
                    border-color: #4a9eff;
                    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.15);
                    background-color: #252525;
                }

                &::placeholder {
                    color: #666;
                }
            }

            .send-btn {
                padding: 0.75rem 1.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: #fff;
                background-color: #4a9eff;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #3d8be6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
                }

                &:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.2);
                }

                &:disabled {
                    background-color: #2d2d2d;
                    color: #666;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
            }
        }
    }
}

:deep(pre),
:deep(code) {
    font-family: "Fira Code", Consolas, Monaco, "Andale Mono", monospace;
    background-color: #2a2a2a !important;
    color: #ddd !important;
    border: 1px solid #333 !important;
}

:deep(a) {
    color: #4a9eff;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
}

:deep(blockquote) {
    border-left: 4px solid #4a9eff;
    margin: 1em 0;
    padding: 0.5em 1em;
    background-color: #2a2a2a;
    color: #ddd;
}

:deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;

    th,
    td {
        border: 1px solid #333;
        padding: 0.5em;
        background-color: #2a2a2a;
    }

    th {
        background-color: #252525;
    }
}
</style>