const { ccclass, property } = cc._decorator

@ccclass
export default class Player extends cc.Component {
  private jumpHeight: number = 60 // 跳跃高度
  private jumpTime: number = 0.6 // 跳跃时间

  /**
   * 跳跃方法
   */
  public jumpFnc(pos: any) {
    let jumpAnimate = cc.sequence(
      cc.scaleTo(0.1, 1.05, 0.85),
      cc.jumpTo(this.jumpTime, cc.v2(pos.x, pos.y), this.jumpHeight, 1),
      cc.scaleTo(0.1, 1, 1)
    )
    return jumpAnimate
  }
}
