/**
* 環境名の定義
*/
const envs = {
  PROD: 'prod',
  STG: 'stg',
  DEV: 'dev'
} as const
// prod | stg | devの文字列しか許さない型
export type Environments = typeof envs[keyof typeof envs]

/**
* 各環境共通で使用する変数のinterface
*/
export interface CommonVariables {
  // project名。各種リソース名に使用
  projectName: string,
};
/**
* 各環境に紐づく環境変数のinterface
*/
export interface EnvironmentVariables {
  common: CommonVariables,
  accountId: string,
  region: string,
  envName: string,
};

/**
* 各環境共通で使用する変数の具体的な設定値
*/
const CommonVariablesSetting: CommonVariables = {
  projectName: 'simpleecs',
}
/**
* 各環境ごとの具体的な設定値
*/
const EnvironmentVariablesSetting: {[key:string]: EnvironmentVariables} = {
  [envs.PROD] : {
    common: CommonVariablesSetting,
    accountId: "",
    region: "ap-northeast-1",
    envName: "prod"
  },
  [envs.STG] : {
    common: CommonVariablesSetting,
    accountId: "",
    region: "ap-northeast-1",
    envName: "stg"
  },
};

/**
* envに紐づく環境変数を返す
* @param env 取得したい対象の環境
* @return envに紐づく環境変数
*/
export function variablesOf(env: Environments): EnvironmentVariables{
  return EnvironmentVariablesSetting[env];
}