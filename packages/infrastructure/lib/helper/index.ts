export const getStage = (prefix?: string) => {
  const STAGE = process.env.STAGE || '';

  return `${prefix}${prefix ? `-${STAGE}` : STAGE}`;
};

export const isProduction = () => process.env.STAGE === 'prod';
