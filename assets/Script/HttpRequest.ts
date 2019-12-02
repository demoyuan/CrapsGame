const { ccclass, property } = cc._decorator

@ccclass
export default class HttpRequest extends cc.Component {
  // private baseUrl: string = 'https://service.ingcreations.com'
  private baseUrl: string = 'http://172.16.47.75:8888/whoot/whoot-local'

  public sendXhr(type: string, url: string, callback: any, dataStr?: string) {
    let xhr = cc.loader.getXMLHttpRequest()
    xhr.open(type, url, true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        let response = xhr.responseText
        if (xhr.status >= 200 && xhr.status < 400) {
          callback(JSON.parse(response))
        }
      }
    }
    if (type === 'GET') {
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')
      xhr.send()
    } else {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.setRequestHeader('whoot_token', 'd0bd30b97d9546a0934ab0f3202ca2cd') // 65976
      xhr.send(dataStr)
    }
  }

  public formatParams(params: object) {
    let dataStr = ''
    if (params) {
      Object.keys(params).forEach(key => {
        dataStr += `${key}=${encodeURIComponent(params[key])}&`
      })
    }
    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
    }
    return dataStr
  }

  public httpGet({ url, params, callback }: { url: string, params?: object, callback: any }) {
    let dataStr = this.formatParams(params)
    url = this.baseUrl + `${url}?${dataStr}`
    this.sendXhr('GET', url, callback)
  }

  public httpPost({ url, params, callback }: { url: string, params?: object, callback: any }) {
    let dataStr = this.formatParams(params)
    url = this.baseUrl + url
    this.sendXhr('POST', url, callback, dataStr)
  }
}
