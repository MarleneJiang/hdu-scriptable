// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: angle-double-right;
//
// iOS 桌面组件脚本 @「妙妙屋」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
//

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { Base } = require("./「妙妙屋」开发环境");

// @组件代码开始

class Widget extends Base {
  constructor(arg) {
    super(arg);
    this.logo = "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/%E6%AF%8F%E6%97%A5%E5%A7%94%E6%89%98.png";
    this.name = "每日委托";
    this.background = "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/background_2.png";
    this.desc = "hdu all in one";
    this.autoUpdate = true; // 是否自动更新,魔改用户不想被更新替换可以这里设置为false
    // 当前设置的存储key（提示：可通过桌面设置不同参数，来保存多个设置）
    let _md5 = this.md5(module.filename);
    this.CACHE_KEY = `cache_${_md5}`;

    this.scripts = {
      moduleName: "「妙妙屋」杭电课表",
      url: "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/%E3%80%8C%E5%A6%99%E5%A6%99%E5%B1%8B%E3%80%8D%E8%AF%BE%E7%A8%8B%E8%A1%A8.js",
      version: "1.1.4",
    };
    
    // 初始化账户
    this.registerAction("设置数字杭电账户", this.setUser);
    this.registerAction("设置大物实验账户", this.setExptPwd);
    // 注册操作菜单
    this.registerAction("个性化设置", this.setWidget);


  }

  async isUsingDarkAppearance() {
    const wv = new WebView();
    let js =
      "(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)";
    let r = await wv.evaluateJavaScript(js);
    return r;
  }

  async renderError(data){
    let w = new ListWidget();
    w.backgroundImage = await this.shadowImage(await (new Request (this.background)).loadImage(),'#000000',0.2);
    w.addSpacer();
    let body = w.addStack();
    body.layoutVertically();
    let error = body.addText(data);
    error.font = Font.boldSystemFont(16);
    error.textColor = new Color("#ffffff");
    let fresh_time = body.addText("更新时间:" + new Date().toLocaleString());
    fresh_time.font = Font.semiboldSystemFont(14);
    fresh_time.textColor = new Color("#ffffff");
    body.addSpacer(6);
    w.addSpacer();
    w.url = this.actionUrl("settings");
    return w;
  }

  // 渲染组件
  async render() {
    if (!this.settings["hdu_username"] || !this.settings["hdu_password"]) {
      return await this.renderError("请先设置数字杭电账户.")
    }
    let data = [];
    data = await this.getData();
    if(data['code'] !=0){
      return await this.renderError(data['message']);
    }
    this.thisWeek = data['data'].week;
    data = data['data'].list;
    

//     if("日一二三四五六".charAt(new Date().getDay()) == "六" || "日一二三四五六".charAt(new Date().getDay()) == "日"){
//       return await this.renderError("周末的课被派蒙吃掉啦~");
//     }
    if (data.length == 0) {
      return await this.renderError("怎么办,委托都丘丘人被吃掉啦！")
    }
    if (this.widgetFamily === "large") {
      return await this.renderWidget(data, 5);
    } else {
      return await this.renderWidget(data, 1);
    }
  }

