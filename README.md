# simple ECS

simple な ECS サービス

# Requirement

前提となる依存リソース

- 適当なドメインを用意
- Route53 にて 上記ドメインの Hosted Zone の作成
- ACM にてサービスドメイン用の証明書発行

# Installation

cdk にて各種リソースを作成しているので作成・更新には cdk が必要です

## 前提ツール

1. AWS CLI
2. node.js （バージョン 13.0.0 ～ 13.6.0 を除く 10.13.0 以上）
3. typescript （TypeScript 2.7 以降）
4. aws-cdk CLI

## リソース作成・更新手順

以下のコマンドを実行

```
# cdk ディレクトリに node.js 依存パッケージをインストール（git clone した直後の初回のみ実行が必要です）
git clone ＜gitのurl＞
cd ＜cloneしてできたディレクトリ＞/
npm install

# 環境変数代入（外部に公開したくない値だけコードに含めずデプロイ時に指定)
export CERTARN="<ALBにつけるACMのARN>"
export DOMAIN="<サブドメインを含まないドメイン（例：app.example.comならexample.com>"
export HOSTEDZONEID="<Route53のHostedzoneID>"
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
