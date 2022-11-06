import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as environment from '../environment';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { EcrCreate } from '../resources/ecr'

export class StatefulStack extends cdk.Stack {
  public readonly TaskContainerRepository: ecr.Repository;
  constructor(scope: Construct, id: string, envs: environment.EnvironmentVariables, gitCommitID:string, props: cdk.StackProps) {
    super(scope, id, props);
    // ecr作成
    this.TaskContainerRepository = new EcrCreate(this, {
        projectName: envs.common.projectName,
        envName: envs.envName,
      },
    ).appRepo
    //本スタックのoutputパラメータとしてデプロイしたときのgitコミットIDを付与
    new cdk.CfnOutput(this, 'gitCommitID',{
      value: gitCommitID,
      description: 'The commit ID when this stack was deployed.',
    });
  }
}
