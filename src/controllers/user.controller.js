import User from "../models/User.js";

// GET /api/user/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("organization", "name industry size plan billing");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
    try {
        const { name, jobTitle, phone } = req.body;
        if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name, jobTitle, phone },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export default { getProfile, updateProfile };