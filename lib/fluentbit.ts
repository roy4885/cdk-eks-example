import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as iampolicy from "../fluentbit/eks-fluent-bit-daemonset-policy.json";
export interface FluentbitStackProps extends cdk.StackProps {
  cluster: eks.Cluster;
}

export class FluentbitStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: FluentbitStackProps) {
    super(scope, id, props);

    const fluentbitSA = new eks.ServiceAccount(this, "FluentbitSA", {
      cluster: props.cluster,
      name: "aws-for-fluent-bit",
      namespace: "kube-system",
    });

    new iam.Policy(this, "FluentbitPolicy", {
      policyName: "FluentbitPolicy",
      document: iam.PolicyDocument.fromJson(iampolicy),
      roles: [fluentbitSA.role],
    });

    props.cluster.addHelmChart("FluentbitChart", {
      repository: "https://aws.github.io/eks-charts",
      chart: "aws-for-fluent-bit",
      release: "aws-for-fluent-bit",
      namespace: "kube-system",
      values: {
        cloudWatch: {
          enabled: true,
          region: "ap-northeast-2",
        },
        firehose: {
          enabled: false,
        },
        kinesis: {
          enabled: false,
        },
        elasticsearch: {
          enabled: false,
        },
        serviceAccount: {
          create: false,
        },
      },
    });
  }
}
