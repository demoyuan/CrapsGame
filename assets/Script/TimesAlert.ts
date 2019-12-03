const { ccclass, property } = cc._decorator

@ccclass
export default class TimesAlert extends cc.Component {
  @property({ type: cc.Label, tooltip: '评论完成次数' })
  public commentLabel: cc.Label = null

  @property({ type: cc.Label, tooltip: '登录完成次数' })
  public loginLabel: cc.Label = null

  public box: cc.Node = null

  /** 是否每日首次登陆 */
  public firstLogin: boolean = false
  /** 当天获得游戏次数 */
  public getTimes: number = 0

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    this.init()
  }

  public init() {
    this.node.active = false
    let graphics = this.box.getComponent(cc.Graphics)
    graphics.clear(true)
    graphics.roundRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height, 16)
    graphics.stroke()
    graphics.fill()

    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0
    alertWidget.updateAlignment() // 执行 widget 对齐操作
    this.box.y = -(this.node.height / 2 + this.box.height / 2)
  }

  public openTips() {
    this.commentLabel.string = `${this.getTimes}/3`
    this.loginLabel.string = `${this.firstLogin ? 1 : 0}/1`
    this.node.active = true
    this.node.runAction(cc.sequence(
      cc.fadeIn(0.1),
      cc.callFunc(() => {
        this.box.runAction(cc.moveBy(0.4, cc.v2(0, this.box.height - 16)))
      })
    ))
  }

  public closeTips() {
    this.node.runAction(cc.sequence(
      cc.callFunc(() => {
        this.box.runAction(cc.moveTo(0.3, cc.v2(0, -this.node.height / 2 - this.box.height / 2)))
      }),
      cc.fadeOut(0.8),
      cc.callFunc(() => {
        this.node.active = false
      })
    ))
  }
}
