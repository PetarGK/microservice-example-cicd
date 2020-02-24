#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MicroserviceExampleCicdStack } from '../lib/microservice-example-cicd-stack';

const app = new cdk.App();
new MicroserviceExampleCicdStack(app, 'MicroserviceExampleCicdStack');
