import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),

  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  phone: z
    .string({
      required_error: 'Phone number is required',
    })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Invalid phone number format'
    )
    .trim(),

  role: z.enum(['Patient', 'Ambulance Personnel'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),

  // Patient-specific fields
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  emergencyContactNumber: z.string().trim().optional(),

  // Ambulance Personnel-specific fields
  employeeId: z.string().trim().optional(),
  ambulanceNumber: z.string().trim().optional(),
  licenseNumber: z.string().trim().optional(),
  organization: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  // Patient-specific required fields
  if (data.role === 'Patient') {
    if (!data.age) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['age'],
        message: 'Age is required for Patient registration',
      });
    }
    if (!data.gender) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gender'],
        message: 'Gender is required for Patient registration',
      });
    }
    if (!data.emergencyContactNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['emergencyContactNumber'],
        message: 'Emergency contact number is required for Patient registration',
      });
    }
  }

  // Ambulance Personnel-specific required fields
  if (data.role === 'Ambulance Personnel') {
    if (!data.employeeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employeeId'],
        message: 'Employee ID is required for Ambulance Personnel registration',
      });
    }
    if (!data.ambulanceNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ambulanceNumber'],
        message: 'Ambulance Number is required for Ambulance Personnel registration',
      });
    }
    if (!data.licenseNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['licenseNumber'],
        message: 'License Number is required for Ambulance Personnel registration',
      });
    }
    if (!data.organization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['organization'],
        message: 'Organization/Hospital is required for Ambulance Personnel registration',
      });
    }
  }
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password is required'),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};
