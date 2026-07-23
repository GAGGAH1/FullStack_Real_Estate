import Property from '../models/propertyModel.js';

export const getPublicProperties = async (req, res) => {
  const { search, location, minPrice, maxPrice, beds, type } = req.query;

  const filter = { status: 'approved' };

  if (location) filter.location = new RegExp(location.trim(), 'i');
  if (type && ['sale', 'rent'].includes(type)) filter.type = type;

  if (beds) {
    const parsedBeds = parseInt(beds, 10);
    if (!Number.isNaN(parsedBeds)) {
      filter.beds = { $gte: parsedBeds };
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!Number.isNaN(min)) filter.price.$gte = min;
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!Number.isNaN(max)) filter.price.$lte = max;
    }
    if (Object.keys(filter.price).length === 0) delete filter.price;
  }

  try {
    let propertiesQuery = Property.find(filter);

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      propertiesQuery = propertiesQuery.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { address: searchRegex },
        ],
      });
    }

    const properties = await propertiesQuery.sort({ createdAt: -1 });
    return res.json(properties);
  } catch (error) {
    return res.status(500).json({ message: 'Error loading properties.', error: error.message });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }
    return res.json(property);
  } catch (error) {
    return res.status(500).json({ message: 'Error loading property.', error: error.message });
  }
};

export const getDashboardProperties = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { agentId: req.user.id };
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    return res.json(properties);
  } catch (error) {
    return res.status(500).json({ message: 'Error loading dashboard properties.', error: error.message });
  }
};

export const createProperty = async (req, res) => {
  const { title, description, price, beds, baths, area, location, address, type, image } = req.body;

  if (!title || !price || !location || !address || !type) {
    return res.status(400).json({ message: 'Title, price, location, address, and type are required.' });
  }

  try {
    const property = await Property.create({
      title: title.trim(),
      description: description?.trim() || 'No description provided.',
      price: parseFloat(price),
      beds: parseInt(beds, 10) || 0,
      baths: parseFloat(baths) || 0,
      area: parseInt(area, 10) || 0,
      location: location.trim(),
      address: address.trim(),
      type,
      image: image?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      agentId: req.user.id,
      agentName: req.user.name,
    });

    return res.status(201).json({
      message: req.user.role === 'admin'
        ? 'Property listed successfully!'
        : 'Property submitted successfully! It is currently pending admin review.',
      property,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating property.', error: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    if (req.user.role !== 'admin' && property.agentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this property listing.' });
    }

    const updates = {};
    const fields = ['title', 'description', 'price', 'beds', 'baths', 'area', 'location', 'address', 'type', 'image'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.title) updates.title = updates.title.trim();
    if (updates.location) updates.location = updates.location.trim();
    if (updates.address) updates.address = updates.address.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.beds !== undefined) updates.beds = parseInt(updates.beds, 10);
    if (updates.baths !== undefined) updates.baths = parseFloat(updates.baths);
    if (updates.area !== undefined) updates.area = parseInt(updates.area, 10);

    if (req.user.role === 'agent') {
      updates.status = 'pending';
    }

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({
      message: req.user.role === 'agent'
        ? 'Property updated. It is now pending admin re-approval.'
        : 'Property updated successfully.',
      property: updatedProperty,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating property.', error: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    if (req.user.role !== 'admin' && property.agentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this property listing.' });
    }

    await Property.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting property.', error: error.message });
  }
};

export const approveProperty = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'approved', 'rejected' or 'pending'." });
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    property.status = status;
    await property.save();

    return res.status(200).json({ message: `Property status set to: ${status}`, property });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating property status.', error: error.message });
  }
};
