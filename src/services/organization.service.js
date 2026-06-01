import Organization from "../models/Organization.js";
import Department from "../models/Department.js";
import DepartmentTemplate from "../models/DepartmentTemplate.js";
import User from "../models/User.js";

// Create organization
const createOrganization = async (userId, orgData) => {
    const { name, industry, size, website } = orgData;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) throw new Error("Organization name already taken");

    const organization = await Organization.create({
        name, slug, industry, size, website,
        owner: userId, members: [userId],
    });

    const mandatoryTemplates = await DepartmentTemplate.find({ isMandatory: true });
    for (const template of mandatoryTemplates) {
        await Department.create({
            name: template.name, code: template.code, icon: template.icon,
            description: template.description, organization: organization._id,
            isFromTemplate: true, templateRef: template._id, isMandatory: true,
            permissions: { documentVisibility: template.defaultPermissions.documentVisibility },
            createdBy: userId,
        });
    }

    await User.findByIdAndUpdate(userId, {
        organization: organization._id, role: "ORG_ADMIN", onboardingCompleted: false,
    });

    return organization;
};

// Get organization details
const getOrganization = async (orgId) => {
    const organization = await Organization.findById(orgId)
        .populate("owner", "name email")
        .populate("members", "name email role department");
    if (!organization) throw new Error("Organization not found");
    return organization;
};

// Update organization
const updateOrganization = async (orgId, userId, updateData) => {
    const organization = await Organization.findById(orgId);
    if (!organization) throw new Error("Organization not found");
    if (organization.owner.toString() !== userId) throw new Error("Not authorized to update organization");
    return await Organization.findByIdAndUpdate(orgId, { ...updateData }, { new: true });
};

// Get all members with full details
const getMembers = async (orgId) => {
    const members = await User.find({ organization: orgId, isActive: true })
        .select("name email role department jobTitle profileImage lastLogin createdAt isEmailVerified")
        .populate("department", "name code icon");
    return members;
};

// Remove member from org
const removeMember = async (orgId, requesterId, targetUserId) => {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error("Organization not found");

    // Only owner can remove members
    if (org.owner.toString() !== requesterId) throw new Error("Only the org owner can remove members");

    // Can't remove the owner
    if (org.owner.toString() === targetUserId) throw new Error("Cannot remove the organization owner");

    // Remove from org members list
    await Organization.findByIdAndUpdate(orgId, { $pull: { members: targetUserId } });

    // Deactivate user
    await User.findByIdAndUpdate(targetUserId, { isActive: false, organization: null, department: null });

    return true;
};

export default { createOrganization, getOrganization, updateOrganization, getMembers, removeMember };