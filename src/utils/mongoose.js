// TODO: Turn ids of type String to Schema.Types.ObjectId
import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const updated_at = {type: Date};
const is_published = {type: Boolean, default: true};

const day = {
  start_time: String,
  end_time: String,
  timezone: String
};

const schedule = {
  sunday: day,
  monday: day,
  tuesday: day,
  wednesday: day,
  thursday: day,
  friday: day,
  saturday: day
};

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
      show_on_org: Boolean,
      title: String
    }
  ],
  name: String,
  is_at_capacity: Boolean,
  is_published,
  last_verified: Date,
  locations: [
    {
      address: String,
      city: String,
      country: String,
      is_primary: Boolean,
      name: String,
      state: String,
      zip: String
    }
  ],
  phones: [
    {
      digits: String,
      extension: String,
      is_primary: Boolean
    }
  ],
  schedule,
  services: [
    {
      created_at,
      updated_at,
      access_instructions: String,
      description: String,
      emailId: String,
      is_appointment: Boolean,
      is_at_capacity: Boolean,
      is_published: Boolean,
      locationId: String,
      name: String,
      phoneId: String,
      schedule,
      // TODO: update slug on save
      slug: String
    }
  ],
  // TODO: update slug on save
  slug: String,
  source: String,
  website: String
});

// TODO: validate schemas & update updated_at to now()
organizationSchema.pre(['findOneAndUpdate', 'save', 'updateOne'], next => {
  this.updated_at(Date.now());
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
  this.updated_at(Date.now());
  next();
});

export const User = model('User', userSchema);
