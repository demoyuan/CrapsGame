const { ccclass, property } = cc._decorator

@ccclass
export default class Dice extends cc.Component {
  @property({ type: cc.Label, tooltip: '骰子点数' })
  public points: cc.Label = null

  /**
   * 投掷方法
   */
  public onThrow() {
    let num = this.random(1, 6)
    this.points.string = '' + num
    return num
  }

  /**
   * @returns 随机正整数
   */
  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max + 1 - min) + min)
  }
}
