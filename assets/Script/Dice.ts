const { ccclass, property } = cc._decorator
import httpRequest from './HttpRequest'

@ccclass
export default class Dice extends cc.Component {
  @property({ type: cc.Label, tooltip: '剩余次数' })
  public timesLabel: cc.Label = null

  private btn: cc.Button = null

  /** 剩余游戏次数 */
  public times: number = 0
  /** 点击冷却 防止重复点击 */
  public buttonDisabled: boolean = false

  protected onLoad() {
    this.btn = this.node.getComponent(cc.Button)
  }

  protected update() {
    this.timesLabel.string = `x ${this.times}`
    // this.times === 0 ? this.disOnClick() : this.enOnClick()
  }

  /**
   * 禁止点击状态
   */
  public disOnClick() {
    this.btn.interactable = false
  }

  /**
   * 开启点击状态
   */
  public enOnClick() {
    this.btn.interactable = true
  }

  /**
   * 投掷方法
   */
  public onThrow(): number | boolean {
    this.node.runAction(cc.sequence(
      cc.scaleTo(0.1, 0.92, 0.92),
      cc.scaleTo(0.1, 1, 1)
    ))
    if (this.times === 0) { // 次数为0 返回0步数
      return 0
    }
    return this.buttonDisabled ? null : 1
  }

  /**
   * @returns 随机正整数
   */
  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max + 1 - min) + min)
  }
}
