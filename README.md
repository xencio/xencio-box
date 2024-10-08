<p align="center">
  <a href="https://xencio.com/" target="_blank"><img src="https://www.xencio.com/cn/wp-content/uploads/2020/10/Xencio-Logo-200.png" width="200" alt="Xencio Logo" /></a>
</p>

## 见知银企通介绍

<p>银企直联是银行提供的一种银行系统与企业财务软件系统的无缝连接接入方式。该业务通过网上连接，使银行和企业的结算中心、财务公司或企业ERP实现平滑对接、有机融合。企业通过财务系统的界面，就可直接完成对银行账户和资金的管理和调用。</p>

<p>见知银企通的目标是实现企业财资管理自动化和智能化，用户通过见知银企通能全自动获取流水数据，查询管理银行电子对账单文件数据，无需在各个银行的服务端进行繁琐的重复操作，实现企业与银行的无缝对接。</p>

<p>目前，见知银企通已经能够覆盖所有主流银行的银企直联，迄今为止已经为数百客户实现了银企直联的接入，接入的银行超过 100 家。业务包括银企直联接入咨询、银企直联实施、银企直联运维，产品覆盖了从银企直联访问、调试、监控、诊断和高可用的设计的完整生命周期，为银企直联的安全运行保驾护航。</p>

## 设计

结合银企直联业务考虑：
1. 账户的实际操作均在银行侧完成，盒子本身主要是整合规范化请求的发送，没有复杂业务计算。（非阻塞异步I/O）
2. 大量事件订阅需求，例如实时反馈转账结果，银行流水实时获取等。（事件驱动）
3. 各家银行的接口差异很大，复用可能性不高。新银行接入时需要能快速开发验证模块。

综合以上考虑选用Nodejs进行设计开发，实现开箱即用。

## 公司情况

<p><a href="https://xencio.com/" target="_blank">见知数据</a>是一家专注于将人工智能等技术应用于企业级现金流分析与管理领域的科技公司，为行业领军企业和金融机构提供适合的现金流分析与管理产品和服务。</p>

<p><a href="https://xencio.com/" target="_blank">见知数据</a>是上海市「专精特新」企业，迄今为止累计处理超过30万亿金额的流水交易大数据，对手方超过100万家，已获35项软件著作权及专利、双软企业认证、ISO27001、27017安全认证，亦被评为上海市高新技术企业，毕马威中国2021领先金融科技50企业。</p>

<img src="https://www.xencio.com/cn/wp-content/uploads/2021/07/xencio-public-wechat-qr.jpg">

## 支持

除接口服务外，见知团队还开发了web端针对不同银行直连配置信息的管理服务

<img src="https://www.xencio.com/cn/wp-content/uploads/2022/06/banks.png" alt="web-list" />

当前项目中包含了「中国银行」银企直联开源代码，如有关于其他银行银企直联接入、运行、维护等相关技术问题，可咨询见知银企通负责人。

![image](https://github.com/user-attachments/assets/8b7e6aad-4c9e-44b3-a3bb-1a869d7f81dc)

## License

见知银企通采用[Apache-2.0 License](LICENSE).

## 安装

```bash
$ npm install
```

## 运行

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
