import * as cdk from 'aws-cdk-lib';
import {
  aws_iam,
  RemovalPolicy,
  aws_ec2,
  aws_ecs,
  aws_logs,
  Tags,
  Duration,
  aws_elasticloadbalancingv2,
  ScopedAws,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as environment from '../environment';

export class StatelessStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: aws_ec2.IVpc,
    props: cdk.StackProps
  ) {
    super(scope, id, props);

    // アカウントID等外部に出したくない値を環境変数から読み込み
    const allowip = process.env.ALLOWIP != null ? process.env.ALLOWIP : "";
    const allowips: string[] = [allowip];

    // 依存リソース
    const certArn = process.env.CERTARN != null ? process.env.CERTARN : "";
    const domain = process.env.DOMAIN != null ? process.env.DOMAIN : "";
    const hostedzoneid = process.env.HOSTEDZONEID != null ? process.env.HOSTEDZONEID : "";
    const r53HostedZone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(this, 'r53HostedZone', {
      hostedZoneId: hostedzoneid,
      zoneName: domain,
    });
    // 擬似パラメータ取得
    const scopedAws = new ScopedAws(this);

    const containerPort = 8080;
    /****************
      ACM
    ******************/
    // ARNから証明書を取得
    const listenerCertificate = aws_elasticloadbalancingv2.ListenerCertificate.fromArn(certArn);

    /****************
      IAM
    ******************/
    // ECSTaskRole作成
    const taskRole = new aws_iam.Role(this, 'TaskRole', {
      assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    // ECSTaskExecutionRole作成
    const executionRole = new aws_iam.Role(this, 'ExecutionRole', {
      assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    /****************
      ECS
    ******************/
    // ecs用セキュリティグループ作成
    const ecsSG = new aws_ec2.SecurityGroup(this, 'ecsSG', {
      vpc: vpc,
    });

    // ecsサービスがログ出力する場所の作成
    const ecsTaskLogGroup = new aws_logs.LogGroup(this, 'ecsTaskLogGroup', {
      removalPolicy: RemovalPolicy.RETAIN,
    });
    // ecsタスク実行ロールにログ出力権限を付与
    ecsTaskLogGroup.grantWrite(executionRole);

    // ECSCluster作成
    const cluster = new aws_ecs.Cluster(this, 'Cluster', {
      vpc: vpc,
      containerInsights: true,
    });
    // ECSTaskDefinition作成（仮のもの実際にはアプリケーション側リポジトリにてタスク定義単位ごと定義する）
    const ecsTaskDef = new aws_ecs.FargateTaskDefinition(this, 'ecsTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: executionRole,
      taskRole: taskRole,
      runtimePlatform: {
        operatingSystemFamily: aws_ecs.OperatingSystemFamily.LINUX,
        cpuArchitecture: aws_ecs.CpuArchitecture.ARM64,
      }
    });

    // コンテナ定義（仮のもの実際にはアプリケーション側リポジトリにてタスク定義単位ごと定義する）
    // テスト用サービスコンテナ
    const appContainer = ecsTaskDef.addContainer('appContainer', {
      image: aws_ecs.ContainerImage.fromAsset("./docker/nginx/"),
      cpu: 128,
      memoryLimitMiB: 256,
      logging: aws_ecs.LogDrivers.awsLogs({
        streamPrefix: "appContainer",
        logGroup: ecsTaskLogGroup,
      }),
    });
    appContainer.addPortMappings({
      protocol: aws_ecs.Protocol.TCP,
      hostPort: containerPort,
      containerPort: containerPort,
    });
    // 複数コンテナが存在する場合は必須
    ecsTaskDef.defaultContainer = appContainer;

    // ログルーティング設定（仮のもの実際にはアプリケーション側リポジトリにてタスク定義単位ごと定義する）
    /*ecsTaskDef.addFirelensLogRouter("firelensLogRouter", {
      containerName: "firelensLogRouter",
      image: aws_ecs.ContainerImage.fromRegistry(
        "899462859581.dkr.ecr.ap-northeast-1.amazonaws.com/ecr-public/aws-observability/aws-for-fluent-bit:init-arm64-2.32.0.20231205"
      ),
      essential: true,
      cpu: 256,
      memoryReservationMiB: 256,
      // ヘルスチェックを行わないか、Simple Uptime Health Check を採用することが推奨とのことなので、ヘルスチェックは行わない
      // https://github.com/aws-samples/amazon-ecs-firelens-examples/tree/mainline/examples/fluent-bit/health-check#not-recommended-tcp-input-health-check
      //healthCheck: { },
      logging: aws_ecs.LogDrivers.awsLogs({
        streamPrefix: "log-router",
        logGroup: ecsTaskLogGroup,
      }),
      firelensConfig: {
        type: aws_ecs.FirelensLogRouterType.FLUENTBIT,
      },
      environment: {
        LOG_GROUP_NAME: ecsTaskLogGroup.logGroupName,
        APP_VERSION: "gitCommitHash",
        
        aws_fluent_bit_init_s3_1: `${assetBucket.bucketArn}/extra.conf`,
      },
    });*/



    // ECSService作成
    const ecsTaskService = new aws_ecs.FargateService( this, 'ecsTaskService', {
      cluster: cluster,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: { subnets: vpc.privateSubnets },
      taskDefinition: ecsTaskDef,
      // ecs Execを可能にするオプション
      enableExecuteCommand: true,
      securityGroups: [ecsSG],
      enableECSManagedTags: true,
      circuitBreaker: { rollback: true },
      deploymentController: {
        type: aws_ecs.DeploymentControllerType.ECS,
      },
      maxHealthyPercent: 200,
      minHealthyPercent: 100,
      platformVersion: aws_ecs.FargatePlatformVersion.VERSION1_4,
      propagateTags: aws_ecs.PropagatedTagSource.SERVICE,
    });

    // ecs autoscaling定義
    /*const scalableTarget = ecsTaskService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });
    
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });*/


    /****************
      ALB
    ******************/
    // albターゲットグループ作成
    const ecsTargetGroup = new aws_elasticloadbalancingv2.ApplicationTargetGroup(this, 'ecsTaskTargetGroup', {
      vpc: vpc,
      targetType: aws_elasticloadbalancingv2.TargetType.IP,
      port: containerPort,
      protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
      protocolVersion: aws_elasticloadbalancingv2.ApplicationProtocolVersion.HTTP1,
      deregistrationDelay: Duration.seconds(30),
      healthCheck: {
        enabled: true,
        path: '/api/_/healthz',
        healthyHttpCodes: '200',
        interval: Duration.seconds(7),
        healthyThresholdCount: 2,
        timeout: Duration.seconds(5),        
      },
    });
    // ecsサービスをターゲットグループに登録
    ecsTargetGroup.addTarget(ecsTaskService);

    // alb用セキュリティグループ作成
    const albSG = new aws_ec2.SecurityGroup(this, 'albSG', {
      vpc: vpc,
    });
    // allowIPからのアクセスを許可
    allowips.forEach(ip => {
      albSG.addIngressRule(aws_ec2.Peer.ipv4(`${ip}/32`), aws_ec2.Port.tcp(443), 'allow https from anywhere');
    });

    const backendAlb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'backendALB', {
      vpc: vpc,
      internetFacing: true,
      securityGroup: albSG,
      vpcSubnets: { subnets: vpc.publicSubnets },
    });
    // backendAlbリスナー作成
    backendAlb.addListener('TlsListener', { 
      port: 443,
      certificates: [ listenerCertificate ],
      protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS,
      sslPolicy: aws_elasticloadbalancingv2.SslPolicy.RECOMMENDED_TLS,
      open: true,
      defaultAction: aws_elasticloadbalancingv2.ListenerAction.forward([ecsTargetGroup],)
    });
    new cdk.aws_route53.RecordSet(this, "ArecordAlb", {
      recordType: cdk.aws_route53.RecordType.A,
      recordName: domain,
      target: cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53_targets.LoadBalancerTarget(backendAlb)),
      zone: r53HostedZone,
    });

    
  }
}
