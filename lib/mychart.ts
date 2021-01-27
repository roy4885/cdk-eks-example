import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import { MyChart } from '../cdk8s/mychart';
import * as cdk8s from 'cdk8s';

interface MyChartStackProps extends cdk.StackProps {
  cluster: eks.Cluster 
}

export class MyChartStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MyChartStackProps) {
    super(scope, id, props);
    props.cluster.addCdk8sChart('my-chart', new MyChart(new cdk8s.App(), 'MyChart'));
  }
}