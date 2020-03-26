import {
  generateSlug,
  getEntityQuery,
  getOrganizationQuery,
  handleBadRequest,
  handleErr,
  handleNotFound,
  parsePageQuery,
  removeUserInfo
} from '../utils';

const testResponse = {
  status: status => ({
    json: resJSON => ({json: resJSON, status})
  })
};

describe('generateSlug', () => {
  it('should default to empty', () => {
    const result = generateSlug();
    const resultTwo = generateSlug('');

    expect(result).toEqual('');
    expect(resultTwo).toEqual('');
  });

  it('should generate the slug', () => {
    const result = generateSlug('hello world');
    const resultTwo = generateSlug('foo');

    expect(result).toEqual('hello-world');
    expect(resultTwo).toEqual('foo');
  });
});

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
      properties: 'hello=true,world=true'
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

describe('handleNotFound', () => {
  it('should pass', () => {
    const result = handleNotFound(testResponse);

    expect(result).toEqual({json: {notFound: true}, status: 404});
  });
});

describe('parsePageQuery', () => {
  it('should generate a correct limit and offset', () => {
    const result = parsePageQuery('2');

    expect(result).toEqual({limit: 20, offset: 20});
  });

  it('should default to the first page', () => {
    const result = parsePageQuery();

    expect(result).toEqual({limit: 20, offset: 0});
  });
});

describe('removeUserInfo', () => {
  it('should remove sensitive user info', () => {
    const user = {
      name: 'foo bar',
      hash: 'hash',
      password: 'password',
      salt: 'salt'
    };
    const result = removeUserInfo(user);

    expect(result).toEqual({name: 'foo bar'});
  });
});
