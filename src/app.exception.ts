export class InitModuleException extends Error {
  constructor() {
    super('初始化模块失败，请检查模块代码');
  }
}
