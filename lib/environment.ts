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
  region: string,
  envName: string,
  vpcConfig: {
    vpcCidr: string,
    natgwNum: number,
  },
  ecstaskConfig: {
    SvcMemMib: number;
    SvcCPU: number;
    ContainerConfig: {
      Variables: {[key: string]: any},
      ContainerMemMib: number,
      ContainerCPU: number,
    },
  },
  ecsServiceConfig: {
    AutoScalingConfig: {
      minCapacity: number,
      maxCapacity: number,
      CpuTarget: number,
      MemTarget: number,
    },
  },
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
    region: "ap-northeast-1",
    envName: "prod",
    vpcConfig: {
      vpcCidr: "10.0.0.0/16",
      natgwNum: 0,
    },
    ecstaskConfig: {
      SvcMemMib: 512,
      SvcCPU: 256,
      ContainerConfig: {
        Variables: {
        },
        ContainerMemMib: 512,
        ContainerCPU: 256,
      },
    },
    ecsServiceConfig: {
      AutoScalingConfig: {
        minCapacity: 1,
        maxCapacity: 1,
        CpuTarget: 60,
        MemTarget: 60,
      },
    },
  },
  [envs.STG] : {
    common: CommonVariablesSetting,
    region: "ap-northeast-1",
    envName: "stg",
    vpcConfig: {
      vpcCidr: "10.1.0.0/16",
      natgwNum: 1,
    },
    ecstaskConfig: {
      SvcMemMib: 512,
      SvcCPU: 256,
      ContainerConfig: {
        Variables: {
        },
        ContainerMemMib: 512,
        ContainerCPU: 256,
      },    
    },
    ecsServiceConfig: {
      AutoScalingConfig: {
        minCapacity: 1,
        maxCapacity: 1,
        CpuTarget: 60,
        MemTarget: 60,
      },
    },
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