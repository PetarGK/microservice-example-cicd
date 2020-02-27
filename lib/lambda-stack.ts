import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Runtime, Alias } from '@aws-cdk/aws-lambda';
import { LambdaDeploymentGroup, LambdaDeploymentConfig } from '@aws-cdk/aws-codedeploy';
import { RestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway'

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
    const getTodosLambda = new NodejsFunction(this, 'get-todos', {
      entry: 'lib/lambda-stack/get-todos.ts',
      runtime: Runtime.NODEJS_12_X,
      memorySize: 512,
      minify: true
    });

    const addTodoLambda = new NodejsFunction(this, 'add-todo', {
      entry: 'lib/lambda-stack/add-todo.ts',
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


    const api = new RestApi(this, 'example-api', { })
    const v1 = api.root.addResource('v1')

    const todos = v1.addResource('todos')
    const getTodosIntegration = new LambdaIntegration(getTodosLambda)
    const addTodoIntegration = new LambdaIntegration(addTodoLambda)

    const getTodosMethod = todos.addMethod('GET', getTodosIntegration, { apiKeyRequired: true })
    const addTodoMethod = todos.addMethod('POST', addTodoIntegration, { apiKeyRequired: true })

    const key = api.addApiKey('ApiKey');
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Easy',
      apiKey: key,
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });
    
    plan.addApiStage({
      stage: api.deploymentStage,
      throttle: [
        {
          method: getTodosMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2
          }
        },
        {
          method: addTodoMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2
          }
        },        
      ]
    });
  }
}
