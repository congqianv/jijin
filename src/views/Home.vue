<template>
  <div class="home">
    <div class="left">
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
    </div>
    <div class="content">
      <div class="content-summary content-item flex-row">
        <div class="content-item-block content-item-big">
          累计持仓: {{ totalPrice }}
        </div>
        <div
          class="content-item-block content-item-big"
          :class="totalCount >= 0 ? 'color-red' : 'color-green'"
        >
          预估收益: {{ totalCount.toFixed(2) }}
        </div>
      </div>
      <div
        class="content-item"
        :class="item.gszzl > 0 ? 'color-red' : 'color-green'"
        v-for="(item, index) in fmtGuzhi"
        :key="index"
      >
        <div class="flex-row content-item-mobile">
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
  </div>
</template>

<script>
// @ is an alias to /src
import { jsonp } from 'vue-jsonp'
import { onMounted, reactive, computed, ref } from 'vue'

export default {
  name: 'Home',

  setup () {
    let isEdit = ref(true)
    let myJiJinList = ref([
      // '001410', '005176', '110022', '161725', '003634', '004477', '110011', '163402'
      // { code: '001410', hold: 18306.33 }, // 信达澳
      // { code: '005176', hold: 23288.05 }, // 富国医疗
      // { code: '110022', hold: 17240.99 }, // 易方达消费
      // { code: '161725', hold: 14094.55 }, // 白酒
      // { code: '003634', hold: 10712.29 },  // 嘉实农业
      // { code: '004477', hold: 0 },
      // { code: '110011', hold: 0 },
      // { code: '004642', hold: 0 },
      // { code: '320007', hold: 0 },
      // { code: '002190', hold: 0 },
      // { code: '167301', hold: 0 }
    ])
    let guzhiList = reactive([])
    let fmtGuzhi = computed(() => guzhiList.sort((a, b) => {
      return b.gszzl - a.gszzl
    }))
    let totalPrice = computed(() => myJiJinList.value.reduce((a, b) => { return a + b.hold }, 0))
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
      getListLocal()
    })

    function getListLocal () {
      const listFromLocal = JSON.parse(localStorage.getItem('jijinList'))
      console.log(listFromLocal)
      myJiJinList.value = listFromLocal || []
      if (!listFromLocal || listFromLocal.length === 0) {
        isEdit.value = true
      } else {
        isEdit.value = false
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
    }

    function toEdit () {
      isEdit.value = true
    }

    async function getData (code) {
      try {
        const result = await jsonp(`http://fundgz.1234567.com.cn/js/${code}.js`)
        console.log(result)
      } catch (e) {
        // console.log(e)
      }
    }

    return {
      handleReq,
      myJiJinList,
      guzhiList,
      fmtGuzhi,
      totalPrice: totalPrice.value.toFixed(2),
      totalCount,
      getListLocal,
      setListLocal,
      addList,
      toDel,
      isEdit,
      toSave,
      toEdit
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

@media screen and (max-width: 750px) {
  .left {
    display: none;
  }
  .content-item-mobile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
