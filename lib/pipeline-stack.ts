import * as cdk from '@aws-cdk/core';
import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline'
import { GitHubSourceAction, GitHubTrigger, CodeBuildAction, CloudFormationCreateUpdateStackAction } from '@aws-cdk/aws-codepipeline-actions'
import { StringParameter } from '@aws-cdk/aws-ssm'
import { SecretValue } from '@aws-cdk/core';
import { PipelineProject, LinuxBuildImage, BuildSpec } from '@aws-cdk/aws-codebuild';

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, "ExamplePipeline", {
      pipelineName: "microservice-example-cicd",
      restartExecutionOnUpdate: true
    })

    const sourceOutput = new Artifact();

    const repositoryUrl = StringParameter.fromStringParameterAttributes(this, 'GithubRepositoryName', {
      parameterName: '/microservice-example-cicd/RepositoryUrl',
    }).stringValue;        

    const sourceAction = new GitHubSourceAction({
      actionName: 'CodeSource',
      owner: 'PetarGK',
      repo: repositoryUrl,
      oauthToken: SecretValue.secretsManager('/microservice-example-cicd/GithubOAuthToken'),
      output: sourceOutput,
      branch: 'master', 
      trigger: GitHubTrigger.WEBHOOK 
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    })

    const cdkBuildOutput = new Artifact('CdkBuildOutput');
    const cdkBuild = new PipelineProject(this, 'CdkBuild', {
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
            install: {
              commands: [
                'npm install -g aws-cdk',
                'npm install'
              ]
            },
            build: {
              commands: 'cdk --app "npx ts-node bin/microservice-example-app.ts" --require-approval=never deploy "*"'
            }
        }      
      })
    })

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CodeBuildAction({
          actionName: 'CDK_Build',
          project: cdkBuild,
          input: sourceOutput,
          outputs: [cdkBuildOutput]
        })
      ]
    })      
  }
}
