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
    this.logo = "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/1_waifu2x_art_noise3_scale_waifu2x_art_noise3_scale.png";
    this.name = "世界任务";
    this.background = "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/102614118_p2.png";
    this.desc = "hdu all in one";
    this.autoUpdate = true; // 是否自动更新,魔改用户不想被更新替换可以这里设置为false
    // 当前设置的存储key（提示：可通过桌面设置不同参数，来保存多个设置）
    let _md5 = this.md5(module.filename);
    this.CACHE_KEY = `cache_${_md5}`;

    this.scripts = {
      moduleName: "「妙妙屋」杭电DDL",
      url: "https://gitee.com/JiangNoah/hdu-scriptable/raw/master/%E3%80%8C%E5%A6%99%E5%A6%99%E5%B1%8B%E3%80%8D%E8%AF%BE%E7%A8%8B%E8%A1%A8.js",
      version: "1.0.7",
    };

    
    // 初始化账户
    this.registerAction("设置超星学习通账户", this.setUser);
    this.registerAction("设置在浙学账户", this.setZjooc);
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
    if (!this.settings["cx_username"] || !this.settings["cx_password"]) {
      return this.renderError("请先设置超星学习通账户.")
    }
    let data = [];
    data = await this.getData();
    if(data['code'] ==-1){
      //将数组拼接为字符串\
      return this.renderError(data['errors'].join("\n"));
    }
    data = data['data'];
    if (data == null || !data || data.length == 0) {
      return this.renderError("旅行者\n你的世界任务都做完啦~");
    }

    // 根据time排序
    data.sort((a,b)=>{
      return a.time-b.time
    })

    if (this.widgetFamily === "large") {
      return await this.renderWidget(data, 5);
    } else {
      return await this.renderWidget(data, 1);
    }
  }

  async renderWidget(data, data_num) {
    let w = new ListWidget();

    // set linear color 
    let gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [
      new Color("#516742", 0.2),
      new Color("#FFFFFF", 0),
    ];
    w.backgroundGradient = gradient;
    w.backgroundImage = await (new Request (!!this.settings["background"] ? this.settings["background"] : this.background)).loadImage();
    


    await this.renderHeader(
      w,
      !!this.settings["logo"] ? this.settings["logo"] : this.logo ,
      (!!this.settings["title"] ? this.settings["title"] : this.name) +
      "("+
      data.length.toString() +
      ")",
      new Color("#ffffff")
    );
    w.addSpacer();
    let body = w.addStack();
    let bodyleft = body.addStack();
    bodyleft.layoutVertically();
    let length = data.length;
    if (length > data_num) {
      length = data_num;
    }
    for (let i = 0; i < length; i++) {
      //计算时间差
      let times = (new Date((data[i].time)*1000)).getTime() - getChineseDate().getTime();
      const days=Math.floor(times/(24*1000*3600));//计算相差的天数
      const leave=times%(24*3600*1000);//计算天数后剩余的毫秒数
      const h=Math.floor(leave/(3600*1000));//计算小时数
      //计算分钟数
      const h_leave=leave%(3600*1000);
      const min=Math.floor(h_leave/(60*1000));
      //计算秒数
      const min_leave=h_leave%(60*1000);
      const sec=Math.floor(min_leave/1000);
      const time = (!!days?(days.toString()+'天'):'')+(!!h?(h.toString()+'小时'):'')+((!!min&&!days)?(min.toString()+'分钟'):'');
      data[i].remain_time = time;
      data[i].emergency = 0;
      if(days>3)data[i].emergency++
      if(days>7)data[i].emergency++
      

      bodyleft = await this.renderCell(bodyleft, data[i]);
      bodyleft.addSpacer(6);
    }
    bodyleft.addSpacer();
    w.url = this.actionUrl("settings");

    return w;
  }
  async renderCell(widget, work) {
    let body = widget.addStack();

    body.setPadding(10, 10, 10, 10);
    const colorList =['#7F8C51','#D5D977','#FFFFFF']
    const colorList_reverse =['#FFFFFF','#FFFFFF','#7F8C51']
    body.backgroundColor = new Color(colorList[work['emergency']], 0.9);
    body.cornerRadius = 10;
    body.url = this.actionUrl("open-url", 'http://i.mooc.chaoxing.com/');
    let left = body.addStack();
    left.layoutVertically();
    let content = left.addText(work["title"]);
    content.font = Font.systemFont(14);
    content.textColor = new Color(colorList_reverse[work['emergency']]);
    content.lineLimit = 2;

    left.addSpacer(5);

    let info = left.addText(work['from']+' '+work['remain_time']+' '+work['course']);
    info.font = Font.lightSystemFont(10);
    info.textColor = new Color(colorList_reverse[work['emergency']]);
    info.textOpacity = 0.6;
    info.lineLimit = 1;

    body.addSpacer();

    return widget;
  }

  async getData() {
    await this.updateVersion();
    // 解析设置，判断类型，获取对应数据
    return await this.getChaoXingDDL(
      this.settings["cx_username"],
      this.settings["cx_password"],
      !!this.settings["zjooc_account"]?this.settings["zjooc_account"]:'',
      !!this.settings["zjooc_password"]?this.settings["zjooc_password"]:''
    );
  }

  /**
   * 获取DDL数据
   */
  async getChaoXingDDL(
    username,
    password,
    zjooc_account = "",
    zjooc_password = ""
  ) {
    let url = `https://api.baimeow.cn/ddl/all?cx_account=${username}&cx_passwd=${password}&cx_loginType=cx&zjooc_account=${zjooc_account}&zjooc_passwd=${zjooc_password}`;
    let arr = await this.fetchAPI(url);
    return arr;
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
    a.message = "设置学习通账户";
    a.addTextField("学习通账号");
    a.addSecureTextField("学习通密码");
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
      this.settings["cx_username"] = a.textFieldValue(0);
      this.settings["cx_password"] = a.textFieldValue(1);
      this.saveSettings(true);
    }
  }

  async setZjooc() {
    const a = new Alert();
    a.title = "账户设置";
    a.message = "设置在浙学账户";
    a.addTextField("在浙学账号");
    a.addSecureTextField("在浙学密码");
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
      this.settings["zjooc_account"] = a.textFieldValue(0);
      this.settings["zjooc_password"] = a.textFieldValue(1);
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

//node pack.js Scripts/「源码」超星DDL.js
//node encode.js Dist/「妙妙屋」超星DDL.js
