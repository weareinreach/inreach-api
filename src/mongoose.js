import {Decimal128} from 'mongoose';
import crypto from 'crypto';

import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const is_published = {type: Boolean, default: true};
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

export const Migration = model('Migration', MigrationSchema);

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
	is_deleted: {type: Boolean, required: true, default: false},
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
	slug: {type: String, unique: true},
	slug_ES: {type: String, unique: true},
	tags: {
		canada: {},
		mexico: {},
		united_states: {}
	}
});

const OrganizationSchema = new Schema(
	{
		alert_message: String,
		alert_message_ES: String,
		description: String,
		description_ES: String,
		emails: [
			{
				email: String,
				first_name: String,
				is_primary: Boolean,
				last_name: String,
				show_on_organization: Boolean,
				title: String,
				title_ES: String
			}
		],
		name: {type: String, required: true},
		name_ES: {type: String},
		is_published,
		is_deleted: {type: Boolean, required: true, default: false},
		locations: [
			{
				address: String,
				city: String,
				city_ES: String,
				country: String,
				country_ES: String,
				is_primary: Boolean,
				lat: String,
				long: String,
				name: String,
				name_ES: String,
				show_on_organization: Boolean,
				state: String,
				state_ES: String,
				unit: String,
				zip_code: String,
				geolocation: {type: {type: String}, coordinates: [Decimal128]}
			}
		],
		notes_log: [
			{
				note: String,
				created_at: Date
			}
		],
		owners: [
			{
				email: String,
				isApproved: Boolean,
				userId: String
			}
		],
		phones: [
			{
				digits: String,
				is_primary: Boolean,
				phone_type: String,
				phone_type_ES: String,
				show_on_organization: Boolean
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
		slug: {type: String, unique: true},
		slug_ES: {type: String, unique: true},
		social_media: [{name: String, url: String}],
		source: String,
		verified_at: Date,
		venue_id: String,
		website: String,
		website_ES: String
	},
	schemaOptions
);

export const Organization = model('Organization', OrganizationSchema);

const CommentSchema = new Schema(
	{
		organizationId: String,
		serviceId: String,
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
		organizationId: String,
		serviceId: String,
		ratings: [
			{
				created_at,
				rating: Number,
				source: String,
				userId: String
			}
		]
	},
	schemaOptions
);

export const Rating = model('Rating', RatingSchema);

const ReviewSchema = new Schema(
	{
		comment: String,
		hasAccount: Boolean,
		hasLeftFeedbackBefore: Boolean,
		negativeReasons: [String],
		rating: Number,
		source: {type: String, default: 'catalog'}
	},
	schemaOptions
);

export const Review = model('Review', ReviewSchema);

const SuggestionSchema = new Schema(
	{
		field: String,
		organizationId: String,
		serviceId: String,
		userEmail: String,
		value: String
	},
	schemaOptions
);

export const Suggestion = model('Suggestion', SuggestionSchema);

const UserSchema = new Schema(
	{
		age: String,
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
		immigrationStatus: String,
		isAdminDataManager: {type: Boolean, default: false},
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

export const User = model('User', UserSchema);
