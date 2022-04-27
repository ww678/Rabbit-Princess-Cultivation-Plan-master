// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({
  data: {
    openid: {},
    showUploadTip: false,
    nowDate: '',
    fallInLoveDate: '',
    powerList: [{
      title: '数据库',
      tip: '安全稳定的文档型数据库',
      showItem: true,
      item: [{
        title: '完成任务',
        page: 'toCompleteMission'
      }, {
        title: '兑换奖励',
        page: 'toExchangeRewards'
      }, {
        title: '查询记录',
        page: 'selectRecord'
      },
      {
        title: '任务管理',
        page: 'updateMission'
      },
      {
        title: '奖励管理',
        page: 'updateRewards'
      }
      ]
    }],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false,
    userIntegral: 0,
    operatorType: {
      COMPLETE_MISSION: 'complete mission',
      EXCHANGE_REWARDS: 'exchange rewards'
    }
  },

  onLoad() {
    this.getOpenId()
    // this.resetMission()
  },

  onShow() {
    this.selectUser();
    var nowDate = this.formatDateTime();
    var towDaysBetween = this.getNumberOfDays(wx.getStorageSync('fallInLoveDate'), nowDate);
    this.setData({
      nowDate: nowDate,
      towDaysBetween: towDaysBetween
    })
  },

  formatDateTime() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    return y + '-' + m + '-' + d;
  },

  getNumberOfDays(date1, date2) {//获得天数
    //date1：开始日期，date2结束日期
    var a1 = Date.parse(new Date(date1));
    var a2 = Date.parse(new Date(date2));
    var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
    return day
  },

  getOpenId() {
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        // 获取到用户的 openid
        console.log('云函数获取到的openid: ', res);
        wx.setStorageSync('openid', res.result.openid);
      }
    })
    // wx.cloud.callFunction({
    //   name: 'quickstartFunctions',
    //   config: {
    //     env: this.data.envId
    //   },
    //   data: {
    //     type: 'addUsers',
    //     data: {
    //       openid: wx.getStorageSync('openid')
    //     }
    //   }
    // }).then(resp => {
    // })
  },

  onClickPowerInfo(e) {
    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    powerList[index].showItem = !powerList[index].showItem;
    if (powerList[index].title === '数据库' && !this.data.haveCreateCollection) {
      this.onClickDatabase(powerList);
    } else {
      this.setData({
        powerList
      });
    }
  },

  onChangeShowEnvChoose() {
    wx.showActionSheet({
      itemList: this.data.envList.map(i => i.alias),
      success: (res) => {
        this.onChangeSelectedEnv(res.tapIndex);
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  onChangeSelectedEnv(index) {
    if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
      return;
    }
    const powerList = this.data.powerList;
    powerList.forEach(i => {
      i.showItem = false;
    });
    this.setData({
      selectedEnv: this.data.envList[index],
      powerList,
      haveCreateCollection: false
    });
  },

  jumpPage(e) {
    wx.navigateTo({
      url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
    });
  },

  onClickDatabase(powerList) {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.selectedEnv.envId
      },
      data: {
        type: 'createCollection'
      }
    }).then((resp) => {
      if (resp.result.success) {
        this.setData({
          haveCreateCollection: true
        });
      }
      this.setData({
        powerList
      });
      wx.hideLoading();
    }).catch((e) => {
      console.log(e);
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  selectUser() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'selectUser',
        data: {
          openid: wx.getStorageSync('openid')
        }
      }
    }).then((resp) => {
      console.log(resp)
      this.setData({
        userIntegral: resp.result.data[0].user_integral
      })
      wx.setStorageSync('userid', resp.result.data[0].user_id),
        wx.setStorageSync('fallInLoveDate', resp.result.data[0].love_date)
    }).catch((e) => {
    });
  },

  // resetMission() {
  //   wx.cloud.callFunction({
  //     name: 'quickstartFunctions',
  //     config: {
  //       env: this.data.envId
  //     },
  //     data: {
  //       type: 'selectOperator'
  //     }
  //   }).then((resp) => {
  //     const operatorData = resp.result.data.reverse();
  //     let lastMissionDate;
  //     operatorData.some(item => {
  //       if (item.operator_type === this.data.operatorType.COMPLETE_MISSION) {
  //         lastMissionDate = new Date(item.operator_time).getDate();
  //         return true
  //       }
  //       return false
  //     })
  //     const currentDate = new Date().getDate();
  //     console.log('lastMissionDate', lastMissionDate)
  //     console.log('currentDate', currentDate)
  //     if (lastMissionDate !== currentDate) {
  //       console.log('resetMission')
  //       wx.cloud.callFunction({
  //         name: 'quickstartFunctions',
  //         config: {
  //           env: this.data.envId
  //         },
  //         data: {
  //           type: 'resetMission'
  //         }
  //       }).then((resp) => {

  //       })
  //     }

  //   }).catch((e) => {
  //   });
  // }
});
