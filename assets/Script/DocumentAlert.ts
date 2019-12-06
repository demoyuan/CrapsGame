const { ccclass, property } = cc._decorator

@ccclass
export default class DocumentAlert extends cc.Component {
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
    graphics.roundRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height, 30)
    graphics.fillColor = cc.Color.WHITE
    graphics.stroke()
    graphics.fill()
  }

  public openAlert() {
    this.node.active = true
    this.node.runAction(cc.fadeIn(0.4))
  }

  public closeAlert() {
    this.node.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(() => {
        this.node.active = false
      })
    ))
  }

  public goAppContact() {
    alert(JSON.stringify({ touchPos: 'Contact' }))
  }
}
