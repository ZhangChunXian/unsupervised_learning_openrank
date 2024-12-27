export async function chat(messageList, apiKey) {
    try {
        const result = await fetch(
            "https://api.gptgod.online/v1/chat/completions",
            {
                method: "post",
                // signal: AbortSignal.timeout(8000),
                // 开启后到达设定时间会中断流式输出
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4-gizmo-g-JtV1tF7gf",
                    stream: true,
                    messages: messageList,
                }),
            }
        );
        return result;
    } catch (error) {
        throw error;
    }
}
