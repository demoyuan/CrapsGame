const { ccclass, property } = cc._decorator
import httpRequest from './HttpRequest'

@ccclass
export default class GiftPackAlert extends cc.Component {
  @property({ type: cc.ScrollView, tooltip: '滚动列表' })
  private scrolView: cc.ScrollView = null

  @property({ type: cc.Prefab, tooltip: 'gift item' })
  private giftItem: cc.Prefab = null

  @property({ type: cc.Prefab, tooltip: 'shop item' })
  private shopItem: cc.Prefab = null

  @property({ type: cc.Node, tooltip: '兑换完毕提示' })
  private giftEmptyTips: cc.Node = null

  public box: cc.Node = null
  public content: any = null

  private ajax = new httpRequest()
  public shopList: Array<object> | any = []

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    let shopJson = ''
    switch (window.location.host) {
      case 'hk.whoot.com':
        shopJson = 'shop'
        break
      default:
        shopJson = 'shop-qc'
    }
    cc.loader.loadRes(shopJson, (err, jsonAsset) => {
      this.shopList = jsonAsset.json
    })
    this.init()
  }

  public init() {
    this.node.active = false
    let titleBox = this.box.getChildByName('Title')
    let graphics = titleBox.getComponent(cc.Graphics)
    graphics.clear(true)
    graphics.roundRect(-titleBox.width / 2, -titleBox.height / 2, titleBox.width, titleBox.height, 30)
    graphics.stroke()
    graphics.fill()
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0
    alertWidget.updateAlignment() // 执行 widget 对齐操作
    this.content = this.scrolView.content
  }

  /**
   * 创建新的gift节点
   */
  public newGiftItem(data: any) {
    let newGift = cc.instantiate(this.giftItem)
    this.changeGiftTime(newGift, { startTm: data.startTm, endTm: data.endTm })
    this.changeGiftImage(newGift, data.productImg)
    this.changeGiftShopName(newGift, data.productName)
    this.changeGiftStatus(newGift, { status: data.status, endTm: data.endTm })

    if (data.shops.length === 1) { // 礼包对应一个门店显示的UI
      let shop = data.shops[0]
      this.changeGiftBtn(newGift, { shopId: shop.shopId, couponType: data.couponType, tokenFrom: data.tokenFrom, status: data.status })
    } else {
      if (data.status === 0) { // 已使用状态， 显示评论按钮
        this.changeGiftBtn(newGift, { status: data.status })
      } else { // 礼包对应多个门店情况，按钮隐藏
        newGift.getChildByName('btn').active = false
      }
      data.shops.map((item: any) => {
        this.newShopItem(newGift, { ...item, ...{ couponType: data.couponType, tokenFrom: data.tokenFrom, status: data.status } })
      })
    }
    this.content.addChild(newGift)
  }

  /**
   * 创建新的shop item节点
   */
  public newShopItem(giftItem: cc.Node, data: any) {
    let newShop = cc.instantiate(this.shopItem)
    let shopItemLayout = giftItem.getChildByName('shopItemLayout')
    shopItemLayout.addChild(newShop)
    shopItemLayout.getComponent(cc.Layout).updateLayout()
    let shopItemLayoutHeight = (newShop.height + 15)
    giftItem.height += shopItemLayoutHeight
    giftItem.getChildByName('bg').height += shopItemLayoutHeight
    this.changeGiftImage(newShop, data.shopImg)
    this.changeGiftShopName(newShop, data.shopName)
    if (data.status === 0) {
      newShop.getChildByName('btn').active = false
    } else {
      this.changeGiftBtn(newShop, { shopId: data.shopId, couponType: data.couponType, tokenFrom: data.tokenFrom, status: data.status })
    }
  }


  /**
   * 修改Gift Prefab 图片
   */
  public changeGiftImage(giftNode: cc.Node, url: string) {
    if (!url) {
      return false
    }
    let imgSprite = giftNode.getChildByName('img').getComponent(cc.Sprite)
    // 加载远程图片
    cc.loader.load({ url, type: 'jpg' }, (err: any, texture: any) => {
      if (!err) {
        imgSprite.spriteFrame = new cc.SpriteFrame(texture)
      }
    })
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
    if (time.endTm) {
      label.string = `有效期：${this.timeFormat({ time: time.startTm })}-${this.timeFormat({ time: time.endTm })}`
    } else {
      label.string = ''
    }
  }

  /**
   * 修改奖品状态
   */
  public changeGiftStatus(giftNode: cc.Node, data: any) {
    let statusNode = giftNode.getChildByName('status')
    let imgSprite = statusNode.getComponent(cc.Sprite)
    if (data.status === 0) { // 已兑换
      cc.loader.loadRes('ui/tag_redeemed', cc.SpriteFrame, (err, spriteFrame) => {
        imgSprite.spriteFrame = spriteFrame
      })
      statusNode.active = true
    }
    else if (data.endTm && data.endTm < new Date().getTime()) { // 已过期
      cc.loader.loadRes('ui/tag_expired', cc.SpriteFrame, (err, spriteFrame) => {
        imgSprite.spriteFrame = spriteFrame
      })
      statusNode.active = true
      giftNode.getChildByName('btn').active = false
    }
  }

  /**
   * 跳转app门店页面
   */
  public changeGiftBtn(giftNode: cc.Node, data: any) {
    let btnNode = giftNode.getChildByName('btn')
    let btn = btnNode.getComponent(cc.Button)
    let clickEventHandler = new cc.Component.EventHandler()
    clickEventHandler.target = this.node
    clickEventHandler.component = 'GiftPackAlert'
    clickEventHandler.handler = 'goAppShopInfo'
    clickEventHandler.customEventData = data
    if (data.status === 0) {
      let btnLabel = btnNode.getComponentInChildren(cc.Label)
      btnLabel.string = '評論'
      btnLabel.node.color = new cc.Color(252, 74, 26)
      clickEventHandler.handler = 'goAppShopComment'
      cc.loader.loadRes('ui/btn_tocomplete', cc.SpriteFrame, (err, spriteFrame) => {
        btnNode.getComponentInChildren(cc.Sprite).spriteFrame = spriteFrame
      })
    }
    btn.clickEvents.push(clickEventHandler)
  }

  public goAppShopInfo(event: any, customEventData: any) {
    this.ajax.httpPost({
      url: '/user/game/limit',
      params: {
        tokenFrom: customEventData.tokenFrom
      },
      callback: (res: any) => {
        this.closeAlert()
        if (res.code === 0) {
          alert(JSON.stringify({ touchPos: 'ShopInfo', ...customEventData }))
        } else {
          this.giftEmptyTips.getComponent('GiftEmptyTips').openTips()
        }
      }
    })
  }
  public goAppShopComment(event: any) {
    alert(JSON.stringify({ touchPos: 'Comment' }))
  }

  public loadGiftList() {
    this.ajax.httpPost({
      url: '/user/coupon/allCoupons',
      callback: (res: any) => {
        if (res.code === 0) {
          let giftArr = res.data.filter((item: any) => item.tokenFrom >= 101 && item.tokenFrom <= 125)
          cc.log('gift pack: ', giftArr)
          if (giftArr.length > 0) {
            this.showEmptyTips(false)
            giftArr.map((item: any) => {
              if (item.tokenFrom >= 101 && item.tokenFrom <= 125) {
                let shopItem = this.shopList.find((shop: any) => shop.tokenFrom === item.tokenFrom)
                if (shopItem) {
                  let obj = {
                    tokenFrom: item.tokenFrom,
                    couponType: item.couponId,
                    startTm: item.createTm,
                    endTm: item.expiredTm,
                    status: item.status, // 0：已使用， 1：未使用
                    shops: shopItem.shop || [],
                    productName: shopItem.productName,
                    productImg: shopItem.productImg
                  }
                  this.newGiftItem(obj)
                }
              }
            })
          } else {
            this.showEmptyTips(true)
          }
        }
      }
    })
  }

  /**
   * 显示空背包提示
   */
  public showEmptyTips(show: boolean) {
    this.box.getChildByName('emptyTips').active = show
  }

  public loadTest() {
    let shopItem = this.shopList.find((shop: any) => shop.tokenFrom === 102)
    if (shopItem) {
      let obj = {
        tokenFrom: shopItem.tokenFrom,
        couponType: shopItem.couponId,
        startTm: 1575730406599,
        endTm: 1575770406599,
        status: 1,
        shops: shopItem.shop,
        productName: shopItem.productName,
        productImg: shopItem.productImg
      }
      this.newGiftItem(obj)
    }
  }

  public openAlert() {
    this.loadGiftList()
    // this.loadTest()
    this.node.active = true
    this.node.runAction(cc.sequence(
      cc.fadeIn(0.1),
      cc.callFunc(() => {
        this.box.runAction(cc.moveTo(0.4, cc.v2(0, -(this.node.height / 2 - this.box.height / 2))))
      })
    ))
  }

  public closeAlert() {
    this.node.runAction(cc.sequence(
      cc.callFunc(() => {
        this.box.runAction(cc.moveTo(0.3, cc.v2(0, -(this.node.height / 2 + this.box.height / 2 + 170))))
      }),
      cc.fadeOut(0.8),
      cc.callFunc(() => {
        this.node.active = false
      }),
      cc.callFunc(() => {
        this.content.destroyAllChildren()
      })
    ))
  }

  public timeFormat({ time }) {
    let data = new Date(time)
    let obj = {
      y: data.getFullYear(),
      m: this.supplement(data.getMonth() + 1),
      d: this.supplement(data.getDate()),
      h: this.supplement(data.getHours()),
      mi: this.supplement(data.getMinutes()),
      s: this.supplement(data.getSeconds())
    }
    return `${obj.y}/${obj.m}/${obj.d}`
  }

  /**
   * @description 个位数补零
   */
  public supplement = (n: any) => {
    return (n = n < 10 ? '0' + n : n.toString())
  }
}
