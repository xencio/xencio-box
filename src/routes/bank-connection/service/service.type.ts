import { DEFAULT_PAGE_SIZE } from '../controller/controller.request';

export function normalizePageable(
  pageNow: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  totalCount: number = 0
): PageableResponse {
  const totalPageCount = Math.ceil(totalCount / pageSize);
  return {
    pageNow,
    pageSize,
    totalCount,
    totalPageCount,
    isFirst: pageNow === 1,
    isLast: pageNow === totalPageCount,
    hasPre: pageNow > 1,
    hasNext: pageNow < totalPageCount
  };
}

// 账户信息
export interface AccountInfo {
  accountNo: string; // 账号
  balance: number; // 余额
  availableBalance?: number; // 有效余额
  overdraftBalance?: number; //透支金额
  frozenBalance?: number; //冻结金额
  currency?: string; // 币种
}

export const enum AMOUNT_FLAG {
  PLUS = 'C', // 贷
  MINUS = 'D' // 借
}

// 账户流水
export interface AccountStatement {
  accountCode: string;
  accountName: string;
  accountBank: string;
  trxDate: Date;
  amount: number;
  flag: AMOUNT_FLAG;
  currency: string;
  customerAccountCode: string;
  customerName: string;
  customerBank: string;
  userMemo: string;
  trxNumber: string;
  balance?: number;
  cashType?: string;
}

export interface PageableResponse {
  pageNow: number;
  pageSize: number;
  totalCount: number;
  totalPageCount?: number;
  isFirst?: boolean;
  isLast?: boolean;
  hasPre?: boolean;
  hasNext?: boolean;
}
