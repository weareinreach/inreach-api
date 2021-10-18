import {EditLog} from '../../src/mongoose';
import {
	generateAuditLogMessage,
	auditEdit,
	getLogs
} from '../../src/routes/editLogs';

describe('editLogs', () => {
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

	describe('getLogs', () => {
		beforeEach(() => {
			mockJSONResponse.mockClear();
		});

		it('should catch a bad request', async () => {
			await getLogs(
				{
					params: {
						orgId: '',
						serviceId: ''
					}
				},
				mockRes
			);
			expect(mockJSONResponse).toHaveBeenCalledWith({error: true});
		});

		it('should catch logs not found', async () => {
			const findSpy = jest
				.spyOn(EditLog, 'find')
				.mockImplementation(async () => {
					return [];
				});

			const mockReq = {
				params: {
					orgId: 'org_id'
				}
			};

			await getLogs(mockReq, mockRes);
			expect(mockJSONResponse).toHaveBeenCalledWith({notFound: true});
			findSpy.mockRestore();
		});

		it('should return logs', async () => {
			const fakeLogs = [{test: 'test'}, {test: 'test'}];

			const findSpy = jest
				.spyOn(EditLog, 'find')
				.mockImplementation(async () => {
					return fakeLogs;
				});

			const mockReq = {
				params: {
					serviceId: 'service_id'
				}
			};

			await getLogs(mockReq, mockRes);
			expect(mockJSONResponse).toHaveBeenCalledWith(fakeLogs);
			findSpy.mockRestore();
		});
	});

	describe('auditEdit', () => {
		let createSpy;
		let consoleLogSpy;
		beforeAll(() => {
			createSpy = jest
				.spyOn(EditLog, 'create')
				.mockImplementation(async (org) => {
					return org;
				});
			consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		});

		beforeEach(() => {
			createSpy.mockClear();
			consoleLogSpy.mockClear();
		});

		afterAll(() => {
			createSpy.mockRestore();
			consoleLogSpy.mockRestore();
		});

		const userId = 'userId';
		const entityType = 'ORGANIZATION';
		const entityId = 'org_id';
		const action = 'test';

		it('should succeed to log no change', async () => {
			await auditEdit(
				userId,
				entityType,
				{_id: entityId},
				{_id: entityId},
				action
			);
			const {previousValue, newValue} = createSpy.mock.calls[0][0];
			expect(previousValue).toMatchObject({});
			expect(newValue).toMatchObject({});
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		});

		it('should succeed to log new property', async () => {
			await auditEdit(
				userId,
				entityType,
				{_id: entityId},
				{_id: entityId, newProperty: 'test'},
				action
			);
			const {previousValue, newValue} = createSpy.mock.calls[0][0];
			expect(previousValue).toMatchObject({});
			expect(newValue).toMatchObject({newProperty: 'test'});
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		});

		it('should succeed to log remove property', async () => {
			await auditEdit(
				userId,
				entityType,
				{_id: entityId, oldProperty: 'test'},
				{_id: entityId},
				action
			);
			const {previousValue, newValue} = createSpy.mock.calls[0][0];
			expect(previousValue).toMatchObject({oldProperty: 'test'});
			expect(newValue).toMatchObject({});
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		});

		it('should succeed to log additions and removals', async () => {
			await auditEdit(
				userId,
				entityType,
				{_id: entityId, oldProperty: 'test'},
				{_id: entityId, newProperty: 'test'},
				action
			);
			const {previousValue, newValue} = createSpy.mock.calls[0][0];
			expect(previousValue).toMatchObject({oldProperty: 'test'});
			expect(newValue).toMatchObject({
				newProperty: 'test',
				oldProperty: undefined
			});
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		});

		it('should succeed to log additions and removals on arrays', async () => {
			await auditEdit(
				userId,
				entityType,
				{_id: entityId, arr: ['test1', 'test2']},
				{_id: entityId, arr: ['test2', 'test3']},
				action
			);
			const {previousValue, newValue} = createSpy.mock.calls[0][0];
			expect(previousValue).toMatchObject({arr: {0: 'test1', 1: 'test2'}});
			expect(newValue).toMatchObject({arr: {0: 'test2', 1: 'test3'}});
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		});

		it('should fail and log fail', async () => {
			const testErr = new Error('test');
			const tempSpy = jest
				.spyOn(EditLog, 'create')
				.mockImplementation(async () => {
					throw testErr;
				});
			await auditEdit(
				userId,
				entityType,
				{_id: entityId},
				{_id: entityId},
				action
			);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				generateAuditLogMessage(userId, entityType, entityId, action, false),
				testErr
			);
			tempSpy.mockReset();
		});
	});
});