  async renderWidget(data, data_num) {
    let w = new ListWidget();
    w.backgroundImage = await this.shadowImage(await (new Request (!!this.settings["background"] ? this.settings["background"] : this.background)).loadImage(),'#000000',0.2);

    let finish_num = 0;
    const startTime = [
      [8, 5],
      [8, 55],
      [10, 0],
      [10, 50],
      [11, 40],
      [13, 30],
      [14, 20],
      [15, 15],
      [16, 5],
      [18, 30],
    ];
    const startTimeString = [
      "8:05",
      "8:55",
      "10:00",
      "10:50",
      "11:40",
      "13:30",
      "14:20",
      "15:15",
      "16:05",
      "18:30",
    ];
    let Courses = [];
    for(let course of data){
      if (this.widgetFamily === "large") {
        if (!compareNowTime(startTime[course.startSection - 1])) {
          finish_num++;
        }
        course['startTimeString'] = startTimeString[course.startSection - 1];
        course=await this.setExpt(course);
        course['url']= `https://skl.hduhelp.com/#/call/course`;
        Courses.push(course);
      } else {
        if (compareNowTime(startTime[course.startSection - 1])) {
          course['startTimeString'] = startTimeString[course.startSection - 1];
          course=await this.setExpt(course);
          course['url']= `https://skl.hduhelp.com/#/call/course`;
          Courses.push(course);
        } else {
          finish_num++;
        }
      }
    }
    await this.renderHeader(
      w,
      !!this.settings["logo"] ? this.settings["logo"] : this.logo ,
      !!this.settings["title"] ? this.settings["title"] : this.name +
      "(" +
      finish_num.toString() +
      "/" +
      data.length.toString() +
      ")" +
      "  " +
      "周" +
      "日一二三四五六".charAt(new Date().getDay()),
      new Color("#ffffff")
    );
    w.addSpacer();
    let body = w.addStack();
    let bodyleft = body.addStack();
    bodyleft.layoutVertically();
    let length = Courses.length;
    if (length > data_num) {
      length = data_num;
    }
    if (length != 0) {
      for (let i = 0; i < length; i++) {
        bodyleft = await this.renderCell(bodyleft, Courses[i]);
        bodyleft.addSpacer(6);
      }
    } else {
      bodyleft.addSpacer();
      let username = bodyleft.addText("旅行者");
      username.font = Font.boldSystemFont(15);
      username.textColor = new Color("#ffffff");
      let noCourse = bodyleft.addText("感谢你完成了今天的委托~");
      noCourse.font = Font.semiboldSystemFont(14);
      noCourse.textColor = new Color("#ffffff");
      let fresh_time = bodyleft.addText(
        "更新时间:" + new Date().toLocaleString()
      );
      fresh_time.font = Font.semiboldSystemFont(14);
      fresh_time.textColor = new Color("#ffffff");
      bodyleft.addSpacer();
    }
    bodyleft.addSpacer();
    w.url = this.actionUrl("settings");

    return w;
  }
  async renderCell(widget, course) {
    let body = widget.addStack();

    body.setPadding(10, 10, 10, 10);
    // body.backgroundColor = Color.dynamic(Color.white(), new Color("#2c2c2d"));

    body.backgroundColor = new Color("#ffffff", 0.9);
    body.cornerRadius = 10;
    body.url = this.actionUrl("open-url", course["url"]);
    let left = body.addStack();
    left.layoutVertically();
    let content = left.addText(course["courseName"]);
    content.font = Font.systemFont(14);
    content.textColor = new Color("#000000");
    content.lineLimit = 2;

    left.addSpacer(5);

    let info = left.addText(
      `限时${course['startTimeString']} 第${course["startSection"]}-${course["endSection"]}节 ${course["classRoom"]}`
    );
    info.font = Font.lightSystemFont(10);
    info.textColor = new Color("#000000");
    info.textOpacity = 0.6;
    info.lineLimit = 2;

    body.addSpacer();

    return widget;
  }

  async getData() {
    await this.updateVersion();
    // 解析设置，判断类型，获取对应数据
    return await this.getDataForToday(
      this.settings["hdu_username"],
      this.settings["hdu_password"]
    );
  }

  /**
   * 获取课表数据、
   */
  async getDataForToday(
    username,
    password
  ) {
    let url = `https://lis.marlene.top/getSklTodayCourse?username=${username}&password=${password}&sourse=ios`;
    let arr = await this.fetchAPI(url);
    return arr;
  }

  /**
   * 获取课表数据、
   */
  async getExpt(
    username,
    expt_pwd
  ) {
    let url = `https://lis.marlene.top/getPhy?username=${username}&expt_pwd=${expt_pwd}&sourse=ios`;
    let arr = await this.fetchAPI(url);

    if(arr.code!=0){
      if(expt_pwd!='123456'){
        this.notify(
          "大物实验数据获取失败",
          arr.message,
          "https://support.qq.com/products/452934"
        );
      }
      return [];
    }
    return arr.data;
  }

  async setExpt(course){
    if(course.classRoom=="大学物理实验中心"){
      const reg = /第(.*)周：/;
      let exptData = await this.getExpt(this.settings["hdu_username"],!!this.settings["expt_pwd"]?this.settings["expt_pwd"]:'123456');
      exptData.forEach((expt,index)=>{
        const weekDay = (reg.exec(expt.time))[1];
        if(weekDay==this.thisWeek.toString()){
          course.courseName = expt.course;
          course.teacherName = expt.teacher;
          course.classRoom = expt.place;
        }
      })
    }
    return course
  }

  // http.get
  async fetchAPI(api, json = true) {
    let data = null;
    try {
      let req = new Request(api);
      req.headers = {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/85.0.4183.102",
      };
      data = await (json ? req.loadJSON() : req.loadString());
    } catch (e) { }
    // 判断数据是否为空（加载失败）
    if (!data) {
      // 判断是否有缓存
      if (Keychain.contains(this.CACHE_KEY)) {
        let cache = Keychain.get(this.CACHE_KEY);
        return json ? JSON.parse(cache) : cache;
      } else {
        // 刷新
        return null;
      }
    }
    // 存储缓存
    Keychain.set(this.CACHE_KEY, json ? JSON.stringify(data) : data);
    return data;
  }
  async actionOpenUrl(url) {
    Safari.openInApp(url, false);
  }

