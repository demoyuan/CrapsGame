const { ccclass, property } = cc._decorator

@ccclass
export default class Tips extends cc.Component {
  @property({ type: cc.Label, tooltip: '提示文字' })
  private tipsText: cc.Label = null

  protected onLoad() {
    this.init()
  }

  public init() {
    this.node.active = false
    this.node.x = 0
    let graphics = this.getComponent(cc.Graphics)
    graphics.clear(true)
    graphics.roundRect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height, 16)
    graphics.stroke()
    graphics.fill()
  }

  /**
   * 显示loading
   */
  public showLoading({ status, text = 'Loading...' }: { status: boolean, text: string }) {
    this.changeNodeSize(text)
    this.init()
    this.node.active = status
    this.tipsText.string = text
  }

  /**
   * 显示消息
   */
  public showMessage({ text = '', time = 3000 }: { text: string, time: number }) {
    this.changeNodeSize(text)
    this.init()
    this.node.active = true
    this.tipsText.string = text
    setTimeout(() => {
      this.node.active = false
    }, time)
  }

  /**
   * 修改显示尺寸
   */
  public changeNodeSize(text: string) {
    let fSize = this.tipsText.fontSize
    let fLength = this.fontLength(text)
    let w = fSize * fLength
    let h = 1
    if (w > 600) {
      h = Math.ceil(w / 600)
      w = 600
    }
    this.node.width = w
    this.node.height = h * 60
    this.tipsText.node.width = this.node.width - 80
  }

  /**
   * 获取字符长度
   */
  public fontLength(str: string) {
    let len = 0
    let formatStr = str.trim()
    for (let font of formatStr) {
      font.charCodeAt(0) > 255 ? (len += 2) : len++
    }
    return len
  }
}
