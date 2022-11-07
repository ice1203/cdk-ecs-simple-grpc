import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface SecurityGProps {
  projectName: string;
  envName: string;
}
export class SecuritygroupCreate {
  public readonly albSG: ec2.SecurityGroup;
  public readonly ecsTaskSG: ec2.SecurityGroup;
  constructor(scope: Construct, vpc: ec2.IVpc, props: SecurityGProps) {
    // alb用セキュリティグループ作成
    this.albSG = new ec2.SecurityGroup(scope, 'albsg', {
      securityGroupName: `${props.projectName}-albsg-${props.envName}`,
      vpc: vpc,
    });

    // ecsタスク用セキュリティグループ作成
    this.ecsTaskSG = new ec2.SecurityGroup(scope, 'ecstasksg', {
        securityGroupName: `${props.projectName}-ecstasksg-${props.envName}`,
        vpc: vpc,
    });
  }
}
