// ==UserScript==
// @name         gdlgxy广东理工学院网课脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  广东理工学院 长江雨课堂 网课自动化脚本
// @author       hqzqaq
// @icon         https://qn-next.xuetangx.com/16758372321856.jpg
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @match        https://*.yuketang.cn/pro/*
// @run-at       document-end
// @license      MIT
// @require https://cdn.bootcss.com/jquery/1.10.2/jquery.min.js
// ==/UserScript==


(function () {
    "use strict";
    // 刷新一下页面时间，单位为分钟
    const reloadTime = 10;
    // 倍速，可以分为0.5，1.0，1.25，1.5，2.0,一般默认情况为1
    const rate = 1;
    // 查询所有具有 "el-tooltip" 和 "leaf-detail" 两个 CSS 类名的元素
    const getElTooltipItemList = () => document.querySelectorAll(".el-tooltip.leaf-detail");
    const getElTooltipList = () => document.querySelectorAll(".el-tooltip.f12.item");
    // 静音
    const claim = () => {
        const volumeButton = document.querySelector("#video-box > div > xt-wrap > xt-controls > xt-inner > xt-volumebutton > xt-icon");
        volumeButton?.click();
    };
    // 点击具有指定类名和选择器的元素
    const clickElement = (className, selector) => {
        const mousemove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, view: window });
        document.querySelector(`.${className}`)?.dispatchEvent(mousemove);
        document.querySelector(selector)?.click();
    };
    // 设置视频播放速度
    const speed = () => {
        let keyt = '';
        if (rate === 2 || rate === 1) {
            keyt = `[keyt="${rate}.00"]`;
        } else {
            keyt = `[keyt="${rate}"]`;
        }
        clickElement("xt_video_player_speed", keyt);
    };
    // 定时器，查询元素并操作
    const getElementInterval = setInterval(() => {
        const elTooltipList = getElTooltipList();
        const elTooltipItemList = getElTooltipItemList();
        // 如果查询到了元素
        if (elTooltipList.length) {
            for (const [index, element] of elTooltipList.entries()) {
                const textContent = element.textContent;
                // 如果视频未开始或未读
                if (textContent === "未开始" || textContent === "未读") {
                    // 如果是习题、作业或已过期，则跳过
                    if (elTooltipItemList[index].innerText.includes('习题') || elTooltipItemList[index].innerText.includes('作业') || elTooltipItemList[index].children[1].children[0].innerText.includes("已过")) {
                        continue;
                    }
                    // 停止查询元素
                    clearInterval(getElementInterval);
                    // 保存当前网页地址
                    GM_setValue("rowUrl", window.location.href);
                    // 点击视频并关闭窗口
                    elTooltipItemList[index].click();
                    window.close();
                    break;
                }
            }
        }
    }, 1000);
    let video;
    // 定时器，查询视频并操作
    const videoPlay = setInterval(() => {
        video = document.querySelector(".xt_video_player");
        if (!video) {
            return;
        }
        // 延迟5秒设置视频播放速度
        setTimeout(() => speed(), 5000);
        // 静音
        claim();
        // 停止查询视频
        clearInterval(videoPlay);
    }, 500);
    // 定时器，查询视频播放状态并操作
    const playTimeOut = setInterval(() => {
        // 播放视频
        video?.play();
        // 如果音量不为0，则静音
        if (video?.volume !== 0) {
            claim();
        }
        // 查询视频播放进度
        const completeness = document.querySelector("#app > div.app-wrapper > div.wrap > div.viewContainer.heightAbsolutely > div > div.video-wrap > div > div > section.title > div.title-fr > div > div > span");
        const videoText = completeness?.innerHTML;
        if (videoText) {
            const succ = videoText.substring(4, videoText.length - 1);
            const succNum = parseInt(succ);
            // 如果播放进度超过95%，则跳转到保存的网页地址
            if (succNum >= 95) {
                const url = GM_getValue("rowUrl");
                if (url) {
                    clearInterval(playTimeOut);
                    window.location.replace(url);
                }
            }
        }
    }, 1000);
    // 定时器，查询阅读状态并进行操作
    const readInterval = setInterval(() => {
        const read = document.querySelector("#app > div.app-wrapper > div.wrap > div.viewContainer.heightAbsolutely > div > div.graph-wrap > div > div > section.title > div.title-fr > div > div");
        const readText = read?.innerHTML;
        // 如果阅读状态为"已读"，则跳转到保存的网页地址
        if (readText && readText.toString() === '已读') {
            clearInterval(readInterval);
            window.location.replace(GM_getValue("rowUrl"));
        }
    }, 1000);
    // 延迟一定时间后，如果有保存的网页地址，则跳转到该地址，否则刷新当前页面
    setTimeout(() => {
        if (GM_getValue("rowUrl")) {
            window.location.replace(GM_getValue("rowUrl"));
        }
        location.reload();
    }, reloadTime * 60 * 1000);
})();
