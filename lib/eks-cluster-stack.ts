import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as eks from '@aws-cdk/aws-eks'
import { CfnOutput } from '@aws-cdk/core';

export interface eksClusterStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
}

export class EksClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster
  public readonly clusterOpenIdConnectIssuerUrl: string

  constructor(scope: cdk.Construct, id: string, props: eksClusterStackProps) {
    super(scope, id, props);

    this.cluster = new eks.Cluster(this, 'eks-cluster', {
      vpc: props.vpc,
      version: eks.KubernetesVersion.V1_18,
      defaultCapacity: 1,
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
    });

    this.clusterOpenIdConnectIssuerUrl = this.cluster.clusterOpenIdConnectIssuerUrl;

    // this.cluster.addHelmChart(`LoadBalancerControllerChart2`, {
    //     repository: 'https://aws.github.io/eks-charts',
    //     chart: 'aws-load-balancer-controller',
    //     release: 'aws-load-balancer-controller',
    //     wait: true,
    //     namespace: 'kube-system',
    //     values: {
    //       'serviceAccount.create': false,
    //       'serviceAccount.name': 'aws-load-balancer-controller'
    //     }
    //   });
  }
}
