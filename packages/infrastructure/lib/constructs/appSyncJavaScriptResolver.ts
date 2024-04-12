import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';

type AppSyncJavaScriptResolverProps = {
  api: appsync.IGraphqlApi;
  typeName: string;
  fieldName: string;
  dataSource: appsync.BaseDataSource;
  code: appsync.Code;
};

export class AppSyncJavaScriptResolver extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: AppSyncJavaScriptResolverProps,
  ) {
    super(scope, id);

    const fn = new appsync.AppsyncFunction(this, `${props.fieldName}Function`, {
      name: props.fieldName,
      api: props.api,
      dataSource: props.dataSource,
      code: props.code,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });
    new appsync.Resolver(this, `${props.fieldName}Resolver`, {
      api: props.api,
      typeName: props.typeName,
      fieldName: props.fieldName,
      pipelineConfig: [fn],
      code: appsync.Code.fromAsset('./src/mapping-templates/dist/default.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });
  }
}
