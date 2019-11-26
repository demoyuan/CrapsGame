const { ccclass, property } = cc._decorator

@ccclass
export default class Player extends cc.Component {
  private jumpHeight: number = 60 // 跳跃高度
  private jumpTime: number = 0.6 // 跳跃时间

  /**
   * 跳跃动画
   */
  public jumpFnc(pos: any) {
    let jumpAnimate = cc.jumpTo(this.jumpTime, cc.v2(pos.x, pos.y), this.jumpHeight, 1)
    return jumpAnimate
  }
}
