<template>
    <div id="index" ref="appRef">
        <div class="bg">
            <dv-loading v-if="loading">Loading...</dv-loading>
            <div v-else class="host-body">
                <div class="d-flex jc-center">
                    <dv-decoration-10 class="dv-dec-10" />
                    <div class="d-flex jc-center">
                        <dv-decoration-8
                            class="dv-dec-8"
                            :color="decorationColor"
                        />
                        <div class="title">
                            <span class="title-text"
                                >OpenDigger AI可视化大屏</span
                            >
                            <dv-decoration-6
                                class="dv-dec-6"
                                :reverse="true"
                                :color="['#50e3c2', '#67a1e5']"
                            />
                        </div>
                        <dv-decoration-8
                            class="dv-dec-8"
                            :reverse="true"
                            :color="decorationColor"
                        />
                    </div>
                    <dv-decoration-10 class="dv-dec-10-s" />
                </div>

                <!-- 第二行 -->
                <div class="d-flex jc-between px-2">
                    <div class="d-flex aside-width">
                        <div class="react-left ml-4 react-l-s">
                            <span class="react-left"></span>
                            <span class="text">作者: 张春贤</span>
                            <el-button
                                style="
                                    background-color: #4693eb;
                                    width: 32px;
                                    height: 32px;
                                    transform: skewX(-45deg)
                                "
                                size="mini"
                                circle
                                @click="handleIntroduceMyselfClick"
                            >
                                <img
                                    src="@/assets/RepoAI_Logo.png"
                                    style="width: 15px; height: 15px"
                                    alt="RepoAI Logo"
                                />
                            </el-button>
                        </div>
                        <div class="react-left ml-3">
                            <span class="text"
                                >华东师范大学数据科学与工程学院</span
                            >
                        </div>
                    </div>
                    <div class="d-flex aside-width">
                        <div class="react-right bg-color-blue mr-3">
                            <span class="text fw-b">{{
                                this.$store.state.currentRepository
                            }}</span>
                            <el-button
                                style="
                                    margin-left: 8px;
                                    background-color: #4693eb;
                                    padding: 8px;
                                    width: 32px;
                                    height: 32px;
                                    transform: skewX(45deg);
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
                            class="react-right mr-4 react-l-s"
                            style="
                                display: flex;
                                align-items: center;
                                justify-content: flex-end;
                            "
                        >
                            <!--              <span class="react-after"></span>-->
                            <!--              <span class="text">-->
                            <!--                <el-select-->
                            <!--                  v-model="value"-->
                            <!--                  filterable-->
                            <!--                  placeholder="请选择"-->
                            <!--                  @input="setCurrentRepository()"-->
                            <!--                >-->
                            <!--                  <el-option-->
                            <!--                    v-for="item in options"-->
                            <!--                    :key="item.value"-->
                            <!--                    :label="item.label"-->
                            <!--                    :value="item.label"-->
                            <!--                    >-->
                            <!--                  </el-option>-->
                            <!--                </el-select>-->
                            <!--                </span-->
                            <!--              >-->
                            <!-- <span class="react-after"></span> -->
                            <span
                                class="text"
                                style="
                                    padding-right: 30px;
                                    transform: skewX(45deg);
                                "
                            >
                                <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="输入格式: Github用户名/仓库名. 支持查询未在候选列表的仓库"
                                    placement="top"
                                >
                                    <el-row>
                                        <el-col :span="24">
                                            <el-autocomplete
                                                v-model="state1"
                                                prefix-icon="el-icon-search"
                                                :fetch-suggestions="querySearch"
                                                placeholder="请输入仓库名"
                                                @select="handleSelect"
                                                @change="handleSelect"
                                                clearable
                                            ></el-autocomplete>
                                        </el-col>
                                    </el-row>
                                </el-tooltip>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="body-box">
                    <!-- 第三行数据 -->
                    <div class="content-box">
                        <div>
                            <dv-border-box-12>
                                <centerLeft1 />
                            </dv-border-box-12>
                        </div>
                        <div>
                            <dv-border-box-12>
                                <centerLeft2 />
                            </dv-border-box-12>
                        </div>
                        <!-- 中间 -->
                        <div>
                            <center />
                        </div>
                        <!-- 中间 -->
                        <div>
                            <centerRight2 />
                        </div>
                        <div>
                            <dv-border-box-13>
                                <centerRight1 />
                            </dv-border-box-13>
                        </div>
                    </div>

                    <!-- 第四行数据 -->
                    <div class="bottom-box">
                        <dv-border-box-13>
                            <bottomLeft />
                        </dv-border-box-13>
                        <dv-border-box-12>
                            <bottomRight />
                        </dv-border-box-12>
                    </div>
                </div>
            </div>
        </div>
        <!-- 悬浮按钮 -->
        <el-button
            class="floating-button"
            type="info"
            size="large"
            @click="$store.commit('setDrawerVisible', true)"
            icon="el-icon-search"
            circle
        >
        </el-button>

        <!-- 抽屉组件 -->
        <el-drawer
            :visible.sync="$store.state.drawerVisible"
            size="30%"
            direction="rtl"
            :close-on-click-modal="true"
        >
            <!-- 添加关闭按钮 -->
            <el-button
                class="drawer-close-btn"
                type="text"
                icon="el-icon-close"
                @click="$store.commit('setDrawerVisible', false)"
                circle
            />
            <repoAI></repoAI>
        </el-drawer>
    </div>
</template>

