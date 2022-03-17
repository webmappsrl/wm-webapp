/* eslint-disable @typescript-eslint/naming-convention */
export interface IConfDic {
  [name: string]: string | number | boolean | number[] | IConfDic;
}

export interface IState {
  conf: ICONF;
}
