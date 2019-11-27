const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.ScrollView, tooltip: '地图' })
  public scrollMap: cc.ScrollView = null

  @property({ type: cc.Sprite, tooltip: '玩家' })
  private player: cc.Sprite = null

  @property({ type: cc.Node, tooltip: '骰子' })
  private dice: cc.Node = null

  private MapComp: any = null
  private playerComp: any = null
  private diceComp: any = null

  /** 玩家格子位置 */
  public playerPos: number = 1

  protected onLoad() {
    this.MapComp = this.scrollMap.getComponent('MapEvent')
    this.playerComp = this.player.getComponent('Player')
    this.diceComp = this.dice.getComponent('Dice')
    this.initGame()
  }

  private initGame() {
    this.getUserData()
    // 初始化玩家位置
    this.player.node.position = this.MapComp.getGridPos(this.playerPos)
    this.MapComp.mapCenter(this.player.node.position)
  }

  public getUserData() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        var response = xhr.responseText
        console.log(response)
      }
    }
    xhr.open('GET', 'https://service.ingcreations.com/cfg/whoot/whootserv_dev', true)
    xhr.send()
  }

  /**
   * 投掷
   */
  public play() {
    let num = this.diceComp.onThrow()
    if (num !== 0) {
      let { arr, nowPlayerPos } = this.MapComp.getPlayPosArr(num, this.playerPos)
      this.playerPos = nowPlayerPos
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
   * 我的奖品页面
   */
  public loadDescPage() {
    cc.director.loadScene('desc')
  }

  /**
   * 我的奖品页面
   */
  public loadPackListPage() {
    cc.director.loadScene('backpack')
  }
}
