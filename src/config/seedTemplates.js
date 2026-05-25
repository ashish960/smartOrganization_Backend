import DepartmentTemplate from "../models/DepartmentTemplate.js";

const templates = [
    {
        name: "Human Resources",
        code: "HR",
        icon: "👥",
        description: "Manages people, policies, hiring and employee relations",
        isMandatory: true,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["HR"],
        },
        suggestedRoles: ["HR Manager", "HR Executive", "Recruiter"],
        industries: ["ALL"],
    },
    {
        name: "Finance",
        code: "FINANCE",
        icon: "💰",
        description: "Manages budgets, accounts, payments and financial reporting",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["FINANCE"],
        },
        suggestedRoles: ["CFO", "Finance Manager", "Accountant"],
        industries: ["ALL"],
    },
    {
        name: "Information Technology",
        code: "IT",
        icon: "💻",
        description: "Manages technology infrastructure and development",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["IT"],
        },
        suggestedRoles: ["CTO", "IT Manager", "Developer", "DevOps"],
        industries: ["ALL"],
    },
    {
        name: "Legal",
        code: "LEGAL",
        icon: "⚖️",
        description: "Manages legal compliance, contracts and regulations",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "RESTRICTED",
            canAccessDepartments: ["LEGAL"],
        },
        suggestedRoles: ["Legal Head", "Lawyer", "Compliance Officer"],
        industries: ["ALL"],
    },
    {
        name: "Operations",
        code: "OPS",
        icon: "⚙️",
        description: "Manages day-to-day business operations",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["OPS"],
        },
        suggestedRoles: ["COO", "Operations Manager", "Process Analyst"],
        industries: ["ALL"],
    },
    {
        name: "Marketing",
        code: "MARKETING",
        icon: "📢",
        description: "Manages brand, campaigns and content",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["MARKETING"],
        },
        suggestedRoles: ["CMO", "Marketing Manager", "Content Writer"],
        industries: ["ALL"],
    },
    {
        name: "Sales",
        code: "SALES",
        icon: "📈",
        description: "Manages clients, deals and revenue generation",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "DEPARTMENT",
            canAccessDepartments: ["SALES", "MARKETING"],
        },
        suggestedRoles: ["Sales Head", "Account Manager", "Sales Rep"],
        industries: ["ALL"],
    },
    {
        name: "Executive",
        code: "EXECUTIVE",
        icon: "👔",
        description: "C-Suite and senior leadership team",
        isMandatory: false,
        defaultPermissions: {
            documentVisibility: "RESTRICTED",
            canAccessDepartments: ["ALL"],
        },
        suggestedRoles: ["CEO", "COO", "CFO", "CTO", "CMO"],
        industries: ["ALL"],
    },
];

export const seedDepartmentTemplates = async () => {
    try {
        const count = await DepartmentTemplate.countDocuments();
        if (count === 0) {
            await DepartmentTemplate.insertMany(templates);
            console.log("✅ Department templates seeded successfully");
        }
    } catch (error) {
        console.error("❌ Failed to seed department templates:", error);
    }
};