const { ccclass, property } = cc._decorator
import httpRequest from './HttpRequest'

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.ScrollView, tooltip: '地图' })
  public scrollMap: cc.ScrollView = null

  @property({ type: cc.Sprite, tooltip: '玩家' })
  private player: cc.Sprite = null

  @property({ type: cc.Node, tooltip: '骰子' })
  private dice: cc.Node = null

  @property({ type: cc.Node, tooltip: '中奖弹窗' })
  private winAlert: cc.Node = null

  @property({ type: cc.Node, tooltip: '获取游戏次数弹窗' })
  private timesAlert: cc.Node = null

  @property({ type: cc.Node, tooltip: 'Tips' })
  private tips: cc.Node = null

  private mapComp: any = null
  private playerComp: any = null
  private diceComp: any = null
  private winAlertComp: any = null
  private timesAlertComp: any = null
  private tipsComp: any = null
  private ajax = new httpRequest()

  /** 玩家格子位置 */
  public playerPos: number = 1

  protected onLoad() {
    this.mapComp = this.scrollMap.getComponent('MapEvent')
    this.playerComp = this.player.getComponent('Player')
    this.diceComp = this.dice.getComponent('Dice')
    this.winAlertComp = this.winAlert.getComponent('Alert')
    this.timesAlertComp = this.timesAlert.getComponent('TimesAlert')
    this.tipsComp = this.tips.getComponent('Tips')
    this.initGame()
  }

  private initGame() {
    this.player.node.position = this.mapComp.getGridPos(this.playerPos)
    this.initUserToken()
    this.getUserData()
  }

  /**
   * 获取用户登录Token
   */
  public initUserToken() {
    // @ts-ignore
    if (window.MessageSignal) {
      // @ts-ignore
      cc.log('android: ', window.MessageSignal.onMonopoly)
      // @ts-ignore
      cc.log('android: ', window.onMonopoly)
    }
    // @ts-ignore
    if (window.webkit && window.webkit.messageHandlers) {
      // @ts-ignore
      window.webkit.messageHandlers.getUserDataForIos.postMessage({ title: '' })
      // @ts-ignore
      window.getUserDataForIos = (res: any) => {
        let userInfo = JSON.parse(res)
        this.ajax.userToken = userInfo.token
        cc.log('IOS user token: ', userInfo.token)
      }
    }
    this.ajax.userToken = 'e4f55ec453e94a62843682ec95f79271' // 75
  }

  public getUserData() {
    this.tipsComp.showLoading({ status: true })
    this.ajax.httpPost({
      url: '/user/game/initGame',
      callback: (res: any) => {
        this.tipsComp.showLoading({ status: false })
        if (res.code === 0) {
          this.playerPos = res.data.location || (res.data.step + 1)
          this.diceComp.times = res.data.amountChance
          this.timesAlertComp.firstLogin = res.data.daily === 1 ? true : false
          this.timesAlertComp.getTimes = res.data.redeemChance
        }
        // 初始化玩家位置
        this.player.node.position = this.mapComp.getGridPos(this.playerPos)
        this.mapComp.mapCenter(this.player.node.position)
      }
    })
  }

  /**
   * 投掷
   */
  public play() {
    let num = this.diceComp.onThrow()
    if (num !== 0) {
      // test
      // let { arr, nowPlayerPos } = this.mapComp.getPlayPosArr(num, this.playerPos)
      // this.playerPos = nowPlayerPos
      // this.runJump(arr, 0)
      // this.winAlertComp.openTips()

      this.tipsComp.showLoading({ status: true })
      this.ajax.httpPost({
        url: '/user/game/playGame',
        callback: (res: any) => {
          this.tipsComp.showLoading({ status: false })
          if (res.code === 0) {
            let { arr, nowPlayerPos } = this.mapComp.getPlayPosArr(num, this.playerPos)
            this.playerPos = nowPlayerPos
            this.diceComp.times = this.diceComp.times - num
            this.runJump(arr, res.data.rewardType)
          } else {
            this.tipsComp.showMessage({ text: res.message })
          }
        }
      })
    }
  }

  /**
   * 执行跳格子动画
   * @param arr 动画数组[cc.jumpTo]
   */
  public runJump(arr: any, winType: number) {
    this.player.node.runAction(
      cc.sequence(
        cc.callFunc(() => {
          this.diceComp.buttonDisabled = true
        }),
        ...arr,
        cc.callFunc(() => {
          let { win, gift } = this.mapComp.checkWin(winType)
          win && this.winAlertComp.openTips(gift)
          this.diceComp.buttonDisabled = false
        })
      )
    )
  }

  /**
   * 我的奖品页面
   */
  public loadDescPage() {
    window.location.href = 'http://www.baidu.com'
    // cc.director.loadScene('desc')
  }

  /**
   * 我的奖品页面
   */
  public loadPackListPage() {
    cc.director.loadScene('backpack')
  }

  /**
   * 打开获取次数提示窗口
   */
  public openTimesAlert() {
    this.timesAlertComp.openTips()
  }
}
