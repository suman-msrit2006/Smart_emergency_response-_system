import { z } from 'zod';

export const createFeedbackSchema = z.object({
  type: z.enum(['Hospital', 'Ambulance', 'Doctor', 'Consultation', 'Emergency', 'General'], {
    errorMap: () => ({ message: 'Invalid feedback type' }),
  }),

  relatedTo: z
    .object({
      hospital: z.string().optional(),
      ambulance: z.string().optional(),
      doctor: z.string().optional(),
      consultation: z.string().optional(),
      emergency: z.string().optional(),
    })
    .optional(),

  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),

  comment: z
    .string({ required_error: 'Comment is required' })
    .min(10, 'Comment must be at least 10 characters long')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .trim(),

  categories: z
    .array(
      z.enum([
        'Service Quality',
        'Staff Behavior',
        'Cleanliness',
        'Wait Time',
        'Equipment',
        'Communication',
        'Overall Experience',
      ])
    )
    .optional(),

  isAnonymous: z.boolean().default(false),
});

export const updateFeedbackSchema = z.object({
  status: z.enum(['Pending', 'Reviewed', 'Resolved', 'Dismissed']).optional(),

  adminResponse: z
    .object({
      response: z
        .string({ required_error: 'Response is required' })
        .min(10, 'Response must be at least 10 characters long')
        .max(1000, 'Response cannot exceed 1000 characters')
        .trim(),
    })
    .optional(),
});

export const voteSchema = z.object({
  vote: z.enum(['helpful', 'notHelpful'], {
    errorMap: () => ({ message: 'Vote must be either helpful or notHelpful' }),
  }),
});
