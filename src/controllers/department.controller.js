import departmentService from "../services/department.service.js";

const getTemplates = async (req, res) => {
    try {
        const templates = await departmentService.getTemplates();
        res.status(200).json({
            success: true,
            data: templates,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const removeMember = async (req, res) => {
    try {
        const result = await departmentService.removeMember(
            req.params.id,
            req.user.organizationId,
            req.params.userId
        );
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const createFromTemplate = async (req, res) => {
    try {
        const department = await departmentService.createFromTemplate(
            req.user.organizationId,
            req.body.templateId,
            req.user.id
        );
        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const createCustomDepartment = async (req, res) => {
    try {
        const department = await departmentService.createCustomDepartment(
            req.user.organizationId,
            req.body,
            req.user.id
        );
        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getDepartments(
            req.user.organizationId
        );
        res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const department = await departmentService.updateDepartment(
            req.params.id,
            req.user.organizationId,
            req.body
        );
        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const addMember = async (req, res) => {
    try {
        const department = await departmentService.addMember(
            req.params.id,
            req.user.organizationId,
            req.body.userId
        );
        res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: department,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateAccessMatrix = async (req, res) => {
    try {
        const department = await departmentService.updateAccessMatrix(
            req.params.id,
            req.user.organizationId,
            req.body.allowedDepartments
        );
        res.status(200).json({
            success: true,
            message: "Access matrix updated successfully",
            data: department,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    getTemplates,
    createFromTemplate,
    createCustomDepartment,
    getDepartments,
    updateDepartment,
    addMember,
    updateAccessMatrix,
    removeMember,
};