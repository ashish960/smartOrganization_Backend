import organizationService from "../services/organization.service.js";

const createOrganization = async (req, res) => {
    try {
        const organization = await organizationService.createOrganization(req.user.id, req.body);
        res.status(201).json({ success: true, message: "Organization created successfully", data: organization });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyOrganization = async (req, res) => {
    try {
        const organization = await organizationService.getOrganization(req.user.organizationId);
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateOrganization = async (req, res) => {
    try {
        const organization = await organizationService.updateOrganization(req.user.organizationId, req.user.id, req.body);
        res.status(200).json({ success: true, message: "Organization updated successfully", data: organization });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMembers = async (req, res) => {
    try {
        const members = await organizationService.getMembers(req.user.organizationId);
        res.status(200).json({ success: true, data: members });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        await organizationService.removeMember(req.user.organizationId, req.user.id, req.params.userId);
        res.status(200).json({ success: true, message: "Member removed successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export default { createOrganization, getMyOrganization, updateOrganization, getMembers, removeMember };