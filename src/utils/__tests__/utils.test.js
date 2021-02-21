import {
  formatService,
  generateJWT,
  handleBadRequest,
  handleErr,
  handleNotFound,
  orderServices,
  removeUserInfo,
  verifyJWT,
} from '../index';

const testResponse = {
  status: (status) => ({
    json: (resJSON) => ({json: resJSON, status}),
  }),
};

describe('formatService', () => {
  it('should format the service', () => {
    const result = formatService(
      {name: 'service'},
      {name: 'org', services: [{hello: 'world'}]}
    );

    expect(result.name).toEqual('service');
    expect(result.organization).toEqual({name: 'org'});
  });
});

describe('generateJWT & verifyJWT', () => {
  it('should return a 400', async () => {
    const user = {first: 'name', last: 'name', age: 40};
    const token = generateJWT(user);
    const decodedToken = await verifyJWT(token);

    expect(decodedToken.valid).toEqual(true);
    expect(decodedToken.user.first).toEqual(user.first);
    expect(decodedToken.user.last).toEqual(user.last);
    expect(decodedToken.user.age).toEqual(user.age);
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

describe('orderServices', () => {
  it('should order services', () => {
    const serviceA = {updated_at: '2020'};
    const serviceB = {updated_at: '2019'};
    const serviceC = {updated_at: '2018'};
    const serviceD = {updated_at: ''};
    const expected = [serviceA, serviceB, serviceC, serviceD];
    const result = orderServices([serviceD, serviceC, serviceB, serviceA]);

    expect(result).toEqual(expected);
  });
});

describe('removeUserInfo', () => {
  it('should remove sensitive user info', () => {
    const user = {
      name: 'foo bar',
      hash: 'hash',
      password: 'password',
      salt: 'salt',
    };
    const result = removeUserInfo(user);

    expect(result).toEqual({name: 'foo bar'});
  });
});
