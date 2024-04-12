const SUPPORTED_FORMATS = ['auto', 'jpeg', 'webp', 'avif', 'png', 'svg', 'gif'];

const handler = (event: {
  request: {
    uri: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    querystring: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: Record<string, any>;
  };
}) => {
  const { request } = event;
  const { uri: originalImagePath, querystring } = request;

  const normalizedOperations: {
    width?: string;
    height?: string;
    format?: string;
  } = {};

  if (querystring) {
    Object.entries<Record<string, string>>(querystring).forEach(
      ([operation, { value }]) => {
        switch (operation.toLowerCase()) {
          case 'format': {
            if (SUPPORTED_FORMATS.includes(value.toLowerCase())) {
              let format = value.toLowerCase();

              if (format === 'auto') {
                format = 'jpeg';
                if (request.headers['accept']) {
                  if (request.headers['accept'].value.includes('avif')) {
                    format = 'avif';
                  } else if (request.headers['accept'].value.includes('webp')) {
                    format = 'webp';
                  }
                }
              }

              normalizedOperations.format = format;
            }
            break;
          }
          case 'width': {
            const width = parseInt(value);
            if (!isNaN(width) && width > 0) {
              normalizedOperations.width = width.toString();
            }
            break;
          }
          case 'height': {
            const height = parseInt(value);
            if (!isNaN(height) && height > 0) {
              normalizedOperations.height = height.toString();
            }
            break;
          }
          default:
            break;
        }
      },
    );

    if (Object.keys(normalizedOperations).length > 0) {
      const normalizedOperationsArray = [];

      if (normalizedOperations.format)
        normalizedOperationsArray.push('format=' + normalizedOperations.format);

      if (normalizedOperations.width)
        normalizedOperationsArray.push('width=' + normalizedOperations.width);

      if (normalizedOperations.height)
        normalizedOperationsArray.push('height=' + normalizedOperations.height);

      request.uri =
        originalImagePath + '/' + normalizedOperationsArray.join(',');
    } else {
      request.uri = originalImagePath + '/original';
    }
  } else {
    request.uri = originalImagePath + '/original';
  }
  request['querystring'] = {};

  return request;
};

export {};
