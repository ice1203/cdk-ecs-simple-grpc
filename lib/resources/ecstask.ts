import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface EcsTaskProps {
  taskrole: iam.Role,
  execrole: iam.Role,
  loggroup: logs.LogGroup, 
  SvcMemMib: number;
  SvcCPU: number;
  ContainerConfig: {
    Variables: {[key: string]: any},
    ContainerMemMib: number,
    ContainerCPU: number,
  };
}
export class EcsTaskCreate {
  public readonly ecsTaskDef: ecs.TaskDefinition;
  constructor(scope: Construct, props: EcsTaskProps) {
    // ecsタスク定義
    this.ecsTaskDef = new ecs.FargateTaskDefinition(scope, 'ecsTaskDef', {
      memoryLimitMiB: props.SvcMemMib,
      cpu: props.SvcCPU,
      executionRole: props.execrole,
      taskRole: props.taskrole,
      // m1 mac上でdocker buildするのでarm64にしている
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
      }
    });

    // コンテナ定義
    const appContainer = this.ecsTaskDef.addContainer('appContainer', {
      image: ecs.ContainerImage.fromAsset("./docker/grpc-test/"),
      cpu: props.ContainerConfig.ContainerCPU,
      memoryReservationMiB: props.ContainerConfig.ContainerMemMib,
      environment: props.ContainerConfig.Variables,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'app/appContainer',
        logGroup: props.loggroup,
      })
    });
    appContainer.addPortMappings({
      protocol: ecs.Protocol.TCP,
      hostPort: 8080,
      containerPort: 8080,
    });
  }
}
