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

  public box: cc.Node = null
  public content: any = null

  private ajax = new httpRequest()
  public shopList: Array<object> | any = []

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    cc.loader.loadRes('shop', (err, jsonAsset) => {
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

    if (data.shops.length === 1) {
      let shop = data.shops[0]
      this.changeGiftImage(newGift, shop.productImg)
      this.changeGiftShopName(newGift, shop.productName)
      this.changeGiftBtn(newGift, { shopId: shop.shopId, couponType: data.couponType, tokenFrom: data.tokenFrom })
    } else {
      data.shops.map((item: any) => {
        this.newShopItem(newGift, item)
      })
      this.changeGiftImage(newGift, '')
      this.changeGiftShopName(newGift, 'aaaaa')
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
    let shopItemLayoutHeight = (newShop.height + 60)
    giftItem.height += shopItemLayoutHeight
    giftItem.getChildByName('bg').height += shopItemLayoutHeight
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
        let originImg = new cc.SpriteFrame(texture)
        let imgSize = originImg.getOriginalSize()
        imgSprite.spriteFrame = new cc.SpriteFrame(texture)
        // 居中裁剪
        imgSprite.spriteFrame.setRect(cc.rect(
          imgSize.width / 2 - imgSprite.node.width / 2,
          imgSize.height / 2 - imgSprite.node.height / 2,
          imgSprite.node.width,
          imgSprite.node.height
        ))
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
    label.string = `有效期：${this.timeFormat({ time: time.startTm })}-${time.endTm && this.timeFormat(time.endTm)}`
  }

  /**
   * 跳转app门店页面
   */
  public changeGiftBtn(giftNode: cc.Node, data: any) {
    let btn = giftNode.getChildByName('btn').getComponent(cc.Button)
    let clickEventHandler = new cc.Component.EventHandler()
    clickEventHandler.target = this.node
    clickEventHandler.component = 'GiftPackAlert'
    clickEventHandler.handler = 'goAppShopInfo'
    clickEventHandler.customEventData = data
    btn.clickEvents.push(clickEventHandler)
  }

  public goAppShopInfo(event: any, customEventData: any) {
    alert(JSON.stringify({ touchPos: 'ShopInfo', ...customEventData }))
  }

  public loadGiftList() {
    this.ajax.httpPost({
      url: '/user/coupon/allCoupons',
      callback: (res: any) => {
        if (res.code === 0) {
          res.data.map((item: any) => {
            if (item.tokenFrom >= 101 && item.tokenFrom <= 125) {
              let shopItem = this.shopList.find((shop: any) => shop.tokenFrom === item.tokenFrom)
              if (shopItem) {
                let obj = {
                  tokenFrom: item.tokenFrom,
                  couponType: item.couponId,
                  startTm: item.createTm,
                  endTm: item.expiredTm,
                  status: item.status, // 0：已使用， 1：未使用
                  shops: shopItem.shop
                }
                this.newGiftItem(obj)
              }
            }
          })
        }
      }
    })
  }

  public loadTest() {
    let shopItem = this.shopList.find((shop: any) => shop.tokenFrom === 102)
    if (shopItem) {
      let obj = {
        tokenFrom: shopItem.tokenFrom,
        couponType: shopItem.couponId,
        startTm: 1575730406599,
        endTm: 1575770406599,
        status: 1, // 0：已使用， 1：未使用
        shops: shopItem.shop
      }
      this.newGiftItem(obj)
    }
  }

  public openAlert() {
    // this.loadGiftList()
    this.loadTest()
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
