import Company from '../models/company.js';

class CompanyRepository {
  // Create a new company
  async create(companyData, options = {}) {
    try {
      const company = await Company.create(companyData, options);
      return company;
    } catch (error) {
      throw new Error('Error creating company: ' + error.message);
    }
  }

  // Find a company by ID
  async findById(companyId, options = {}) {
    try {
      const company = await Company.findByPk(companyId, options);
      return company;
    } catch (error) {
      throw new Error('Error finding company by ID: ' + error.message);
    }
  }

  // Find a company by name
  async findByName(name, options = {}) {
    try {
      const company = await Company.findOne({ where: { name }, ...options });
      return company;
    } catch (error) {
      throw new Error('Error finding company by name: ' + error.message);
    }
  }

  // Update a company by ID
  async updateById(companyId, updateData, options = {}) {
    try {
      const [updated] = await Company.update(updateData, {
        where: { id: companyId },
        ...options
      });
      if (updated) {
        const updatedCompany = await Company.findByPk(companyId, options);
        return updatedCompany;
      }
      throw new Error('Company not found');
    } catch (error) {
      throw new Error('Error updating company: ' + error.message);
    }
  }

  // Delete a company by ID
  async deleteById(companyId, options = {}) {
    try {
      const deleted = await Company.destroy({
        where: { id: companyId },
        ...options
      });
      if (deleted) {
        return 'Company deleted';
      }
      throw new Error('Company not found');
    } catch (error) {
      throw new Error('Error deleting company: ' + error.message);
    }
  }
}

export default new CompanyRepository();
