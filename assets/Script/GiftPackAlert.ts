const { ccclass, property } = cc._decorator
import httpRequest from './HttpRequest'

@ccclass
export default class GiftPackAlert extends cc.Component {
  @property({ type: cc.ScrollView, tooltip: '滚动列表' })
  private scrolView: cc.ScrollView = null

  @property({ type: cc.Prefab, tooltip: 'gift item' })
  private giftItem: cc.Prefab = null

  public content: any = null

  private ajax = new httpRequest()

  protected onLoad() {
    this.init()
  }

  public init() {
    this.node.active = false
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0

    this.content = this.scrolView.content
  }

  /**
   * 创建新的gift节点
   */
  public newGiftItem(data: any) {
    let newGift = cc.instantiate(this.giftItem)
    let test1 = 'https://hk-storage.whoot.com/LaIQTyfAn4Oym89rA5s0aQ==.jpg' // 跨域
    let test2 = 'https://world-storage.whoot.com/-25PjGn9fq7t9b4ZUH2KoQ==.jpg' // 正常
    let test3 = 'https://world-storage.whoot.com/3-W0GrGJiQbWy-BLWHv9gg==.blob' // blob
    this.changeGiftImage(newGift, test3)
    this.changeGiftShopName(newGift, 'aaaa123')
    this.changeGiftTime(newGift, { startTm: data.startTm, endTm: data.endTm })
    this.content.addChild(newGift)
  }

  /**
   * 修改Gift Prefab 图片
   */
  public changeGiftImage(giftNode: cc.Node, url: string) {
    let imgSprite = giftNode.getChildByName('img').getComponent(cc.Sprite)
    // 加载远程图片
    cc.loader.load({ url, type: 'jpg' }, (err: any, texture: any) => {
      if (!err) {
        imgSprite.spriteFrame = new cc.SpriteFrame(texture)
      }
    })
    // 加载本地图片
    // cc.loader.loadRes('ui/btn_go_n', cc.SpriteFrame, (err, spriteFrame) => {
    //   imgSprite.spriteFrame = spriteFrame
    // })
  }

  /**
   * 修改Gift Prefab 门店名
   */
  public changeGiftShopName(giftNode: cc.Node, text: string) {
    let label = giftNode.getChildByName('shopName').getComponent(cc.Label)
    label.string = text
  }

  /**
   * 修改Gift Prefab 有效期时间
   */
  public changeGiftTime(giftNode: cc.Node, time: any) {
    let label = giftNode.getChildByName('time').getComponent(cc.Label)
    label.string = `有效期：${time.startTm}-${time.endTm}`
  }

  public loadGiftList() {
    this.ajax.httpGet({
      url: '/user/coupon/list',
      callback: (res: any) => {
        if (res.code === 0) {
          res.data.coupons.map((item: any) => {
            if (item.tokenFrom >= 101 && item.tokenFrom <= 106) {
              let obj = {
                id: item.id,
                couponType: item.couponId,
                startTm: new Date(item.createTm).toJSON(),
                endTm: item.expiredTm ? new Date(item.expiredTm).toJSON() : null
              }
              this.newGiftItem(obj)
            }
          })
        }
      }
    })
  }

  public loadGiftHistoryList() {
    this.ajax.httpGet({
      url: '/user/coupon/history',
      params: {
        start: 0,
        rows: 999
      },
      callback: (res: any) => {
        if (res.code === 0) {
        }
      }
    })
  }

  public loadGiftExpiredList() {
    this.ajax.httpGet({
      url: '/user/coupon/expired',
      params: {
        start: 0,
        rows: 999
      },
      callback: (res: any) => {
        if (res.code === 0) {
        }
      }
    })
  }

  public openAlert() {
    this.loadGiftList()
    this.node.active = true
    this.node.runAction(cc.fadeIn(0.4))
  }

  public closeAlert() {
    this.node.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(() => {
        this.node.active = false
      })
    ))
  }
}
