import User from '../models/user.js';

class UserRepository {
  // Create a new user
  async createUser(userData, options = {}) {
    try {
      const user = await User.create(userData, options);
      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  // Find a user by ID
  async findById(userId, options = {}) {
    try {
      const user = await User.findByPk(userId, options);
      return user;
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
    }
  }

  // Find a user by username
  async findByUsername(username, options = {}) {
    try {
      const user = await User.findOne({ where: { username }, ...options });
      return user;
    } catch (error) {
      throw new Error('Error finding user by username: ' + error.message);
    }
  }

  // Update a user by ID
  async updateUser(userId, updateData, options = {}) {
    try {
      const [updated] = await User.update(updateData, {
        where: { id: userId },
        ...options
      });
      if (updated) {
        const updatedUser = await User.findByPk(userId, options);
        return updatedUser;
      }
      throw new Error('User not found');
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  // Delete a user by ID
  async deleteUser(userId, options = {}) {
    try {
      const deleted = await User.destroy({ where: { id: userId }, ...options });
      if (deleted) {
        return 'User deleted';
      }
      throw new Error('User not found');
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
}

export default new UserRepository();
