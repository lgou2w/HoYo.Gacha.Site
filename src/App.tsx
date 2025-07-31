import './App.css'
import Logo from './Logo.png'

export default function App () {
  return (
    <div className="root">
      <div className="hero">
        <div className="heroText">
          <div className="heroTextLogo">
            <img className="heroBrand" src={Logo} alt="logo" />
            <h2>HoYo.Gacha</h2>
            <div className="heroTextTagline">非官方工具 · 开源免费</div>
          </div>
          <h1>管理分析你的 miHoYo 抽卡记录</h1>
          <p>支持原神、崩坏：星穹铁道、绝区零等游戏。无需任何本地代理服务器。只需读取 Chromium 缓存文件，快速获取并分析你的抽卡记录。</p>
          <div className="heroTextFeatures">
            <div className="heroTextFeature">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z" /></svg>
              <h3>快捷、方便</h3>
              <p>无需任何本地代理服务器，快速便捷地获取你的抽卡记录数据。</p>
            </div>
            <div className="heroTextFeature">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" /></svg>
              <h3>记录管理</h3>
              <p>本地数据库，支持游戏的多个账号。支持导入或导出 UIGF 等多种交换格式。</p>
            </div>
          </div>
          <div className="heroActions">
            <a className="button heroDownload" href="https://github.com/lgou2w/HoYo.Gacha/releases">立即下载</a>
            <a className="button heroTutorial" href="https://github.com/lgou2w/HoYo.Gacha?tab=readme-ov-file">使用教程</a>
          </div>
        </div>
        <div className="heroVisual">
          <div className="heroVisualPreview">
            <div className="heroVisualHeader">
              <i />
              <div className="heroVisualHeaderBar">
                HoYo.Gacha://Clientarea
              </div>
            </div>
            <div className="heroVisualContent">
              <div className="heroVisualContentGrids">
                <div className="heroVisualContentGrid">
                  <div>总抽数</div>
                  <div>1248</div>
                </div>
                <div className="heroVisualContentGrid">
                  <div>已出金</div>
                  <div>9</div>
                </div>
                <div className="heroVisualContentGrid">
                  <div>最近出金</div>
                  <div>73</div>
                </div>
                <div className="heroVisualContentGrid">
                  <div>保底进度</div>
                  <div>63</div>
                </div>
              </div>
              <div className="heroVisualChart">
                <div className="heroVisualChartPie">
                  <div className="heroVisualChartPieCenter">物品分布</div>
                </div>
                <div className="heroVisualChartLegend">
                  <div className="heroVisualChartLegendItem" data-rank="5">
                    <i />
                    <p>5 星</p>
                    <div>5%</div>
                  </div>
                  <div className="heroVisualChartLegendItem" data-rank="4">
                    <i />
                    <p>4 星</p>
                    <div>12%</div>
                  </div>
                  <div className="heroVisualChartLegendItem" data-rank="3">
                    <i />
                    <p>3 星</p>
                    <div>83%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <p>开源社区玩家开发。本软件不会向您索要任何关于 ©miHoYo 账户的账号密码信息，也不会收集任何用户数据。所有操作均在本地完成，以确保数据和隐私安全。</p>
      </div>
      <div className="sponsors">
        <p>Deploys by <a href="https://www.netlify.com">Netlify</a></p>
        <a href="https://www.netlify.com">
          <img src="https://www.netlify.com/assets/badges/netlify-badge-color-accent.svg" alt="Deploys by Netlify" />
        </a>
      </div>
    </div>
  )
}
