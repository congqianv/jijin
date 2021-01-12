<template>
  <div class="home">
    <div
      class="left"
      :class="showLeft ? 'left-mobile' : ''"
      v-if="isPc || showLeft"
    >
      <div
        class="left-item flex-row"
        v-for="(item, index) in myJiJinList"
        :key="index"
      >
        <input
          class="left-item-ipt"
          v-model="item.code"
          :disabled="!isEdit"
          type="number"
          placeholder="基金代码"
        />
        <input
          class="left-item-ipt"
          v-model="item.hold"
          :disabled="!isEdit"
          type="number"
          placeholder="持仓金额"
        />
        <img
          src="@/assets/del.png"
          @click="toDel(index)"
          class="del-icon"
          v-if="isEdit"
        />
      </div>
      <div
        class="flex-row"
        style="margin-top: 40px"
        v-if="myJiJinList.length > 0 && !isEdit"
      >
        <div class="btn" @click="toEdit">修改</div>
        <div class="btn btn-default" @click="handleReq">查询</div>
      </div>
      <div class="flex-row" style="margin-top: 40px" v-else>
        <div class="btn" @click="addList">新增</div>
        <div class="btn btn-default" @click="toSave">保存</div>
      </div>
      <div
        class="flex-row"
        style="margin-top: 10px"
        v-if="myJiJinList.length === 0 || !isEdit"
      >
        <div class="btn" @click="showImport = true">导入</div>
        <div class="btn btn-default" @click="toExport">导出</div>
      </div>
      <div class="tip">
        本项目依赖本地缓存,更换设备需要重新新增基金,觉得麻烦可以在旧设备点击导出,然后在新设备点击导入
      </div>

      <div v-if="showImport">
        <textarea
          class="import-ipt"
          v-model="importValue"
          placeholder="请粘贴复制的数据"
        ></textarea>
        <div class="btn btn-default" style="margin: 0" @click="toImport">
          确定
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-summary content-item flex-row">
        <div class="content-item-block content-item-big">
          累计持仓: {{ totalPrice.toFixed(2) }}
        </div>
        <div
          class="content-item-block content-item-big"
          :class="totalCount >= 0 ? 'color-red' : 'color-green'"
        >
          预估收益: {{ totalCount.toFixed(2) }}
        </div>
        <div class="flex-row content-item-block content-item-big" :class="totalCount >= 0 ? 'color-red' : 'color-green'">
          <img class="arrow up" src="@/assets/up.png" v-if="totalCount >= 0" />
          <img class="arrow down" src="@/assets/down.png" v-else />
          {{ (totalCount / totalPrice).toFixed(4) }}
        </div>
      </div>
      <div
        class="content-item"
        :class="item.gszzl > 0 ? 'color-red' : 'color-green'"
        v-for="(item, index) in fmtGuzhi"
        :key="index"
      >
        <div class="flex-row" :class="isPc ? '' : 'content-item-mobile'">
          <div class="content-item-block">
            {{ item.name }}
          </div>
          <div class="content-item-block">持仓: {{ item.hold }}</div>
          <div class="content-item-block" v-if="item.gszzl > 0">
            涨幅: +{{ item.gszzl }}
          </div>
          <div class="content-item-block" v-else>涨幅: {{ item.gszzl }}</div>
          <div class="content-item-block fwb">预估收益: {{ item.got }}</div>
        </div>
        <div class="content-item-small flex-row">
          <div class="content-item-block">{{ item.fundcode }}</div>
          <div class="content-item-block">{{ item.gztime }}</div>
        </div>
      </div>
    </div>
    <img
      class="menu"
      @click="showLeft = !showLeft"
      v-if="!isPc"
      src="@/assets/menu.png"
    />
    <input class="copy" />
    <div class="toast" v-if="toastContent">{{ toastContent }}</div>
  </div>
</template>

<script>
// @ is an alias to /src
import { jsonp } from 'vue-jsonp'
import { onMounted, reactive, computed, ref } from 'vue'

