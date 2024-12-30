<template>
    <div class="home">
        <div class="header">
            <div class="title">
                <img
                    src="../assets/RepoAI_Logo.png"
                    alt="RepoAI Logo"
                    class="logo"
                />
                RepoAI
            </div>
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
                    <div class="role">
                        <template v-if="item.role === 'assistant'">
                            <img
                                src="../assets/RepoAI_Logo.png"
                                alt="RepoAI Logo"
                                class="role-logo"
                            />
                        </template>
                        <template v-if="item.role === 'user'">
                            <img
                                src="../assets/user.svg"
                                alt="User Logo"
                                class="role-logo"
                            />
                            {{ roleAlias[item.role] }}：
                        </template>
                        <template v-else>
                            {{ roleAlias[item.role] }}：
                        </template>
                    </div>
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
                    content: `你是 **RepoAI**，一个专为代码仓库分析设计的 AI 助手，主要任务是分析并协助用户处理代码仓库相关的问题。你的主要目标是通过提供洞察、解释和建议来帮助用户更好地理解和优化他们的代码仓库。你在以下领域表现尤为出色：

### **代码解析与解释：**

- 分析代码库的结构、模块和逻辑。
- 提供清晰简明的代码功能总结。
- 识别代码库中的关键组件及其关系。
- 为代码库生成详细文档或高层次摘要。

### **知识检索：**

- 使用 **检索增强生成（RAG）** 技术，从仓库中搜索、提取和提供特定信息，例如：
  - API 文档和使用方法。
  - 代码注释和标注。
  - 提交历史和变更日志。
- 帮助用户高效准确地定位相关内容。

### **问题诊断与优化：**

- 分析代码中的性能瓶颈、错误或 bug。
- 提供优化建议以及问题的解决方案。
- 总结开放问题、拉取请求（PR）和其他仓库活动。
- 提出可操作的步骤，以解决问题并提高代码质量。

### **版本控制与协作分析：**

- 解析和总结 Git 历史，识别贡献者及其贡献。
- 分析提交模式，发现协作和开发中的趋势。
- 提供改进版本控制实践和团队工作流的建议。

---

### **互动指导原则：**
- 始终使用符合用户专业水平的技术语言（如有疑问，可先澄清用户的水平）。
- 尽可能提供可操作的建议，并基于代码库中的证据支持这些建议。
- 根据请求以结构化格式生成输出（如表格、项目符号、详细段落等）。
- 确保解释简明扼要，同时足够详细以提供有意义的洞察。
- 始终优先考虑道德和安全问题——绝不暴露敏感或私人信息。

---

### **你可以处理的任务示例：**

- “总结这个代码库的架构。”
- “查找 API 端点并解释其用法。”
- “找出性能问题并提出优化建议。”
- “总结最近的 20 次提交和贡献者。”
- “为这个仓库生成文档。”
- “解释代码库中功能 X 的实现方式。”
- “识别未解决问题并提供解决建议。”

作为一个协作性强且知识渊博的代码助手，你需要对代码仓库和软件工程实践有深入的理解，并在用户需求的基础上提供高效的帮助。`,
                },
                {
                    role: "assistant",
                    content: `你好，我是RepoAI, 基于大模型和RAG的仓库分析助手，我可以提供以下常用服务和功能，例如：

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
            display: flex;
            align-items: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a9eff;

            .logo {
                height: 30px;
                width: auto;
                margin-right: 0.5rem;
                object-fit: contain;
                background-color: rgb(70, 147, 235);
                border-radius: 4px;
                padding: 2px;
            }
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
        overflow-y: auto;
        padding-bottom: 0;
        margin-bottom: 3.5rem;

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
                    display: flex;
                    align-items: center;
                    font-weight: bold;
                    margin-bottom: 0.5rem;

                    .role-logo {
                        height: 24px;
                        width: auto;
                        object-fit: contain;
                        background-color: rgb(70, 147, 235);
                        border-radius: 4px;
                        padding: 2px;
                        margin-right: 4px;
                    }
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
        position: fixed;
        bottom: 0;
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: #1e1e1e;
        border-top: 1px solid #333;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
        z-index: 10;

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