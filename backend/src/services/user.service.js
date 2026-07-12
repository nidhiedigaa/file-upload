import UserModel from '../models/user.model.js';

export const findByIdUserService = async (userId) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};