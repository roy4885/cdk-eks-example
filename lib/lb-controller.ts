import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as iampolicy from "./iam_policy.json";
import { readYamlFromDir } from "../utils/read-file";

export interface LoadBalancerControllerStackProps extends cdk.StackProps {
  cluster: eks.Cluster;
}

export class LoadBalancerControllerStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: LoadBalancerControllerStackProps
  ) {
    super(scope, id, props);

    const lbControllerSA = new eks.ServiceAccount(
      this,
      "LoadBalancerControllerSA",
      {
        cluster: props.cluster,
        name: "aws-load-balancer-controller",
        namespace: "kube-system",
      }
    );

    new iam.Policy(this, "LoadBalancerControllerPolicy", {
      policyName: "AWSLoadBalancerControllerIAMPolicy",
      document: iam.PolicyDocument.fromJson(iampolicy),
      roles: [lbControllerSA.role],
    });

    const lbControllerFolder = "./load-balancer-controller/";
    readYamlFromDir(lbControllerFolder, props.cluster);

    new eks.HelmChart(this, `LoadBalancerControllerChart`, {
      cluster: props.cluster,
      repository: "https://aws.github.io/eks-charts",
      chart: "aws-load-balancer-controller",
      release: "aws-load-balancer-controller",
      namespace: "kube-system",
      values: {
        serviceAccount: {
          create: false,
          name: "aws-load-balancer-controller",
        },
        clusterName: props.cluster.clusterName,
      },
    });
  }
}
