import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cwlogs from 'aws-cdk-lib/aws-logs';

export class CwlogGroupCreate {
  public readonly ecsTaskLogGroup: cwlogs.LogGroup;
  constructor(scope: Construct) {
    // ecsサービスがログ出力する場所の作成
    this.ecsTaskLogGroup = new cwlogs.LogGroup(scope, 'ecsTaskLogGroup', {
      removalPolicy: RemovalPolicy.RETAIN,
      retention: cwlogs.RetentionDays.ONE_WEEK,
    });
  }
}
