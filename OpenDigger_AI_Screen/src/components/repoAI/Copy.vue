<script>
import { Copy as IconCopy, Loading as IconLoading, CheckOne as IconCheckOne, CloseOne as IconCloseOne } from "@icon-park/vue";

export default {
    name: 'Copy',
    components: {
        IconCopy,
        IconLoading,
        IconCheckOne,
        IconCloseOne
    },
    props: {
        content: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            btnConfig: {
                size: 14,
                fill: "#999",
                theme: "outline"
            },
            btnTips: {
                copy: "复制全文",
                loading: "",
                success: "已复制到剪贴板！",
                error: "复制失败！"
            },
            btnStatus: "copy"
        }
    },
    methods: {
        copyToClipboard() {
            this.btnStatus = "loading";
            navigator.clipboard
                .writeText(this.content)
                .then(() => {
                    setTimeout(() => {
                        this.btnStatus = "success"
                    }, 150);
                })
                .catch(() => {
                    this.btnStatus = "error";
                })
                .finally(() => {
                    setTimeout(() => {
                        this.btnStatus = "copy"
                    }, 1500);
                });
        }
    }
}
</script>

<template>
    <div class="flex items-center cursor-pointer" @click="copyToClipboard">
        <icon-copy
            v-show="btnStatus === 'copy'"
            :theme="btnConfig.theme"
            :size="btnConfig.size"
            :fill="btnConfig.fill"
        />
        <icon-loading
            class="rotate"
            v-show="btnStatus === 'loading'"
            :theme="btnConfig.theme"
            :size="btnConfig.size"
            :fill="btnConfig.fill"
        />
        <icon-check-one
            v-show="btnStatus === 'success'"
            :theme="btnConfig.theme"
            :size="btnConfig.size"
            :fill="btnConfig.fill"
        />
        <icon-close-one
            v-show="btnStatus === 'error'"
            :theme="btnConfig.theme"
            :size="btnConfig.size"
            :fill="btnConfig.fill"
        />
        <span class="text-xs ml-0.5 text-gray-500 leading-none">{{
            btnTips[btnStatus]
        }}</span>
    </div>
</template>

<style scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.rotate {
    animation: spin 2s linear infinite;
}
</style>
