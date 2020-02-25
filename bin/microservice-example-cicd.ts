#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack'
import { PipelineStack } from '../lib/pipeline-stack'

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack')
new LambdaStack(app, 'LambdaStack')
