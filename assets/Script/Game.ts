const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '玩家' })
  private player: cc.Sprite = null

  @property({ type: cc.Node, tooltip: '骰子' })
  private dice: cc.Node = null

  private playerComp: any = null
  private diceComp: any = null

  // 玩家初始信息
  private userData = {
    playerPos: 1 // 玩家格子位置
  }

  protected onLoad() {
    this.playerComp = this.player.getComponent('Player')
    this.diceComp = this.dice.getComponent('Dice')
    this.initGame()
  }

  private initGame() {
    // 初始化玩家坐标
    this.playerComp.init({ mapNum: this.userData.playerPos })
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
    this.playerComp.jumpAction(num)
  }
}
