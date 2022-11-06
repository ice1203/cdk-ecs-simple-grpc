import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export interface EcrProps {
    projectName: string;
    envName: string;
}
export class EcrCreate {
  public readonly appRepo: ecr.Repository;
  constructor(scope: Construct, props: EcrProps) {
    // ecr作成
    this.appRepo = new ecr.Repository(scope, 'EcrRepositoryApp', {
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE,
      repositoryName: `${props.projectName}-apprepo-${props.envName}`
    });
  }
}