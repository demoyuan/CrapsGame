const { ccclass, property } = cc._decorator

@ccclass
export default class SetLanguage extends cc.Component {
  public lang: string = 'en-US'

  protected onLoad() {
    const navLang = navigator.language
    // this.lang = navLang === 'en-US' ? 'en-US' : 'zh-HK'
    this.init()
  }

  public init() {
    cc.loader.loadRes(`i18n/${this.lang}`, (err, jsonAsset) => {
      if (!err) {
        this.replaceLang(jsonAsset.json)
      }
    })
  }

  public replaceLang(lang: object) {
    let labeArr = this.node.getComponentsInChildren(cc.Label)
    labeArr.forEach(item => {
      if (/\$t\- */g.test(item.name)) {
        let key = item.name.replace(/<Label>/, '').replace(/\$t-/, '')
        if (lang[key]) {
          item.string = lang[key]
        }
      }
    })
  }
}
