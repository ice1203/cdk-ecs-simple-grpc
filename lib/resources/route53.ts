import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface R53Props {
  ecsTaskAlb: elb.NetworkLoadBalancer;
  hostedzone: route53.IHostedZone,
  domain: string,
}
export class R53recordCreate {
  constructor(
    scope: Construct,
    props: R53Props,
  ) {
    new route53.RecordSet(scope, "ArecordAlb", {
      recordType: route53.RecordType.A,
      recordName: props.domain,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.ecsTaskAlb)),
      zone: props.hostedzone,
    });
  }
}
