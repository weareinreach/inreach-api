import crypto from 'crypto';

import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const is_published = {type: Boolean, default: true};
const schmeaOptions = {
  timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
};

const ServiceSchema = new Schema({
  created_at,
  updated_at: Date,
  access_instructions: [
    {
      access_value: String,
      access_type: String,
      instructions: String,
    },
  ],
  description: String,
  email_id: String,
  is_published,
  location_id: String,
  name: {type: String, required: true},
  phone_id: String,
  properties: {},
  schedule_id: String,
  slug: String,
  tags: {
    canada: {},
    mexico: {},
    united_states: {},
  },
});

const OrganizationSchema = new Schema(
  {
    alert_message: String,
    description: String,
    emails: [
      {
        email: String,
        first_name: String,
        is_primary: Boolean,
        last_name: String,
        show_on_organization: Boolean,
        title: String,
      },
    ],
    name: {type: String, required: true},
    is_published,
    locations: [
      {
        address: String,
        city: String,
        country: String,
        is_primary: Boolean,
        lat: String,
        long: String,
        name: String,
        show_on_organization: Boolean,
        state: String,
        unit: String,
        zip_code: String,
      },
    ],
    owners: [
      {
        email: String,
        isApproved: Boolean,
        userId: String,
      },
    ],
    phones: [
      {
        digits: String,
        is_primary: Boolean,
        phone_type: String,
        show_on_organization: Boolean,
      },
    ],
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
        timezone: String,
      },
    ],
    services: [ServiceSchema],
    slug: String,
    source: String,
    verified_at: Date,
    website: String,
  },
  schmeaOptions
);

export const Organization = model('Organization', OrganizationSchema);

const CommentSchema = new Schema(
  {
    organizationId: String,
    serviceId: String,
    comments: [
      {
        created_at,
        comment: String,
        source: String,
        userId: String,
      },
    ],
  },
  schmeaOptions
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
        userId: String,
      },
    ],
  },
  schmeaOptions
);

export const Rating = model('Rating', RatingSchema);

const ReviewSchema = new Schema(
  {
    comment: String,
    hasAccount: Boolean,
    hasLeftFeedbackBefore: Boolean,
    negativeReasons: [String],
    rating: Number,
    source: {type: String, default: 'catalog'},
  },
  schmeaOptions
);

export const Review = model('Review', ReviewSchema);

const SuggestionSchema = new Schema(
  {
    field: String,
    organizationId: String,
    serviceId: String,
    userEmail: String,
    value: String,
  },
  schmeaOptions
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
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    ethnicityRace: [String],
    hash: {type: String, required: true},
    homeLocation: String,
    identityPrimary: String,
    identitySupplimental: [String],
    isAdminDataManager: {type: Boolean, default: false},
    isDataManager: {type: Boolean, default: false},
    isProfessional: {type: Boolean, default: false},
    lists: [
      {
        name: String,
        items: [{fetchable_id: String, orgId: String}],
      },
    ],
    name: {type: String, required: true},
    orgAreaOfWork: String,
    orgId: String,
    orgPositionTitle: String,
    reasonForJoining: String,
    salt: {type: String, required: true},
  },
  schmeaOptions
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
