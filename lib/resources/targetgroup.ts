import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'


export class TargetgroupCreate {
  public readonly ecsTask: elb.ApplicationTargetGroup;
  constructor(scope: Construct, vpc: ec2.IVpc) {
    // albターゲットグループ作成
    this.ecsTask = new elb.ApplicationTargetGroup(scope, 'ecsTasktargetGroup', {
      vpc: vpc,
      targetType: elb.TargetType.IP,
      port: 8080,
      protocol: elb.ApplicationProtocol.HTTP,
      // protocolVersionにGRPCを指定
      protocolVersion: elb.ApplicationProtocolVersion.GRPC,
      healthCheck: {
        enabled: true,
        // /package.service/method　の形式でヘルスチェックパスを入力
        path: '/myapp.GreetingService/Hello',
        // grpcのリターンコードは0-99
        healthyGrpcCodes: '0',
      },
    });
  }
}
