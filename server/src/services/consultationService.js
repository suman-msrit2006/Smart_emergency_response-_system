import Consultation from '../models/Consultation.js';
import AppError from '../utils/AppError.js';

export const createConsultation = async (consultationData) => {
  const consultation = await Consultation.create(consultationData);

  return consultation;
};

export const getAllConsultations = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    patient,
    doctor,
    hospital,
    status,
    type,
    sortBy = 'scheduledAt',
    order = 'desc',
  } = queryParams;

  const query = {};

  if (patient) {
    query.patient = patient;
  }

  if (doctor) {
    query.doctor = doctor;
  }

  if (hospital) {
    query.hospital = hospital;
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const consultations = await Consultation.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email phone')
    .populate('hospital', 'name address')
    .populate('emergency', 'type severity')
    .populate('vitals')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Consultation.countDocuments(query);

  return {
    consultations,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getConsultationById = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email phone')
    .populate('hospital', 'name address phone')
    .populate('emergency', 'type severity status')
    .populate('vitals')
    .populate('procedures.performedBy', 'name');

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  return consultation;
};

export const updateConsultation = async (consultationId, updateData) => {
  const consultation = await Consultation.findByIdAndUpdate(
    consultationId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  return consultation;
};

export const deleteConsultation = async (consultationId) => {
  const consultation = await Consultation.findByIdAndDelete(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  return consultation;
};

export const startConsultation = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  if (consultation.status !== 'Scheduled') {
    throw new AppError('Consultation has already been started or completed', 400);
  }

  consultation.status = 'In Progress';
  consultation.startedAt = new Date();
  await consultation.save();

  return consultation;
};

export const completeConsultation = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  if (consultation.status !== 'In Progress') {
    throw new AppError('Consultation must be in progress to complete', 400);
  }

  consultation.status = 'Completed';
  consultation.completedAt = new Date();
  await consultation.save();

  return consultation;
};

export const addPrescription = async (consultationId, prescriptionData) => {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  consultation.prescriptions.push(prescriptionData);
  await consultation.save();

  return consultation;
};

export const addLabTest = async (consultationId, labTestData) => {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  consultation.labTests.push({
    ...labTestData,
    orderedAt: new Date(),
    status: 'Ordered',
  });
  await consultation.save();

  return consultation;
};

export const updateLabTest = async (consultationId, labTestId, updateData) => {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  const labTest = consultation.labTests.id(labTestId);

  if (!labTest) {
    throw new AppError('Lab test not found', 404);
  }

  Object.assign(labTest, updateData);

  if (updateData.status === 'Completed') {
    labTest.completedAt = new Date();
  }

  await consultation.save();

  return consultation;
};

export const getPatientConsultations = async (patientId) => {
  const consultations = await Consultation.find({ patient: patientId })
    .populate('doctor', 'name')
    .populate('hospital', 'name')
    .sort({ scheduledAt: -1 });

  return consultations;
};

export const getDoctorConsultations = async (doctorId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const consultations = await Consultation.find({
    doctor: doctorId,
    scheduledAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate('patient', 'name phone')
    .populate('hospital', 'name')
    .sort({ scheduledAt: 1 });

  return consultations;
};
