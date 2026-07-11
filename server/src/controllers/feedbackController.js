import * as feedbackService from '../services/feedbackService.js';
import catchAsync from '../utils/catchAsync.js';

export const createFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    message: 'Feedback submitted successfully',
    data: { feedback },
  });
});

export const getAllFeedbacks = catchAsync(async (req, res) => {
  const result = await feedbackService.getAllFeedbacks(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { feedback },
  });
});

export const updateFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.updateFeedback(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Feedback updated successfully',
    data: { feedback },
  });
});

export const deleteFeedback = catchAsync(async (req, res) => {
  await feedbackService.deleteFeedback(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Feedback deleted successfully',
    data: null,
  });
});

export const voteFeedback = catchAsync(async (req, res) => {
  const { vote } = req.body;
  const feedback = await feedbackService.voteFeedback(req.params.id, vote);

  res.status(200).json({
    status: 'success',
    message: 'Vote recorded successfully',
    data: { feedback },
  });
});

export const getHospitalFeedbacks = catchAsync(async (req, res) => {
  const result = await feedbackService.getHospitalFeedbacks(req.params.hospitalId);

  res.status(200).json({
    status: 'success',
    results: result.feedbacks.length,
    data: result,
  });
});

export const getDoctorFeedbacks = catchAsync(async (req, res) => {
  const result = await feedbackService.getDoctorFeedbacks(req.params.doctorId);

  res.status(200).json({
    status: 'success',
    results: result.feedbacks.length,
    data: result,
  });
});

export const getUserFeedbacks = catchAsync(async (req, res) => {
  const feedbacks = await feedbackService.getUserFeedbacks(req.user._id);

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: { feedbacks },
  });
});
