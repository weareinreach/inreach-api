// TODO: Turn ids of type String to Schema.Types.ObjectId
import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const updated_at = Date;
const is_published = {type: Boolean, default: true};

// TODO: validate schemas & update updated_at to now()
const organizationSchema = new Schema({
  created_at,
  updated_at,
  alert_message: String,
  description: String,
  emails: [
    {
      email: String,
      first_name: String,
      is_primary: Boolean,
      last_name: String,
      show_on_organization: Boolean,
      title: String
    }
  ],
  name: String,
  is_published,
  locations: [
    {
      address: String,
      city: String,
      country: String,
      is_primary: Boolean,
      name: String,
      show_on_organization: Boolean,
      state: String,
      unit: String,
      zip_code: String
    }
  ],
  phones: [
    {
      phone_type: String,
      digits: String,
      is_primary: Boolean
    }
  ],
  properties: {},
  region: String,
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
      note: String
    }
  ],
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
      emailId: String,
      is_appointment: Boolean,
      is_published: Boolean,
      locationId: String,
      organization: {},
      properties: {},
      name: String,
      phoneId: String,
      scheduleId: String,
      // TODO: update slug on save
      slug: String,
      tags: [String]
    }
  ],
  // TODO: update slug on save
  slug: String,
  source: String,
  verified_at: Date,
  website: String
});

// TODO: validate schemas & update updated_at to now()
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
  favorites: []
});

userSchema.pre(['findOneAndUpdate', 'save', 'updateOne'], next => {
  if (this) {
    this.updated_at = Date.now();
  }
  next();
});

export const User = model('User', userSchema);
