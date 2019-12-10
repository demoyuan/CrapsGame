const { ccclass, property } = cc._decorator

@ccclass
export default class Alert extends cc.Component {
  public box: cc.Node = null
  public fire: cc.Node = null
  // public shopList: Array<object> | any = []

  protected onLoad() {
    this.box = this.node.getChildByName('Box')
    this.fire = this.node.getChildByName('Fireworks')
    this.init()
    let repeat = cc.repeatForever(cc.rotateBy(1.0, 90))
    this.fire.runAction(repeat)

    // cc.loader.loadRes('shop', (err, jsonAsset) => {
    //   this.shopList = jsonAsset.json
    // })
  }

  public init() {
    this.node.active = false
    // 弹窗初始位置居中
    let alertWidget = this.getComponent(cc.Widget)
    alertWidget.left = 0
    alertWidget.right = 0

    // 绘制圆角矩形背景
    let graphics = this.box.getComponent(cc.Graphics)
    graphics.roundRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height, 24)
    graphics.fillColor = cc.Color.WHITE
    graphics.stroke()
    graphics.fill()
  }

  public openTips(giftData?: any) {
    let giftNode = this.box.getChildByName('gift')
    let imgSprite = giftNode.getChildByName('img').getComponent(cc.Sprite)
    let shopNameLabel = giftNode.getChildByName('shopName').getComponent(cc.Label)
    let productNameLabel = giftNode.getChildByName('productName').getComponent(cc.Label)
    if (giftData.img) {
      cc.loader.load({ url: giftData.img, type: 'jpg' }, (err: any, texture: any) => {
        if (!err) {
          let originImg = new cc.SpriteFrame(texture)
          let imgSize = originImg.getOriginalSize()
          imgSprite.spriteFrame = new cc.SpriteFrame(texture)
          imgSprite.spriteFrame.setRect(cc.rect(
            imgSize.width / 2 - imgSprite.node.width / 2,
            imgSize.height / 2 - imgSprite.node.height / 2,
            imgSprite.node.width,
            imgSprite.node.height
          ))
        }
      })
    }
    shopNameLabel.string = giftData.shopName
    productNameLabel.string = giftData.productName
    this.node.active = true
    this.node.runAction(cc.fadeIn(0.4))
  }

  public closeTips() {
    this.node.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(() => {
        this.node.active = false
      })
    ))
  }
}
