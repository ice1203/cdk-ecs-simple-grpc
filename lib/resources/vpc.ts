import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { aws_ec2 } from 'aws-cdk-lib';

export interface VpcProps {
  projectName: string;
  envName: string;
  region: string;
  vpccidr: string;
  natgatewayNum: number;
}
export class VpcCreate {
  public readonly vpc: ec2.Vpc;
  constructor(
    scope: Construct,
    props: VpcProps,
  ) {
    // VPC設定
    this.vpc = new ec2.Vpc(scope, 'myVPC', {
      vpcName: `${props.projectName}-vpc-${props.envName}`,
      ipAddresses: aws_ec2.IpAddresses.cidr(props.vpccidr),
      natGateways: props.natgatewayNum,
      vpnGateway: false,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      ]
    })
  }
}