  async setUser() {
    const a = new Alert();
    a.title = "账户设置";
    a.message = "设置数字杭电账户";
    a.addTextField("学号");
    a.addSecureTextField("密码");
    a.addAction("确定");
    a.addCancelAction("取消");
    const i = await a.presentAlert();
    if (i == -1) {
      return;
    }
    if (!a.textFieldValue(0) || !a.textFieldValue(1)) {
      const b = new Alert();
      b.title = "错误，账户或密码为空";
      b.message = "请重新设置";
      b.addAction("确定");
      await b.presentAlert();
      return;
    } else {
      this.settings["hdu_username"] = a.textFieldValue(0);
      this.settings["hdu_password"] = a.textFieldValue(1);
      this.saveSettings(true);
    }
  }

  async setExptPwd() {
    const a = new Alert();
    a.title = "账户设置";
    a.message = "设置大物实验账户密码";
    a.addSecureTextField("密码");
    a.addAction("确定");
    a.addCancelAction("取消");
    const i = await a.presentAlert();
    if (i == -1) {
      return;
    }
    if (!a.textFieldValue(0)) {
      const b = new Alert();
      b.title = "错误，密码为空";
      b.message = "请重新设置";
      b.addAction("确定");
      await b.presentAlert();
      return;
    } else {
      this.settings["expt_pwd"] = a.textFieldValue(0);
      this.saveSettings(true);
    }
  }


  async setWidget(){
    const a = new Alert();
    a.title = "个性化设置";
    a.message = "设置logo/标题/背景";
    a.addTextField("logo",this.settings["logo"]);
    a.addTextField("标题",this.settings["title"]);
    a.addTextField("背景",this.settings["background"]);
    a.addAction("确定");
    a.addCancelAction("取消");
    const i = await a.presentAlert();
    if (i == -1) {
      return;
    }
    if (!!a.textFieldValue(0)) {
      this.settings["logo"] = a.textFieldValue(0);
    }
    if (!!a.textFieldValue(1)) {
      this.settings["title"] = a.textFieldValue(1);
    }
    if (!!a.textFieldValue(2)) {
      this.settings["background"] = a.textFieldValue(2);
    }
    this.saveSettings(true);
  }

  async actionSettings(){
    // 弹出选择菜单
    const actions = this._actions
    const _actions = [
      async () => {
        Safari.openInApp("https://support.qq.com/products/452934", false)
      }
    ]
    const alert = new Alert()
    alert.title = this.name
    alert.message = this.desc
    alert.addAction("反馈交流")
    for (let _ in actions) {
      alert.addAction(_)
      _actions.push(actions[_])
    }
    alert.addCancelAction("取消操作")
    const idx = await alert.presentSheet()
    if (_actions[idx]) {
      const func = _actions[idx]
      await func()
    }
    return
}

  async updateVersion() {
    const vreq = new Request(
      "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/scriptVersion.json?_=" +
      +new Date()
    );
    const p = await vreq.loadJSON();
    if (
      p[this.scripts.moduleName] &&
      p[this.scripts.moduleName].version > this.scripts.version &&
      this.autoUpdate
    ) {
      const URL = p[this.scripts.moduleName].url + "?_=" + +new Date();
      const req = new Request(URL);
      const res = await req.loadString();

      const NAME = this.scripts.moduleName;

      const FPATH = FileManager.local().documentsDirectory() + `/${NAME}.js`;
// 這裏不能格式化，否則會報錯！！
      const js = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: map-pin;
/************************
        「妙妙屋」
    致力于杭电生活一卡通
问题反馈：https://support.qq.com/products/452934
*************************/

module.__DEBUG__ = false;
module.__VERSION__ = '${p[NAME].version}';
${res}`;
      FileManager.local().writeString(FPATH, js);
      try {
        const RPATH = FileManager.iCloud().documentsDirectory() + `/${NAME}.js`;
        FileManager.iCloud().writeString(RPATH, js);
      } catch (e) {
        console.log("pass icloud..");
      }
      if (FileManager.local().fileExists(FPATH)) {
        this.notify(
          "更新成功",
          this.scripts.moduleName +
          "小组件已更新至" +
          p[this.scripts.moduleName].version +
          "！稍后刷新生效。有任何问题欢迎反馈！",
          "https://support.qq.com/products/452934"
        );
      } else {
        this.notify(
          "更新失败",
          "更新失败!请手动更新。",
          p[NAME].url
        );
      }
    }
  }
}

function compareNowTime(time) {
  const nowTime = getChineseDate();
  const time2 = nowTime.getHours() * 60 + nowTime.getMinutes();
  const time1 = time[0] * 60 + time[1];
  if (time1 < time2) {
    return false;
  } else {
    return true;
  }
}

function getChineseDate() {
  return new Date(
    new Date().getTime() +
    new Date().getTimezoneOffset() * 60 * 1000 +
    8 * 60 * 60 * 1000
  );
}

// @组件代码结束

const { Testing } = require("./「妙妙屋」开发环境");
await Testing(Widget);

//node pack.js Scripts/「源码」课程表.js
//node encode.js Dist/「妙妙屋」课程表.js
