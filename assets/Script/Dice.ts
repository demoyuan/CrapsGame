const { ccclass, property } = cc._decorator
import httpRequest from './HttpRequest'

@ccclass
export default class Dice extends cc.Component {
  @property({ type: cc.Node, tooltip: '背景' })
  public bg: cc.Node = null

  /** 剩余游戏次数 */
  public times: number = 0
  /** 点击冷却 防止重复点击 */
  public buttonDisabled: boolean = false

  private btn: cc.Button = null

  protected onLoad() {
    this.btn = this.node.getComponent(cc.Button)
  }

  protected update() {
    this.times === 0 ? this.disOnClick() : this.enOnClick()
  }

  /**
   * 禁止点击状态
   */
  public disOnClick() {
    this.btn.interactable = false
    // cc.loader.loadRes('ui/btn_go_n', cc.SpriteFrame, (err, spriteFrame) => {
    //   this.bg.getComponent(cc.Sprite).spriteFrame = spriteFrame
    // })
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
  public onThrow(): number {
    this.node.runAction(cc.sequence(
      cc.scaleTo(0.1, 0.8, 0.8),
      cc.scaleTo(0.1, 1, 1)
    ))
    return this.buttonDisabled ? 0 : 1
  }

  /**
   * @returns 随机正整数
   */
  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max + 1 - min) + min)
  }
}
