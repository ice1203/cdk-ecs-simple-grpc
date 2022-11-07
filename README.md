# simple ECS

simple な ECS サービス

# 本 cdk で作成されるリソース

- stateful スタック（rds,dynamoDB などデータを保持する必要のあるリソースとそれらの作成に前提となるリソースを作成する cloudformation スタック）
  - ecr
  - vpc
- stateless スタック（ecs タスク等、git 上のコードがあれば再作成可能なリソース※を作成する cloudformation スタック）
  - ecs 関連
    - ecs クラスタ
    - ecs サービス定義
    - ecs タスク定義
    - ecs autoscaling 定義
    - ecs タスク用セキュリティグループと IAM ロール
    - ecs タスク用 cloudwatchlogs
  - alb 関連
    - alb
    - ターゲットグループ
    - リスナー
    - alb 用セキュリティグループ

※cloudwatchlogs など単純なログで保持するデータが他リソースに依存しないのであれば RemovalPolicy で RETAIN にした上でここに含める

# Requirement

前提となる依存リソース

## 周辺システム

# Installation

cdk にて各種リソースを作成しているので作成・更新には cdk が必要です

## 前提ツール

1. AWS CLI
2. node.js （バージョン 13.0.0 ～ 13.6.0 を除く 10.13.0 以上）
3. typescript （TypeScript 2.7 以降）
4. aws-cdk CLI

## deploy

1. cdk ディレクトリに node.js 依存パッケージをインストール（git clone した直後の初回のみ実行が必要です）

```
git clone ＜gitのurl＞
cd ＜cloneしてできたディレクトリ＞/
npm install
```

## リソース更新手順

以下のコマンドを実行

```
# 環境変数代入（外部に公開したくない値だけコードに含めずデプロイ時に指定)
export CERTARN="<ALBにつけるACMのARN>"
export ALLOWIP="<接続を許可するIPアドレス>/<サブネットマスク>"

# cdk diffで現状との差分確認
cdk diff --all --profile ＜対象アカウントのプロファイル名＞ -c target=＜stg or prod＞ -c gitCommitID=$(git rev-parse HEAD)

# diffして変更箇所が問題なければ以下コマンドでdeployする。yes noで実行するか聞かれたりしないので注意
cdk deploy --all --profile ＜対象アカウントのプロファイル名＞ -c target=＜stg or prod＞ -c gitCommitID=$(git rev-parse HEAD)
```

# Note

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
