<template>
    <div id="centerRight2">
        <fullscreen
            v-model="fullscreen"
            :teleport="teleport"
            :page-only="pageOnly"
        >
            <div class="fullscreen-wrapper">
                <div className="bg-color-black">
                    <div
                        className="d-flex pt-2 pl-2"
                        style="align-items: center"
                    >
                        <el-tooltip
                            className="item"
                            effect="dark"
                            content="仓库关系图 数据来源: X-lab2017/open-digger"
                            placement="top"
                        >
                            <span
                                className="text"
                                style="font-size: 0.9rem; font-weight: bold"
                                >仓库关系图</span
                            >
                        </el-tooltip>
                        <el-button
                            @click="toggle"
                            circle="true"
                            icon="el-icon-full-screen"
                            size="mini"
                        ></el-button>
                        <el-button
                            style="
                                margin-left: 8px;
                                background-color: #4693eb;
                                padding: 8px;
                                width: 32px;
                                height: 32px;
                            "
                            size="mini"
                            circle
                            @click="handleRepoAIClick"
                        >
                            <img
                                src="@/assets/RepoAI_Logo.png"
                                style="width: 15px; height: 15px"
                                alt="RepoAI Logo"
                            />
                        </el-button>
                    </div>
                    <div
                        className="d-flex ai-center flex-column body-box"
                        ref="chartsMax"
                    >
                        <!--        <dv-capsule-chart class="dv-cap-chart" :config="config"  />-->
                        <CenterLeft2Index
                            v-show="!fullscreen"
                            :fullscreen="fullscreen"
                            @update-cdata="updateCdata"
                        ></CenterLeft2Index>
                        <CenterLeft2Index
                            v-show="fullscreen"
                            :fullscreen="fullscreen"
                            @update-cdata="updateCdata"
                        ></CenterLeft2Index>
                    </div>
                </div>
            </div>
        </fullscreen>
    </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import CenterLeft2Index from "./centerRight2Index.vue";
import { component } from "vue-fullscreen";

export default {
    components: {
        CenterLeft2Index,
        fullscreen: component,
    },
    data() {
        return {
            cdata: null,
            config: {
                data: [
                    {
                        name: "gmail",
                        value: 3529,
                    },
                    {
                        name: "qq",
                        value: 369,
                    },
                    {
                        name: "github",
                        value: 351,
                    },
                    {
                        name: "outlook",
                        value: 82,
                    },
                    {
                        name: "163",
                        value: 76,
                    },
                ],
                showValue: true,
            },
            fullscreen: false,
            teleport: true,
            pageOnly: false,
        };
    },
    computed: {
        ...mapState(["currentRepository"]),
    },
    watch: {
        currentRepository: {
            handler: async function (newVal) {
                this.config = await this.fetchData(
                    "https://oss.x-lab.info/open_digger/github/" + newVal
                );
            },
            deep: true,
        },
    },
    methods: {
        async fetchData(path) {
            let mailResponse = await axios.get(
                path + "/contributor_email_suffixes.json"
            );
            let mailData = mailResponse.data;

            return this.processData(mailData);
        },
        toggle() {
            this.fullscreen = !this.fullscreen;
        },

        processData(data) {
            const result = {};
            Object.values(data).forEach((arr) => {
                arr.forEach((item) => {
                    let [name, value] = item;

                    if (name === "users.noreply.github.com") {
                        name = "github.com";
                    }

                    const index = name.indexOf(".");
                    if (index !== -1) {
                        name = name.substring(0, index);
                    }

                    if (!result[name]) {
                        result[name] = 0;
                    }
                    result[name] += Number(value);
                });
            });
            let output = Object.entries(result)
                .filter(([, value]) => value >= 75)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            const configs = {
                data: output,
                showValue: true,
            };

            return configs;
        },
        handleRepoAIClick() {
            this.$store.commit("setDrawerVisible", true);
            let languageData = this.extractedData();
            console.log("languageData:", languageData);
            let message = `该项目为https://github.com/${
                this.$store.state.currentRepository
            }，该项目与其他项目的关系已经整理成了JSON数据, 其中value值越大代表越相关, 数据为${JSON.stringify(
                languageData
            )}，请分析该数据并给出详细结果`;
            this.$store.dispatch("sendChatMessage", message);
        },
        updateCdata(newCdata) {
            this.cdata = newCdata;
            this.extractedData();
        },
        extractedData() {
            if (!this.cdata) return;

            const extractedData = {
                data: this.cdata.data.map(item => ({
                    name: item.name,
                    value: item.value
                })),
                links: [...this.cdata.links]
            };

            return extractedData;
        },
    },
};
</script>

<style lang="scss" scoped>
#centerRight2 {
    $box-height: 410px;
    $box-width: 340px;
    padding: 5px;
    height: $box-height;
    width: $box-width;
    border-radius: 5px;

    .bg-color-black {
        padding: 5px;
        height: $box-height;
        width: $box-width;
        border-radius: 10px;
    }

    .text {
        color: #c3cbde;
    }

    .body-box {
        border-radius: 10px;
        overflow: hidden;

        .dv-cap-chart {
            width: 100%;
            height: 350px;
        }
    }
}

.fullscreen-wrapper {
    width: 100%;
    height: 100%;
    background: #0e1325;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .button {
        margin-bottom: 20px;
    }
}
</style>
