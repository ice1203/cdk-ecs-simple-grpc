#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StatefulStack } from '../lib/stacks/stateful';
import { StatelessStack } from '../lib/stacks/stateless';
import * as environment from '../lib/environment';

const app = new cdk.App();

const target: environment.Environments = app.node.tryGetContext('target') as environment.Environments;
if(!target || !environment.variablesOf(target)) throw new Error('Invalid target environment');
const envs = environment.variablesOf(target);

//ContextからgitcommitID取得
const gitCommitID: string = app.node.tryGetContext('gitCommitID');
//gitcommitIDが定義されてない場合エラー !で否定,空文字列の場合falseとなることを利用
if ( !app.node.tryGetContext('gitCommitID') ) throw new Error('gitCommitID is not exsits. please check readme.')

// statefulなリソースを作成するスタック
const stateful = new StatefulStack(app, `${envs.common.projectName}-StatefulStack-${envs.envName}`, envs, gitCommitID, {
  description: envs.common.projectName,
  env: {
    region: envs.region,
  },
});
// スタック全体にIaCタグを付与
cdk.Tags.of(stateful).add('iac','cdk');

// statelessなリソースを作成するスタック
const stateless = new StatelessStack(app, `${envs.common.projectName}-StatelessStack-${envs.envName}`, envs, gitCommitID, stateful.ServiceVpc, {
  description: envs.common.projectName,
  env: {
    region: envs.region,
  },
});
// スタック全体にIaCタグを付与
cdk.Tags.of(stateless).add('iac','cdk');
