import {Decimal128} from 'mongoose';
import crypto from 'crypto';

import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const updated_at_function = function () {
	this.updated_at = Date.now;
};
const is_published = {type: Boolean, default: true};
const is_deleted = {type: Boolean, required: true, default: false};
const schemaOptions = {
	timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
};
const ObjectId = Schema.Types.ObjectId;

const MigrationSchema = new Schema({
	created_at,
	updated_at: Date,
	migration_file: {type: String, unique: true, required: true},
	pipeline_reference: String,
	approver: String,
	migration_type: {type: String, required: true}
});

MigrationSchema.pre('save', updated_at_function);
export const Migration = model('Migration', MigrationSchema);

//Notes
// is published, set default to false to all services
//make sure all services have slug

const ServiceSchema = new Schema({
	created_at,
	updated_at: Date,
	access_instructions: [
		{
			access_value: String,
			access_value_ES: String,
			access_type: String,
			instructions: String,
			instructions_ES: String
		}
	],
	description: String,
	description_ES: String,
	email_id: String,
	is_published,
	is_deleted,
	location_id: String,
	name: {type: String, required: true},
	name_ES: {type: String},
	notes_log: [
		{
			note: String,
			created_at: Date
		}
	],
	phone_id: String,
	properties: {},
	schedule_id: String,
	slug: {type: String, required: true},
	slug_ES: String,
	tags: {
		canada: {},
		mexico: {},
		united_states: {}
	}
});
ServiceSchema.pre('save', updated_at_function);

const LocationSchema = new Schema({
	address: {type: String, required: true},
	city: {type: String, required: true},
	city_ES: String,
	country: {type: String, required: true},
	country_ES: String,
	created_at,
	updated_at: Date,
	is_primary: {type: Boolean, required: true, default: false},
	lat: {type: String, required: true},
	long: {type: String, required: true},
	name: String,
	name_ES: String,
	show_on_organization: {type: Boolean, required: true, default: false},
	state: String,
	state_ES: String,
	unit: String,
	zip_code: String,
	geolocation: {type: {type: String}, coordinates: [Decimal128]}
});

LocationSchema.pre('save', updated_at_function);

const OrganizationSchema = new Schema(
	{
		alert_message: String,
		alert_message_ES: String,
		description: String,
		description_ES: String,
		created_at,
		updated_at: Date,
		emails: [
			{
				email: {
					type: String,
					required: true,
					lowercase: true,
					match: [/\S+@\S+\.\S+/, 'is invalid']
				},
				first_name: String,
				is_primary: {type: Boolean, required: true, default: false},
				last_name: String,
				show_on_organization: {type: Boolean, required: true, default: false},
				title: {type: String, required: true},
				title_ES: String
			}
		],
		name: {type: String, required: true},
		name_ES: {type: String},
		is_published,
		is_deleted,
		locations: [LocationSchema],
		notes_log: [
			{
				note: {type: String, required: true},
				created_at
			}
		],
		owners: [
			{
				email: {type: String, required: true},
				isApproved: {type: Boolean, required: true, default: false},
				userId: String
			}
		],
		phones: [
			{
				digits: {type: String, required: true},
				is_primary: {type: Boolean, required: true, default: false},
				country_code: {type: String, required: true, default: '+1'},
				phone_type: String,
				phone_type_ES: String,
				show_on_organization: {type: Boolean, required: true, default: false}
			}
		],
		photos: [],
		properties: {},
		schedules: [
			{
				monday_start: String,
				monday_end: String,
				tuesday_start: String,
				tuesday_end: String,
				wednesday_start: String,
				wednesday_end: String,
				thursday_start: String,
				thursday_end: String,
				friday_start: String,
				friday_end: String,
				saturday_start: String,
				saturday_end: String,
				sunday_start: String,
				sunday_end: String,
				name: String,
				note: String,
				timezone: String
			}
		],
		services: [ServiceSchema],
		slug: {type: String, required: true},
		slug_ES: String,
		social_media: [
			{
				name: {type: String, required: true},
				url: {type: String, required: true}
			}
		],
		source: String,
		verified_at: Date,
		venue_id: String,
		website: String,
		website_ES: String
	},
	schemaOptions
);

