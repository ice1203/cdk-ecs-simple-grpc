import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface EcsServiceProps {
  vpc: ec2.IVpc,
  ecsTaskDef: ecs.TaskDefinition,
  ecsTaskSG: ec2.SecurityGroup,
  targetgroup: elb.NetworkTargetGroup, 
  AutoScalingConfig: {
    minCapacity: number,
    maxCapacity: number,
    CpuTarget: number,
    MemTarget: number,
  }
};
export class EcsClusterSvcCreate {
  constructor(scope: Construct, props: EcsServiceProps) {
    // ecsクラスタ作成
    const cluster = new ecs.Cluster(scope, 'ecsCluster', {
      vpc: props.vpc,
      containerInsights: true
    });
    // ecsサービス定義
    const ecsTaskService = new ecs.FargateService( scope, 'ecsTaskService', {
      cluster: cluster,
      desiredCount: props.AutoScalingConfig.minCapacity,
      assignPublicIp: false,
      taskDefinition: props.ecsTaskDef,
      enableExecuteCommand: true,
      securityGroups: [props.ecsTaskSG],
      enableECSManagedTags: true,
      circuitBreaker: { rollback: true },
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      maxHealthyPercent: 200,
      minHealthyPercent: 100,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      propagateTags: ecs.PropagatedTagSource.SERVICE,
    });
    // ecsサービスをターゲットグループに登録
    props.targetgroup.addTarget(ecsTaskService);

    // ecs autoscaling定義
    const scalableTarget = ecsTaskService.autoScaleTaskCount({
      minCapacity: props.AutoScalingConfig.minCapacity,
      maxCapacity: props.AutoScalingConfig.maxCapacity,
    });
    
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: props.AutoScalingConfig.CpuTarget,
    });
    
    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: props.AutoScalingConfig.MemTarget,
    });

  }
}
