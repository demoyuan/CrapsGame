const { ccclass, property } = cc._decorator

@ccclass
export default class MapEvent extends cc.Component {
  private scrollMap: cc.ScrollView = null
  private playerComp: any = null

  public mapLength: number = 0
  public mapList: Array<object> = [
    { x: -210, y: -1044, z: 0 },
    { x: -70, y: -960, z: 0 }, // 1
    { x: 60, y: -890, z: 0 },
    { x: 192, y: -795, z: 0 },
    { x: 62, y: -696, z: 0 },
    { x: -96, y: -610, z: 0 }, // 5
    { x: -240, y: -510, z: 0 },
    { x: -128, y: -412, z: 0 },
    { x: 8, y: -315, z: 0 },
    { x: 155, y: -234, z: 0 },
    { x: 31, y: -152, z: 0 }, // 10
    { x: -101, y: -75, z: 0 },
    { x: -96, y: 51, z: 0 },
    { x: -266, y: 76, z: 0 },
    { x: -185, y: 195, z: 0 },
    { x: -64, y: 275, z: 0 }, // 15
    { x: 55, y: 363, z: 0 },
    { x: 170, y: 468, z: 0 },
    { x: 37, y: 545, z: 0 },
    { x: -116, y: 620, z: 0 },
    { x: -257, y: 699, z: 0 }, // 20
    { x: -115, y: 769, z: 0 },
    { x: 68, y: 744, z: 0 },
    { x: 213, y: 833, z: 0 },
    { x: 168, y: 978, z: 0 },
    { x: -1, y: 1025, z: 0 } // 25
  ]

  public shopList: Array<object> | any = []

  protected onLoad() {
    this.scrollMap = this.node.getComponent(cc.ScrollView)
    this.mapLength = this.mapList.length
    this.playerComp = this.scrollMap.node.getComponentInChildren('Player')
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
  }

  /**
   * 获取格子位置坐标
   * @param mapNum 格子ID playerPos
   */
  public getGridPos(mapNum: number): object {
    return this.mapList[mapNum - 1]
  }

  /**
   * 玩家位置相对地图居中
   * @param pos 坐标位置 cc.v2
   */
  public mapCenter(pos: any) {
    let mapW = this.scrollMap.content.width
    let mapH = this.scrollMap.content.height // 2804
    let scrollW = this.scrollMap.node.width
    let scrollH = this.scrollMap.node.height // 1344
    let xPercent = this.getPercent((scrollW + pos.x) / (mapW - scrollW))
    // let yPercent = this.getPercent(1 + pos.y / (mapH - scrollH))
    let hDifference = scrollH / 1000 - 1
    let yPercent = this.getPercent((scrollH + pos.y) / (mapH - scrollH) - hDifference)
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
      if (nowPlayerPos >= this.mapLength) {
        nowPlayerPos = this.mapLength // 终点后不跳
      }
      let pos = this.getGridPos(nowPlayerPos)
      arr = [...arr, this.playerComp.jumpFnc(pos)]
      if (i === mapNum) {
        this.mapCenter(pos)
      }
    }
    return { arr, nowPlayerPos }
  }

  /**
   * 检查是否中奖
   */
  public checkWin(type: number) {
    let shopItem = this.shopList.find((item: any) => item.tokenFrom === type)
    cc.log(shopItem)
    if (shopItem && shopItem.shop) {
      if (shopItem.shop.length === 1) {
        return { win: true, shopItem: { img: shopItem.productImg, shopName: shopItem.shop[0].shopName, productName: shopItem.productName } }
      } else {
        return { win: true, shopItem: { img: shopItem.productImg, shopName: '', productName: shopItem.productName } }
      }
    } else {
      return { win: false, shopItem: null }
    }
  }
}
