import mongoose from 'mongoose';
import * as mongooseService from '../../src/mongoose';
import {Organization} from '../../src/mongoose';

jest.mock('../../src/utils/mail', () => {});
jest.mock('../../src/utils/sendMail', () => {});

import * as OrganizationService from '../../src/routes/organizations';
import * as EditLogsService from '../../src/routes/editLogs';

describe('organizations', () => {
	afterAll(() => {
		jest.restoreAllMocks();
	});

	describe('auditing', () => {
		let auditEditSpy;
		const objectId = new mongoose.Types.ObjectId();

		beforeAll(() => {
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

		it('should catch empty organization on createOrg', async () => {
			const mockReq = {
				body: {
					userId: 'user_id',
					organization: {}
				}
			};
			await OrganizationService.createOrg(mockReq, mockRes);
			expect(mockJSONResponse).toHaveBeenCalledWith({error: true});
		});

		it('should audit on createOrg', async () => {
			const mockReq = {
				body: {
					userId: 'user_id',
					organization: {
						_id: objectId,
						name: 'organization_name'
					}
				}
			};
			const constructorSpy = jest
				.spyOn(mongooseService, 'Organization')
				.mockImplementation((organization) => {
					return {
						save: async () => {
							return organization;
						}
					};
				});
			await OrganizationService.createOrg(mockReq, mockRes);
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.userId,
				'ORGANIZATION',
				{},
				mockReq.body.organization,
				'ADDED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({
				created: true,
				organization: mockReq.body.organization
			});
			constructorSpy.mockRestore();
		});

		it('should audit on deleteOrg', async () => {
			const mockReq = {
				params: {
					orgId: objectId
				},
				body: {
					userId: 'user_id'
				}
			};

			const expected = {_id: objectId};
			jest
				.spyOn(Organization, 'findByIdAndDelete')
				.mockImplementation(async () => {
					return expected;
				});
			await OrganizationService.deleteOrg(mockReq, mockRes);
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.userId,
				'ORGANIZATION',
				expected,
				{},
				'DELETED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({deleted: true});
		});

		it('should audit edit on updateOrg', async () => {
			const mockReq = {
				params: {
					orgId: objectId
				},
				body: {
					userId: 'user_id',
					updates: {
						test: 'test'
					}
				}
			};
			const expected = {_id: objectId};
			const expectedUpdated = {...expected, ...mockReq.body.updates};
			jest.spyOn(Organization, 'findById').mockImplementation(async () => {
				return expected;
			});
			jest
				.spyOn(Organization, 'findOneAndUpdate')
				.mockImplementation(async () => {
					return expectedUpdated;
				});
			await OrganizationService.updateOrg(mockReq, mockRes);
			expect(auditEditSpy).toHaveBeenCalledWith(
				mockReq.body.userId,
				'ORGANIZATION',
				expected,
				expectedUpdated,
				'UPDATED'
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({updated: true});
			jest.restoreAllMocks();
		});
	});
});
