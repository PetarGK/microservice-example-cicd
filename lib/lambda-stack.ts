import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Runtime, Alias } from '@aws-cdk/aws-lambda';
import { LambdaDeploymentGroup, LambdaDeploymentConfig } from '@aws-cdk/aws-codedeploy';

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
    const getTodosLambda = new NodejsFunction(this, 'get-todos', {
      runtime: Runtime.NODEJS_12_X,
      memorySize: 512,
      minify: true
    });

    /*
    const getTodosVersion = getTodosLambda.addVersion(new Date().toISOString());
    const getTodosAlias = new Alias(this, 'getTodosAlias', {
      aliasName: 'Prod',
      version: getTodosVersion,
    });

    new LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias: getTodosAlias,
      deploymentConfig: LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
*/
  }
}
