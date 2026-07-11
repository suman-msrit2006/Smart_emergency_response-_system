import { z } from 'zod';

export const createConsultationSchema = z.object({
  patient: z.string({ required_error: 'Patient ID is required' }),
  doctor: z.string({ required_error: 'Doctor ID is required' }),
  hospital: z.string({ required_error: 'Hospital ID is required' }),

  emergency: z.string().optional(),

  type: z
    .enum(['Emergency', 'Scheduled', 'Walk-in', 'Follow-up', 'Telemedicine'], {
      errorMap: () => ({ message: 'Invalid consultation type' }),
    })
    .default('Scheduled'),

  scheduledAt: z.string({ required_error: 'Scheduled time is required' }).datetime(),

  chiefComplaint: z
    .string({ required_error: 'Chief complaint is required' })
    .min(5, 'Chief complaint must be at least 5 characters long')
    .max(500, 'Chief complaint cannot exceed 500 characters')
    .trim(),

  symptoms: z
    .array(
      z.object({
        name: z.string(),
        severity: z.enum(['Mild', 'Moderate', 'Severe']).optional(),
        duration: z.string().optional(),
      })
    )
    .optional(),
});

export const updateConsultationSchema = z.object({
  status: z
    .enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'])
    .optional(),

  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  diagnosis: z
    .object({
      primary: z.string().trim().optional(),
      secondary: z.array(z.string()).optional(),
      icdCode: z.string().optional(),
    })
    .optional(),

  examination: z
    .object({
      generalAppearance: z.string().optional(),
      cardiovascular: z.string().optional(),
      respiratory: z.string().optional(),
      gastrointestinal: z.string().optional(),
      neurological: z.string().optional(),
      musculoskeletal: z.string().optional(),
      other: z.string().optional(),
    })
    .optional(),

  vitals: z.string().optional(),

  treatmentPlan: z.string().trim().optional(),

  followUpRequired: z.boolean().optional(),
  followUpDate: z.string().datetime().optional(),
  followUpInstructions: z.string().optional(),

  admissionRequired: z.boolean().optional(),

  notes: z.string().trim().optional(),

  billingAmount: z.number().min(0).optional(),
  paymentStatus: z
    .enum(['Pending', 'Partial', 'Paid', 'Insurance Claimed'])
    .optional(),
});

export const addPrescriptionSchema = z.object({
  medication: z.string({ required_error: 'Medication name is required' }),
  dosage: z.string({ required_error: 'Dosage is required' }),
  frequency: z.string({ required_error: 'Frequency is required' }),
  duration: z.string({ required_error: 'Duration is required' }),
  instructions: z.string().optional(),
  refills: z.number().int().min(0).default(0),
});

export const addLabTestSchema = z.object({
  testName: z.string({ required_error: 'Test name is required' }),
  orderedAt: z.string().datetime().optional(),
});

export const updateLabTestSchema = z.object({
  status: z.enum(['Ordered', 'In Progress', 'Completed', 'Cancelled']),
  results: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});