export default {
  name: 'Home',

  setup () {
    let isPc = ref(true)
    let showLeft = ref(false)
    let showImport = ref(false)
    let toastContent = ref('')
    let importValue = ref('')
    let isEdit = ref(true)
    let myJiJinList = ref([])
    let guzhiList = reactive([])
    let fmtGuzhi = computed(() => guzhiList.sort((a, b) => {
      return b.gszzl - a.gszzl
    }))
    let totalPrice = computed(() => myJiJinList.value.reduce((a, b) => { return a + +b.hold }, 0))
    let totalCount = computed(() => guzhiList.reduce((a, b) => { return a + +b.got }, 0))

    window.jsonpgz = function (item2) {
      myJiJinList.value.forEach(item => {
        if (item.code === item2.fundcode) {
          item2.hold = item.hold
          item2.got = (item.hold * item2.gszzl / 100).toFixed(2)
          guzhiList.push(item2)
        }
      })
    }

    onMounted(() => {
      isPc.value = isPC()
      getListLocal()
    })

    function isPC () {
      let userAgentInfo = navigator.userAgent;
      let Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    }

    function getListLocal () {
      const listFromLocal = JSON.parse(localStorage.getItem('jijinList'))
      myJiJinList.value = listFromLocal || []
      if (!listFromLocal || listFromLocal.length === 0) {
        isEdit.value = true
      } else {
        isEdit.value = false
        handleReq()
      }
    }

    function setListLocal () {
      if (myJiJinList.value.length === 0) return
      for (let i = 0, len = myJiJinList.value.length; i < len; i++) {
        if (!myJiJinList.value[i].hold) {
          myJiJinList.value[i].hold = 0
        }
        if (!myJiJinList.value[i].code) {
          return
        }
      }
      localStorage.setItem('jijinList', JSON.stringify(myJiJinList.value))
      isEdit.value = false
      showLeft.value = false
      handleReq()
    }

    function addList () {
      myJiJinList.value.push({
        code: '',
        hold: ''
      })
    }

    function toDel (index) {
      myJiJinList.value.splice(index, 1)
    }

    function toSave () {
      this.setListLocal()
    }

    function handleReq () {
      guzhiList.length = 0
      myJiJinList.value.forEach(item => {
        getData(item.code)
      })
      showLeft.value = false
    }

    function toEdit () {
      isEdit.value = true
    }

    async function getData (code) {
      try {
        const result = await jsonp(`https://fundgz.1234567.com.cn/js/${code}.js`)
        console.log(result)
      } catch (e) {
        // console.log(e)
      }
    }

    function toExport () {
      var copyIpt = document.querySelector(".copy");
      copyIpt.value = JSON.stringify(myJiJinList.value)
      copyIpt.select(); // 选择对象
      document.execCommand("Copy");
      toastContent.value = '导出成功,请更换设备点击导入'
      setTimeout(() => {
        toastContent.value = ''
      }, 3000);
    }

    function toImport () {
      myJiJinList.value = JSON.parse(importValue.value)
      setListLocal()
      showImport.value = false
    }

    return {
      handleReq,
      myJiJinList,
      guzhiList,
      fmtGuzhi,
      totalPrice,
      totalCount,
      getListLocal,
      setListLocal,
      addList,
      toDel,
      isEdit,
      toSave,
      toEdit,
      isPc,
      showLeft,
      toExport,
      toImport,
      toastContent,
      importValue,
      showImport
    }
  }
}
</script>

<style lang="less" scoped>
.flex-row {
  display: flex;
  align-items: center;
}

.flex-start {
  display: flex;
  align-items: flex-start;
}

.home {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;

  .left,
  .content {
    padding: 20px 20px;
    height: 100%;
    overflow: auto;
  }
}

.left {
  flex: 3;
  box-shadow: 10px 0 30px #c7cadb;

  &-mobile {
    position: fixed;
    background: #fff;
    z-index: 10;
    width: 100vw;
  }

  &-item {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(145deg, #d6d7d9, #ffffff);
    box-shadow: 10px 10px 30px #cacbcd, -10px -10px 30px #ffffff;
    padding: 8px 20px;
    margin-bottom: 15px;

    &-ipt {
      width: 50%;
      height: 100%;
      border: none;
      background: none;
      outline: none;

      &:nth-child(1) {
        margin-right: 20px;
      }
    }
  }
}

.content {
  flex: 7;

  &-summary {
    position: sticky;
    top: 0;
    left: 0;
  }

  &-item {
    padding: 10px 30px;
    border-radius: 10px;
    background: linear-gradient(145deg, #d6d7d9, #ffffff);
    box-shadow: 10px 10px 30px #cacbcd, -10px -10px 30px #ffffff;
    margin-bottom: 20px;

    &-small {
      font-size: 12px;
      opacity: 0.7;
      color: #333;
    }

    &-big {
      font-size: 16px;
      font-weight: bold;
    }

    &-block {
      margin-right: 20px;
    }
  }
}

.btn {
  flex: 1;
  width: 100%;
  height: 40px;
  text-align: center;
  line-height: 40px;
  border-radius: 4px;
  font-weight: bold;
  border: 1px solid #ececec;
  flex: 1;
  cursor: pointer;

  &-default {
    background: #2d8cf0;
    color: #fff;
    margin-left: 20px;
  }
}

.del-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-left: 10px;
}

.color {
  &-red {
    color: red;
  }

  &-green {
    color: green;
  }
}

.fwb {
  font-weight: bold;
}

.menu {
  position: fixed;
  bottom: 40px;
  left: 30px;
  width: 32px;
  z-index: 20;
}

.content-item-mobile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tip {
  font-size: 12px;
  color: #333;
  opacity: 0.7;
  margin-top: 10px;
}

.copy {
  position: fixed;
  top: -1000vh;
  // display: none;
}

.toast {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  margin: auto;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  width: fit-content;
  padding: 4px 6px;
  border-radius: 6px;
}

.import-ipt {
  margin-top: 20px;
  width: 100%;
  height: 40px;
  border: none;
  outline: none;
}

.arrow {
  width: 43px;
  height: 24px;
  transform: scale(0.6);
  margin-right: -8px;
  margin-bottom: 3px;
}

.down {
  transform: scale(0.6) rotate(180deg);
}
</style>
