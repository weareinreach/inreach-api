import crypto from 'crypto';

import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const updated_at = Date;
const is_published = {type: Boolean, default: true};
const email = {
  email: String,
  first_name: String,
  is_primary: Boolean,
  last_name: String,
  show_on_organization: Boolean,
  title: String
};
const location = {
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
  zip_code: String
};
const phone = {
  digits: String,
  is_primary: Boolean,
  phone_type: String,
  show_on_organization: Boolean
};
const schedule = {
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
  note: String,
  timezone: String
};

// TODO: validate schemas & update updated_at to now()
// TODO: generate/update slugs on save on org and services
const organizationSchema = new Schema({
  created_at,
  updated_at,
  alert_message: String,
  description: String,
  emails: [email],
  name: String,
  is_published,
  locations: [location],
  phones: [phone],
  properties: {},
  schedules: [schedule],
  services: [
    {
      created_at,
      updated_at,
      access_instructions: [
        {
          access_value: String,
          access_type: String,
          instructions: String
        }
      ],
      description: String,
      email_id: String,
      is_published: Boolean,
      location_id: String,
      name: String,
      phone_id: String,
      properties: {},
      schedule_id: String,
      slug: String,
      tags: {
        united_states: [String],
        canada: [String],
        mexico: [String]
      }
    }
  ],
  slug: String,
  source: String,
  verified_at: Date,
  website: String
});

organizationSchema.pre(['findOneAndUpdate', 'save', 'updateOne'], next => {
  if (this) {
    this.updated_at = Date.now();
  }
  next();
});

export const Organization = model('Organization', organizationSchema);

// TODO: validate schemas & update updated_at to now()
const commentSchema = new Schema({
  organizationId: String,
  serviceId: String,
  comments: [
    {
      created_at,
      comment: String,
      source: String,
      userId: String
    }
  ]
});

export const Comment = model('Comment', commentSchema);

// TODO: validate schemas & update updated_at to now()
const ratingSchema = new Schema({
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
});

export const Rating = model('Rating', ratingSchema);

// TODO: validate schemas & update updated_at to now()
const userSchema = new Schema({
  created_at,
  updated_at,
  catalogType: String,
  email: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  favorites: [],
  hash: String,
  isAdminDataManager: Boolean,
  isDataManager: Boolean,
  name: String,
  salt: String
});

userSchema.pre(['findOneAndUpdate', 'save', 'updateOne'], next => {
  if (this) {
    this.updated_at = Date.now();
  }
  next();
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

export const User = model('User', userSchema);
