import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as eks from '@aws-cdk/aws-eks'

export interface eksClusterStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
}

export class EksClusterStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: eksClusterStackProps) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, 'eks-cluster', {
      vpc: props.vpc,
      version: eks.KubernetesVersion.V1_18,
      defaultCapacity: 1,
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
    });

  }
}
