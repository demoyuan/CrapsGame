const { ccclass, property } = cc._decorator

@ccclass
export default class Player extends cc.Component {
  @property({ type: cc.Node, tooltip: '地图格子列表' })
  public mapList: cc.Node = null

  private mapLength: number = 0 // 地图长度
  private jumpHeight: number = 40 // 跳跃高度
  private jumpTime: number = 0.2 // 跳跃时间
  private playerPos: number = 1 // 玩家格子位置

  public init({ mapNum }) {
    this.mapLength = this.mapList.children.length
    this.playerPos = mapNum
    this.node.position = this.getPlayerPos(mapNum)
  }

  /**
   * 获取格子位置坐标
   */
  public getPlayerPos(mapNum: number) {
    let findMapItem = this.mapList.children[mapNum - 1]
    return findMapItem.position
  }

  /**
   * 执行跳跃
   */
  public jumpAction(mapNum: number) {
    for (let i = 1; i <= mapNum; i++) {
      setTimeout(() => {
        this.playerPos += 1
        let pos = this.getPlayerPos(this.playerPos)
        console.log(pos)
        // this.node.runAction(this.jumpFnc(pos))
      }, i * 1000)
    }
  }

  /**
   * 跳跃动画
   */
  public jumpFnc(pos: any) {
    let jumpUp = cc.moveBy(this.jumpTime, cc.v2(-pos.x / 2, pos.y + this.jumpHeight)).easing(cc.easeCubicActionOut())
    let jumpDown = cc.moveBy(this.jumpTime, cc.v2(-pos.x, - pos.y)).easing(cc.easeCubicActionIn())
    return cc.sequence(jumpUp, jumpDown)
  }
}
