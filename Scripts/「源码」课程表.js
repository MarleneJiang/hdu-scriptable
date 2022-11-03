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
    this.logo =
      "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/logo.png";
    this.name = "每日委托";
    this.desc = "hdu all in one";
    // 请求数据接口列表（收集整理中）
    this.API = [
      // today
      [
        {
          id: "withoutExpt",
          expt: false,
          name: "不获取大物实验详情",
        },
        {
          id: "withExptDefault",
          expt: true,
          name: "获取大物实验课详情(使用默认密码)",
        },
        {
          id: "withExpt",
          expt: true,
          name: "获取大物实验课详情(设置密码)",
        },
      ],
      // now
      [
        {
          id: "withoutExpt",
          expt: false,
          name: "不获取大物实验详情",
        },
        {
          id: "withExptDefault",
          expt: true,
          name: "获取大物实验课详情(使用默认密码)",
        },
        {
          id: "withExpt",
          expt: true,
          name: "获取大物实验课详情(设置密码)",
        },
      ],
    ];
    // 当前设置的存储key（提示：可通过桌面设置不同参数，来保存多个设置）
    let _md5 = this.md5(module.filename);
    this.CACHE_KEY = `cache_${_md5}`;
    // 获取设置
    // 格式：type@name，比如 today@withoutExpt、now@withExpt
    this.SETTINGS = this.settings["node"] || "today@withoutExpt";

    // 注册操作菜单
    this.registerAction("功能设置", this.actionSettings);
    // 初始化账户
    this.registerAction("初始化账户", this.setUser);
  }

  async isUsingDarkAppearance() {
    const wv = new WebView();
    let js =
      "(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)";
    let r = await wv.evaluateJavaScript(js);
    return r;
  }

  // 渲染组件
  async render() {
    if (!this.settings["hdu_username"] || !this.settings["hdu_password"]) {
      let w = new ListWidget();
      w.addSpacer();
      let body = w.addStack();
      body.layoutVertically();
      let noCourse = body.addText("请先在设置中填写你的数字杭电账号密码.");
      noCourse.font = Font.lightSystemFont(14);
      body.addSpacer(6);
      w.addSpacer();
      w.url = this.actionUrl("settings");
      return w;
    }
    let data = [];
    data = await this.getData();
    if (data.length == 0) {
      let w = new ListWidget();
      w.addSpacer();
      let body = w.addStack();
      body.layoutVertically();
      let noCourse = body.addText("抱歉,课表获取内容为空.");
      noCourse.font = Font.lightSystemFont(14);
      let fresh_time = body.addText("更新时间:" + new Date().toLocaleString());
      fresh_time.font = Font.lightSystemFont(14);
      body.addSpacer(6);
      w.addSpacer();
      w.url = this.actionUrl("settings");
      return w;
    }
    if (this.widgetFamily === "medium") {
      return await this.renderWidget(data, 1);
    } else if (this.widgetFamily === "large") {
      return await this.renderWidget(data, 5);
    } else {
      return await this.renderWidget(data, 1);
    }
  }

  async renderWidget(data, data_num) {
    let w = new ListWidget();
    w.backgroundColor = Color.dynamic(
      new Color("#EFEFF4"),
      new Color("#1c1c1d")
    );

    const Courses = [];
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
    data.forEach((course) => {
      if (this.SETTINGS.split("@")[0] == "today") {
        if (!compareNowTime(startTime[course.startSection - 1])) {
          finish_num++;
        }
        Courses.push(course);
      } else {
        if (compareNowTime(startTime[course.startSection - 1])) {
          Courses.push(course);
        } else {
          finish_num++;
        }
      }
    });

    await this.renderHeader(
      w,
      this.logo,
      this.name +
      "(" +
      finish_num.toString() +
      "/" +
      data.length.toString() +
      ")" +
      "  " +
      "周" +
      "日一二三四五六".charAt(new Date().getDay())
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
      let username = bodyleft.addText(this.settings["hdu_username"] + "同学");
      username.font = Font.lightSystemFont(14);
      let noCourse = bodyleft.addText("今天的每日委托已经完成啦！");
      noCourse.font = Font.lightSystemFont(14);
      let fresh_time = bodyleft.addText(
        "更新时间:" + new Date().toLocaleString()
      );
      fresh_time.font = Font.lightSystemFont(14);
      bodyleft.addSpacer();
    }
    bodyleft.addSpacer();
    w.url = this.actionUrl("settings");

    return w;
  }
  async renderCell(widget, course) {
    let body = widget.addStack();

    body.setPadding(10, 10, 10, 10);
    body.backgroundColor = Color.dynamic(Color.white(), new Color("#2c2c2d"));
    body.cornerRadius = 10;
    body.url = this.actionUrl("open-url", course["url"]);
    let left = body.addStack();
    left.layoutVertically();
    let content = left.addText(course["courseName"]);
    content.font = Font.lightSystemFont(14);
    content.lineLimit = 2;

    left.addSpacer(5);

    let info = left.addText(
      `第${course["startSection"]}-${course["endSection"]}节 ${course["classRoom"]}`
    );
    info.font = Font.lightSystemFont(10);
    info.textOpacity = 0.6;
    info.lineLimit = 2;

    body.addSpacer();

    return widget;
  }

  async getData() {
    await this.updateVersion();
    // 解析设置，判断类型，获取对应数据
    const tmp = this.SETTINGS.split("@");
    return await this.getDataForToday(
      this.settings["hdu_username"],
      this.settings["hdu_password"],
      tmp[1] == "withExpt" || tmp[1] == "withExptDefault",
      !!this.settings["expt_pwd"] ? this.settings["expt_pwd"] : "123456"
    );
  }

  /**
   * 获取课表数据
   * @param {boolean} withExpt 是否包含实验课
   */
  async getDataForToday(
    username,
    password,
    withExpt = false,
    exptPwd = "123456"
  ) {
    let url = `http://lis.marlene.top/getSklTodayCourse?username=${username}&password=${password}&withExpt=${withExpt}&exptPwd=${exptPwd}&sourse=ios`;
    let arr = await this.fetchAPI(url);

    let datas = [];
    for (let i = 0; i < arr.length; i++) {
      let t = arr[i];
      datas.push({
        url: `https://skl.hduhelp.com/#/call/course`,
        ...t,
      });
    }

    return datas;
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

  async actionSettings() {
    if (!this.settings["hdu_username"] || !this.settings["hdu_password"]) {
      await this.setUser();
    }
    const tmp = this.SETTINGS.split("@");
    const a = new Alert();
    a.title = "内容设置";
    a.message = "设置组件展示的内容";
    a.addAction((tmp[0] === "today" ? "✅ " : "") + "今日课程");
    a.addAction((tmp[0] === "now" ? "✅ " : "") + "今日剩余课程");
    a.addCancelAction("取消设置");
    const i = await a.presentSheet();
    if (i === -1) return;
    const table = new UITable();
    this.API[i].map((t) => {
      const r = new UITableRow();
      r.addText((tmp[1] === t.id ? "✅ " : "") + t["name"]);
      r.onSelect = (n) => {
        // 保存设置
        let _t = "today";
        _t = i === 1 ? "now" : _t; // today / now
        let v = `${_t}@${t["id"]}`;
        this.SETTINGS = v;
        this.settings["node"] = v;
        this.saveSettings(true);
      };
      table.addRow(r);
    });
    table.present(false);
    if (this.SETTINGS.split("@")[1] == "withExpt") {
      await this.setExptPwd();
    }
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
      this.SETTINGS = `${this.SETTINGS.split("@")[0]}@withExptDefault`;
      this.settings["node"] = this.SETTINGS;
      this.saveSettings(false);
    } else {
      this.settings["expt_pwd"] = a.textFieldValue(0);
      this.saveSettings(true);
    }
  }

  async updateVersion() {
    const scripts = {
      moduleName: "「妙妙屋」杭电课表",
      url: "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/%E3%80%8C%E5%A6%99%E5%A6%99%E5%B1%8B%E3%80%8D%E8%AF%BE%E7%A8%8B%E8%A1%A8.js",
      version: "1.0.3",
    };
    const vreq = new Request(
      "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/scriptVersion.json?_=" +
      +new Date()
    );
    const p = await vreq.loadJSON();
    if (
      p[scripts.moduleName] &&
      p[scripts.moduleName].version > scripts.version
    ) {
      const URL = p[scripts.moduleName].url + "?_=" + +new Date();
      const req = new Request(URL);
      const res = await req.loadString();

      const NAME = scripts.moduleName;

      const FPATH = FileManager.local().documentsDirectory() + `/${NAME}.js`;

      const js = `// Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: pink; icon-glyph: map-pin;
      /************************
              「妙妙屋」
          致力于杭电生活一卡通
      问题反馈：https://support.qq.com/products/452934
      *************************/
  
      module.__DEBUG__ = false;
      module.__VERSION__ = '${p[scripts.moduleName].version}';
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
          scripts.moduleName +
          "小组件已更新至" +
          p[scripts.moduleName].version +
          "！稍后刷新生效。有任何问题欢迎反馈！",
          "https://support.qq.com/products/452934"
        );
      } else {
        this.notify(
          "更新失败",
          "更新失败!请手动更新。",
          p[scripts.moduleName].url
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
