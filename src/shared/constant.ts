export const enum BOX_CODE {
  SUCCESS = 'X0000',
  PUBLIC_KEY_ERROR = 'X4002',
  BANK_CONFIGURATION_EMPTY = 'X4006',
  BANK_EMPTY = 'X5004',
  BANK_TRANSFER_PROCESS = 'X5555',
  BANK_FAILURE = 'X9999'
}

export const BOX_MESSAGE = new Map<BOX_CODE, string>([
  [BOX_CODE.PUBLIC_KEY_ERROR, '签名验证不通过，请检查企业应用的企业公钥配置！'],
  [BOX_CODE.BANK_CONFIGURATION_EMPTY, '此银行配置不存在，请检查企业应用的银行服务配置！'],
  [BOX_CODE.BANK_EMPTY, '此银行服务不存在，请检查银行服务部署！'],
  [BOX_CODE.BANK_TRANSFER_PROCESS, '付款进行中，请使用transStatus进行最终状态确认。'],
  [BOX_CODE.BANK_FAILURE, '银行服务错误，请检查后再试！']
]);
