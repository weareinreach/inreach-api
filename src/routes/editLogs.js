import {EditLog} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {diff} from 'deep-object-diff';

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
				`${entityType} ${entityId} updated (${action}) by ${userId} and successfully logged it`
			);
		})
		.catch((e) => {
			console.log(
				`${entityType} ${entityId} updated (${action}) by ${userId} but failed to log it`,
				e
			);
		});
};
