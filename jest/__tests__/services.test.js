import _ from 'lodash';

import {Organization} from '../../src/mongoose';
import * as ServicesService from '../../src/routes/services';
import * as EditLogsService from '../../src/routes/editLogs';

describe('services', () => {
	describe('auditing', () => {
		let auditEditSpy;
		let removeSpy = jest.fn();
		const mockService = {
			_id: 'service_id',
			id: () => {
				return this;
			},
			remove: removeSpy
		};

		beforeAll(() => {
			jest.spyOn(Organization, 'findById').mockImplementation(async () => {
				const mockOrgInstance = {
					services: [mockService],
					save: async () => {}
				};
				mockOrgInstance.services.id = (serviceId) => {
					return _.find(mockOrgInstance.services, (s) => s._id === serviceId);
				};
				return mockOrgInstance;
			});

			jest
				.spyOn(Organization, 'findOneAndUpdate')
				.mockImplementation(async () => {
					return {
						services: [mockService]
					};
				});

			auditEditSpy = jest
				.spyOn(EditLogsService, 'auditEdit')
				.mockImplementation(async () => {});
		});

		beforeEach(() => {
			jest.clearAllMocks();
		});

		afterAll(() => {
			jest.restoreAllMocks();
		});

		const mockJSONResponse = jest.fn();
		const mockRes = {
			json: mockJSONResponse,
			status: () => {
				return {
					json: mockJSONResponse
				};
			}
		};

		it('should catch empty service body', async () => {
			const mockReq = {
				params: {
					orgId: 'org_id'
				},
				body: {
					userId: 'user_id',
					service: {}
				}
			};

			await ServicesService.createService(mockReq, mockRes);
			expect(mockJSONResponse).toHaveBeenCalledWith({error: true});
		});

		it('should audit on createService', async () => {
			const mockReq = {
				params: {
					orgId: 'org_id'
				},
				body: {
					userId: 'user_id',
					service: {
						_id: 'service_id'
					}
				}
			};

			await ServicesService.createService(mockReq, mockRes);
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.userId,
				'SERVICE',
				[mockService],
				expect.arrayContaining([mockService, mockReq.body.service]),
				'ADDED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({created: true});
		});

		it('should audit on deleteService', async () => {
			const mockReq = {
				params: {
					orgId: 'org_id',
					serviceId: 'service_id'
				},
				body: {
					authorId: 'user_id'
				}
			};
			await ServicesService.deleteService(mockReq, mockRes);
			expect(removeSpy).toHaveBeenCalled();
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.authorId,
				'SERVICE',
				[mockService],
				expect.arrayContaining([mockService]),
				'DELETED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({deleted: true});
		});

		it('should audit on updateService', async () => {
			const mockReq = {
				params: {
					ordId: 'org_id',
					serviceId: 'service_id'
				},
				body: {
					userId: 'user_id',
					service: {
						_id: 'test_id'
					}
				}
			};
			await ServicesService.updateService(mockReq, mockRes);
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.userId,
				'SERVICE',
				expect.arrayContaining([mockService]),
				[mockService],
				'UPDATED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({updated: true});
		});
	});
});
