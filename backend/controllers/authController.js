import config from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const users = db.users.find();
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    return res.json(sanitizedUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['buyer', 'agent', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be buyer, agent, or admin.' });
  }

  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'Lockout Protection: You cannot change your own admin role.' });
  }

  const user = db.users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  try {
    const updatedUser = db.users.findByIdAndUpdate(req.params.id, { role });
    return res.json({
      message: `User role updated successfully to ${role}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user role.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Lockout Protection: You cannot delete your own admin account.' });
  }

  const user = db.users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  try {
    db.users.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};
