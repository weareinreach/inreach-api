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
  name: String,
  is_published,
  services: [
    {
      created_at,
      updated_at,
      is_published
    }
  ],
  source: String
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
