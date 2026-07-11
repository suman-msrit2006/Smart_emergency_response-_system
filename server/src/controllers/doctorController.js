import Doctor from '../models/Doctor.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = catchAsync(async (req, res) => {
  const { specialty, hospital, availability, limit = 50, page = 1 } = req.query;

  const query = { isActive: true };

  if (specialty) {
    query.specialty = specialty;
  }

  if (hospital) {
    query.hospital = hospital;
  }

  if (availability) {
    query.availability = availability;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const doctors = await Doctor.find(query)
    .populate('hospital', 'name location')
    .sort('-rating')
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Doctor.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('hospital', 'name location address contact');

  if (!doctor) {
    throw new ApiError('Doctor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor,
    },
  });
});

// @desc    Get doctors by specialty
// @route   GET /api/doctors/specialty/:specialty
// @access  Public
export const getDoctorsBySpecialty = catchAsync(async (req, res) => {
  const { specialty } = req.params;

  const doctors = await Doctor.find({
    specialty,
    isActive: true,
  })
    .populate('hospital', 'name location')
    .sort('-rating');

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      doctors,
    },
  });
});

// @desc    Get doctors by hospital
// @route   GET /api/doctors/hospital/:hospitalId
// @access  Public
export const getDoctorsByHospital = catchAsync(async (req, res) => {
  const { hospitalId } = req.params;

  const doctors = await Doctor.find({
    hospital: hospitalId,
    isActive: true,
  }).sort('-rating');

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      doctors,
    },
  });
});

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Hospital Admin)
export const createDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      doctor,
    },
  });
});

// @desc    Update doctor
// @route   PATCH /api/doctors/:id
// @access  Private (Doctor, Hospital Admin)
export const updateDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('hospital', 'name location');

  if (!doctor) {
    throw new ApiError('Doctor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor,
    },
  });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Hospital Admin)
export const deleteDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  // Soft delete
  doctor.isActive = false;
  await doctor.save();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
