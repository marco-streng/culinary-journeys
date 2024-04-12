import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['./src/schema.graphql'],
  generates: {
    'src/types/gql.d.ts': {
      config: {
        scalars: {
          AWSDate: 'string',
        },
      },
      plugins: ['typescript'],
      hooks: {
        afterOneFileWrite: 'prettier --write',
      },
    },
  },
};

export default config;
