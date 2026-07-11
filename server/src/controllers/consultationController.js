import * as consultationService from '../services/consultationService.js';
import catchAsync from '../utils/catchAsync.js';

export const createConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.createConsultation(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Consultation created successfully',
    data: { consultation },
  });
});

export const getAllConsultations = catchAsync(async (req, res) => {
  const result = await consultationService.getAllConsultations(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.getConsultationById(
    req.params.id
  );

  res.status(200).json({
    status: 'success',
    data: { consultation },
  });
});

export const updateConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateConsultation(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Consultation updated successfully',
    data: { consultation },
  });
});

export const deleteConsultation = catchAsync(async (req, res) => {
  await consultationService.deleteConsultation(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Consultation deleted successfully',
    data: null,
  });
});

export const startConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.startConsultation(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Consultation started successfully',
    data: { consultation },
  });
});

export const completeConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.completeConsultation(
    req.params.id
  );

  res.status(200).json({
    status: 'success',
    message: 'Consultation completed successfully',
    data: { consultation },
  });
});

export const addPrescription = catchAsync(async (req, res) => {
  const consultation = await consultationService.addPrescription(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Prescription added successfully',
    data: { consultation },
  });
});

export const addLabTest = catchAsync(async (req, res) => {
  const consultation = await consultationService.addLabTest(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Lab test ordered successfully',
    data: { consultation },
  });
});

export const updateLabTest = catchAsync(async (req, res) => {
  const { labTestId } = req.params;
  const consultation = await consultationService.updateLabTest(
    req.params.id,
    labTestId,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Lab test updated successfully',
    data: { consultation },
  });
});

export const getPatientConsultations = catchAsync(async (req, res) => {
  const consultations = await consultationService.getPatientConsultations(
    req.params.patientId
  );

  res.status(200).json({
    status: 'success',
    results: consultations.length,
    data: { consultations },
  });
});

export const getDoctorConsultations = catchAsync(async (req, res) => {
  const { date } = req.query;
  const consultations = await consultationService.getDoctorConsultations(
    req.params.doctorId,
    date || new Date()
  );

  res.status(200).json({
    status: 'success',
    results: consultations.length,
    data: { consultations },
  });
});
