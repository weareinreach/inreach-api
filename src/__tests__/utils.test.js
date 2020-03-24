import {
  getEntityQuery,
  getOrganizationQuery,
  handleBadRequest,
  handleErr
} from '../utils';

const testResponse = {
  status: status => ({
    json: resJSON => ({json: resJSON, status})
  })
};

describe('getEntityQuery', () => {
  it('should default to empty', () => {
    const result = getEntityQuery();

    expect(result).toEqual({});
  });

  it('should return organizationId', () => {
    const result = getEntityQuery({organizationId: 'test'});

    expect(result).toEqual({organizationId: 'test'});
  });

  it('should return serviceId', () => {
    const result = getEntityQuery({serviceId: 'test'});

    expect(result).toEqual({serviceId: 'test'});
  });

  it('should return both values', () => {
    const result = getEntityQuery({organizationId: 'test', serviceId: 'test'});

    expect(result).toEqual({organizationId: 'test', serviceId: 'test'});
  });
});

describe('getOrganizationQuery', () => {
  it('should check defaults', () => {
    const {params, query} = getOrganizationQuery();

    expect(params.limit).toEqual(20);
    expect(params.offset).toEqual(0);
    expect(query).toEqual({});
  });

  it('should apply params and match snapshot', () => {
    const result = getOrganizationQuery({
      name: test,
      page: '10',
      properties: 'hello,world'
    });

    expect(result).toMatchSnapshot();
  });
});

describe('handleBadRequest', () => {
  it('should return a 400', () => {
    const result = handleBadRequest(testResponse);

    expect(result).toEqual({json: {error: true}, status: 400});
  });
});

describe('handleErr', () => {
  it('should pass', () => {
    const result = handleErr(new Error('test error'), testResponse);

    expect(result).toEqual({json: {error: true}, status: 500});
  });
});
