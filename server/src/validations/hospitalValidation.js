import { z } from 'zod';

export const createHospitalSchema = z.object({
  name: z
    .string({
      required_error: 'Hospital name is required',
    })
    .min(3, 'Hospital name must be at least 3 characters long')
    .max(200, 'Hospital name cannot exceed 200 characters')
    .trim(),

  address: z.object({
    street: z.string({ required_error: 'Street address is required' }).trim(),
    city: z.string({ required_error: 'City is required' }).trim(),
    state: z.string({ required_error: 'State is required' }).trim(),
    zipCode: z.string({ required_error: 'Zip code is required' }).trim(),
    country: z.string().trim().default('USA'),
  }),

  location: z.object({
    coordinates: z
      .array(z.number())
      .length(2, 'Coordinates must have exactly 2 values [longitude, latitude]')
      .refine(
        (coords) => coords[0] >= -180 && coords[0] <= 180,
        'Longitude must be between -180 and 180'
      )
      .refine(
        (coords) => coords[1] >= -90 && coords[1] <= 90,
        'Latitude must be between -90 and 90'
      ),
  }),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Invalid phone number format'
    )
    .trim(),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  emergencyContact: z
    .string({ required_error: 'Emergency contact is required' })
    .trim(),

  specialties: z
    .array(z.string())
    .min(1, 'At least one specialty is required')
    .nonempty('Specialties cannot be empty'),

  facilities: z
    .object({
      emergencyRoom: z.boolean().optional(),
      icu: z.boolean().optional(),
      operationTheater: z.boolean().optional(),
      ambulanceService: z.boolean().optional(),
      pharmacy: z.boolean().optional(),
      laboratory: z.boolean().optional(),
      imaging: z.boolean().optional(),
    })
    .optional(),

  capacity: z.object({
    totalBeds: z
      .number({ required_error: 'Total beds is required' })
      .int('Total beds must be an integer')
      .min(1, 'Total beds must be at least 1'),
    availableBeds: z
      .number({ required_error: 'Available beds is required' })
      .int('Available beds must be an integer')
      .min(0, 'Available beds cannot be negative'),
    icuBeds: z.number().int().min(0).optional(),
    emergencyBeds: z.number().int().min(0).optional(),
  }),

  accreditation: z.string().trim().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const updateHospitalSchema = createHospitalSchema.partial();

export const updateCapacitySchema = z.object({
  availableBeds: z
    .number()
    .int('Available beds must be an integer')
    .min(0, 'Available beds cannot be negative')
    .optional(),
  icuBeds: z
    .number()
    .int('ICU beds must be an integer')
    .min(0, 'ICU beds cannot be negative')
    .optional(),
  emergencyBeds: z
    .number()
    .int('Emergency beds must be an integer')
    .min(0, 'Emergency beds cannot be negative')
    .optional(),
});