<script>
import drawMixin from "../utils/drawMixin";
import { formatTime } from "../utils/index.js";
import centerLeft1 from "./centerLeft1";
import centerLeft2 from "./centerLeft2";
import centerRight1 from "./centerRight1";
import centerRight2 from "./centerRight2";
import center from "./center";
import bottomLeft from "./bottomLeft";
import bottomRight from "./bottomRight";
import axios from "axios";
import repoAI from "./repoAI";
import { mapState } from "vuex";

export default {
    mixins: [drawMixin],
    data() {
        return {
            options: this.$store.state.Repositories,
            timing: null,
            loading: true,
            dateDay: null,
            dateYear: null,
            dateWeek: null,
            weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            decorationColor: ["#568aea", "#000000"],
            value: "",
            state1: "",
            repositories: [],
        };
    },
    components: {
        centerLeft1,
        centerLeft2,
        centerRight1,
        centerRight2,
        center,
        bottomLeft,
        bottomRight,
        repoAI,
    },
    mounted() {
        this.timeFn();
        this.cancelLoading();
        this.repositories = this.$store.state.Repositories;
    },
    beforeDestroy() {
        clearInterval(this.timing);
    },
    methods: {
        timeFn() {
            this.timing = setInterval(() => {
                this.dateDay = formatTime(new Date(), "HH: mm: ss");
                this.dateYear = formatTime(new Date(), "yyyy-MM-dd");
                this.dateWeek = this.weekday[new Date().getDay()];
            }, 1000);
        },
        cancelLoading() {
            setTimeout(() => {
                this.loading = false;
            }, 500);
        },
        setCurrentRepository() {
            this.$store.commit("setCurrentRepository", this.value);
        },
        querySearch(queryString, cb) {
            var repositories = this.repositories.map((item) => {
                return {
                    value: item.label,
                    label: item.value,
                };
            });
            var results = queryString
                ? repositories.filter(this.createFilter(queryString))
                : repositories;
            // 调用 callback 返回建议列表的数据
            cb(results);
        },
        createFilter(queryString) {
            return (repository) => {
                return repository.value.indexOf(queryString) === 0;
            };
        },
        handleSelect(item) {
            if (typeof item == "string") {
                if (this.state1) {
                    if (this.checkRepoValidity(this.state1)) {
                        this.$store.commit("setCurrentRepository", this.state1);
                    }
                }
            } else {
                this.$store.commit("setCurrentRepository", item.value);
            }
        },
        checkRepoValidity(link) {
            return axios
                .get(
                    `https://oss.x-lab.info/open_digger/github/` +
                        link +
                        "/stars.json"
                )
                .then((response) => {
                    if (response.status === 200) {
                        return 1;
                    } else {
                        this.$message.error(
                            "您输入的仓库名无效, 请检查后重新输入"
                        );
                        return 0;
                    }
                })
                .catch(() => {
                    this.$message.error("您输入的仓库名无效, 请检查后重新输入");
                    return 0;
                });
        },
        handleClose(done) {
            this.$confirm("确认关闭？")
                .then((_) => {
                    done();
                })
                .catch((_) => {});
        },

        handleRepoAIClick() {
            this.$store.commit("setDrawerVisible", true);
            let message = `该项目为https://github.com/${this.$store.state.currentRepository}，请给不了解该项目的用户详细介绍该项目`;
            this.$store.dispatch("sendChatMessage", message);
        },
        handleIntroduceMyselfClick() {
            this.$store.commit("setDrawerVisible", true);
            let message = `这是RepoAI的作者张春贤, 来自华东师范大学数据科学与工程学院, Github主页为https://github.com/ZhangChunXian, 请介绍作者, 并对用户表示欢迎`;
            this.$store.dispatch("sendChatMessage", message);
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/index.scss";

// 添加以下样式来覆盖 el-drawer 的默认背景色
:deep(.el-drawer) {
    background: #121212;
    .el-drawer__body {
        height: 100%;
        padding: 0;
    }
}

::v-deep .el-drawer {
    background: #121212;
    .el-drawer__body {
        height: 100%;
        padding: 0;
        overflow: hidden;
    }
}

// 消息确认框暗黑模式
.confirm-box {
    background-color: #1e1e1e !important;
    border-color: #333 !important;

    &__title {
        color: #fff !important;
    }

    &__content {
        color: #ccc !important;
    }

    &__header {
        background-color: #1e1e1e !important;
    }

    .el-button {
        background: #2b2b2b !important;
        border-color: #444 !important;
        color: #fff !important;

        &:hover {
            background: #363636 !important;
            border-color: #555 !important;
        }

        &--primary {
            background: #409eff !important;
            border-color: #409eff !important;

            &:hover {
                background: #66b1ff !important;
                border-color: #66b1ff !important;
            }
        }
    }
}

// 添加关闭按钮样式
.drawer-close-btn {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 20px;
    color: #909399;
    z-index: 1;

    &:hover {
        color: #fff;
    }
}

.react-left {
    &.react-l-s {
        width: 700px;
        text-align: left;
        display: flex;
        align-items: center;
    }
    font-size: 18px;
    width: 500px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    transform: skewX(45deg);
    background-color: #0f1325;

    .react-left {
        position: absolute;
        left: -25px;
        top: 0;
        height: 50px;
        width: 50px;
        background-color: #0f1325;
        transform: skewX(-45deg);
    }

    .text {
        display: inline-block;
        transform: skewX(-45deg);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