OrganizationSchema.pre('save', updated_at_function);
export const Organization = model('Organization', OrganizationSchema);

const CommentSchema = new Schema(
	{
		organizationId: {type: String, required: true},
		serviceId: {type: String, required: true},
		is_deleted: {type: Boolean, required: true, default: false},
		comments: [
			{
				created_at,
				comment: String,
				source: String,
				userId: String
			}
		]
	},
	schemaOptions
);

export const Comment = model('Comment', CommentSchema);

const RatingSchema = new Schema(
	{
		organizationId: {type: String, required: true},
		serviceId: {type: String, required: true},
		ratings: [
			{
				created_at,
				rating: {type: Number, required: true},
				source: String,
				userId: {type: String, required: true}
			}
		]
	},
	schemaOptions
);

export const Rating = model('Rating', RatingSchema);

//Change migration from catalog to app
const ReviewSchema = new Schema(
	{
		comment: {type: String, required: true},
		created_at,
		updated_at: Date,
		hasAccount: {type: Boolean, required: true},
		hasLeftFeedbackBefore: {type: Boolean, required: true},
		negativeReasons: [String],
		rating: {type: Number, required: true},
		source: {type: String, default: 'app'}
	},
	schemaOptions
);

ReviewSchema.pre('save', updated_at_function);
export const Review = model('Review', ReviewSchema);

const SuggestionSchema = new Schema(
	{
		field: {type: String, required: true},
		organizationId: {type: String, required: true},
		serviceId: String,
		userEmail: String,
		value: String
	},
	schemaOptions
);

export const Suggestion = model('Suggestion', SuggestionSchema);

const UserSchema = new Schema(
	{
		age: {type: String, required: true},
		catalogType: {type: String, enum: ['lawyer', 'provider', 'seeker']},
		currentLocation: String,
		email: {
			type: String,
			lowercase: true,
			required: [true, "can't be blank"],
			match: [/\S+@\S+\.\S+/, 'is invalid']
		},
		ethnicityRace: [String],
		hash: {type: String, required: true},
		countryOfOrigin: String,
		sogIdentity: [String],
		created_at,
		updated_at: Date,
		immigrationStatus: String,
		isAdminDataManager: {type: Boolean, default: false},
		isAdminDeveloper: {type: Boolean, default: false},
		isDataManager: {type: Boolean, default: false},
		isProfessional: {type: Boolean, default: false},
		lists: [
			{
				name: String,
				items: [{fetchable_id: String, orgId: String}],
				visibility: {
					type: String,
					default: 'private',
					enum: ['private', 'shared', 'public']
				},
				shared_with: [{user_id: {type: ObjectId, ref: 'User'}, email: String}]
			}
		],
		name: {type: String, required: true},
		orgId: String,
		orgName: String,
		orgPositionTitle: String,
		orgType: String,
		reasonForJoining: String,
		salt: {type: String, required: true}
	},
	schemaOptions
);

UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
		.toString('hex');
};

UserSchema.methods.validPassword = function (password) {
	const hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
		.toString('hex');
	return this.hash === hash;
};
UserSchema.pre('save', updated_at_function);
export const User = model('User', UserSchema);

const DeveloperSchema = new Schema({
	email: {type: String, required: true},
	created_at,
	updated_at: Date,
	github_access: {type: Boolean, required: true, default: false},
	github_invite: Date,
	slack_access: {type: Boolean, required: true, default: false},
	slack_invite: Date,
	asana_access: {type: Boolean, required: true, default: false},
	asana_invite: Date,
	status: {
		type: String,
		required: true,
		enum: ['invited', 'removed'],
		default: 'invited'
	}
});

DeveloperSchema.pre('save', updated_at_function);
export const Developer = model('Developer', DeveloperSchema);
