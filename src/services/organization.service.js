import Organization from "../models/Organization.js";
import Department from "../models/Department.js";
import DepartmentTemplate from "../models/DepartmentTemplate.js";
import User from "../models/User.js";

// Create organization
const createOrganization = async (userId, orgData) => {
    const { name, industry, size, website } = orgData;

    // Create slug from name
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

    // Check if slug exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
        throw new Error("Organization name already taken");
    }

    // Create organization
    const organization = await Organization.create({
        name,
        slug,
        industry,
        size,
        website,
        owner: userId,
        members: [userId],
    });

    // Find mandatory templates (HR)
    const mandatoryTemplates = await DepartmentTemplate.find({
        isMandatory: true,
    });

    // Auto create mandatory departments
    for (const template of mandatoryTemplates) {
        await Department.create({
            name: template.name,
            code: template.code,
            icon: template.icon,
            description: template.description,
            organization: organization._id,
            isFromTemplate: true,
            templateRef: template._id,
            isMandatory: true,
            permissions: {
                documentVisibility: template.defaultPermissions.documentVisibility,
            },
            createdBy: userId,
        });
    }

    // Update user with organization
    await User.findByIdAndUpdate(userId, {
        organization: organization._id,
        role: "ORG_ADMIN",
        onboardingCompleted: false,
    });

    return organization;
};

// Get organization details
const getOrganization = async (orgId) => {
    const organization = await Organization.findById(orgId)
        .populate("owner", "name email")
        .populate("members", "name email role department");

    if (!organization) {
        throw new Error("Organization not found");
    }

    return organization;
};

// Update organization
const updateOrganization = async (orgId, userId, updateData) => {
    const organization = await Organization.findById(orgId);

    if (!organization) {
        throw new Error("Organization not found");
    }

    // Only owner or admin can update
    if (organization.owner.toString() !== userId) {
        throw new Error("Not authorized to update organization");
    }

    const updated = await Organization.findByIdAndUpdate(
        orgId,
        { ...updateData },
        { new: true }
    );

    return updated;
};

export default {
    createOrganization,
    getOrganization,
    updateOrganization,
};