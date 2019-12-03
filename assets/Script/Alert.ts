const { ccclass, property } = cc._decorator

@ccclass
export default class Alert extends cc.Component {
  public box: cc.Node = null
  public fire: cc.Node = null

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    this.fire = this.node.getChildByName('Fireworks')
    this.init()
    let repeat = cc.repeatForever(cc.rotateBy(1.0, 90))
    this.fire.runAction(repeat)
  }

  public init() {
    this.node.active = false
    // 弹窗初始位置居中
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0

    // 绘制圆角矩形背景
    let graphics = this.box.getComponent(cc.Graphics)
    graphics.roundRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height, 24)
    graphics.fillColor = cc.Color.WHITE
    graphics.stroke()
    graphics.fill()
  }

  public openTips(gift?: any) {
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
