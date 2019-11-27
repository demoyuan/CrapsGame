const { ccclass, property } = cc._decorator

@ccclass
export default class MapEvent extends cc.Component {
  private scrollMap: cc.ScrollView = null
  private playerComp: any = null
  
  public mapList: any = []
  public mapLength: number = 0

  protected onLoad() {
    this.scrollMap = this.node.getComponent(cc.ScrollView)
    this.mapList = this.scrollMap.content.children[0].children
    this.mapLength = this.mapList.length
    this.playerComp = this.scrollMap.node.getComponentInChildren('Player')
  }

  /**
   * 获取格子位置坐标
   * @param mapNum 格子ID playerPos
   */
  public getGridPos(mapNum: number): cc.Vec2 {
    let findMapItem = this.mapList[mapNum - 1]
    return findMapItem.position
  }

  /**
   * 玩家位置相对地图居中
   * @param pos 坐标位置 cc.v2
   */
  public mapCenter(pos: any) {
    let mapW = this.scrollMap.content.width
    let mapH = this.scrollMap.content.height
    let scrollW = this.scrollMap.node.width
    let scrollH = this.scrollMap.node.height
    let xPercent = this.getPercent((scrollW + pos.x) / (mapW - scrollW))
    let yPercent = this.getPercent(1 + pos.y / (mapH - scrollH))
    // 停止自动滚动
    this.scrollMap.stopAutoScroll()
    this.scrollMap.scrollTo(cc.v2(xPercent, yPercent), 3.6)
  }

  public getPercent(num: number): number {
    return Math.round(num * 100) / 100
  }

  /**
   * 获取本次投掷格子坐标数组
   * @param mapNum 投掷数字
   * @param playerPos 当前玩家位置
   */
  public getPlayPosArr(mapNum: number, playerPos: number) {
    let arr = []
    let nowPlayerPos = playerPos
    for (let i = 1; i <= mapNum; i++) {
      nowPlayerPos += 1
      if (nowPlayerPos > this.mapLength) {
        nowPlayerPos = 1
      }
      let pos = this.getGridPos(nowPlayerPos)
      arr = [...arr, this.playerComp.jumpFnc(pos)]
      if (i === mapNum) {
        this.mapCenter(pos)
      }
    }
    return { arr, nowPlayerPos }
  }
}
