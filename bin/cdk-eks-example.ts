#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/vpc-stack';
import { EksClusterStack } from '../lib/eks-cluster-stack';
import { LoadBalancerControllerStack } from '../lib/lb-controller';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const deployEnv = {account: account, region: region};

const vpcStack = new VpcStack(app, `VpcStack-${deployEnv.region}`, {env: deployEnv});
const clusterStack = new EksClusterStack(app, `EksClusterStack`, {env: deployEnv, vpc: vpcStack.vpc});
new LoadBalancerControllerStack(app, 'LoadBalancerControllerStack', {env: deployEnv, url: clusterStack.clusterOpenIdConnectIssuerUrl, cluster: clusterStack.cluster});

