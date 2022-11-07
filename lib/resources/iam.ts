import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

//export interface IamProps {
//}
export class IamCreate {
  public readonly ecsAppTaskRole: iam.Role;
  public readonly ecsAppTaskExecRole: iam.Role;
  constructor(
    scope: Construct,
    //props: IamProps
  ) {
    // ecsexecするためのポリシー
    const ECSExecPolicyStatement = new iam.PolicyStatement({
      sid: 'allowECSExec',
      resources: ['*'],
      actions: [
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
        'logs:CreateLogStream',
        'logs:DescribeLogGroups',
        'logs:DescribeLogStreams',
        'logs:PutLogEvents',
      ],
    });
    // ECSタスク定義にセットするIAMロールの作成
    this.ecsAppTaskRole = new iam.Role(scope, 'ecsAppTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    this.ecsAppTaskRole.addToPolicy(ECSExecPolicyStatement);

    // ECSタスク定義の実行ロールの作成
    this.ecsAppTaskExecRole = new iam.Role(scope, 'ecsAppTaskExecRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn:
            'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
        },
      ],
    });
  }
}
