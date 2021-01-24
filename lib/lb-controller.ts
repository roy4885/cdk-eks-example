import * as iam from '@aws-cdk/aws-iam'
import * as cdk from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import { CfnOutput, CfnJson } from '@aws-cdk/core';
import * as iampolicy from './iam_policy.json'

export interface LoadBalancerControllerStackProps extends cdk.StackProps {
    url: string,
    cluster: eks.ICluster
}

export class LoadBalancerControllerStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: LoadBalancerControllerStackProps) {
        super(scope, id, props);

        // new CfnOutput(this, 'openidprovider', { value: props.url});
        // const oidcprovider = new iam.OpenIdConnectProvider(this, 'OpenIdConnectProvider', {
        //     url: props.url,
        //     clientIds: ['sts.amazonaws.com']
        // });
        // const openIdConnectProviderArn = oidcprovider.openIdConnectProviderArn;
        // const stringEquals = new CfnJson(this, 'OidcConditionJson', {
        //     value: {
        //       [`${oidcprovider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
        //       [`${oidcprovider.openIdConnectProviderIssuer}:sub`]: 'system:serviceaccount:kube-system:aws-load-balancer-controller',
        //     },
        //   });

        // const lbRole = new iam.Role(this, 'EKSLoadBalancerControllerRole', {
        //     assumedBy: new iam.WebIdentityPrincipal(
        //         openIdConnectProviderArn,
        //         {StringEquals: stringEquals}),
        //     roleName: 'EKSLoadBalancerControllerRole',
        //     });
        

        // new iam.Policy(this, 'LoadBalancerControllerPolicy', {
        //     policyName: 'AWSLoadBalancerControllerIAMPolicy',
        //     document: iam.PolicyDocument.fromJson(iampolicy),
        //     roles: [lbRole]
        // })
        
        const lbControllerSA = new eks.ServiceAccount(this, 'LoadBalancerControllerSA', {
            cluster: props.cluster,
            name: 'aws-load-balancer-controller',
            namespace: 'kube-system'
        })

        new iam.Policy(this, 'LoadBalancerControllerPolicy', {
            policyName: 'AWSLoadBalancerControllerIAMPolicy',
            document: iam.PolicyDocument.fromJson(iampolicy),
            roles: [lbControllerSA.role]
        })

        new eks.HelmChart(this, `LoadBalancerControllerChart`, {
            cluster: props.cluster,
            repository: 'https://aws.github.io/eks-charts',
            chart: 'aws-load-balancer-controller',
            release: 'aws-load-balancer-controller',
            wait: true,
            namespace: 'kube-system',
            values: {
              'serviceAccount.create': false,
              'serviceAccount.name': 'aws-load-balancer-controller'
            }
          });
            
  }


}
