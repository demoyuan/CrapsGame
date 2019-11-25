const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.ScrollView, tooltip: '地图' })
  public scrollMap: cc.ScrollView = null
  
  @property({ type: cc.Sprite, tooltip: '玩家' })
  private player: cc.Sprite = null

  @property({ type: cc.Node, tooltip: '骰子' })
  private dice: cc.Node = null

  private playerComp: any = null
  private diceComp: any = null

  /** 地图列表 */
  public mapList: any = []
  public mapLength: number = 0
  /** 玩家格子位置 */
  public playerPos: number = 1

  protected onLoad() {
    this.playerComp = this.player.getComponent('Player')
    this.diceComp = this.dice.getComponent('Dice')
    this.initGame()
  }

  private initGame() {
    this.mapList = this.scrollMap.content.children[0]
    this.mapLength = this.mapList.children.length

    // 初始化玩家位置
    this.player.node.position = this.getPlayerPos(this.playerPos)
    this.mapCenter(this.player.node.position)
    this.addListener()
  }

  private addListener() {
    this.dice.on('click', this.play, this)
  }

  /**
   * 投掷
   */
  public play() {
    let num = this.diceComp.onThrow()
    if (num !== 0 ) {
      let arr = this.getPlayPosArr(num)
      this.runJump(arr)
    }
  }

  /**
   * 执行跳格子动画
   * @param arr 动画数组[cc.jumpTo]
   */
  public runJump(arr: any) {
    this.player.node.runAction(
      cc.sequence(
        cc.callFunc(() => {
          this.diceComp.buttonDisabled = true
        }),
        ...arr,
        cc.callFunc(() => {
          this.diceComp.buttonDisabled = false
        })
      )
    )
  }

  /**
   * 获取格子位置坐标
   * @param mapNum 格子ID playerPos
   */
  public getPlayerPos(mapNum: number): cc.Vec2 {
    let findMapItem = this.mapList.children[mapNum - 1]
    return findMapItem.position
  }

  /**
   * 玩家位置相对地图居中
   * @param pos 坐标位置 cc.v2
   */
  public mapCenter(pos: any) {
    let mapW = this.scrollMap.content.width
    let mapH = this.scrollMap.content.height
    let xPercent = Math.round((mapW / 2 + pos.x) / mapW * 100) / 100
    let yPercent = Math.round((mapH / 2 - pos.y) / mapH * 100) / 100
    // 停止自动滚动
    this.scrollMap.stopAutoScroll()
    this.scrollMap.scrollTo(cc.v2(xPercent, yPercent), 3.6)
  }

  /**
   * 获取本次投掷格子坐标数组
   * @param mapNum 投掷数字
   */
  public getPlayPosArr(mapNum: number) {
    let arr = []
    for (let i = 1; i <= mapNum; i++) {
      this.playerPos += 1
      if (this.playerPos > this.mapLength) {
        this.playerPos = 1
      }
      let pos = this.getPlayerPos(this.playerPos)
      arr = [...arr, this.playerComp.jumpFnc(pos), this.mapCenter(pos)]
    }
    return arr
  }
}
