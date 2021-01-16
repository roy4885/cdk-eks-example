#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEksExampleStack } from '../lib/cdk-eks-example-stack';

const app = new cdk.App();
new CdkEksExampleStack(app, 'CdkEksExampleStack');
