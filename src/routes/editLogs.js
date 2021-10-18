import {EditLog} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {diff} from 'deep-object-diff';

export const generateAuditLogMessage = (
	userId,
	entityType,
	entityId,
	action,
	success
) => {
	return `${entityType} ${entityId} updated (${action}) by ${userId} ${
		success ? `and successfully logged it` : `but failed to log it`
	}`;
};

export const getLogs = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const query = {entityId: orgId || serviceId};

	if (!orgId && !serviceId) {
		return handleBadRequest(res);
	}

	await EditLog.find(query)
		.then((logs) => {
			if (!logs || !logs.length) {
				return handleNotFound(res);
			}
			return res.json(logs);
		})
		.catch((err) => {
			handleErr(err, res);
		});
};

export const auditEdit = async (
	userId,
	entityType,
	entityOld = {},
	entityUpdate = {},
	action
) => {
	const entityOldJSON = entityOld.toJSON ? entityOld.toJSON() : entityOld;
	const entityUpdateJSON = entityUpdate.toJSON
		? entityUpdate.toJSON()
		: entityUpdate;
	const previousValue = diff(entityUpdateJSON, entityOldJSON);
	const newValue = diff(entityOldJSON, entityUpdateJSON);
	const entityId = entityOld._id || entityUpdate._id;
	await EditLog.create({
		userId,
		updatedOn: Date.now(),
		entityType,
		entityId,
		previousValue,
		newValue,
		action
	})
		.then(() => {
			console.log(
				generateAuditLogMessage(userId, entityType, entityId, action, true)
			);
		})
		.catch((e) => {
			console.log(
				generateAuditLogMessage(userId, entityType, entityId, action, false),
				e
			);
		});
};
