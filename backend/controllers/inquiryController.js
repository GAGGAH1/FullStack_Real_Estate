import Property from '../models/propertyModel.js';
import Inquiry from '../models/inquiryModel.js';

export const createInquiry = async (req, res) => {
  const { propertyId, message } = req.body;

  if (!propertyId || !message) {
    return res.status(400).json({ message: 'propertyId and message are required.' });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const inquiry = await Inquiry.create({
      propertyId: property._id,
      propertyName: property.title,
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      message: message.trim(),
      agentId: property.agentId,
      status: 'unread',
      replyMessage: '',
    });

    return res.status(201).json({
      message: 'Inquiry submitted successfully! The agent will be notified.',
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting inquiry.', error: error.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : req.user.role === 'agent'
        ? { agentId: req.user.id }
        : { buyerId: req.user.id };

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching inquiries.', error: error.message });
  }
};

export const replyToInquiry = async (req, res) => {
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ message: 'replyMessage is required.' });
  }

  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    if (req.user.role === 'agent' && inquiry.agentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This inquiry is for another agent.' });
    }

    inquiry.status = 'replied';
    inquiry.replyMessage = replyMessage.trim();
    await inquiry.save();

    return res.json({ message: 'Reply sent successfully!', inquiry });
  } catch (error) {
    return res.status(500).json({ message: 'Error replying to inquiry.', error: error.message });
  }
};
