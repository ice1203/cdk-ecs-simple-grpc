import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as environment from '../environment';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';

import { IamCreate } from '../resources/iam'
import { TargetgroupCreate } from '../resources/targetgroup'
import { SecuritygroupCreate } from '../resources/securitygroup'
import { CwlogGroupCreate } from '../resources/cloudwatchlogs'
import { ElbCreate } from '../resources/elb'
import { EcsTaskCreate } from '../resources/ecstask'
import { EcsClusterSvcCreate } from '../resources/ecscluster-svc'
import { R53recordCreate } from '../resources/route53'

export class StatelessStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    envs: environment.EnvironmentVariables,
    gitCommitID:string,
    serviceVpc: ec2.IVpc,
    props: cdk.StackProps
  ) {
    super(scope, id, props);

    // アカウントID等外部に出したくない値を環境変数から読み込み
    const allowip = process.env.ALLOWIP != null ? process.env.ALLOWIP : "";
    const allowips: string[] = [allowip];

    // 依存リソース
    const certArn = process.env.CERTARN != null ? process.env.CERTARN : "";
    const domain = process.env.DOMAIN != null ? process.env.DOMAIN : "";
    const hostedzoneid = process.env.HOSTEDZONEID != null ? process.env.HOSTEDZONEID : "";
    const r53HostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'r53HostedZone', {
      hostedZoneId: hostedzoneid,
      zoneName: domain,
    });
    // iam作成
    const iamRole = new IamCreate(this);
    // targetGroup作成
    const targetgroup = new TargetgroupCreate(this, serviceVpc,);
    // securityGroup作成
    const securitygroup = new SecuritygroupCreate(this, serviceVpc, {
      projectName: envs.common.projectName,
      envName: envs.envName,
    });
    // elb作成
    const alb = new ElbCreate(this,{
      projectName: envs.common.projectName,
      envName: envs.envName,
      vpc: serviceVpc,
      securityGroup: securitygroup.albSG,
      targetGroup: targetgroup.ecsTask,
      certificateArn: certArn,
      allowSourceIPs: allowips,
    });
    // r53 record作成
    new R53recordCreate(this,{
      ecsTaskAlb: alb.ecsTaskAlb,
      hostedzone: r53HostedZone,
      domain: `${envs.subDomain}.${domain}`,
    });

    // cwlogs作成
    const logGroup = new CwlogGroupCreate(this);
    // ecstask定義作成
    const ecstask = new EcsTaskCreate(this, {
        taskrole: iamRole.ecsAppTaskRole,
        execrole: iamRole.ecsAppTaskExecRole,
        loggroup: logGroup.ecsTaskLogGroup,
        SvcMemMib: envs.ecstaskConfig.SvcMemMib,
        SvcCPU: envs.ecstaskConfig.SvcCPU,
        ContainerConfig: envs.ecstaskConfig.ContainerConfig,
    });

    // ecsクラスタとサービス作成
    const ecssvc = new EcsClusterSvcCreate(this, {
      vpc: serviceVpc,
      ecsTaskDef: ecstask.ecsTaskDef,
      ecsTaskSG: securitygroup.ecsTaskSG,
      targetgroup: targetgroup.ecsTask,
      AutoScalingConfig: envs.ecsServiceConfig.AutoScalingConfig,
    });

    //本スタックのoutputパラメータとしてデプロイしたときのgitコミットIDを付与
    new cdk.CfnOutput(this, 'gitCommitID',{
      value: gitCommitID,
      description: 'The commit ID when this stack was deployed.',
    });
  }
}
