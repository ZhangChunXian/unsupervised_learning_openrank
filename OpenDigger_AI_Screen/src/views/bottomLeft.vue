<template>
    <div id="bottomLeft">
        <div class="bg-color-black">
            <div
                class="d-flex pt-2 pl-2"
                style="display: flex; align-items: center"
            >
                <span>
                    <icon name="chart-bar" class="text-icon"></icon>
                </span>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="star, issue, PR统计图 数据来源: X-lab2017/open-digger"
                    placement="top"
                >
                    <div class="d-flex" style="align-items: center">
                        <span class="font-size: 0.9rem; font-weight: bold"
                            >数据统计图</span
                        >
                        <!-- <dv-decoration-3 class="dv-dec-3" /> -->
                    </div>
                </el-tooltip>
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
            <div>
                <BottomLeftChart @update-cdata="updateCdata" />
            </div>
        </div>
    </div>
</template>

<script>
import BottomLeftChart from "@/components/echart/bottom/bottomLeftChart";
import { mapState } from "vuex";

export default {
    components: {
        BottomLeftChart,
    },
    data() {
        return {
            childCdata: {
                month: [
                    "2015-06", "2015-07", "2015-08", "2015-09", "2015-10",
                    "2015-11", "2015-12", "2016-01", "2016-02", "2016-03",
                    "2016-04", "2016-05", "2016-06", "2016-07", "2016-08",
                    "2016-09", "2016-10", "2016-11", "2016-12", "2017-01",
                    "2017-02", "2017-03", "2017-04", "2017-05", "2017-06",
                    "2017-07", "2017-08", "2017-09", "2017-10", "2017-11",
                    "2017-12", "2018-01", "2018-02", "2018-03", "2018-04",
                    "2018-05", "2018-06", "2018-07", "2018-08", "2018-09",
                    "2018-10", "2018-11", "2018-12", "2019-01", "2019-02",
                    "2019-03", "2019-04", "2019-05", "2019-06", "2019-07",
                    "2019-08", "2019-09", "2019-10", "2019-11", "2019-12",
                    "2020-01", "2020-02", "2020-03", "2020-04", "2020-05",
                    "2020-06", "2020-07", "2020-08", "2020-09", "2020-10",
                    "2020-11", "2020-12", "2021-01", "2021-02", "2021-03",
                    "2021-04", "2021-05", "2021-06", "2021-07", "2021-08",
                    "2021-09", "2021-10", "2021-11", "2021-12", "2022-01",
                    "2022-02", "2022-03", "2022-04", "2022-05", "2022-06",
                    "2022-07", "2022-08", "2022-09", "2022-10", "2022-11",
                    "2022-12", "2023-01", "2023-02", "2023-03", "2021-10-raw"
                ],
                starData: [
                    20, 421, 635, 234, 178, 331, 299, 324, 219, 508, 510, 550,
                    396, 505, 604, 559, 626, 1891, 1044, 724, 1089, 1232, 1064,
                    982, 1015, 1039, 1192, 990, 1266, 1358, 1747, 1998, 1112,
                    1686, 1284, 1379, 1279, 1348, 1351, 1265, 1039, 1184, 4138,
                    1653, 1176, 1653, 1667, 1538, 1301, 1729, 1439, 1145, 1223,
                    1097, 1131, 1155, 1270, 1280, 1210, 1155, 1128, 1172, 917,
                    918, 771, 859, 867, 860, 4689, 1382, 1054, 10744, 1181, 913,
                    784, 788, 857, 871, 1057, 1042, 1017, 908, 880, 882, 518,
                    554, 593, 506, 516, 804, 590, 644, 633, 745, 292
                ],
                forkData: [
                    3, 45, 91, 49, 42, 52, 70, 64, 35, 120, 122, 104, 100, 107,
                    155, 185, 169, 216, 233, 174, 282, 493, 386, 428, 455, 530,
                    532, 489, 459, 505, 618, 707, 416, 720, 559, 633, 601, 687,
                    662, 654, 576, 650, 1056, 927, 717, 962, 707, 689, 661, 847,
                    690, 547, 629, 611, 602, 490, 449, 761, 788, 718, 744, 776,
                    634, 669, 592, 700, 727, 616, 617, 687, 655, 662, 739, 754,
                    656, 719, 692, 682, 687, 569, 538, 704, 664, 595, 563, 608,
                    629, 594, 543, 674, 642, 596, 656, 388, 195
                ],
                issueData: [
                    13, 25, 66, 109, 61, 115, 145, 136, 105, 165, 208, 319, 272,
                    269, 285, 262, 330, 344, 297, 244, 313, 377, 305, 273, 314,
                    272, 272, 262, 213, 227, 307, 280, 169, 286, 263, 273, 263,
                    267, 276, 334, 263, 283, 379, 332, 262, 424, 407, 333, 311,
                    438, 368, 311, 281, 340, 354, 380, 316, 720, 634, 470, 406,
                    366, 350, 317, 317, 395, 351, 305, 229, 261, 250, 238, 277,
                    244, 208, 200, 226, 246, 258, 220, 157, 261, 224, 200, 211,
                    229, 231, 189, 152, 329, 335, 211, 198, 250, 66
                ]
            }
        };
    },
    methods: {
        updateCdata(newCdata) {
            this.childCdata = newCdata;
        },
        handleRepoAIClick() {
            this.$store.commit("setDrawerVisible", true);
            let message = `该项目为https://github.com/${
                this.$store.state.currentRepository
            }, 其中该项目每月的fork, star, issue数据为${JSON.stringify(
                this.childCdata
            )}, 其中month代表月份, starData代表star数量, forkData代表fork数量, issueData代表issue数量, 请分析该数据并给出分析结果`;
            this.$store.dispatch("sendChatMessage", message);
        },
    },
};
</script>

<style lang="scss" scoped>
$box-height: 520px;
$box-width: 100%;
#bottomLeft {
    padding: 20px 16px;
    height: $box-height;
    width: $box-width;
    border-radius: 5px;
    .bg-color-black {
        height: $box-height - 35px;
        border-radius: 10px;
    }
    .text {
        color: #c3cbde;
    }
    .chart-box {
        margin-top: 16px;
        width: 170px;
        height: 170px;
        .active-ring-name {
            padding-top: 10px;
        }
    }
}
</style>
