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

// statefulなリソースを作成するスタック
const stateful = new StatefulStack(app, `${envs.common.projectName}-StatefulStack-${envs.envName}`, envs, {
  description: envs.common.projectName,
  env: {
    region: envs.region,
  },
});
// スタック全体にIaCタグを付与
cdk.Tags.of(stateful).add('iac','cdk');

// statelessなリソースを作成するスタック
const stateless = new StatelessStack(app, `${envs.common.projectName}-StatelessStack-${envs.envName}`, stateful.ServiceVpc, {
  description: envs.common.projectName,
  env: {
    region: envs.region,
  },
});
// スタック全体にIaCタグを付与
cdk.Tags.of(stateless).add('iac','cdk');
