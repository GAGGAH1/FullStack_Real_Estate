import propertyModel from '../models/propertyModel.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    // Filtering, sorting, pagination can be added here
    const properties = await propertyModel.find().populate('agent', 'name email');

    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = async (req, res) => {
  try {
    const property = await propertyModel.findById(req.params.id).populate('agent', 'name email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (agent, admin)
export const createProperty = async (req, res) => {
  try {
    // Add the logged-in user as the agent
    req.body.agent = req.user.id;

    const property = await propertyModel.create(req.body);

    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (agent, admin)
export const updateProperty = async (req, res) => {
  try {
    let property = await propertyModel.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure the logged-in user is the agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await propertyModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (agent, admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await propertyModel.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure the logged-in user is the agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success:false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.json({ success: true, message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ success:false, message: 'Server error', error: error.message });
  }
};