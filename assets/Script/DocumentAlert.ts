const { ccclass, property } = cc._decorator

@ccclass
export default class DocumentAlert extends cc.Component {
  protected onLoad() {
    this.init()
  }

  public init() {
    this.node.active = false
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0
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
}
