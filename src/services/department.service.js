import Department from "../models/Department.js";
import DepartmentTemplate from "../models/DepartmentTemplate.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

// Get all templates
const getTemplates = async () => {
    return await DepartmentTemplate.find({ isActive: true });
};

// Create department from template
const createFromTemplate = async (orgId, templateId, userId) => {
    const template = await DepartmentTemplate.findById(templateId);
    if (!template) {
        throw new Error("Template not found");
    }

    // Check if department already exists
    const existing = await Department.findOne({
        organization: orgId,
        code: template.code,
    });

    if (existing) {
        throw new Error(`${template.name} department already exists`);
    }

    const department = await Department.create({
        name: template.name,
        code: template.code,
        icon: template.icon,
        description: template.description,
        organization: orgId,
        isFromTemplate: true,
        templateRef: template._id,
        permissions: {
            documentVisibility: template.defaultPermissions.documentVisibility,
        },
        createdBy: userId,
    });

    return department;
};

// Create custom department
const createCustomDepartment = async (orgId, deptData, userId) => {
    const { name, code, icon, description } = deptData;

    // Check if code already exists in this org
    const existing = await Department.findOne({
        organization: orgId,
        code: code.toUpperCase(),
    });

    if (existing) {
        throw new Error(`Department with code ${code} already exists`);
    }

    const department = await Department.create({
        name,
        code: code.toUpperCase(),
        icon: icon || "📁",
        description,
        organization: orgId,
        isFromTemplate: false,
        createdBy: userId,
    });

    return department;
};

// Get all departments for organization
const getDepartments = async (orgId) => {
    return await Department.find({ organization: orgId, isActive: true })
        .populate("head", "name email")
        .populate("members", "name email role");
};

// Update department
const updateDepartment = async (deptId, orgId, updateData) => {
    const department = await Department.findOne({
        _id: deptId,
        organization: orgId,
    });

    if (!department) {
        throw new Error("Department not found");
    }

    // Cannot update mandatory departments name/code
    if (department.isMandatory) {
        delete updateData.name;
        delete updateData.code;
    }

    return await Department.findByIdAndUpdate(
        deptId,
        { ...updateData },
        { new: true }
    );
};

// Add member to department
const addMember = async (deptId, orgId, userId) => {
    const department = await Department.findOne({
        _id: deptId,
        organization: orgId,
    });

    if (!department) {
        throw new Error("Department not found");
    }

    // Check if already a member
    if (department.members.includes(userId)) {
        throw new Error("User is already a member");
    }

    department.members.push(userId);
    await department.save();

    // Update user's department
    await User.findByIdAndUpdate(userId, {
        department: deptId,
    });

    return department;
};

// Update access matrix
const updateAccessMatrix = async (deptId, orgId, allowedDepartments) => {
    const department = await Department.findOne({
        _id: deptId,
        organization: orgId,
    });

    if (!department) {
        throw new Error("Department not found");
    }

    department.permissions.canAccessDepartments = allowedDepartments;
    await department.save();

    return department;
};

export default {
    getTemplates,
    createFromTemplate,
    createCustomDepartment,
    getDepartments,
    updateDepartment,
    addMember,
    updateAccessMatrix,
};