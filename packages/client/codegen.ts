import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['../infrastructure/src/schema.graphql'],
  documents: 'src/gql/*.ts*',
  generates: {
    'src/types/gql.ts': {
      config: {
        fetcher: '../lib/index#fetcher',
        scalars: {
          AWSDate: 'string',
        },
        exposeQueryKeys: true,
      },
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query',
      ],
      hooks: {
        afterOneFileWrite: 'prettier --write',
      },
    },
  },
};

export default config;
