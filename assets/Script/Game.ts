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

  @property({ type: cc.Label, tooltip: '参与人数' })
  private joinPeopleNum: cc.Label = null

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
    this.winAlertComp = this.winAlert.getComponent('WinAlert')
    this.timesAlertComp = this.timesAlert.getComponent('TimesAlert')
    this.tipsComp = this.tips.getComponent('Tips')
    this.initGame()
  }

  private initGame() {
    this.player.node.position = this.mapComp.getGridPos(this.playerPos)
    this.initUserToken()
  }

  /**
   * 获取用户登录Token
   */
  public initUserToken() {
    let token = ''
    // @ts-ignore
    if (window.webkit && window.webkit.messageHandlers) {
      // @ts-ignore
      window.webkit.messageHandlers.getUserDataForIos.postMessage({ title: '' })
      // @ts-ignore
      window.getUserDataForIos = (res: any) => {
        // 异步调用
        let userInfo = JSON.parse(res)
        token = userInfo.token
        cc.log('ISO user token: ', token)
        cc.sys.localStorage.setItem('userData', JSON.stringify({ token }))
        this.getUserData()
      }
    } else {
      let urlToken = new URL(window.location.href).searchParams.get('token')
      token = urlToken ? urlToken : ''
      cc.sys.localStorage.setItem('userData', JSON.stringify({ token }))
      cc.log('URL user token: ', token)
      this.getUserData()
    }
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
          this.timesAlertComp.setGetTimesStr()
          this.joinPeopleNum.string = `參與人次：${res.data.amountPlayers}`
        }
        this.initPlayerPos()
      }
    })
  }

  /**
   * 设置玩家位置
   */
  public initPlayerPos() {
    if (this.playerPos >= this.mapComp.mapLength) {
      this.playerPos = this.mapComp.mapLength
    }
    this.player.node.position = this.mapComp.getGridPos(this.playerPos)
    this.mapComp.mapCenter(this.player.node.position)
  }

  /**
   * 投掷
   */
  public play() {
    let num = this.diceComp.onThrow()
    if (num && num > 0) {
      // test
      // this.playSucFnc(num, 101)

      // 已到终点
      if (this.playerPos >= this.mapComp.mapLength) {
        this.playerPos = this.mapComp.mapLength
        this.tipsComp.showMessage({ text: '恭喜您已獲得所有獎勵' })
        return
      }

      this.tipsComp.showLoading({ status: true })
      this.diceComp.buttonDisabled = true

      this.ajax.httpPost({
        url: '/user/game/playGame',
        callback: (res: any) => {
          this.tipsComp.showLoading({ status: false })
          this.diceComp.buttonDisabled = false
          if (res.code === 0) {
            this.playSucFnc(num, res.data.rewardType)
          } else {
            switch (res.code) {
              case 1082:
                this.initPlayerPos()
                this.diceComp.disOnClick()
                this.tipsComp.showMessage({ text: '恭喜您已獲得所有獎勵' })
                break
              default:
                this.tipsComp.showMessage({ text: res.message })
                break
            }
          }
        }
      })
    } else if (num === 0) { // 次数为0 弹出获取次数提示
      this.timesAlertComp.openTips()
    }
  }

  public playSucFnc(num: number, winType: number) {
    let { arr, nowPlayerPos } = this.mapComp.getPlayPosArr(num, this.playerPos)
    this.playerPos = nowPlayerPos
    this.diceComp.times = this.diceComp.times - num
    this.runJump(arr, winType)
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
          let { win, shopItem } = this.mapComp.checkWin(winType)
          win && this.winAlertComp.openTips(shopItem)
        }),
        cc.callFunc(() => {
          setTimeout(() => {
            this.diceComp.buttonDisabled = false
          }, 1000)
        })
      )
    )
  }
}
