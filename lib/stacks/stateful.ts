import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as environment from '../environment';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { VpcCreate } from '../resources/vpc'

export class StatefulStack extends cdk.Stack {
  public readonly ServiceVpc: ec2.Vpc;
  constructor(scope: Construct, id: string, envs: environment.EnvironmentVariables, props: cdk.StackProps) {
    super(scope, id, props);
    // vpc作成
    this.ServiceVpc = new VpcCreate(this, {
      projectName: envs.common.projectName,
      envName: envs.envName,
      region: envs.region,
      vpccidr: envs.vpcConfig.vpcCidr,
      natgatewayNum: envs.vpcConfig.natgwNum,
    }).vpc
  }
}
