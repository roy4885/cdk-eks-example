import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as route53 from "@aws-cdk/aws-route53";
import * as iampolicy from "./iam_policy_external_dns.json";
import { readYamlFromDir } from "../utils/read-file";

export interface ExternalDnsStackProps extends cdk.StackProps {
  cluster: eks.Cluster;
  domainName: string;
}

export class ExternalDnsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ExternalDnsStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    const externalDnsSA = new eks.ServiceAccount(this, "ExternalDnsSA", {
      cluster: props.cluster,
      name: "external-dns",
      namespace: "default",
    });

    externalDnsSA.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSClusterPolicy")
    );

    new iam.Policy(this, "ExternalDnsPolicy", {
      policyName: "ExternalDnsPolicy",
      document: iam.PolicyDocument.fromJson(iampolicy),
      roles: [externalDnsSA.role],
    });

    props.cluster.addHelmChart(`ExternalDnsChart`, {
      repository: "https://charts.bitnami.com/bitnami",
      chart: "external-dns",
      release: "external-dns",
      namespace: "default",
      values: {
        'provider': 'aws',
        'domainFilters': [props.domainName],
        'policy': 'sync',
        'registry': 'txt',
        'txtOwnerId': `/hostedzone/${hostedZone.hostedZoneId}`,
        'interval': '3m',
        'serviceAccount': {
          'create': false,
          'name': 'external-dns'
        }
      },
    });
  }
}
