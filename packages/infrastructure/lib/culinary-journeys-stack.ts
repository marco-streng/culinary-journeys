import {
  aws_certificatemanager,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_cognito,
  aws_dynamodb,
  aws_iam,
  aws_lambda,
  aws_lambda_nodejs,
  aws_s3,
  aws_s3_deployment,
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { BillingMode, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { createHash } from 'crypto';
import 'dotenv/config';
import * as path from 'path';
import { AppSyncJavaScriptResolver } from './constructs';
import { getStage, isProduction } from './helper';

const {
  DOMAIN,
  EMAIL,
  CERTIFICATE,
  EMAIL_SIGN_UP_BODY,
  EMAIL_SIGN_UP_SUBJECT,
} = process.env;

export class CulinaryJourneysStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // -------
    // Cognito
    // -------
    const userPool = new aws_cognito.UserPool(this, 'UserPool', {
      passwordPolicy: {
        tempPasswordValidity: Duration.days(365),
      },
      userPoolName: getStage('CulinaryJourneys'),
      userInvitation: {
        emailSubject: EMAIL_SIGN_UP_SUBJECT,
        emailBody: EMAIL_SIGN_UP_BODY,
      },
    });
    const userPoolClient = new aws_cognito.UserPoolClient(
      this,
      'UserPoolClient',
      {
        userPool,
        userPoolClientName: getStage('CulinaryJourneys'),
      },
    );
    const cognitoTriggerLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'cognitoTriggerLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(
          __dirname,
          '..',
          'src',
          'functions',
          'cognitoTrigger.ts',
        ),
        memorySize: 128,
        environment: {
          EMAIL: EMAIL!,
        },
        timeout: Duration.seconds(10),
      },
    );
    cognitoTriggerLambda.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        effect: Effect.ALLOW,
        resources: [`arn:aws:ses:${this.region}:*:*`],
      }),
    );
    userPool.addTrigger(
      UserPoolOperation.PRE_AUTHENTICATION,
      cognitoTriggerLambda,
    );

    // --------
    // DynamoDB
    // --------
    const table = new aws_dynamodb.Table(this, 'Table', {
      tableName: getStage('CulinaryJourneys'),
      partitionKey: {
        name: 'id',
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'kind',
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,
    });
    table.addGlobalSecondaryIndex({
      indexName: 'kind',
      partitionKey: {
        name: 'kind',
        type: aws_dynamodb.AttributeType.STRING,
      },
    });

    // -----------
    // AppSync API
    // -----------
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: getStage('CulinaryJourneys'),
      environmentVariables: {
        TABLE_NAME: table.tableName,
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      definition: {
        schema: appsync.SchemaFile.fromAsset(
          path.join(__dirname, '..', 'src', 'schema.graphql'),
        ),
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        },
      },
    });
    const tableDataSource = api.addDynamoDbDataSource('tableDataSource', table);

    // ----------
    // S3 Buckets
    // ----------
    const clientBucket = new aws_s3.Bucket(this, 'ClientBucket', {
      accessControl: BucketAccessControl.PRIVATE,
    });
    const uploadsBucket = new aws_s3.Bucket(this, 'UploadsBucket', {
      accessControl: BucketAccessControl.PRIVATE,
      cors: [
        {
          allowedMethods: [aws_s3.HttpMethods.PUT],
          allowedOrigins: isProduction()
            ? [`https://${DOMAIN}`]
            : ['http://localhost:5173', 'https://*.cloudfront.net'],
          allowedHeaders: ['*'],
        },
      ],
    });
    const imagesBucket = new aws_s3.Bucket(this, 'ImagesBucket', {
      accessControl: BucketAccessControl.PRIVATE,
      cors: [
        {
          allowedMethods: [aws_s3.HttpMethods.GET],
          allowedOrigins: isProduction()
            ? [`https://${DOMAIN}`]
            : ['http://localhost:5173', 'https://*.cloudfront.net'],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: Duration.days(30),
        },
      ],
    });

    // Create secret key to be used between CloudFront and Lambda URL for access control
    const SECRET_KEY = createHash('md5').update(this.node.addr).digest('hex');
    const originalImageBucket = uploadsBucket;
    const transformedImageBucket = imagesBucket;

    // Lambda function
    const imageProcessingLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'imageProcessingLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        entry: path.join(
          __dirname,
          '..',
          'src',
          'functions',
          'imageProcessing.ts',
        ),
        bundling: {
          forceDockerBundling: true,
          nodeModules: ['sharp'],
        },
        timeout: Duration.seconds(60),
        memorySize: 1536,
        environment: {
          originalImageBucketName: originalImageBucket.bucketName,
          transformedImageBucketName: transformedImageBucket.bucketName,
          transformedImageCacheTTL: 'max-age=31622400',
          secretKey: SECRET_KEY,
          logTiming: 'true',
        },
      },
    );
    originalImageBucket.grantRead(imageProcessingLambda);
    transformedImageBucket.grantReadWrite(imageProcessingLambda);

    const imageProcessingFunctionUrl = imageProcessingLambda.addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE,
    });

    // -------
    // Lambdas
    // -------
    const emailLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'emailLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(__dirname, '..', 'src', 'functions', 'sendEmail.tsx'),
        memorySize: 512,
        timeout: Duration.seconds(30),
        environment: {
          EMAIL: EMAIL!,
          TABLE_NAME: table.tableName,
          HOST: `https://${DOMAIN!}`,
        },
        events: [
          new DynamoEventSource(table, {
            startingPosition: StartingPosition.LATEST,
          }),
        ],
      },
    );
    emailLambda.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        effect: Effect.ALLOW,
        resources: [`arn:aws:ses:${this.region}:*:*`],
      }),
    );
    table.grantReadData(emailLambda);

    const createUploadUrlsLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'createUploadUrlsLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(
          __dirname,
          '..',
          'src',
          'functions',
          'createUploadUrls.ts',
        ),
        memorySize: 128,
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME: uploadsBucket.bucketName,
        },
      },
    );
    uploadsBucket.grantWrite(createUploadUrlsLambda);

    const createImagesLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'createImagesLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(
          __dirname,
          '..',
          'src',
          'functions',
          'createImages.ts',
        ),
        memorySize: 128,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: table.tableName,
        },
      },
    );
    table.grantWriteData(createImagesLambda);

    const groupsLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'groupsLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(__dirname, '..', 'src', 'functions', 'groups.ts'),
        memorySize: 128,
        timeout: Duration.seconds(10),
        environment: {
          TABLE_NAME: table.tableName,
        },
      },
    );
    table.grantReadData(groupsLambda);

    const createUserLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'createUserLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(__dirname, '..', 'src', 'functions', 'createUser.ts'),
        memorySize: 128,
        timeout: Duration.seconds(30),
        environment: {
          USER_POOL_ID: userPool.userPoolId,
          TABLE_NAME: table.tableName,
        },
      },
    );
    userPool.grant(createUserLambda, 'cognito-idp:AdminAddUserToGroup');
    userPool.grant(createUserLambda, 'cognito-idp:AdminCreateUser');
    table.grantWriteData(createUserLambda);

    const updateUserLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'updateUserLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(__dirname, '..', 'src', 'functions', 'updateUser.ts'),
        memorySize: 128,
        timeout: Duration.seconds(30),
        environment: {
          USER_POOL_ID: userPool.userPoolId,
          TABLE_NAME: table.tableName,
        },
      },
    );
    userPool.grant(updateUserLambda, 'cognito-idp:AdminAddUserToGroup');
    table.grantReadWriteData(updateUserLambda);

    const createGroupLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'createGroupLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_22_X,
        architecture: aws_lambda.Architecture.ARM_64,
        entry: path.join(__dirname, '..', 'src', 'functions', 'createGroup.ts'),
        memorySize: 128,
        timeout: Duration.seconds(30),
        environment: {
          USER_POOL_ID: userPool.userPoolId,
          TABLE_NAME: table.tableName,
        },
      },
    );
    userPool.grant(createGroupLambda, 'cognito-idp:CreateGroup');
    table.grantWriteData(createGroupLambda);

    // --------
    // Resolver
    // --------
    // restaurants
    new AppSyncJavaScriptResolver(this, 'restaurants', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/restaurants.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Query',
      fieldName: 'restaurants',
    });

    // restaurant
    new AppSyncJavaScriptResolver(this, 'restaurant', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/restaurant.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Query',
      fieldName: 'restaurant',
    });

    // Restaurants.createdBy
    new AppSyncJavaScriptResolver(this, 'restaurant_createdyBy', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/restaurant_createdBy.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Restaurant',
      fieldName: 'createdBy',
    });

    // user
    new AppSyncJavaScriptResolver(this, 'user', {
      api,
      code: appsync.Code.fromAsset('./src/mapping-templates/dist/user.js'),
      dataSource: tableDataSource,
      typeName: 'Query',
      fieldName: 'user',
    });

    // user.groups
    new AppSyncJavaScriptResolver(this, 'user_groups', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/user_groups.js',
      ),
      dataSource: tableDataSource,
      typeName: 'User',
      fieldName: 'groups',
    });

    // dates
    new AppSyncJavaScriptResolver(this, 'dates', {
      api,
      code: appsync.Code.fromAsset('./src/mapping-templates/dist/dates.js'),
      dataSource: tableDataSource,
      typeName: 'Query',
      fieldName: 'dates',
    });

    // createRestaurant
    new AppSyncJavaScriptResolver(this, 'createRestaurant', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/createRestaurant.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Mutation',
      fieldName: 'createRestaurant',
    });

    // createDate
    new AppSyncJavaScriptResolver(this, 'createDateFunction', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/createDate.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Mutation',
      fieldName: 'createDate',
    });

    // updateRestaurant
    new AppSyncJavaScriptResolver(this, 'updateRestaurant', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/updateRestaurant.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Mutation',
      fieldName: 'updateRestaurant',
    });

    // createRating
    new AppSyncJavaScriptResolver(this, 'createRating', {
      api,
      code: appsync.Code.fromAsset(
        './src/mapping-templates/dist/createRating.js',
      ),
      dataSource: tableDataSource,
      typeName: 'Mutation',
      fieldName: 'createRating',
    });

    // ratings
    new AppSyncJavaScriptResolver(this, 'ratings', {
      api,
      code: appsync.Code.fromAsset('./src/mapping-templates/dist/ratings.js'),
      dataSource: tableDataSource,
      typeName: 'Restaurant',
      fieldName: 'ratings',
    });

    // images
    new AppSyncJavaScriptResolver(this, 'images', {
      api,
      code: appsync.Code.fromAsset('./src/mapping-templates/dist/images.js'),
      dataSource: tableDataSource,
      typeName: 'Restaurant',
      fieldName: 'images',
    });

    // createUploadUrls
    const createUploadUrlsLambdaDataSource = api.addLambdaDataSource(
      'createUploadUrlsLambdaDataSource',
      createUploadUrlsLambda,
    );
    createUploadUrlsLambdaDataSource.createResolver(
      'createUploadUrlsResolver',
      {
        typeName: 'Mutation',
        fieldName: 'createUploadUrls',
      },
    );

    // createImages
    const createImagesLambdaDataSource = api.addLambdaDataSource(
      'createImagesLambdaDataSource',
      createImagesLambda,
    );
    createImagesLambdaDataSource.createResolver('createImagesResolver', {
      typeName: 'Mutation',
      fieldName: 'createImages',
    });

    // createUser
    const createUserLambdaDataSource = api.addLambdaDataSource(
      'createUserLambdaDataSource',
      createUserLambda,
    );
    createUserLambdaDataSource.createResolver('createUserResolver', {
      typeName: 'Mutation',
      fieldName: 'createUser',
    });

    // updateUser
    const updateUserLambdaDataSource = api.addLambdaDataSource(
      'updateUserLambdaDataSource',
      updateUserLambda,
    );
    updateUserLambdaDataSource.createResolver('updateUserResolver', {
      typeName: 'Mutation',
      fieldName: 'updateUser',
    });

    // groups
    const groupsLambdaDataSource = api.addLambdaDataSource(
      'groupsLambdaDataSource',
      groupsLambda,
    );
    groupsLambdaDataSource.createResolver('groupsResolver', {
      typeName: 'Query',
      fieldName: 'groups',
    });

    // ----------
    // CloudFront
    // ----------
    const cloudFrontIndexFunction = new aws_cloudfront.Function(
      this,
      'IndexFunction',
      {
        code: aws_cloudfront.FunctionCode.fromFile({
          filePath: path.join(
            __dirname,
            '..',
            'src',
            'functions',
            'dist',
            '_indexRewrite.js',
          ),
        }),
      },
    );
    const cloudFrontImageRewriteFunction = new aws_cloudfront.Function(
      this,
      'ImageRewriteFunction',
      {
        code: aws_cloudfront.FunctionCode.fromFile({
          filePath: path.join(
            __dirname,
            '..',
            'src',
            'functions',
            'dist',
            '_imageUrlRewrite.js',
          ),
        }),
      },
    );
    const cloudFrontDistribution = new aws_cloudfront.Distribution(
      this,
      'Distribution',
      {
        comment: getStage('CulinaryJourneys'),
        ...(isProduction() && {
          domainNames: [DOMAIN!],
          certificate: aws_certificatemanager.Certificate.fromCertificateArn(
            this,
            'certificate',
            CERTIFICATE!,
          ),
        }),
        defaultBehavior: {
          origin:
            aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              clientBucket,
            ),
          functionAssociations: [
            {
              eventType: aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
              function: cloudFrontIndexFunction,
            },
          ],
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        additionalBehaviors: {
          'images/*': {
            origin: new aws_cloudfront_origins.OriginGroup({
              primaryOrigin:
                aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
                  transformedImageBucket,
                ),
              fallbackOrigin: new aws_cloudfront_origins.HttpOrigin(
                Fn.select(2, Fn.split('/', imageProcessingFunctionUrl.url)),
                {
                  customHeaders: {
                    'x-origin-secret-header': SECRET_KEY,
                  },
                },
              ),
              fallbackStatusCodes: [403],
            }),
            cachePolicy: new aws_cloudfront.CachePolicy(
              this,
              `ImageCachePolicy${this.node.addr}`,
              {
                defaultTtl: Duration.hours(24),
                maxTtl: Duration.days(365),
                minTtl: Duration.seconds(0),
                queryStringBehavior:
                  aws_cloudfront.CacheQueryStringBehavior.all(),
              },
            ),
            functionAssociations: [
              {
                eventType: aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
                function: cloudFrontImageRewriteFunction,
              },
            ],
          },
        },
      },
    );
    new aws_s3_deployment.BucketDeployment(this, 'DeployClient', {
      sources: [aws_s3_deployment.Source.asset('../client/dist/')],
      destinationBucket: clientBucket,
      distribution: cloudFrontDistribution,
      distributionPaths: ['/*'],
    });

    // -------
    // Outputs
    // -------
    new CfnOutput(this, 'graphqlUrl', {
      value: api.graphqlUrl,
      description: 'The URL of the AppSync GraphQL API',
    });
    new CfnOutput(this, 'cloudFrontUrl', {
      value: `https://${cloudFrontDistribution.domainName}`,
      description: 'The URL of the CloudFront Distribution',
    });
  }
}
