const { ccclass, property } = cc._decorator

@ccclass
export default class ExpiresEnd extends cc.Component {
  private box: cc.Node = null

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    this.init()
  }

  public init() {
    this.node.active = false
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0
    let graphics = this.box.getComponent(cc.Graphics)
    graphics.roundRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height, 24)
    graphics.fillColor = cc.Color.WHITE
    graphics.stroke()
    graphics.fill()

    this.checkTime()
  }

  /**
   * 获取活动时间
   */
  public checkTime() {
    let xhr = cc.loader.getXMLHttpRequest()
    xhr.open('GET', 'https://service.ingcreations.com/cfg/whoot/whootserv_dev', true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        let response = xhr.responseText
        if (xhr.status >= 200 && xhr.status < 400) {
          let res = JSON.parse(response)
          if (res.code === 0) {
            let gameTime = res.data.BigWin
            let nowTime = new Date().getTime()
            if (gameTime.EndTm < nowTime) {
              this.openTips()
            }
          }
        }
      }
    }
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')
    xhr.send()
  }

  public openTips() {
    this.node.active = true
    this.node.runAction(cc.fadeIn(0.4))
  }

  public closeTips() {
    this.node.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(() => {
        this.node.active = false
      })
    ))
  }
}
