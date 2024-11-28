const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    try {
        // Kiểm tra nếu không có token
        if (!token) {
            return {
                message: "Session out",
                logout: true,
            };
        }

        // Giải mã token và lấy thông tin user
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Truy vấn người dùng từ cơ sở dữ liệu, bỏ qua mật khẩu
        const user = await UserModel.findById(decoded.id).select('-password');

        // Nếu không tìm thấy người dùng, trả về thông báo lỗi
        if (!user) {
            return {
                message: "User not found",
                logout: true,
            };
        }

        // Trả về thông tin người dùng
        return user;

    } catch (error) {
        // Nếu có lỗi trong việc giải mã token hoặc bất kỳ lỗi nào khác
        return {
            message: error.message || "An error occurred",
            logout: true,
        };
    }
};

module.exports = getUserDetailsFromToken;
