// TODO: Turn ids of type String to Schema.Types.ObjectId
import {model, Schema} from 'mongoose';

const created_at = {type: Date, default: Date.now};
const updated_at = Date;
const is_published = {type: Boolean, default: true};

// TODO: validate schemas
const organizationSchema = new Schema({
  created_at,
  updated_at,
  alert_message: String,
  description: String,
  name: String,
  is_at_capacity: Boolean,
  is_published,
  last_verified: Date,
  services: [
    {
      created_at,
      updated_at,
      access_instructions: String,
      description: String,
      is_appointment: Boolean,
      is_at_capacity: Boolean,
      is_published: Boolean,
      name: String,
      slug: String
    }
  ],
  slug: String,
  source: String,
  website: String
});

export const Organization = model('Organization', organizationSchema);

// TODO: validate schemas
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

// TODO: validate schemas
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

// TODO: validate schemas
const userSchema = new Schema({
  created_at,
  updated_at
});

export const User = model('User', userSchema);
