import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
//import * as s3 from 'aws-cdk-lib/aws-s3';

export interface ElbProps {
  projectName: string;
  envName: string;
  vpc: ec2.IVpc,
  securityGroup: ec2.SecurityGroup,
  targetGroup: elb.NetworkTargetGroup,
  //logbucket: s3.IBucket,
  allowSourceIPs: string[],
}
export class ElbCreate {
  public readonly ecsTaskAlb: elb.NetworkLoadBalancer;
  constructor(
    scope: Construct,
    props: ElbProps
  ) {
    this.ecsTaskAlb = new elb.NetworkLoadBalancer(scope, 'NLB', {
      vpc: props.vpc,
      loadBalancerName: `${props.projectName}-Nlb-${props.envName}`,
      internetFacing: true,
      //securityGroup: props.securityGroup,
      vpcSubnets: { subnets: props.vpc.publicSubnets },
      
    });
    //ecsTaskAlbログ出力設定
    //this.ecsTaskAlb.logAccessLogs(logbucket, props.ecsTaskAlbName);
    // ecsTaskAlbリスナー作成
    this.ecsTaskAlb.addListener('tcpListener', { 
      port: 443,
      protocol: elb.Protocol.TCP,
      defaultAction: elb.NetworkListenerAction.forward([props.targetGroup]),
    });

  }
}
