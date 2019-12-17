const { ccclass, property } = cc._decorator

@ccclass
export default class HttpRequest extends cc.Component {
  private baseDev: string = 'http://172.16.47.75:8888/whoot/whoot-local'
  private baseQc: string = 'https://qc-k8s.ingcreations.com/gw/whoot-local'
  private baseRelease: string = 'https://test.whoot.com/api'

  public sendXhr(type: string, url: string, callback: any, dataStr?: string) {
    let xhr = cc.loader.getXMLHttpRequest()
    switch (window.location.host) {
      case 'qc.whoot.com':
        url = this.baseQc + url
        break
      case 'hk.whoot.com':
        url = this.baseRelease + url
        break
      default:
        // url = this.baseDev + url
        url = this.baseQc + url
    }

    xhr.open(type, url, true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        let response = xhr.responseText
        if (xhr.status >= 200 && xhr.status < 400) {
          callback(JSON.parse(response))
        }
      }
    }
    let userData = JSON.parse(cc.sys.localStorage.getItem('userData'))
    xhr.setRequestHeader('whoot_token', userData.token)
    xhr.setRequestHeader('client_version', 'v2.8.0')
    if (type === 'GET') {
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')
      xhr.send()
    } else {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
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
    this.sendXhr('GET', `${url}?${dataStr}`, callback)
  }

  public httpPost({ url, params, callback }: { url: string, params?: object, callback: any }) {
    let dataStr = this.formatParams(params)
    this.sendXhr('POST', url, callback, dataStr)
  }
}
