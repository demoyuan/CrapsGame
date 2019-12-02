const { ccclass, property } = cc._decorator

@ccclass
export default class Dice extends cc.Component {
  @property({ type: cc.Node, tooltip: '背景' })
  public bg: cc.Node = null

  /** 按钮禁止点击 */
  public buttonDisabled: boolean = false

  /**
   * 禁止点击状态
   */
  public disOnClick() {
    this.buttonDisabled = true
    cc.loader.loadRes('ui/btn_go_n', cc.SpriteFrame, (err, spriteFrame) => {
      this.bg.getComponent(cc.Sprite).spriteFrame = spriteFrame
    })
  }

  /**
   * 投掷方法
   */
  public onThrow(): number {
    if (this.buttonDisabled) {
      return 0
    }
    let num = this.random(1, 6)
    return 1
  }

  /**
   * @returns 随机正整数
   */
  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max + 1 - min) + min)
  }
}
